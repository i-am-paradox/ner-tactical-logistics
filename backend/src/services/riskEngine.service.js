/**
 * Deterministic Risk Engine for NER Logistics Platform
 *
 * Formula:
 *   risk_score = (w_rain * norm_rainfall) +
 *                (w_slope * norm_slope) +
 *                (w_hist * norm_incidents) +
 *                (w_cond * condition_penalty)
 *
 * Thresholds:
 *   0 - 39  -> Safe (Green, #22C55E)
 *   40 - 69 -> Moderate (Amber, #F59E0B)
 *   70 - 100 -> High (Red, #EF4444)
 */

const WEIGHTS = {
  rainfall: 0.35,        // 35% weight on live/forecast rainfall intensity
  slope: 0.25,           // 25% weight on DEM slope gradient
  incidentHistory: 0.20, // 20% weight on past localized disruptions
  condition: 0.20        // 20% weight on physical road status / blockage flags
};

/**
 * Calculates deterministic risk score (0 to 100)
 */
function calculateSegmentRisk({
  rainfallMm = 0,
  slopeDeg = 10,
  historicalIncidentCount = 0,
  isBlocked = false,
  isDegraded = false,
  baseRisk = 20
}) {
  if (isBlocked) {
    return {
      score: 100,
      band: 'high',
      hexColor: '#EF4444',
      breakdown: {
        rainfallFactor: 100,
        slopeFactor: 100,
        historyFactor: 100,
        conditionPenalty: 100
      }
    };
  }

  // Normalize rainfall (0mm -> 0, 100mm+ in 6h -> 100)
  const normRainfall = Math.min(100, Math.max(0, (rainfallMm / 80) * 100));

  // Normalize slope (0 deg -> 0, 45 deg steep cliff -> 100)
  const normSlope = Math.min(100, Math.max(0, (slopeDeg / 40) * 100));

  // Normalize history (0 -> 0, 5+ incidents -> 100)
  const normHistory = Math.min(100, Math.max(0, (historicalIncidentCount / 4) * 100));

  // Road condition penalty
  let condScore = 0;
  if (isDegraded) condScore = 70;
  else condScore = Math.min(100, baseRisk);

  const rawScore = (
    normRainfall * WEIGHTS.rainfall +
    normSlope * WEIGHTS.slope +
    normHistory * WEIGHTS.incidentHistory +
    condScore * WEIGHTS.condition
  );

  const score = Math.round(Math.min(100, Math.max(5, rawScore)));

  let band = 'safe';
  let hexColor = '#22C55E';

  if (score >= 70) {
    band = 'high';
    hexColor = '#EF4444';
  } else if (score >= 40) {
    band = 'moderate';
    hexColor = '#F59E0B';
  }

  return {
    score,
    band,
    hexColor,
    breakdown: {
      rainfallContribution: Math.round(normRainfall * WEIGHTS.rainfall),
      slopeContribution: Math.round(normSlope * WEIGHTS.slope),
      historyContribution: Math.round(normHistory * WEIGHTS.incidentHistory),
      conditionContribution: Math.round(condScore * WEIGHTS.condition)
    }
  };
}

/**
 * Calculates combined overall risk score for an entire multi-segment route
 */
function calculateRouteRisk(segments = []) {
  if (!segments || segments.length === 0) {
    return { overallScore: 20, band: 'safe', hexColor: '#22C55E' };
  }

  let totalWeightedScore = 0;
  let totalDistance = 0;
  let maxSegmentScore = 0;

  segments.forEach(seg => {
    const dist = seg.distanceKm || 10;
    const score = seg.currentRiskScore || seg.baseRiskScore || 20;
    totalWeightedScore += score * dist;
    totalDistance += dist;
    if (score > maxSegmentScore) maxSegmentScore = score;
  });

  const avgScore = totalDistance > 0 ? totalWeightedScore / totalDistance : 20;
  
  // High risk bottle-neck influence (if a single bottleneck has risk >= 80, penalize overall score)
  const finalScore = Math.round(Math.min(100, Math.max(avgScore, maxSegmentScore * 0.75 + avgScore * 0.25)));

  let band = 'safe';
  let hexColor = '#22C55E';

  if (finalScore >= 70) {
    band = 'high';
    hexColor = '#EF4444';
  } else if (finalScore >= 40) {
    band = 'moderate';
    hexColor = '#F59E0B';
  }

  return {
    overallScore: finalScore,
    band,
    hexColor,
    maxSegmentScore
  };
}

module.exports = {
  calculateSegmentRisk,
  calculateRouteRisk,
  WEIGHTS
};
