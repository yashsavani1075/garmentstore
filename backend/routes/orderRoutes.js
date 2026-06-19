const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

const {
  createOrder,
  getOrders,
  deleteOrder,
  updateOrderStatus,
  getUserOrders,
} = require("../controllers/orderController");

router.post("/", auth, createOrder);
router.get("/", adminAuth, getOrders);
router.get("/user/:email", auth, getUserOrders);
router.delete("/:id", adminAuth, deleteOrder);
router.put("/:id", adminAuth, updateOrderStatus);
module.exports = router;