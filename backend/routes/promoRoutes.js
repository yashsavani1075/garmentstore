const express = require("express");
const router = express.Router();
const {
  addPromo,
  getPromos,
  updatePromo,
  deletePromo,
  validatePromo
} = require("../controllers/promoController");

const adminAuth = require("../middleware/adminAuth");


router.post("/validate", validatePromo);

router.post("/", adminAuth, addPromo);
router.get("/", adminAuth, getPromos);
router.put("/:id", adminAuth, updatePromo);
router.delete("/:id", adminAuth, deletePromo);

module.exports = router;