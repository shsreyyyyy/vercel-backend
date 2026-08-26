import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { connectDb } from "./db.js";
import cors from "cors";
import userRoutes from "./Routes/User.js";
import cartRoutes from "./Routes/Cart.js";
import adminRoutes from "./Routes/Admin.js";
import cookieParser from "cookie-parser";
import productRoutes from "./Routes/product.js";
import wishlistRoutes from "./Routes/wishlist.js";
import orderRoutes from "./Routes/order.js";

const app = express();

app.use(cors({
  origin: "https://vercel-frontend-six-liart.vercel.app",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(cookieParser());

app.use("/youtube/user", userRoutes);
app.use("/user/cart", cartRoutes);
app.use("/admin", adminRoutes);
app.use("/product", productRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/order", orderRoutes);

await connectDb();

app.get("/", (req, res) => {
  res.json({
    message: "Server is running"
  });
});

export default app;