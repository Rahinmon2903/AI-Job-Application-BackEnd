import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./Routes/authRoute.js";
import resumeRoutes from "./Routes/resumeRoute.js";
import jobRoutes from "./Routes/jobRoute.js";

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
app.use("/api/resume", resumeRoutes);
app.use("/api/job", jobRoutes);
//port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
//default route
app.get("/", (req, res) => {
  res.send("Welcome to my api");
});