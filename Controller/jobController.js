const Job = require("../Model/jobSchema");
const groq = require("../config/groq");


const extractJSONBlock = (text) => {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
        throw new Error("No JSON object found in AI response");
    }
    return match[0];
};


// AI FUNCTION
const extractJobWithAI = async (jobText) => {
    const response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
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

    const raw = response.choices[0].message.content;
    const jsonOnly = extractJSONBlock(raw);
    return JSON.parse(jsonOnly);


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
