const express = require("express");
const router = express.Router();

const {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");

router.get("/:userEmail", getCart);
router.post("/add", addToCart);
router.put("/quantity", updateQuantity);
router.post("/remove", removeFromCart);
router.delete("/:userEmail", clearCart);

module.exports = router;