import redis from "../config/redis.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("AUTH HEADER:", authHeader);

    if (!authHeader) {
      return res.status(401).json({
        message: "Please login first",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Token not found",
      });
    }

    const session = await redis.get(`auth:${token}`);

    console.log("REDIS SESSION:", session);

    if (!session) {
      return res.status(401).json({
        message: "Invalid or Token Expire",
      });
    }

    // Redis se string aati hai, isliye JSON.parse
    req.user = JSON.parse(session);

    console.log("REQ.USER:", req.user);

    next();

  } catch (error) {
    console.error("AUTH ERROR:", error.message);

    return res.status(401).json({
      message: "Invalid or Token Expire",
    });
  }
};