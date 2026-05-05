import Job from "../Model/jobSchema.js";
import Resume from "../Model/resumeSchema.js";
import Insight from "../Model/insightSchema.js";
import Analysis from "../Model/analysisSchema.js";


const normalizeSkill = (skill) => {
    return skill
        .toLowerCase() // converts into lower case
        .replace(/\(.*?\)/g, "") // remove brackets
        .replace(/&/g, "and") // convert && to and
        .replace(/[^a-z0-9\s]/g, "") // remove special characters
        .trim(); // remove extra space
};


// analyze match
export const analyzeMatch = async (req, res) => {
    try {
        // destructure
        const { jobId, resumeId } = req.body;

        // validation
        if (!jobId || !resumeId) {
            return res.status(400).json({ message: "Job and resume ids are required" });
        }

        // finding resume and job
        const [resume, job] = await Promise.all([
            Resume.findById(resumeId),
            Job.findById(jobId)
        ]);

        // validation
        if (!resume || !job) {
            return res.status(404).json({ message: "Resume or job not found" });
        }

        // extracting skills
        const resumeSkills = resume.parsedData.skills.map(normalizeSkill);
        const requiredSkills = job.extracted.requiredSkills.map(normalizeSkill);
        const preferredSkills = job.extracted.preferredSkills.map(normalizeSkill);

        // matching required skills
        const matchedSkills = requiredSkills.filter(reqSkill => {
            const parts = reqSkill.split(" and ").map(s => s.trim());
            return parts.every(p => resumeSkills.includes(p));
        });

        // missing required skills
        const missingSkills = requiredSkills.filter(reqSkill => {
            const parts = reqSkill.split(" and ").map(s => s.trim());
            return !parts.every(p => resumeSkills.includes(p));
        });

        // preferred gaps
        const highImpactGaps = preferredSkills.filter(skill =>
            !resumeSkills.includes(skill)
        );

        // score
        const score =
            requiredSkills.length === 0
                ? 0
                : Math.round((matchedSkills.length / requiredSkills.length) * 100);

        // verdict
        let verdict = "Not Ready";
        if (score >= 80) verdict = "Ready to Apply";
        else if (score >= 50) verdict = "Partially Ready";
        else if (score >= 30) verdict = "Partially Not Ready";

        // save analysis
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

        // --- INSIGHTS (optimized) ---
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


// getting history
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


// get single analysis by id
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
