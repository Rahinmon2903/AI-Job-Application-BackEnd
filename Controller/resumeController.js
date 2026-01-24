const Resume = require("../Model/resumeSchema");
const pdfParse = require("pdf-parse");
const openai = require("../config/openai");

//  openai function
const extractResumeWithAI = async (resumeText) => {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: "You extract structured data from resumes."
      },
      {
        role: "user",
        content: `
Return ONLY valid JSON in this format:

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

// TEXT RESUME
const uploadResume = async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText) {
      return res.status(400).json({ message: "Resume text is required" });
    }

    const parsedData = await extractResumeWithAI(resumeText);

    const lastResume = await Resume.findOne({ userId: req.user._id }).sort({ version: -1 });
    const version = lastResume ? lastResume.version + 1 : 1;

    const resume = await Resume.create({
      userId: req.user._id,
      originalText: resumeText,
      parsedData,
      version
    });

    res.status(201).json({ message: "Resume uploaded", resume });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
};

// PDF RESUME
const uploadResumePdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "PDF file required" });
    }

    const data = await pdfParse(req.file.buffer);

    if (!data.text || data.text.trim().length === 0) {
      return res.status(400).json({ message: "Unable to extract text from PDF" });
    }

    const parsedData = await extractResumeWithAI(data.text);

    const lastResume = await Resume.findOne({ userId: req.user._id }).sort({ version: -1 });
    const version = lastResume ? lastResume.version + 1 : 1;

    const resume = await Resume.create({
      userId: req.user._id,
      originalText: data.text,
      parsedData,
      version
    });

    res.status(201).json({ message: "PDF resume uploaded", resume });
  } catch (err) {
    console.error("PDF ERROR:", err);
    res.status(500).json({ message: "PDF upload failed" });
  }
};

module.exports = { uploadResume, uploadResumePdf };
