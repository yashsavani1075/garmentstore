const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const adminAuth = require("../middleware/adminAuth");

const {
  createGarment,
  getGarments,
  getGarment,
  updateGarment,
  deleteGarment,
  getSimilarProducts,
} = require("../controllers/garmentController");

router.post("/", adminAuth, upload.array("photos", 10), createGarment);

router.get("/", getGarments);
router.get("/similar/:id", getSimilarProducts);
router.get("/:id", getGarment);

router.put("/:id", adminAuth, upload.array("photos", 10), updateGarment);

router.delete("/:id", adminAuth, deleteGarment);

module.exports = router;