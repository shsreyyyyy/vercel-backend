import express from "express"
import { addProduct, deleteProduct, getCategoryCount, getProductById, getProducts, updateProduct } from "../Controller/product.js";

const productRoutes=express.Router();

productRoutes.post("/add",addProduct)
productRoutes.get("/fetchProducts",getProducts)
productRoutes.get("/categoryCount", getCategoryCount);
productRoutes.put("/update/:id", updateProduct);
productRoutes.delete("/delete/:id", deleteProduct);
productRoutes.get("/:id", getProductById);



export default productRoutes