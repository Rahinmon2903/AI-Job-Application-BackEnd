import express from "express";
import { protect } from "../Middleware/authMiddleware.js";
import {
  analyzeMatch,
  getMyAnalysisHistory,
  getAnalysisById
} from "../Controller/analysisController.js";

const router = express.Router();

router.post("/", protect, analyzeMatch);
router.get("/history", protect, getMyAnalysisHistory);
router.get("/:id", protect, getAnalysisById);

export default router;