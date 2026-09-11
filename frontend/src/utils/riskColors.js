export function getRiskColor(score) {
  if (score >= 70) return '#ef4444'; // Red (High)
  if (score >= 40) return '#f59e0b'; // Amber (Moderate)
  return '#22c55e'; // Green (Safe)
}

export function getRiskBand(score) {
  if (score >= 70) return 'high';
  if (score >= 40) return 'moderate';
  return 'safe';
}

export function getRiskBadgeClasses(bandOrScore) {
  const band = typeof bandOrScore === 'number' ? getRiskBand(bandOrScore) : bandOrScore;
  switch (band?.toLowerCase()) {
    case 'high':
    case 'critical':
      return 'bg-red-950/70 text-red-400 border border-red-800/80 shadow-[0_0_12px_rgba(239,68,68,0.25)]';
    case 'moderate':
    case 'warning':
    case 'caution':
      return 'bg-amber-950/70 text-amber-400 border border-amber-800/80 shadow-[0_0_12px_rgba(245,158,11,0.25)]';
    case 'safe':
    case 'low':
    default:
      return 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/80 shadow-[0_0_12px_rgba(34,197,94,0.25)]';
  }
}

export function getSeverityClasses(severity) {
  const num = Number(severity);
  if (num >= 4) return 'bg-red-500/20 text-red-300 border-red-500/50';
  if (num === 3) return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
  return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
}
