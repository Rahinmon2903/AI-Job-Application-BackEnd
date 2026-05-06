import Job from "../Model/jobSchema.js";
import groq from "../config/groq.js";


//  Extract JSON safely
const extractJSONBlock = (text) => {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
        throw new Error("No JSON object found in AI response");
    }
    return match[0];
};


//  CLEAN SKILLS 
const cleanSkills = (skills) => {
    return skills.flatMap(skill =>
        skill
            .toLowerCase()
            .split(/,| and |\/|\|/)
            .map(s => s.trim())
            .filter(Boolean)
    );
};


//  AI FUNCTION 
const extractJobWithAI = async (jobText) => {
    const response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        temperature: 0,
        messages: [
            {
                role: "system",
                content: `
You are a job description parser.

STRICT RULES:
- Extract skills clearly and individually
- NEVER combine multiple skills
- ❌ WRONG: "html css javascript"
- ❌ WRONG: "reactjavascript hooks"
- ✅ CORRECT: ["html", "css", "javascript"]
- Normalize:
  - Node.js → nodejs
  - Express.js → expressjs
  - JS → javascript
- Keep skills short and meaningful
`
            },
            {
                role: "user",
                content: `
Return ONLY valid JSON.

FORMAT:

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

    try {
        const parsed = JSON.parse(jsonOnly);

        //  CLEAN BOTH ARRAYS
        parsed.requiredSkills = cleanSkills(parsed.requiredSkills || []);
        parsed.preferredSkills = cleanSkills(parsed.preferredSkills || []);

        return parsed;

    } catch {
        throw new Error("Invalid JSON returned from AI");
    }
};


// CONTROLLER 
export const createJob = async (req, res) => {
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