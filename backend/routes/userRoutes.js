const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth");

const {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getProfile,
  updateProfile,
} = require("../controllers/userController");

router.get("/addresses", protect, getAddresses);

router.post("/addresses", protect, addAddress);

router.put(
  "/addresses/:addressId",
  protect,
  updateAddress
);

router.delete(
  "/addresses/:addressId",
  protect,
  deleteAddress
);

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

module.exports = router;