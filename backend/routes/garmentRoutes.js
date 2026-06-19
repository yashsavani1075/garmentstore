const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const adminAuth = require("../middleware/adminAuth");

const {
  createGarment,
  getGarments,
  getGarment,
  getSimilarProducts,
  updateGarment,
  deleteGarment,
} = require("../controllers/garmentController");

router.post("/", adminAuth, upload.array("photos", 30), createGarment);
router.get("/", getGarments);

router.get("/similar/:id", getSimilarProducts);
router.get("/:id", getGarment);


router.put("/:id", adminAuth, upload.array("photos", 30), updateGarment);
router.delete("/:id", adminAuth, deleteGarment);

module.exports = router;