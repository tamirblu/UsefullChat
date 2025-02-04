// routes/folderRoutes.js
const express = require('express');
const fs = require('fs');
const multer = require('multer');
const AdmZip = require('adm-zip');
const { logEvent } = require('../logger');
const { createChatCompletion } = require('../openaiService');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

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

router.post('/upload-folder', upload.single('folderZip'), async (req, res) => {
  try {
    logEvent('INFO', 'Started /api/upload-folder', req);

    const filePath = req.file.path;
    const userPrompt = req.body.userPrompt || "Please analyze these files";

    const zip = new AdmZip(filePath);
    const entries = zip.getEntries();

    let aggregatedAnswers = [];
    for (let entry of entries) {
      if (entry.isDirectory) continue;

      const lowerName = entry.entryName.toLowerCase();
      // Accept .js, .json, .txt, .md, etc.
      if (
        lowerName.endsWith(".js") ||
        lowerName.endsWith(".json") ||
        lowerName.endsWith(".txt") ||
        lowerName.endsWith(".md") ||
        lowerName.endsWith(".pdf")
      ) {
        const content = entry.getData().toString("utf-8");
        logEvent('INFO', `Processing file: ${entry.entryName}, length=${content.length}`, req);

        const chunks = chunkText(content, 1000);
        for (let i = 0; i < chunks.length; i++) {
          const chunkPrompt = `${userPrompt}\nFile: ${entry.entryName}\n(Chunk ${i+1}):\n${chunks[i]}`;
          const ans = await createChatCompletion(chunkPrompt, 800);
          aggregatedAnswers.push(`File: ${entry.entryName}, chunk #${i+1}\n${ans}`);
        }
      }
    }

    const combined = aggregatedAnswers.join("\n---\n");
    const finalSummary = await createChatCompletion(
      `We have multiple partial analyses:\n${combined}\nPlease provide a concise summary.`,
      800
    );

    fs.unlinkSync(filePath);
    logEvent('INFO', `Completed folder analysis. Final summary len=${finalSummary.length}`, req);

    return res.json({
      success: true,
      summary: finalSummary,
      partials: aggregatedAnswers
    });
  } catch (err) {
    logEvent('ERROR', `Failed /api/upload-folder: ${err.message}`, req);
    return res.status(500).json({ error: "Error processing folder upload" });
  }
});

module.exports = router;
