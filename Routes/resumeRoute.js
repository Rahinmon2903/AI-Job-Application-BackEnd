import express from "express";
import { uploadResume, uploadResumePdf } from "../Controller/resumeController.js";
import { protect } from "../Middleware/authMiddleware.js";
import upload from "../Middleware/uploadMiddleware.js";


const router=express.Router();

router.post("/",protect, uploadResume);
router.post("/pdf",protect, upload.single("resume"), uploadResumePdf);

export default router;