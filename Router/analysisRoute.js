const express = require("express");
const { protect } = require("../Middleware/authMiddleware");
const { analyzeMatch,getMyAnalysisHistory,getAnalysisById } = require("../Controller/analysisController");

const router = express.Router();

router.post("/", protect, analyzeMatch);
router.get("/history", protect, getMyAnalysisHistory);
router.get("/:id", protect, getAnalysisById);


module.exports = router;
