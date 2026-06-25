const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");

router.get("/:userEmail", auth, getCart);
router.post("/add", auth, addToCart);
router.put("/quantity", auth, updateQuantity);
router.post("/remove", auth, removeFromCart);
router.delete("/:userEmail", auth, clearCart);

module.exports = router;