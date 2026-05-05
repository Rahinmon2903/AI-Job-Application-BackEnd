import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true
    },
    matchScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    missingSkills: {
      type: [String],
      default: []
    },
    highImpactGaps: {
      type: [String],
      default: []
    },
    verdict: {
      type: String,
      enum: [
        "Not Ready",
        "Partially Not Ready",
        "Partially Ready",
        "Ready to Apply"
      ]
    },
    explanation: String
  },
  { timestamps: true }
);

const Analysis = mongoose.model("Analysis", analysisSchema);

export default Analysis;