const express = require("express");
const router = express.Router();

const { getDashboardStats } = require("../controllers/dashboardController");
const adminAuth = require("../middleware/adminAuth");

router.get("/", adminAuth, getDashboardStats);

module.exports = router;