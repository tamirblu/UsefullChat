// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const { logEvent } = require('../logger');
const { createChatCompletion } = require('../openaiService');

router.post('/chat', async (req, res) => {
  try {
    const prompt = req.body.prompt || "";
    logEvent('INFO', `Received /api/chat prompt(length=${prompt.length})`, req);

    const answer = await createChatCompletion(prompt, 1000);
    logEvent('INFO', `OpenAI answer length=${answer.length}`, req);

    res.json({ answer });
  } catch (error) {
    logEvent('ERROR', `Failed /api/chat: ${error.message}`, req);
    res.status(500).json({ error: 'Error during call to OpenAI' });
  }
});

module.exports = router;
