import redis from "../config/redis.js";

export const authMiddleware = async (req, res, next) => {
  try {

    // 1. Browser cookie se token milega
    const token = req.cookies.authToken;

    if (!token) {
      return res.status(401).json({
        message: "UnAuthorized login,Please Login First",
      });
    }

    // 2. Redis mein token check hoga
    const session = await redis.get(`auth:${token}`);

    if (!session) {
      return res.status(401).json({
        message: "Invalid or Token Expire",
      });
    }

    // 3. Redis ke session se user data
    req.user = JSON.parse(session);

    next();

  } catch (error) {

    console.error("Error message:", error.message);

    return res.status(401).json({
      message: "Invalid or Token Expire",
    });
  }
};