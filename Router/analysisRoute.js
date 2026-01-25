const express = require("express");
const { protect } = require("../Middleware/authMiddleware");
const { analyzeMatch,getMyAnalysisHistory } = require("../Controller/analysisController");

const router = express.Router();

router.post("/", protect, analyzeMatch);
router.get("/history", protect, getMyAnalysisHistory);


module.exports = router;
