import mongoose from "mongoose";

const insightSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    skill: String,
    type: {
      type: String,
      enum: ["high_gap", "repeated_gap"]
    },
    frequency: { type: Number, default: 1 },
    lastSeen: Date,
    message: String
  },
  { timestamps: true }
);

const Insight = mongoose.model("Insight", insightSchema);
export default Insight;
