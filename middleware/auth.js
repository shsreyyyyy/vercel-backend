import redis from "../config/redis.js";

export const authMiddleware = async (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "UnAuthorized login,Please Login First",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Token not found",
      });
    }

    const session = await redis.get(`auth:${token}`);

    if (!session) {
      return res.status(401).json({
        message: "Invalid or Token Expire",
      });
    }

    req.user =session;

    next();

  } catch (error) {

    console.error(error.message);

    return res.status(401).json({
      message: "Invalid or Token Expire",
    });
  }
};