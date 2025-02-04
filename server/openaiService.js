// openaiService.js
require('dotenv').config();
const Configuration  = require('openai');
const OpenAIApi  = require('openai');
const { logEvent } = require('./logger');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

/**
 * createChatCompletion - helper to call OpenAI
 * @param {string} prompt
 * @param {number} maxTokens
 * @returns {string} content from OpenAI
 */
async function createChatCompletion(prompt, maxTokens = 5000) {
  logEvent('INFO', ` prompt=(${prompt})`);

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: prompt }
    ],
    max_tokens: maxTokens
  });
  return response.choices[0].message.content;
}

module.exports = { createChatCompletion, openai };
