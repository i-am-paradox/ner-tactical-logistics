export function formatDistance(km) {
  if (km === undefined || km === null) return '-- km';
  return `${Number(km).toFixed(1)} km`;
}

export function formatDuration(mins) {
  if (!mins) return '--';
  const hrs = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (hrs === 0) return `${m}m`;
  return `${hrs}h ${m}m`;
}

export function formatDate(isoString) {
  if (!isoString) return '--';
  try {
    const d = new Date(isoString);
    return d.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return isoString;
  }
}

export function formatWeight(kg) {
  if (!kg) return '0 kg';
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)} MT`;
  return `${kg} kg`;
}
