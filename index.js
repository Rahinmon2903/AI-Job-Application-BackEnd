const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");
const authRoutes = require("./Router/authRoute.js");
const resumeRoutes = require("./Router/resumeRoute.js");
const jobRoutes = require("./Router/jobRoute.js");
const analysisRoutes = require("./Router/analysisRoute.js");
const insightRoutes = require("./Router/insightRoute.js");

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
app.use("/api/analyze", analysisRoutes);
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