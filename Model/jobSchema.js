const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    text: String,
    extracted: {
        requiredSkills: [String],
        preferredSkills: [String],
        seniority: String,
        domain: String
    }

},
{ timestamps: true }

)

const Job = mongoose.model('Job', jobSchema);
module.exports = Job