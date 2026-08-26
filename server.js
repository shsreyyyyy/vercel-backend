import dotenv from "dotenv";
import express from "express"
import { connectDb } from "./db.js"
import cors from "cors"
import userRoutes from "./Routes/User.js"
import cartRoutes from "./Routes/Cart.js";
import adminRoutes from "./Routes/Admin.js";
import cookieParser from "cookie-parser"
import productRoutes from "./Routes/product.js";
import wishlistRoutes from "./Routes/wishlist.js";
import orderRoutes from "./Routes/order.js";



dotenv.config(); 

const app = express();
const port = 3000;

app.use(cors({
  origin:process.env.FRONTEND_URL,
  credentials:true
}));

app.use(express.json());
app.use(cookieParser())
app.use("/youtube/user",userRoutes)
app.use("/user/cart",cartRoutes)
app.use("/admin",adminRoutes)
app.use("/product",productRoutes)
app.use("/wishlist",wishlistRoutes)
app.use("/order", orderRoutes);

await connectDb()

app.listen(port, (req,res) => {
  res.status(200).json({
    message:"server is running"
  })

  console.log("server running at ", port);
});
