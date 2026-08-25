import { Admin } from "../Model/admin.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { transporter } from "../config/mail.js";
import redis from "../config/redis.js";

export const adminRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "please provide all details",
      });
    }
    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
        return res.status(400).json({
          message: "Admin already exist.try to login",
        });
      }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({
      name,
      email,
      password: hashedPassword,
    });
    await admin.save();
    return res.status(200).json({
      message: "Admin Register successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const AdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "please provide all details",
      });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({
        message: "user not exists and invalid email or password",
      });
    }

    const checkPassword = await bcrypt.compare(password, admin.password);
    if (!checkPassword) {
      return res.status(400).json({
        message: "password not match",
      });
    }

    if (admin.isVerified) {
      const token = jwt.sign(
        {
          adminId: admin._id,
          email: admin.email,
          role: "admin",
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "15m",
        },
      );
      const refreshToken = jwt.sign(
        {
          adminId: admin._id,
        },
        process.env.JWT_REFRESH_TOKEN_SECRET,
        {
          expiresIn: "7d",
        },
      );
      res.cookie("adminAuthToken", token, {
        httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      });
      res.cookie("adminRefreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        message: "Admin Login Successfully",
        requiresOtp:false
      });
    }

    const otp =Math.floor(100000+Math.random()*900000).toString()

    await redis.set(`adminOtp:${email}`,otp,{
      ex:300
    })

    await transporter.sendMail({
      from:process.env.USER_EMAIL,
      to:admin.email,
      subject:"Admin Account Verification otp",
      text:`your admin otp for verification is : ${otp}`
    })
    res.cookie("adminEmail",admin.email,{
       httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "lax",
        maxAge: 5 * 60 * 1000,
    })
     return res.status(200).json({
      message:"if email is valid ,otp sent on email also checked spam",
      ttl:300,
      requiresOtp:true
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const adminOtpTimer=async(req,res)=>{
  try {
    const email=req.cookies.adminEmail

    if(!email){
       return res.status(400).json({
      message: "email not found on timer",
    });
    }
    const ttl =await redis.ttl(`adminOtp:${email}`)
    if(ttl<0){
        return res.status(200).json({
      ttl:0,
    });
    }
      return res.status(200).json({
      ttl,
    });
  } catch (error) {
     return res.status(500).json({
      message: error.message,
    });
  }
}

export const verifyAdminOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const email = req.cookies.adminEmail;
    if (!email) {
      return res.status(400).json({
        message: "session expired,email not found",
      });
    }
    if (!otp) {
      return res.status(400).json({
        message: "please enter otp",
      });
    }
    //check is account is locked or not
    const lockKey=`adminOtpLock:${email}`
    const isLocked=await redis.get(lockKey)
    if(isLocked){
       return res.status(429).json({
        message: "to many wrong attempt, Try again after 1 hour",
      });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({
        message: "Admin not found",
      });
    }

    const savedOtp = await redis.get(`adminOtp:${email}`);

    if (!savedOtp) {
      return res.status(400).json({
        message: "Otp Expired",
      });
    }
    if (String(savedOtp) !== String(otp)) {

      const attemptKey=`adminOtpAttempts:${email}`

      const attempts=await redis.incr(attemptKey)

      if(attempts===1){
        await redis.expire(attemptKey,60*60)
      }
      if(attempts>=3){
        await redis.set(lockKey,"locked",{
          ex:60*60
        })
        await redis.del(attemptKey)
        return res.status(429).json({
        message: "3 wrong OTP attempts.Admin Account locked for 1 hour",
      });
      }

      return res.status(400).json({
        message: `Invalid OTP. ${3-attempts} attempts remaining`,
      });
    }

    await redis.del(`adminOtp:${email}`);
    await redis.del(`adminOtpAttempts:${email}`)

    admin.isVerified = true;
    await admin.save();

    res.clearCookie("adminEmail", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

      const token = jwt.sign(
        { adminId: admin._id,
           email: admin.email ,
          role:"admin"},
        process.env.JWT_SECRET,
        { expiresIn: "15" },
      );

       const refreshToken = jwt.sign(
      {
        adminId: admin._id,
      },
      process.env.JWT_REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
      }
    )
      res.cookie("adminAuthToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("adminRefreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
      return res.status(201).json({
        message: "Admin login successfully",
      });
    
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const resendAdminOtp=async(req,res)=>{
  try {
    const email=req.cookies.adminEmail;
    if(!email){
      return res.status(400).json({
      message: "admin email not found",
    });
    }
    const admin=await Admin.findOne({email})
     if(!admin){
      return res.status(400).json({
      message: "admin email not found database",
    });
    }
    if(admin.isVerified){
       
      return res.status(400).json({
      message: " email  is already verified",
    });
    }
    const otp=Math.floor(100000+Math.random()*900000).toString();
    await redis.set(`adminOtp:${email}`,otp,{
      ex:300
    })

    await transporter.sendMail({
      from:process.env.USER_EMAIL,
      to:admin.email,
      subject:"Admin Account Verification otp",
      text:`your admin otp for verification is : ${otp}`
    })
     return res.status(200).json({
      message: "admin resend Otp Send Successfully",
      ttl:300
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

export const logoutAdmin = async (req, res) => {
  try {
    const adminId = req.admin.adminId;
    const email=req.admin.email;
     if (!email) {
      return res.status(401).json({
        message: "email not found logout",
      });
    }
    if (!adminId) {
      return res.status(401).json({
        message: "Admin not logged in",
      });
    }
    const admin=await Admin.findOne({email})
    if(!admin){
       return res.status(401).json({
        message: "Admin not not found database",
      });
    }

     res.clearCookie("adminEmail",{
       httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "lax",

    })


    res.clearCookie("adminAuthToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    res.clearCookie("adminRefreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    admin.isVerified=false;
    await admin.save()

    return res.status(200).json({
      message: "Admin Logout Successfully",
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const checkAdminAuth = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.adminId)
      .select("-password");

    if (!admin) {
      return res.status(401).json({
        message: "Admin not found",
      });
    }

    return res.status(200).json({
      authenticated: true,
      admin,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong in admin auth check",
    });
  }
};

export const forgotAdminPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Please enter email to reset password",
      });
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(400).json({
        message: "Admin email is not registered",
      });
    }

    // Generate OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Store OTP for 5 minutes
    await redis.set(`adminForgotOtp:${email}`, otp, {
      ex: 300,
    });

    // Send OTP
    await transporter.sendMail({
      from: process.env.USER_EMAIL,
      to: admin.email,
      subject: "Admin Password Reset OTP",
      text: `To reset your admin password, enter OTP: ${otp}`,
    });

    // Temporary cookie
    res.cookie("adminForgotEmail", email, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 5 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Password reset OTP sent successfully",
      ttl: 300,
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const checkAdminForgotOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const email = req.cookies.adminForgotEmail;

    if (!otp) {
      return res.status(400).json({
        message: "Please provide OTP to verify",
      });
    }

    if (!email) {
      return res.status(400).json({
        message: "Session expired, admin email not found",
      });
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(400).json({
        message: "Admin is not registered",
      });
    }

    const verifyOtp = await redis.get(
      `adminForgotOtp:${email}`
    );

    if (!verifyOtp) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    if (String(verifyOtp) !== String(otp)) {
      return res.status(400).json({
        message: "OTP doesn't match, please try again",
      });
    }

    // OTP verified
    await redis.del(`adminForgotOtp:${email}`);

    // Mark that forgot OTP was verified
    await redis.set(
      `adminPasswordReset:${email}`,
      "verified",
      { ex: 600 }
    );

    return res.status(200).json({
      message: "OTP verified successfully",
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const updateAdminPassword = async (req, res) => {
  try {
    const { forgotPassword, reForgotPassword } = req.body;
    const email = req.cookies.adminForgotEmail;

    if (!email) {
      return res.status(400).json({
        message: "Session expired, please try again",
      });
    }

    if (!forgotPassword || !reForgotPassword) {
      return res.status(400).json({
        message: "Please provide both passwords",
      });
    }

    if (forgotPassword !== reForgotPassword) {
      return res.status(400).json({
        message: "Both passwords don't match",
      });
    }

    // Check OTP verification
    const isVerified = await redis.get(
      `adminPasswordReset:${email}`
    );

    if (isVerified !== "verified") {
      return res.status(403).json({
        message: "Please verify OTP first",
      });
    }

    const hashedPassword = await bcrypt.hash(forgotPassword, 10);

    const admin = await Admin.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    // Remove reset permission after password change
    await redis.del(`adminPasswordReset:${email}`);

    res.clearCookie("adminForgotEmail", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    return res.status(200).json({
      message: "Admin password updated successfully",
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const adminForgotOtpTimer = async (req, res) => {
  try {
    const email = req.cookies.adminForgotEmail;

    if (!email) {
      return res.status(200).json({
        message: "Admin email not found",
        ttl: 0,
      });
    }

    const ttl = await redis.ttl(
      `adminForgotOtp:${email}`
    );

    return res.status(200).json({
      ttl: ttl > 0 ? ttl : 0,
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const refreshAdminAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.adminRefreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Admin refresh token not found",
      });
    }

    const decode = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET
    );

    const admin = await Admin.findById(decode.adminId);

    if (!admin) {
      return res.status(401).json({
        message: "Admin not found",
      });
    }

    const newAccessToken = jwt.sign(
      {
        adminId: admin._id,
        email: admin.email,
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      }
    );

    res.cookie("adminAuthToken", newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Admin access token refreshed successfully",
    });

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired admin refresh token",
    });
  }
};


