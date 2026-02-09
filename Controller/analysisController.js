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
        //destructure
        const { jobId, resumeId } = req.body;


        //validation
        if (!jobId || !resumeId) {
            return res.status(400).json({ message: "Job and resume ids are required" });
        }

        //finding resume and job
        const resume = await Resume.findById(resumeId);
        const job = await Job.findById(jobId);
         //validation
        if (!resume || !job) {
            return res.status(404).json({ message: "Resume or job not found" });
        }

//extracting resumeskills,requiredskills,preferredskills
        const resumeSkills = resume.parsedData.skills.map(normalizeSkill);
        const requiredSkills = job.extracted.requiredSkills.map(normalizeSkill);
        const preferredSkills = job.extracted.preferredSkills.map(normalizeSkill);

      //matching resume and required skills
        const matchedSkills = requiredSkills.filter(reqSkill => {
            const parts = reqSkill.split(" and ").map(s => s.trim());
            return parts.every(p => resumeSkills.includes(p));
        });


       //finding missing skills
        const missingSkills = requiredSkills.filter(reqSkill => {
            const parts = reqSkill.split(" and ").map(s => s.trim());
            return !parts.every(p => resumeSkills.includes(p));
        });
        //finding high impact gaps
        const highImpactGaps = preferredSkills.filter(skill =>
            !resumeSkills.includes(skill)
        );
        //finding match score
        const score =
            requiredSkills.length === 0
                ? 0
                : Math.round((matchedSkills.length / requiredSkills.length) * 100);
        //setting sore based on our condition
        let verdict = "Not Ready";
        if (score >= 80) verdict = "Ready to Apply";
        else if (score >= 50) verdict = "Partially Ready";
        else if (score >= 30) verdict = "Partially Not Ready";
        //creating new analysis
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
        //in our insights in type we have two types high_gap and repeated_gap
        //required skills mean this skill is not optional we need it so it is high_gap
        //in the output of missing skill we have the required skills which are not present in resume
        for (let skill of missingSkills) {
            const insight = await Insight.findOne({
                userId: req.user._id,
                skill,
                type: "high_gap"
            })
            // if the skill already present we just increase the frequency and update the date
            if (insight) {
                insight.frequency++;
                insight.lastSeen = new Date();
                await insight.save();
            } else {
                //else we create a new insight for that skill
                await Insight.create({
                    userId: req.user._id,
                    skill,
                    type: "high_gap",

                    lastSeen: new Date(),
                    message: `${skill} is a critical missing skill across multiple job applications.`
                })
            }
        }
        //we have the preferred skills which are not present in resume
        for (const skill of highImpactGaps) {
            let insight = await Insight.findOne({
                userId: req.user._id,
                skill,
                type: "repeated_gap"
            });
           //if the skill already present we just increase the frequency and update the date
            if (insight) {
                insight.frequency += 1;
                insight.lastSeen = new Date();
                await insight.save();
            } else {
                //else we create a new insight for that skill
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
    //getting all my analysis output
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
    //getting single analysis
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


