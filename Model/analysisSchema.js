const mongoose = require("mongoose");


const analysisSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job"
    },
    resumeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resume"
    },
    matchScore: Number,
    missingSkills: [String],
    highImpactGaps: [String],
    verdict: String,
    explanation: String
},
{ timestamps: true }
)
const Analysis = mongoose.model('Analysis', analysisSchema);
module.exports = Analysis;