const express = require("express");
const { protect } = require("../Middleware/authMiddleware");
const { getMyInsights } = require("../Controller/insightController");


const router = express.Router();

router.get("/", protect, getMyInsights);

module.exports = router;