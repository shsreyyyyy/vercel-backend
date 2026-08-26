export const authMiddleware = async (req, res, next) => {
  try {

    console.log("\n================ AUTH MIDDLEWARE ================");

    console.log("URL:", req.originalUrl);
    console.log("Method:", req.method);

    console.log("Origin:", req.headers.origin);

    console.log("Cookie header exists:", !!req.headers.cookie);

    console.log(
      "Cookie header:",
      req.headers.cookie || "NO COOKIE HEADER"
    );

    console.log("Parsed cookies:", req.cookies);

    const token = req.cookies.authToken;

    console.log(
      "authToken exists:",
      !!token
    );

    if (!token) {

      console.log("❌ AUTH TOKEN NOT FOUND");

      return res.status(401).json({
        message: "UnAuthorized login,Please Login First",
      });
    }

    console.log("JWT verification starting...");

    console.log(
      "JWT_SECRET exists:",
      !!process.env.JWT_SECRET
    );

    const decode = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log("✅ JWT VERIFIED");
    console.log("User ID:", decode.userId);
    console.log("Email:", decode.email);

    req.user = decode;

    next();

  } catch (error) {

    console.error("\n❌ AUTH MIDDLEWARE ERROR");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);

    return res.status(401).json({
      message: "Invalid or Token Expire",
    });
  }
};