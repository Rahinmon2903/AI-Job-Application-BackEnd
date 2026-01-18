import mongoose from "mongoose";

const insightSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: String,
    message: String,
    frequency: { type: Number, default: 1 },
    lastSeen: Date
  },
  { timestamps: true }
);

const Insight = mongoose.model("Insight", insightSchema);
export default Insight;
