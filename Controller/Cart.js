import { Cart } from "../Model/Cart.js";
export const addCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, name, image, category, description, price } = req.body;

    if (
      !productId ||
      !name ||
      !category ||
      price === undefined
    ) {
      return res.status(400).json({
        message: "Please Provide All Details",
      });
    }
    const existingCart = await Cart.findOne({ userId });
    if (!existingCart) {
      const cart = new Cart({
        userId,
        items: [
          {
            productId,
            name,
            image,
            description,
            category,
            price,
            quantity: 1,
          },
        ],
      });

      await cart.save();
      return res.status(201).json({
        message: "added successfully",
      });
    }
    const existingProduct = existingCart.items.find(
      (item) => String(item.productId) === String(productId),
    );
    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      existingCart.items.push({
        productId,
        name,
        image,
        description,
        category,
        price,
        quantity: 1,
      });
    }

    await existingCart.save();

    return res.status(200).json({
      message: "Product added successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getCart=async(req,res)=>{
  try {
    const userId=req.user.userId

    const cart=await Cart.findOne({userId})
    if(!cart){
      return res.status(200).json({
      items:[]
    });
    }
    return res.status(200).json({
      items:cart.items
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

export const cartCount=async(req,res)=>{
  try {
    const userId=req.user.userId;
     const cart=await Cart.findOne({userId})
    if(!cart){
      return res.status(200).json({
      count:0
    });
    }
    const count=cart.items.reduce((total,item)=>total+item.quantity,0)

     return res.status(200).json({
      count
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}
export const removeCartItem=async(req,res)=>{
  try {
    const userId=req.user.userId;
    const {productId}=req.body
    
    const cart=await Cart.findOne({userId});
    if(!cart){
       return res.status(400).json({
      message: "cart not found",
      items:[]
    });
    }
    const existingCart=cart.items.find((item)=>String(item.productId)===String(productId))
    if(!existingCart){
       return res.status(400).json({
      message: "product not found",
      items:cart.items
    });
    }

    if(existingCart.quantity>1){
      existingCart.quantity -= 1;
    }
    else{
      cart.items=cart.items.filter((item)=>String(item.productId)!==String(productId))
    }

    await cart.save();
    
     return res.status(200).json({
      message: "removed successfully",
      items:cart.items
    });
  } catch (error) {
     return res.status(500).json({
      message: error.message,
    });
  }
}
