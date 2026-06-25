const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
  getWishlist,
  toggleWishlist,
  clearWishlist,
} = require("../controllers/wishlistController");

router.get("/:userEmail", auth, getWishlist);
router.post("/toggle", auth, toggleWishlist);
router.delete("/:userEmail", auth, clearWishlist);

module.exports = router;