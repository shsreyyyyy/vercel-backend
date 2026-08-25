import express from "express";

import {
  adminRegister,
  AdminLogin,
  adminOtpTimer,
  verifyAdminOtp,
  resendAdminOtp,
  logoutAdmin,
  checkAdminAuth,
  forgotAdminPassword,
  checkAdminForgotOtp,
  updateAdminPassword,
  adminForgotOtpTimer,
  refreshAdminAccessToken,
} from "../Controller/admin.js";

import { adminAuthMiddleware } from "../middleware/admin.js";

const adminRoutes = express.Router();

// Register & Login
adminRoutes.post("/register", adminRegister);
adminRoutes.post("/login", AdminLogin);

// OTP
adminRoutes.post("/verify_otp", verifyAdminOtp);
adminRoutes.post("/resend", resendAdminOtp);
adminRoutes.get("/otpTimer", adminOtpTimer);

// Authentication
adminRoutes.post("/logout", adminAuthMiddleware, logoutAdmin);
adminRoutes.get("/auth-check", adminAuthMiddleware, checkAdminAuth);

// Forgot Password
adminRoutes.post("/forgotPassword", forgotAdminPassword);
adminRoutes.post("/checkForgotOtp", checkAdminForgotOtp);
adminRoutes.post("/updatePassword", updateAdminPassword);
adminRoutes.get("/forgotOtpTimer", adminForgotOtpTimer);

// Refresh Token
adminRoutes.post("/refreshToken", refreshAdminAccessToken);

export default adminRoutes;