const express = require("express");
const { protect } = require("../Middleware/authMiddleware");
const upload = require("../Middleware/uploadMiddleware");
const {
  uploadResume,
  uploadResumePdf
} = require("../Controller/resumeController");

const router = express.Router();

router.post("/", protect, uploadResume);
router.post("/pdf", protect, upload.single("resume"), uploadResumePdf);

module.exports = router;
