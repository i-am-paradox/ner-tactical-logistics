const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('./env');

let genAI = null;
let defaultModel = null;
let visionModel = null;

if (config.geminiApiKey && config.geminiApiKey.trim() !== '') {
  try {
    genAI = new GoogleGenerativeAI(config.geminiApiKey);
    defaultModel = genAI.getGenerativeModel({ model: 'gemini-3.7-flash' });
    visionModel = genAI.getGenerativeModel({ model: 'gemini-3.7-flash' });
    console.log('[Gemini] Google Generative AI SDK successfully initialized with gemini-3.7-flash and user API key.');
  } catch (err) {
    console.warn('[Gemini] Initialization error:', err.message);
  }
} else {
  console.log('[Gemini] No GEMINI_API_KEY detected. Dynamic AI reasoning fallback engine active.');
}

module.exports = {
  genAI,
  defaultModel,
  visionModel,
  hasApiKey: Boolean(config.geminiApiKey && config.geminiApiKey.trim() !== '')
};
