const Resume = require("../Model/resumeSchema");
const pdfParse = require("pdf-parse");
const groq = require("../config/groq");

//AI FUNCTION 
const extractResumeWithAI = async (resumeText) => {
  const response = await groq.chat.completions.create({
    model: "llama3-8b-8192",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: "Extract structured data from resumes."
      },
      {
        role: "user",
        content: `
Return ONLY valid JSON:

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

  return JSON.parse(response.choices[0].message.content);
};

// ---------- TEXT RESUME ----------
const uploadResume = async (req, res) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText) {
      return res.status(400).json({ message: "Resume text required" });
    }

    const parsedData = await extractResumeWithAI(resumeText);

    const last = await Resume.findOne({ userId: req.user._id }).sort({ version: -1 });
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
const uploadResumePdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "PDF required" });
    }

    const data = await pdfParse(req.file.buffer);
    if (!data.text || data.text.trim().length === 0) {
      return res.status(400).json({ message: "Unable to read PDF" });
    }

    const parsedData = await extractResumeWithAI(data.text);

    const last = await Resume.findOne({ userId: req.user._id }).sort({ version: -1 });
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

module.exports = { uploadResume, uploadResumePdf };
