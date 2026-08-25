import express, { Router } from "express"
import { loginUser, registerUser, resendOtp, verifyOtp,logout,
     otpTimer,checkAuth, forgotPassword, checkForgotOtp, updatePassword, ForgotOtpTimer, 
     refreshAccessToken,
     getProfile,
     getUserCount} from "../Controller/User.js";
import { authMiddleware } from "../middleware/auth.js";

const userRoutes=express.Router();

userRoutes.post("/register",registerUser)
userRoutes.post("/login",loginUser)
userRoutes.post("/verify_otp",verifyOtp)
userRoutes.post("/resend",resendOtp)
userRoutes.post("/logout",authMiddleware,logout)
userRoutes.get("/otpTimer",otpTimer)
userRoutes.get("/auth-check",authMiddleware,checkAuth)
userRoutes.post("/forgotOtp",forgotPassword)
userRoutes.post("/checkForgotOtp",checkForgotOtp)
userRoutes.post("/updatePassword",updatePassword)
userRoutes.get("/forgotOtpTimer",ForgotOtpTimer)
userRoutes.post("/refreshToken",refreshAccessToken)
userRoutes.get("/getProfile",authMiddleware,getProfile)
userRoutes.get("/getUserCount",authMiddleware,getUserCount)












export default userRoutes;