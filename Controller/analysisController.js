import Job from "../Model/jobSchema.js";
import Resume from "../Model/resumeSchema.js";
import Insight from "../Model/insightSchema.js";
import Analysis from "../Model/analysisSchema.js";



const SKILL_SYNONYMS = {
    html5: "html",
    css3: "css",
    js: "javascript",
    ts: "typescript",
    "node.js": "nodejs",
    "node js": "nodejs",
    expressjs: "express",
    "express.js": "express",
    reactjs: "react",
    "react.js": "react",
    angularjs: "angular",
    "angular.js": "angular",
    vuejs: "vue",
    "vue.js": "vue",
    mongodb: "mongo",
    "mongo db": "mongo",
    sql: "database",
    mysql: "database",
    postgres: "database",
    restapi: "api",
    "rest api": "api",
    apis: "api",
    github: "git",
    gitlab: "git",
    dockerized: "docker",
    kubernetes: "k8s",
    "kubernetes": "k8s",
    firebase: "backend",
    reduxjs: "redux",
    "redux.js": "redux"
};


// 🔧 Normalize skills (SCALABLE)
const normalizeSkill = (skill) => {
    let s = skill.toLowerCase().trim();

    // remove brackets
    s = s.replace(/\(.*?\)/g, "");

    // remove version numbers (HTML5 → html)
    s = s.replace(/\d+(\.\d+)?/g, "");

    // normalize dots
    s = s.replace(/\./g, "");

    // replace special chars
    s = s.replace(/&/g, "and");

    // remove extra spaces
    s = s.replace(/\s+/g, " ").trim();

    // apply synonym mapping
    if (SKILL_SYNONYMS[s]) {
        return SKILL_SYNONYMS[s];
    }

    return s;
};


//  Split skills
const splitSkills = (skills) => {
    return skills.flatMap(skill =>
        skill
            .toLowerCase()
            .split(/,| and |\/|\|/)
            .map(s => s.trim())
            .filter(Boolean)
    );
};


//  Remove duplicates
const unique = (arr) => [...new Set(arr)];



const isMatch = (skill, resumeSkills) => {
    return resumeSkills.some(r =>
        r === skill ||
        r.includes(skill) ||
        skill.includes(r)
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

        //  APPLY FULL PIPELINE
        const resumeSkills = unique(
            splitSkills(resume.parsedData.skills).map(normalizeSkill)
        );

        const requiredSkills = unique(
            splitSkills(job.extracted.requiredSkills).map(normalizeSkill)
        );

        const preferredSkills = unique(
            splitSkills(job.extracted.preferredSkills).map(normalizeSkill)
        );

        //  SMART MATCHING
        const matchedSkills = requiredSkills.filter(skill =>
            isMatch(skill, resumeSkills)
        );

        const missingSkills = requiredSkills.filter(skill =>
            !isMatch(skill, resumeSkills)
        );

        const highImpactGaps = preferredSkills.filter(skill =>
            !isMatch(skill, resumeSkills)
        );

        // SCORE
        const score =
            requiredSkills.length === 0
                ? 0
                : Math.round((matchedSkills.length / requiredSkills.length) * 100);

        // VERDICT
        let verdict = "Not Ready";
        if (score >= 80) verdict = "Ready to Apply";
        else if (score >= 50) verdict = "Partially Ready";
        else if (score >= 30) verdict = "Partially Not Ready";

        //  SAVE
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

        //  INSIGHTS
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


// history
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


// single
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