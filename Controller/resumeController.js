import Resume from "../Model/resumeSchema.js";
import pdfParse from "pdf-parse";
import groq from "../config/groq.js";


//  Extract JSON safely
const extractJSONBlock = (text) => {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("No JSON object found in AI response");
  }
  return match[0];
};



const cleanSkills = (skills) => {
  return skills.flatMap(skill =>
    skill
      .toLowerCase()
      // split only meaningful separators
      .split(/,| and |\/|\|/)
      .map(s => s.trim())
      .filter(Boolean)
  );
};


// 🔥 AI FUNCTION 
const extractResumeWithAI = async (resumeText) => {
  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: `
You are a resume parser.

STRICT RULES:
- Extract skills as individual items
- NEVER combine multiple skills
- ❌ WRONG: "HTML CSS JavaScript"
- ❌ WRONG: "reactjavascript hooks"
- ✅ CORRECT: ["html", "css", "javascript"]
- Normalize names:
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
  "skills": [],
  "experienceLevel": "junior | mid | senior",
  "domains": []
}

Resume:
${resumeText}
`
      }
    ]
  });

  const raw = response.choices[0].message.content;
  const jsonOnly = extractJSONBlock(raw);

  try {
    const parsed = JSON.parse(jsonOnly);

    //  CLEAN SKILLS HERE
    parsed.skills = cleanSkills(parsed.skills);

    return parsed;

  } catch {
    throw new Error("Invalid JSON returned from AI");
  }
};


// ---------- TEXT RESUME ----------
export const uploadResume = async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText) {
      return res.status(400).json({ message: "Resume text required" });
    }

    const parsedData = await extractResumeWithAI(resumeText);

    const last = await Resume
      .findOne({ userId: req.user._id })
      .sort({ version: -1 });

    const version = last ? last.version + 1 : 1;

    const resume = await Resume.create({
      userId: req.user._id,
      originalText: resumeText,
      parsedData,
      version
    });

    res.status(201).json({ resume });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Resume upload failed" });
  }
};


// ---------- PDF RESUME ----------
export const uploadResumePdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "PDF required" });
    }

    const data = await pdfParse(req.file.buffer);

    if (!data.text || data.text.trim().length === 0) {
      return res.status(400).json({ message: "Unable to read PDF" });
    }

    const parsedData = await extractResumeWithAI(data.text);

    const last = await Resume
      .findOne({ userId: req.user._id })
      .sort({ version: -1 });

    const version = last ? last.version + 1 : 1;

    const resume = await Resume.create({
      userId: req.user._id,
      originalText: data.text,
      parsedData,
      version
    });

    res.status(201).json({ resume });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "PDF upload failed" });
  }
};