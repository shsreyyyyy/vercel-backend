import { Cart } from "../Model/Cart.js";
import { Order } from "../Model/order.js";

// create order
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      paymentMethod,
      deliveryCharge = 50,
    } = req.body;

    if (!paymentMethod) {
      return res.status(400).json({
        message: "Please select payment method",
      });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    const subtotal = cart.items.reduce(
      (total, item) =>
        total + item.price * item.quantity,
      0
    );

    const total = subtotal + deliveryCharge;

    const order = await Order.create({
      userId,

      items: cart.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      })),

      subtotal,
      deliveryCharge,
      total,

      paymentMethod,

      paymentStatus:
        paymentMethod === "cash"
          ? "pending"
          : "paid",

      orderStatus: "placed",
    });

    // Order banne ke baad cart empty
    cart.items = [];
    await cart.save();

    return res.status(201).json({
      message: "Order placed successfully",
      order,
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// get order
export const getOrders = async (req, res) => {
  try {

    const userId = req.user.userId;

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Orders fetched successfully",
      orders,
    });

  } catch (error) {

    return res.status(500).json({
      message: error.message,
    });

  }
};

// admin fetch 
export const getRecentOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(4);

    return res.status(200).json({
      message: "Recent orders fetched successfully",
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
// get all order
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "All orders fetched successfully",
            orders
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

// update order status
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { orderStatus } = req.body;

        const allowedStatus = [
            "placed",
            "processing",
            "shipped",
            "delivered",
            "cancelled"
        ];

        if (!allowedStatus.includes(orderStatus)) {
            return res.status(400).json({
                message: "Invalid order status"
            });
        }

        const order = await Order.findByIdAndUpdate(
            id,
            { orderStatus },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        return res.status(200).json({
            message: "Order status updated successfully",
            order
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

// cancel order
export const cancelOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const order = await Order.findOne({
      _id: id,
      userId,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // User sirf placed/processing order cancel kar sakta hai
    if (!["placed", "processing"].includes(order.orderStatus)) {
      return res.status(400).json({
        message: "Order cannot be cancelled at this stage",
      });
    }

    order.orderStatus = "cancelled";

    await order.save();

    return res.status(200).json({
      message: "Order cancelled successfully",
      order,
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};