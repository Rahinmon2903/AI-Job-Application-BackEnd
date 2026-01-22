import Job from "../Model/jobSchema.js";
import Resume from "../Model/resumeSchema.js";
import Analysis from "../Model/analysisSchema.js";
import Insight from "../Model/insightSchema.js";

// analyze match
export const analyzeMatch = async (req, res) => {
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

        const resumeSkills = resume.parsedData.skills.map(skill =>
            skill.toLowerCase()
        );
        const requiredSkills = job.extracted.requiredSkills.map(skill =>
            skill.toLowerCase()
        );
        const preferredSkills = job.extracted.preferredSkills.map(skill =>
            skill.toLowerCase()
        );

        const matchedSkills = requiredSkills.filter(skill =>
            resumeSkills.includes(skill)
        );
        const missingSkills = requiredSkills.filter(skill =>
            !resumeSkills.includes(skill)
        );
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
                    frequency: 1,
                    lastSeen: new Date(),
                    message: `You have a high gap in ${skill}`
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
