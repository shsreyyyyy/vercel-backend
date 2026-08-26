import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { cancelOrder, createOrder,getAllOrders,getOrders, getRecentOrders, updateOrderStatus } from "../Controller/order.js";
import { adminAuthMiddleware } from "../middleware/admin.js";
const orderRoutes = express.Router();

orderRoutes.post("/create",authMiddleware,createOrder);

orderRoutes.get("/get",authMiddleware,getOrders);
orderRoutes.get("/admin/recent",authMiddleware,getRecentOrders);
orderRoutes.get("/admin/all",authMiddleware,getAllOrders);
orderRoutes.put("/admin/status/:id",adminAuthMiddleware,updateOrderStatus);
orderRoutes.put("/user/cancel/:id",authMiddleware,cancelOrder);







export default orderRoutes;