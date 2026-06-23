const express = require("express");
const router = express.Router();

const {
  getWishlist,
  toggleWishlist,
  clearWishlist,
} = require("../controllers/wishlistController");

router.get("/:userEmail", getWishlist);
router.post("/toggle", toggleWishlist);
router.delete("/:userEmail", clearWishlist);

module.exports = router;