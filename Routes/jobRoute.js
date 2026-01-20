import express from "express";

import { protect } from "../Middleware/authMiddleware.js";
import { createJob } from "../Controller/jobController.js";


const router=express.Router();

router.post("/",protect, createJob);

export default router;