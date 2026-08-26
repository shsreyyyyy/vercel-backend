import redis from "../config/redis.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("AUTH HEADER:", authHeader);

    if (!authHeader) {
      return res.status(401).json({
        message: "UnAuthorized login,Please Login First",
      });
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        message: "Invalid Authorization format",
      });
    }

    const token = parts[1];

    console.log("TOKEN EXISTS:", !!token);

   const session = await redis.get(`auth:${token}`);

if (!session) {
  return res.status(401).json({
    message: "Invalid or Token Expire",
  });
}

req.user = JSON.parse(session);

    next();

  } catch (error) {
    console.error("AUTH ERROR:", error);

    return res.status(401).json({
      message: "Invalid or Token Expire",
    });
  }
};