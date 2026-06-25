const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const calculateTotal = require("../utils/calculateTotal");

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
router.post("/create-order", async (req, res) => {
  try {
    const { items, promoCode } = req.body;

    const amount = await calculateTotal(items, promoCode);

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const options = {
      amount: Math.round(amount * 100), // rupees to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Razorpay order error:", err);
    res.status(500).json({ message: "Failed to create payment order" });
  }
});

// Verify payment
router.post("/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign === razorpay_signature) {
      return res.json({
        success: true,
        message: "Payment verified successfully",
      });
    }

    res.status(400).json({
      success: false,
      message: "Invalid payment signature",
    });
  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).json({ message: "Payment verification failed" });
  }
});

module.exports = router;