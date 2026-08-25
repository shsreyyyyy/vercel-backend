import express from "express";
import { addWishlist, getWishlist, removeWishlist } from "../Controller/wishlist.js";
import { authMiddleware } from "../middleware/wishlist.js";

const wishlistRoutes = express.Router();

wishlistRoutes.post("/add",authMiddleware, addWishlist);

wishlistRoutes.get("/get",authMiddleware ,getWishlist);

wishlistRoutes.delete("/remove",authMiddleware, removeWishlist);

export default wishlistRoutes;