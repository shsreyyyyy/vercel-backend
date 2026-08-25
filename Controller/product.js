import { Product } from "../Model/product.js";

export const addProduct = async (req, res) => {
  try {
    const {
      name,
      image,
      description,
      price,
      quantity,
      category,
    } = req.body;

    if (
      !name ||
      !image ||
      !description ||
      price === undefined ||
      quantity === undefined ||
      !category
    ) {
      return res.status(400).json({
        message: "Please provide all product details",
      });
    }

    const product = new Product({
      name,
      image,
      description,
      price,
      quantity,
      category,
    });

    await product.save();

    return res.status(201).json({
      message: "Product added successfully",
      product,
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getProducts = async (req, res) => {
  try {

    const { category } = req.query;

    let products;

    if (!category || category === "All Categories") {

      products = await Product.find();

    } else {

      products = await Product.find({
        category: category
      });

    }

    return res.status(200).json({
      message: "Products fetched successfully",
      products
    });

  } catch (error) {

    return res.status(500).json({
      message: error.message
    });

  }
};

export const getCategoryCount = async (req, res) => {
  try {
    const categories = [
      "Electronics",
      "Fashion",
      "Home & Kitchen",
      "Books",
      "Beauty",
      "Sports",
      "Toys",
      "Mobiles",
    ];

    const categoryCount = await Promise.all(
      categories.map(async (category) => {
        const count = await Product.countDocuments({
          category: category,
        });

        return {
          name: category,
          products: count,
        };
      })
    );

    return res.status(200).json({
      success: true,
      categories: categoryCount,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      image,
      description,
      price,
      quantity,
      category,
    } = req.body;

    if (
      !name ||
      !image ||
      !description ||
      price === undefined ||
      quantity === undefined ||
      !category
    ) {
      return res.status(400).json({
        message: "Please provide all product details",
      });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      {
        name,
        image,
        description,
        price,
        quantity,
        category,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      message: "Product updated successfully",
      product,
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      message: "Product deleted successfully",
      product,
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      message: "Product fetched successfully",
      product,
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};