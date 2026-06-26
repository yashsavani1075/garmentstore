const Order = require("../models/Order");
const sendMail = require("../utils/sendMail");
const calculateTotal = require("../utils/calculateTotal");
const User = require("../models/User");

exports.createOrder = async (req, res) => {
  try {
    const {
      items,
      address,
      paymentMethod,
      paymentId,
      paymentStatus,
      promoCode,
    } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userEmail = user.email;

    const calculatedTotal = await calculateTotal(items, promoCode);

    const order = await Order.create({
      userEmail,
      items,
      totalAmount: calculatedTotal,
      address,
      paymentMethod: paymentMethod || "COD",
      paymentId: paymentId || "",
      paymentStatus: paymentStatus || "Pending",
      status: "Pending",
    });

    // ✅ Send response immediately
    res.status(201).json({
      message: "Order placed successfully",
      order,
    });

    // ✅ Send email in background
    sendMail({
      to: order.userEmail,
      subject: "Your GarmentStore Order is Confirmed",
      html: `
        <h2>Order Confirmed</h2>
        <p>Thank you for shopping with GarmentStore.</p>

        <h3>Order Details</h3>
        <p><b>Total Amount:</b> ₹${order.totalAmount}</p>
        <p><b>Payment Method:</b> ${order.paymentMethod || "N/A"}</p>
        <p><b>Payment Status:</b> ${order.paymentStatus || "N/A"}</p>
        <p><b>Order Status:</b> ${order.status || "Pending"}</p>

        <h3>Delivery Address</h3>
        <p>
          ${order.address?.fullName || "N/A"}<br/>
          ${order.address?.houseNo || "N/A"}, ${order.address?.street || "N/A"}<br/>
          ${order.address?.city || "N/A"}, ${order.address?.state || "N/A"} - ${order.address?.pincode || "N/A"}<br/>
          Phone: ${order.address?.phone || "N/A"}
        </p>
      `,
    })
      .then(() => console.log("Order confirmation mail sent"))
      .catch((err) => console.log("Mail sending error:", err.message));

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({
      createdAt: -1,
    });

    res.json(orders);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Order deleted",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { returnDocument: "after" }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // ✅ Send response immediately
    res.json(updatedOrder);

    // ✅ Send status mail in background
    sendMail({
      to: updatedOrder.userEmail,
      subject: "GarmentStore Order Status Updated",
      html: `
        <h2>Order Status Updated</h2>
        <p>Your order status is now:</p>
        <h3>${updatedOrder.status}</h3>
        <p>Total Amount: ₹${updatedOrder.totalAmount}</p>
      `,
    })
      .then(() => console.log("Order status mail sent"))
      .catch((err) => console.log("Mail sending error:", err.message));

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const email = user.email;

    const orders = await Order.find({ userEmail: email }).sort({
      createdAt: -1,
    });

    res.json(orders);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};