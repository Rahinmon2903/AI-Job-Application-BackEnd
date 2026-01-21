import express from "express";
import { protect } from "../Middleware/authMiddleware.js";
import { analyzeMatch } from "../Controller/analysisController.js";


const router = express.Router();

router.post("/", protect, analyzeMatch);

export default router;