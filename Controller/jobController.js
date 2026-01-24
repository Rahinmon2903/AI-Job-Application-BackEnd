const Job = require("../Model/jobSchema");


//reading the description andstoring in db
const createJob = async (req, res) => {
    try {
        const { jobText } = req.body;
        if (! jobText) {
            return res.status(400).json({ message: "Job description is required" });
        }
        //Ai output
        const extracted = {
            requiredSkills: ["React", "Node.js", "REST APIs"],
            preferredSkills: ["AWS", "Docker"],
            seniority: "mid",
            domain: "Web / SaaS"
        };
        const newJob = new Job({ userId: req.user._id, text: jobText, extracted });
        await newJob.save();
        res.status(201).json({ message: "Job created successfully", job: newJob });


    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error in creating job" });

    }
}

module.exports = { createJob };