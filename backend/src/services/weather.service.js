const axios = require('axios');
const config = require('../config/env');

// In-memory weather cache: key -> { data, expiresAt }
const weatherCache = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Fetch current weather & precipitation for a given [lng, lat] coordinate centroid
 */
async function getWeatherForCoordinates(lng, lat, districtName = 'NER Node') {
  const cacheKey = `${lat.toFixed(2)}_${lng.toFixed(2)}`;
  const now = Date.now();

  if (weatherCache.has(cacheKey)) {
    const cached = weatherCache.get(cacheKey);
    if (cached.expiresAt > now) {
      return cached.data;
    }
  }

  // 1. Try OpenWeatherMap if API key is provided
  if (config.openWeatherApiKey && config.openWeatherApiKey.trim() !== '') {
    try {
      const owmUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${config.openWeatherApiKey}&units=metric`;
      const response = await axios.get(owmUrl, { timeout: 4000 });
      const data = response.data || {};

      const rainfallMm = Number(data.rain?.['1h'] || data.rain?.['3h'] || 0);
      const tempC = Math.round(Number(data.main?.temp || 22));
      const humidityPct = Math.round(Number(data.main?.humidity || 75));
      const windKmph = Math.round(Number((data.wind?.speed || 3) * 3.6));
      const condition = data.weather?.[0]?.description
        ? data.weather[0].description.replace(/\b\w/g, l => l.toUpperCase())
        : 'Partly Cloudy';

      const weatherData = {
        districtName,
        tempC,
        humidityPct,
        rainfallMm,
        windKmph,
        condition,
        fetchedAt: new Date(),
        provider: 'OpenWeatherMap',
        isLive: true
      };

      weatherCache.set(cacheKey, {
        data: weatherData,
        expiresAt: now + CACHE_TTL_MS
      });

      console.log(`[Weather Service] Fetched live weather for ${districtName} via OpenWeatherMap: ${tempC}°C, ${condition}`);
      return weatherData;
    } catch (owmErr) {
      console.warn(`[Weather Service] OpenWeatherMap call failed (${owmErr.message}), falling back to Open-Meteo...`);
    }
  }

  // 2. Fallback to Open-Meteo API (Free, no API key required)
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m&forecast_days=1`;
    const response = await axios.get(url, { timeout: 3500 });
    const current = response.data?.current || {};

    const rainfallMm = Number(current.rain || current.precipitation || 0);
    const tempC = Math.round(Number(current.temperature_2m || 22));
    const humidityPct = Math.round(Number(current.relative_humidity_2m || 75));
    const windKmph = Math.round(Number(current.wind_speed_10m || 10));

    const weatherCode = current.weather_code || 0;
    let condition = 'Fair / Partly Cloudy';
    if (weatherCode >= 80) condition = 'Rain Showers';
    else if (weatherCode >= 61) condition = 'Continuous Rain';
    else if (weatherCode >= 51) condition = 'Drizzle / Fog';
    else if (weatherCode >= 45) condition = 'Dense Mountain Fog';
    else if (weatherCode >= 1) condition = 'Overcast';

    const weatherData = {
      districtName,
      tempC,
      humidityPct,
      rainfallMm,
      windKmph,
      condition,
      fetchedAt: new Date(),
      provider: 'Open-Meteo',
      isLive: true
    };

    weatherCache.set(cacheKey, {
      data: weatherData,
      expiresAt: now + CACHE_TTL_MS
    });

    return weatherData;
  } catch (err) {
    // 3. Fallback Heuristics
    const heuristicData = {
      districtName,
      tempC: lat > 27 ? 14 : 24,
      humidityPct: 82,
      rainfallMm: lat > 25.5 ? 12.4 : 4.0,
      windKmph: 11,
      condition: lat > 27 ? 'Mountain Mist & Light Showers' : 'Overcast / Moderate Rain',
      fetchedAt: new Date(),
      provider: 'Regional Heuristics',
      isLive: false
    };

    weatherCache.set(cacheKey, {
      data: heuristicData,
      expiresAt: now + 5 * 60 * 1000
    });

    return heuristicData;
  }
}

module.exports = {
  getWeatherForCoordinates
};
