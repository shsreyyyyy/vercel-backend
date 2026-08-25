import express from "express"
import { addCart, cartCount, getCart, removeCartItem } from "../Controller/Cart.js";
import {authMiddleware} from "../middleware/auth.js";


const cartRoutes=express.Router();

cartRoutes.post("/add",authMiddleware,addCart)
cartRoutes.get("/getCart",authMiddleware,getCart)
cartRoutes.get("/countCartData",authMiddleware,cartCount)
cartRoutes.patch("/removeCartItem",authMiddleware,removeCartItem)



export default cartRoutes;