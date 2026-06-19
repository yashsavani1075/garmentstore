const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");

const {
  getConfig,
  addCategory,
  deleteCategory,
  addSubCategory,
  deleteSubCategory,
  addFabric,
  deleteFabric,
  addSize,
  deleteSize,
} = require("../controllers/configController");

router.get("/", getConfig);

router.post("/category", adminAuth, addCategory);
router.delete("/category/:name", adminAuth, deleteCategory);

router.post("/subcategory", adminAuth, addSubCategory);
router.delete("/subcategory", adminAuth, deleteSubCategory);

router.post("/fabric", adminAuth, addFabric);
router.delete("/fabric/:fabric", adminAuth, deleteFabric);

router.post("/size", adminAuth, addSize);
router.delete("/size/:size", adminAuth, deleteSize);

module.exports = router;