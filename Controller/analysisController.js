import Job from "../Model/jobSchema.js";
import Resume from "../Model/resumeSchema.js";
import Insight from "../Model/insightSchema.js";
import Analysis from "../Model/analysisSchema.js";


// 🔧 Normalize skills
const normalizeSkill = (skill) => {
    return skill
        .toLowerCase()
        .replace(/\(.*?\)/g, "")
        .replace(/&/g, "and")
        .replace(/\bnode\s?js\b/g, "nodejs")
        .replace(/\bexpress\s?js\b/g, "expressjs")
        .replace(/\bjs\b/g, "javascript")
        .replace(/[^a-z0-9\s]/g, "")
        .trim();
};


// 🔧 Split skills properly
const splitSkills = (skills) => {
    return skills.flatMap(skill =>
        skill
            .toLowerCase()
            .split(/,| and |\/|\|/)  // handles comma, "and", slash, and spaces
            .map(s => s.trim())
            .filter(Boolean)
    );
};


// analyze match
export const analyzeMatch = async (req, res) => {
    try {
        const { jobId, resumeId } = req.body;

        if (!jobId || !resumeId) {
            return res.status(400).json({ message: "Job and resume ids are required" });
        }

        const [resume, job] = await Promise.all([
            Resume.findById(resumeId),
            Job.findById(jobId)
        ]);

        if (!resume || !job) {
            return res.status(404).json({ message: "Resume or job not found" });
        }

        // 🔥 Apply split + normalize
        const resumeSkills = splitSkills(resume.parsedData.skills).map(normalizeSkill);
        const requiredSkills = splitSkills(job.extracted.requiredSkills).map(normalizeSkill);
        const preferredSkills = splitSkills(job.extracted.preferredSkills).map(normalizeSkill);

        // 🔥 Matching logic
        const matchedSkills = requiredSkills.filter(skill =>
            resumeSkills.includes(skill)
        );

        const missingSkills = requiredSkills.filter(skill =>
            !resumeSkills.includes(skill)
        );

        const highImpactGaps = preferredSkills.filter(skill =>
            !resumeSkills.includes(skill)
        );

        // 🔥 Score calculation
        const score =
            requiredSkills.length === 0
                ? 0
                : Math.round((matchedSkills.length / requiredSkills.length) * 100);

        // 🔥 Verdict logic
        let verdict = "Not Ready";
        if (score >= 80) verdict = "Ready to Apply";
        else if (score >= 50) verdict = "Partially Ready";
        else if (score >= 30) verdict = "Partially Not Ready";

        // 🔥 Save analysis
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

        // 🔥 INSIGHTS
        const now = new Date();

        for (const skill of missingSkills) {
            await Insight.findOneAndUpdate(
                { userId: req.user._id, skill, type: "high_gap" },
                {
                    $inc: { frequency: 1 },
                    $set: {
                        lastSeen: now,
                        message: `${skill} is a critical missing skill across multiple job applications.`
                    }
                },
                { upsert: true, new: true }
            );
        }

        for (const skill of highImpactGaps) {
            await Insight.findOneAndUpdate(
                { userId: req.user._id, skill, type: "repeated_gap" },
                {
                    $inc: { frequency: 1 },
                    $set: {
                        lastSeen: now,
                        message: `${skill} frequently appears as a preferred requirement.`
                    }
                },
                { upsert: true, new: true }
            );
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


// get history
export const getMyAnalysisHistory = async (req, res) => {
    try {
        const history = await Analysis.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);

        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// get single analysis
export const getAnalysisById = async (req, res) => {
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