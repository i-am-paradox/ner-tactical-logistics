const { translateAndSummarize } = require('./gemini.service');

// In-memory alert translation cache: alertId_lang -> translatedText
const translationCache = new Map();

/**
 * Unified dispatch for Push, SMS, and In-App notifications with multilingual support
 */
async function dispatchNotification({
  alertId = `ALT-${Date.now()}`,
  severity = 'warning',
  title,
  message,
  affectedDistricts = [],
  channels = ['in_app', 'sms', 'push'],
  recipientLanguage = 'en'
}) {
  console.log(`[Notification Service] Dispatching alert [${severity.toUpperCase()}] across channels: ${channels.join(', ')}`);

  // Multilingual translation if needed
  let localizedMessage = message;
  let localizedTitle = title;

  if (recipientLanguage && recipientLanguage !== 'en') {
    const cacheKey = `${alertId}_${recipientLanguage}`;
    if (translationCache.has(cacheKey)) {
      localizedMessage = translationCache.get(cacheKey);
    } else {
      try {
        localizedMessage = await translateAndSummarize(message, recipientLanguage);
        translationCache.set(cacheKey, localizedMessage);
      } catch (err) {
        console.warn('[Notification Service] Translation failed, fallback to English:', err.message);
      }
    }
  }

  const dispatchResults = {};

  if (channels.includes('in_app')) {
    dispatchResults.in_app = { status: 'delivered', timestamp: new Date() };
  }

  if (channels.includes('sms')) {
    // Mock SMS Gateway dispatch log
    console.log(`[Notification SMS Gateway] Sent SMS to emergency roster in ${affectedDistricts.join(', ')}: "${localizedTitle} - ${localizedMessage.slice(0, 70)}..."`);
    dispatchResults.sms = { status: 'mock_sent', provider: 'NER_TRAI_GATEWAY', timestamp: new Date() };
  }

  if (channels.includes('push')) {
    // Web Push API payload
    dispatchResults.push = { status: 'dispatched', timestamp: new Date() };
  }

  return {
    alertId,
    severity,
    title: localizedTitle,
    message: localizedMessage,
    recipientLanguage,
    channelsDispatched: dispatchResults
  };
}

module.exports = {
  dispatchNotification
};
