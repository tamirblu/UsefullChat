// routes/fileRoutes.js
const express = require('express');
const fs = require('fs');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { logEvent } = require('../logger');
const { createChatCompletion } = require('../openaiService');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Helper chunk function
function chunkText(text, size = 1000) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + size, text.length);
    chunks.push(text.slice(start, end));
    start = end;
  }
  return chunks;
}
router.post('/upload-template-file', upload.single('fileTemplate'), async (req, res) => {
  try {
    logEvent('INFO', 'Started /api/upload-file', req);

    const filePath = req.file.path;
    const userPrompt = req.body.userPrompt;
    if (req.file.originalname.endsWith(".txt")) {

      const dataBuffer = fs.readFileSync(filePath);
      const fullText = dataBuffer.toString('utf-8');
      const fullPrompt = userPrompt + fullText;
      fs.unlinkSync(filePath);
      logEvent('INFO', `Completed text file analysis length=${fullPrompt.length}`, req);
      logEvent('INFO', `Completed text file analysis fullPrompt =${fullPrompt}`, req);

      return res.json({
        success: true,
        prompt: fullPrompt
      });
    }
    // If it's PDF
    else if (req.file.mimetype === 'application/pdf' ) {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      const fullText = pdfData.text;
      const fullPrompt = userPrompt + fullText;
      fs.unlinkSync(filePath);
      logEvent('INFO', `Completed PDF analysis length=${fullPrompt.length}`, req);

      return res.json({
        success: true,
        prompt: fullPrompt
      });
    }
      else {
      fs.unlinkSync(filePath);
      logEvent('INFO', `Unsupported file type: ${req.file.mimetype}`, req);
      return res.status(400).json({ success: false, error: "Unsupported file type" });
    }
  } catch (err) {
    logEvent('ERROR', `Failed /api/upload-file: ${err.message}`, req);
    res.status(500).json({ error: "Error processing file" });
  }
});


router.post('/upload-file', upload.single('fileToAnalyze'), async (req, res) => {
  try {
    logEvent('INFO', 'Started /api/upload-file', req);

    const filePath = req.file.path;
    const userPrompt = req.body.userPrompt || "Please summarize this file";

    // If it's PDF
    if (req.file.mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      const fullText = pdfData.text;

      const textChunks = chunkText(fullText, 1000);
      let partials = [];

      for (let i = 0; i < textChunks.length; i++) {
        const subPrompt = `${userPrompt}\n\n(Chunk ${i+1}):\n${textChunks[i]}`;
        const ans = await createChatCompletion(subPrompt, 800);
        partials.push(ans);
      }

      // Final summary
      const combined = partials.join("\n---\n");
      const finalAnswer = await createChatCompletion(
        `Combine or summarize:\n${combined}`,
        800
      );

      fs.unlinkSync(filePath);
      logEvent('INFO', `Completed PDF analysis length=${finalAnswer.length}`, req);

      return res.json({
        success: true,
        summary: finalAnswer,
        partials
      });
    } else {
      fs.unlinkSync(filePath);
      logEvent('INFO', `Unsupported file type: ${req.file.mimetype}`, req);
      return res.status(400).json({ success: false, error: "Unsupported file type" });
    }
  } catch (err) {
    logEvent('ERROR', `Failed /api/upload-file: ${err.message}`, req);
    res.status(500).json({ error: "Error processing file" });
  }
});

module.exports = router;
