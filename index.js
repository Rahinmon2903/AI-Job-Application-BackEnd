import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import authRoutes from "./Router/authRoute.js";
import resumeRoutes from "./Router/resumeRoute.js";
import jobRoutes from "./Router/jobRoute.js";
import analysisRoutes from "./Router/analysisRoute.js";
import insightRoutes from "./Router/insightRoute.js";
//config
dotenv.config();
//db
connectDB();
//server
const app = express();
//middleware
app.use(cors());
app.use(express.json());
//routes
app.use("/api/auth", authRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/insights", insightRoutes);
//port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
//default route
app.get("/", (req, res) => {
  res.send("Welcome to my api");
});