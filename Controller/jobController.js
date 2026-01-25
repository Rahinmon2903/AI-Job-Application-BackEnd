const Job = require("../Model/jobSchema");
const openai = require("../config/openai");


//AI
const extractJobWithAI = async (jobText) => {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: "You extract structured job requirements."
      },
      {
        role: "user",
        content: `
Return ONLY valid JSON in this format:

{
  "requiredSkills": [],
  "preferredSkills": [],
  "seniority": "junior | mid | senior",
  "domain": ""
}

Job Description:
${jobText}
`
      }
    ]
  });

  return JSON.parse(response.choices[0].message.content);
};



//reading the description andstoring in db
const createJob = async (req, res) => {
    try {
        const { jobText } = req.body;
        if (! jobText) {
            return res.status(400).json({ message: "Job description is required" });
        }

        const extracted = await extractJobWithAI(jobText);
    
        const newJob = new Job({ userId: req.user._id, text: jobText, extracted });
        await newJob.save();
        res.status(201).json({ message: "Job created successfully", job: newJob });


    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error in creating job" });

    }
}

module.exports = { createJob };