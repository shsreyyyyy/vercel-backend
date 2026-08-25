import jwt from "jsonwebtoken";

export const adminAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.adminAuthToken;

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized. Please login as admin first",
      });
    }

    const decode = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Check role
    if (decode.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admin only",
      });
    }

    req.admin = decode;

    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired admin token",
    });
  }
};