const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getDashboardData } = require("../controllers/dashboardControllers.js");

const router = express.Router();

router.get("/", protect, getDashboardData);

module.exports = router;
