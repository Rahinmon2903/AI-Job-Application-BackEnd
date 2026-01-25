const Job = require("../Model/jobSchema");
const groq = require("../config/groq");

// AI FUNCTION
const extractJobWithAI = async (jobText) => {
  const response = await groq.chat.completions.create({
    model: "llama3-8b-8192",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: "Extract structured job requirements."
      },
      {
        role: "user",
        content: `
Return ONLY valid JSON:

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

// CONTROLLER 
const createJob = async (req, res) => {
  try {
    const { jobText } = req.body;
    if (!jobText) {
      return res.status(400).json({ message: "Job text required" });
    }

    const extracted = await extractJobWithAI(jobText);

    const job = await Job.create({
      userId: req.user._id,
      text: jobText,
      extracted
    });

    res.status(201).json({ job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Job creation failed" });
  }
};

module.exports = { createJob };
