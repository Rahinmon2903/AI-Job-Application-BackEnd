const express = require("express");
const protect = require("../Middleware/authMiddleware");
const { analyzeMatch } = require("../Controller/analysisController");

const router = express.Router();

router.post("/", protect, analyzeMatch);

module.exports = router;