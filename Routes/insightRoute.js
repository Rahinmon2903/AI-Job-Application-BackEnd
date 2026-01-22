import express from "express";
import { protect } from "../Middleware/authMiddleware.js";
import { getMyInsights } from "../Controller/insightController.js";


const router = express.Router();

router.get("/", protect, getMyInsights);

export default router;
