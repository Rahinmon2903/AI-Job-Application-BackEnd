const Job = require("../Model/jobSchema.js");
const Resume = require("../Model/resumeSchema.js");
const Insight = require("../Model/insightSchema.js");
const Analysis = require("../Model/analysisSchema.js");


const normalizeSkill = (skill) => {
    return skill
        .toLowerCase()
        .replace(/\(.*?\)/g, "")
        .replace(/&/g, "and")
        .replace(/[^a-z0-9\s]/g, "")
        .trim();
};


// analyze match
const analyzeMatch = async (req, res) => {
    try {
        const { jobId, resumeId } = req.body;

        if (!jobId || !resumeId) {
            return res.status(400).json({ message: "Job and resume ids are required" });
        }

        const resume = await Resume.findById(resumeId);
        const job = await Job.findById(jobId);

        if (!resume || !job) {
            return res.status(404).json({ message: "Resume or job not found" });
        }

        const resumeSkills = resume.parsedData.skills.map(normalizeSkill);
        const requiredSkills = job.extracted.requiredSkills.map(normalizeSkill);
        const preferredSkills = job.extracted.preferredSkills.map(normalizeSkill);


        const matchedSkills = requiredSkills.filter(reqSkill => {
            const parts = reqSkill.split(" and ").map(s => s.trim());
            return parts.every(p => resumeSkills.includes(p));
        });

        const missingSkills = requiredSkills.filter(reqSkill => {
            const parts = reqSkill.split(" and ").map(s => s.trim());
            return !parts.every(p => resumeSkills.includes(p));
        });

        const highImpactGaps = preferredSkills.filter(skill =>
            !resumeSkills.includes(skill)
        );

        const score =
            requiredSkills.length === 0
                ? 0
                : Math.round((matchedSkills.length / requiredSkills.length) * 100);

        let verdict = "Not Ready";
        if (score >= 80) verdict = "Ready to Apply";
        else if (score >= 50) verdict = "Partially Ready";
        else if (score >= 30) verdict = "Partially Not Ready";

        const analysis = await Analysis.create({
            userId: req.user._id,
            jobId,
            resumeId,
            matchScore: score,
            missingSkills,
            highImpactGaps,
            verdict,
            explanation: `Matched ${matchedSkills.length} out of ${requiredSkills.length} required skills.`
        });

        for (let skill of missingSkills) {
            const insight = await Insight.findOne({
                userId: req.user._id,
                skill,
                type: "high_gap"
            })

            if (insight) {
                insight.frequency++;
                insight.lastSeen = new Date();
                await insight.save();
            } else {
                await Insight.create({
                    userId: req.user._id,
                    skill,
                    type: "high_gap",

                    lastSeen: new Date(),
                    message: `${skill} is a critical missing skill across multiple job applications.`
                })
            }
        }

        for (const skill of highImpactGaps) {
            let insight = await Insight.findOne({
                userId: req.user._id,
                skill,
                type: "repeated_gap"
            });

            if (insight) {
                insight.frequency += 1;
                insight.lastSeen = new Date();
                await insight.save();
            } else {
                await Insight.create({
                    userId: req.user._id,
                    skill,
                    type: "repeated_gap",
                    message: `${skill} frequently appears as a preferred requirement.`,
                    lastSeen: new Date()
                });
            }
        }


        res.status(201).json({
            message: "Analysis completed with insights",
            analysis
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error in creating analysis" });
    }
};


//getting history
const getMyAnalysisHistory = async (req, res) => {
  try {
    const history = await Analysis.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// get single analysis by id
const getAnalysisById = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found" });
    }

    res.status(200).json(analysis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = { analyzeMatch, getMyAnalysisHistory,getAnalysisById };


