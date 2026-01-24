import Resume from "../Model/resumeSchema.js";
import pdfParse from "pdf-parse";


export const uploadResume = async (req, res) => {
    try {
        const { resumeText } = req.body;
        if (!resumeText) {
            return res.status(400).json({ message: "Resume text is required" });

        }
        //AI output
        const parsedData = {
            skills: ["React", "Node.js", "MongoDB"],
            experienceLevel: "mid",
            domains: ["Web", "SaaS"]
        };
        const lastResume = await Resume.findOne({ userId: req.user._id }).sort({ version: -1 });

        const version = lastResume ? lastResume.version + 1 : 1;
        const newResume = new Resume({ userId: req.user._id, originalText: resumeText, parsedData,version });
        await newResume.save();
        res.status(201).json({ message: "Resume uploaded successfully", resume: newResume });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error in uploading resume" });
    }
}

export const uploadResumePdf = async (req, res) => {
    try {
          if (!req.file) {
      return res.status(400).json({ message: "PDF file required" });
    }

    const pdfData = await pdfParse(req.file.buffer);
    const resumeText=pdfData.text;
     //AI output
        const parsedData = {
            skills: ["React", "Node.js", "MongoDB"],
            experienceLevel: "mid",
            domains: ["Web", "SaaS"]
        };
        const lastResume = await Resume.findOne({ userId: req.user._id }).sort({ version: -1 });

        const version = lastResume ? lastResume.version + 1 : 1;
        const newResume = new Resume({ userId: req.user._id, originalText: resumeText, parsedData,version });
        await newResume.save();
        res.status(201).json({ message: "Resume uploaded successfully", resume: newResume });


    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error in uploading resume PDF" });
    }
}