const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || process.env.MONGO_URL || process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/ner_logistics',
  jwtSecret: process.env.JWT_SECRET || 'ner_logistics_tactical_command_secret_2026_super_secure_key',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  openWeatherApiKey: process.env.OPENWEATHER_API_KEY || '',
  clientOrigin: process.env.CLIENT_ORIGIN || '*'
};

module.exports = config;
