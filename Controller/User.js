import { transporter } from "../config/mail.js";
import { User } from "../Model/User.js";
import bcrypt from "bcrypt";
import redis from "../config/redis.js";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "please provide all details",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User Already Exist, Please Try To Login",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
    });

    await user.save();

    return res.status(201).json({
      message: "account create successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {

    console.log("\n================ LOGIN START ================");

    console.log("Request origin:", req.headers.origin);
    console.log("Request cookies:", req.cookies);
    console.log("Request body email:", req.body.email);

    const { email, password } = req.body;

    console.log("Email received:", !!email);
    console.log("Password received:", !!password);

    if (!email || !password) {
      console.log("❌ EMAIL OR PASSWORD MISSING");

      return res.status(400).json({
        message: "please enter all the details",
      });
    }

    const user = await User.findOne({ email });

    console.log("User found:", !!user);

    if (!user) {
      console.log("❌ USER NOT FOUND");

      return res.status(400).json({
        message: "User Not Found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    console.log("Password matched:", isMatch);

    if (!isMatch) {
      console.log("❌ PASSWORD DOES NOT MATCH");

      return res.status(400).json({
        message: "Password Doesn't Match, Please Try Again.",
      });
    }

    console.log("User verified status:", user.isVerified);

    if (user.isVerified) {

      console.log("Existing verified user -> creating tokens");

      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "5m"
        }
      );

      const refreshToken = jwt.sign(
        {
          userId: user._id
        },
        process.env.JWT_REFRESH_TOKEN_SECRET,
        {
          expiresIn: "7d"
        }
      );

      console.log("JWT secret exists:", !!process.env.JWT_SECRET);
      console.log(
        "Refresh JWT secret exists:",
        !!process.env.JWT_REFRESH_TOKEN_SECRET
      );

      res.cookie("authToken", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 5 * 60 * 1000,
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      console.log("✅ authToken cookie set");
      console.log("✅ refreshToken cookie set");

      return res.status(200).json({
        message: "Login Successfully",
        requiresOtp: false,
      });
    }

    console.log("User is not verified -> generating OTP");

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    console.log("OTP generated:", otp);

    await redis.set(`otp:${email}`, otp, {
      ex: 300,
    });

    console.log("OTP saved to Redis");

    await transporter.sendMail({
      from: process.env.USER_EMAIL,
      to: user.email,
      subject: "To Verify Your Account Using OTP",
      text: `To Confirm Your Account Please Enter OTP : ${otp}`,
    });

    console.log("OTP email sent");

    res.cookie("email", user.email, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      path: "/",
      maxAge: 5 * 60 * 1000,
    });

    console.log("✅ EMAIL COOKIE SET");
    console.log("Email:", user.email);

    console.log("================ LOGIN SUCCESS ================\n");

    return res.status(200).json({
      message: "if email is valid, otp sent on your email",
      ttl: 300,
      requiresOtp: true,
    });

  } catch (error) {

    console.error("\n❌ LOGIN ERROR");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);

    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

export const otpTimer = async (req, res) => {
  try {

    console.log("\n================ OTP TIMER ================");

    console.log("Cookie header:", req.headers.cookie || "NO COOKIE");

    console.log("Parsed cookies:", req.cookies);

    const email = req.cookies.email;

    console.log(
      "Email:",
      email || "EMAIL NOT FOUND"
    );

    if (!email) {
      console.log("❌ EMAIL COOKIE NOT FOUND");

      return res.status(200).json({
        message: "not found email",
      });
    }

    const ttl = await redis.ttl(`otp:${email}`);

    console.log("Redis OTP TTL:", ttl);

    if (ttl < 0) {
      return res.status(200).json({
        ttl: 0,
      });
    }

    return res.status(200).json({
      ttl,
    });

  } catch (error) {

    console.error("❌ OTP TIMER ERROR");
    console.error(error.message);

    return res.status(500).json({
      message: error.message,
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    console.log("\n================ VERIFY OTP START ================");

    console.log("Request method:", req.method);
    console.log("Request URL:", req.originalUrl);

    console.log("Request headers:", {
      origin: req.headers.origin,
      contentType: req.headers["content-type"],
      cookieExists: !!req.headers.cookie,
      cookieHeader: req.headers.cookie || "NO COOKIE HEADER",
    });

    console.log("req.cookies:", req.cookies);

    const { otp } = req.body;

    console.log("OTP received:", otp ? "YES" : "NO");
    console.log("OTP length:", otp ? String(otp).length : 0);

    const email = req.cookies.email;

    console.log("Email cookie exists:", !!email);
    console.log("Email:", email || "EMAIL NOT FOUND");

    if (!email) {
      console.log("❌ EMAIL COOKIE NOT FOUND");

      return res.status(400).json({
        message: "session expired,email not found",
      });
    }

    if (!otp) {
      console.log("❌ OTP NOT PROVIDED");

      return res.status(400).json({
        message: "please enter otp",
      });
    }

    console.log("Checking OTP lock...");

    const lockKey = `otpLock${email}`;

    const isLocked = await redis.get(lockKey);

    console.log("Account locked:", !!isLocked);

    if (isLocked) {
      console.log("❌ ACCOUNT LOCKED");

      return res.status(429).json({
        message: "to many wrong attempt, Try again after 1 hour",
      });
    }

    console.log("Finding user:", email);

    const user = await User.findOne({ email });

    console.log("User found:", !!user);

    if (!user) {
      console.log("❌ USER NOT FOUND");

      return res.status(400).json({
        message: "user not found",
      });
    }

    console.log("Getting OTP from Redis...");

    const savedOtp = await redis.get(`otp:${email}`);

    console.log("Redis OTP exists:", !!savedOtp);

    if (!savedOtp) {
      console.log("❌ OTP EXPIRED / NOT FOUND IN REDIS");

      return res.status(400).json({
        message: "Otp Expired",
      });
    }

    console.log("Comparing OTP...");

    if (String(savedOtp) !== String(otp)) {
      console.log("❌ OTP DOES NOT MATCH");

      const attemptKey = `otpAttempts:${email}`;

      const attempts = await redis.incr(attemptKey);

      console.log("Wrong OTP attempts:", attempts);

      if (attempts === 1) {
        await redis.expire(attemptKey, 60 * 60);

        console.log("Attempt expiry set to 1 hour");
      }

      if (attempts >= 3) {
        console.log("❌ 3 WRONG ATTEMPTS - ACCOUNT LOCKING");

        await redis.set(lockKey, "locked", {
          ex: 60 * 60,
        });

        await redis.del(attemptKey);

        return res.status(429).json({
          message: "3 wrong OTP attempts.Account locked for 1 hour",
        });
      }

      return res.status(400).json({
        message: `Invalid OTP. ${3 - attempts} attempts remaining`,
      });
    }

    console.log("✅ OTP MATCHED");

    await redis.del(`otp:${email}`);
    await redis.del(`otpAttempts:${email}`);

    console.log("OTP deleted from Redis");

    user.isVerified = true;
    await user.save();

    console.log("User isVerified updated:", user.isVerified);

    console.log("Clearing email cookie...");

    res.clearCookie("email", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    console.log("Email cookie clear command sent");

    if (user.isVerified) {
      console.log("Creating JWT authToken...");

      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        }
      );

      console.log("JWT created:", !!token);

      res.cookie("authToken", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
      });

      console.log("authToken cookie set");

      console.log("================ VERIFY OTP SUCCESS ================\n");

      return res.status(201).json({
        message: "login successfully",
      });
    }

  } catch (error) {

    console.error("\n❌ VERIFY OTP ERROR");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    return res.status(500).json({
      message: error.message,
    });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const email = req.cookies.email;
    if (!email) {
      return res.status(400).json({
        message: "Email Not Found,Try Again To Login",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User Is Not Register,Try Again To Register",
      });
    }
    if (user.isVerified) {
      return res.status(400).json({
        message: "Account Is Already Verified",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // user.otp = otp;
    // user.expiryDate = new Date(Date.now() + 5 * 60 * 1000);
    await redis.set(`otp:${email}`, otp, { ex: 300 });

    await user.save();

    await transporter.sendMail({
      from: process.env.USER_EMAIL,
      to: user.email,
      subject: "To Verify Your Account Using OTP",
      text: `To Confirm Your Account Please Enter OTP : ${otp}`,
    });

    return res.status(200).json({
      message: "Resent Otp Sent Successfully",
      ttl: 300,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const logout = async (req, res) => {
  try {
    const email = req.user.email;
    if (!email) {
      return res.status(400).json({
        message: "User Not Login",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Email not Register",
      });
    }
    await redis.del(`otp:${email}`);

    res.clearCookie("authToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    user.isVerified = false;
    await user.save();

    return res.status(200).json({
      message: "Account Logout Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "something went wrong",
      error: error,
    });
  }
};

export const checkAuth = async (req, res) => {
  try {

    console.log("\n================ AUTH CHECK ================");

    console.log("req.user:", req.user);

    console.log(
      "User ID:",
      req.user?.userId
    );

    const user = await User.findById(
      req.user.userId
    ).select("-password");

    console.log(
      "User found:",
      !!user
    );

    if (!user) {
      console.log("❌ USER NOT FOUND IN DB");

      return res.status(401).json({
        message: "User Not Found",
      });
    }

    console.log("✅ AUTH CHECK SUCCESS");

    return res.status(200).json({
      authenticated: true,
      user,
    });

  } catch (error) {

    console.error("❌ AUTH CHECK ERROR");
    console.error(error.message);
    console.error(error.stack);

    return res.status(500).json({
      message: "something went wrong authCheck",
    });
  }
};
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        message: "Please Enter Email To Proceed Forgot Password",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Your Email Is Not Register On Website",
      });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redis.set(`otp:${email}`, otp, { ex: 300 });
    await transporter.sendMail({
      from: process.env.USER_EMAIL,
      to: user.email,
      subject: "to forgot your password",
      text: `To Forgot Your Password Enter Otp :${otp}`,
    });

    res.cookie("forgotEmail", email, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 5 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Otp Sent On Your Email Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const checkForgotOtp = async (req, res) => {
  try {
    const {otp} = req.body;
    const email = req.cookies.forgotEmail;
    if (!otp) {
      return res.status(400).json({
        message: "Please Provide Otp TO Verify your Account",
      });
    }
    if (!email) {
      return res.status(400).json({
        message: "Please Check Backend Email Not Saved",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Email is Not Register in Website,Please Register",
      });
    }
    const verifyOtp =await redis.get(`otp:${email}`);
    if (!verifyOtp) {
      return res.status(400).json({
        message: "OTP Doesn't Saved",
      });
    }
    if (String(verifyOtp) !== String(otp)) {
      return res.status(400).json({
        message: "OTp Doesn't match ,Please Try Again",
      });
    }

    await redis.del(`otp:${email}`);

     return res.status(200).json({
        message: "verify Successfully",
      });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const updatePassword=async(req,res)=>{
  try {
    const {password,rePassword} =req.body;
    const email=req.cookies.forgotEmail;
    if(!password || !rePassword){
      return res.status(400).json({
      message:"Please Provide Both Password"
    });
    }
    if(password !== rePassword){
      return res.status(401).json({
      message: "Both Password Doesn't Match, PLease Try To Re-Enter"
    });
    }
    const hashedPassword=await bcrypt.hash(password,10)
   

    const user=await User.findOneAndUpdate({email},{password:hashedPassword})
    if(!user){
    return res.status(401).json({
      message: "User Not Register In Database"
    });
    }

    return res.status(200).json({
      message: "Password Update Successfully"
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

export const ForgotOtpTimer = async (req, res) => {
  try {
    const email = req.cookies.forgotEmail;
    if (!email) {
      return res.status(200).json({
        message: "not found email",
      });
    }
    const ttl = await redis.ttl(`otp:${email}`);
    if (ttl < 0) {
      return res.status(200).json({
        ttl: 0,
      });
    }

    return res.status(200).json({
      ttl: ttl < 0 ? 0 : ttl,
    });
  } catch (error) {
    return res.status(500).json({
      message: error,
    });
  }
};

export const refreshAccessToken=async(req,res,next)=>{
  try {
    const refreshToken=req.cookies.refreshToken;
    if(!refreshToken){
       return res.status(401).json({
      message: "token not found"
    });
    }
    const decode=jwt.verify(refreshToken,process.env.JWT_REFRESH_TOKEN_SECRET);
   
    const user=await User.findById(decode.userId)
    if(!user){
       return res.status(400).json({
      message: "user not find"
    });
    }

    const newAccessToken=jwt.sign({
      userId:user._id,
      email:user.email
    },process.env.JWT_ACCESS_TOKEN,{
      expiresIn:"15m"
    })
    res.cookie("accessToken",newAccessToken,{
      httpOnly:true,
      secure:true,
      path:"/",
      sameSite:"none",
      maxAge:15*60*1000
    })
     return res.status(200).json({
      message:"access token refresh successfully"
    });
  } catch (error) {
     return res.status(500).json({
      message: error,
    });
  }
}

export const getProfile = async (req, res) => {
  try {

    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Profile fetched successfully",
      user,
    });

  } catch (error) {

    return res.status(500).json({
      message: error.message,
    });

  }
};

export const getUserCount = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    return res.status(200).json({
      success: true,
      totalUsers
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};