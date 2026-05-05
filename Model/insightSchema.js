import mongoose from "mongoose";

const insightSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    skill: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ["high_gap", "repeated_gap"],
      required: true
    },
    frequency: {
      type: Number,
      default: 1
    },
    lastSeen: {
      type: Date,
      default: Date.now
    },
    message: String
  },
  { timestamps: true }
);

const Insight = mongoose.model("Insight", insightSchema);

export default Insight;