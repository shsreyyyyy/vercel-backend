import { Product } from "../Model/product.js";
import { Wishlist } from "../Model/wishlist.js";

// ADD TO WISHLIST
export const addWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    const userId = req.user.id;
    console.log("User ID:", userId);
    console.log("Product ID:", productId);

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const alreadyWishlist = await Wishlist.findOne({
      userId,
      productId,
    });

    if (alreadyWishlist) {
      return res.status(400).json({
        message: "Product already in wishlist",
      });
    }

    const wishlist = await Wishlist.create({
      userId,
      productId,
    });

    return res.status(201).json({
      message: "Product added to wishlist",
      wishlist,
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


// GET WISHLIST
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const wishlist = await Wishlist.find({ userId })
      .populate("productId");

    return res.status(200).json({
      message: "Wishlist fetched successfully",
      wishlist,
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


// REMOVE FROM WISHLIST
export const removeWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    const userId = req.user.id;

    const wishlist = await Wishlist.findOneAndDelete({
      userId,
      productId,
    });

    if (!wishlist) {
      return res.status(404).json({
        message: "Product not found in wishlist",
      });
    }

    return res.status(200).json({
      message: "Product removed from wishlist",
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};