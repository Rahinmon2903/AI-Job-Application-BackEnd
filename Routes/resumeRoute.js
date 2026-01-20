import express from "express";
import { uploadResume } from "../Controller/resumeController.js";
import { protect } from "../Middleware/authMiddleware.js";


const router=express.Router();

router.post("/",protect, uploadResume);

export default router;