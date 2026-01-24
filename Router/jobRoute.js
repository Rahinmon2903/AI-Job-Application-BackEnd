const express=require("express");
const {protect}=require("../Middleware/authMiddleware");
const {createJob}=require("../Controller/jobController");


const router=express.Router();

router.post("/",protect, createJob);

module.exports=router;