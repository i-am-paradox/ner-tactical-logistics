const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const RoadSegment = require('../models/RoadSegment');
const { broadcastVehicleUpdate } = require('../sockets/liveTracking.socket');

let simulationTimer = null;

// Calculate heading angle (0-360 degrees) between two [lng, lat] points
function calculateBearing(lng1, lat1, lng2, lat2) {
  const toRad = deg => (deg * Math.PI) / 180;
  const toDeg = rad => (rad * 180) / Math.PI;

  const dLng = toRad(lng2 - lng1);
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);

  const y = Math.sin(dLng) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLng);

  let bearing = toDeg(Math.atan2(y, x));
  return Math.round((bearing + 360) % 360);
}

async function stepSimulation() {
  try {
    // Check if MongoDB connection is ready
    if (mongoose.connection.readyState !== 1) return;

    const vehicles = await Vehicle.find({
      status: { $in: ['in_transit', 'caution_zone'] }
    });

    if (!vehicles || vehicles.length === 0) return;

    for (const vehicle of vehicles) {
      let polyline = vehicle.activeRoutePolyline;

      if (!polyline || polyline.length < 2) {
        if (vehicle.assignedSegmentId) {
          const segment = await RoadSegment.findOne({ segmentId: vehicle.assignedSegmentId });
          if (segment?.geometry?.coordinates) {
            polyline = segment.geometry.coordinates;
            vehicle.activeRoutePolyline = polyline;
            vehicle.routeProgressIndex = 0;
          }
        }
      }

      if (!polyline || polyline.length < 2) {
        const currentCoord = vehicle.currentLocation?.coordinates || [91.7362, 26.1445];
        const nextCoord = [
          currentCoord[0] + (Math.random() - 0.5) * 0.002,
          currentCoord[1] + (Math.random() - 0.5) * 0.002
        ];
        polyline = [currentCoord, nextCoord];
      }

      let currentIndex = vehicle.routeProgressIndex || 0;
      let nextIndex = currentIndex + 1;

      if (nextIndex >= polyline.length) {
        polyline = polyline.slice().reverse();
        vehicle.activeRoutePolyline = polyline;
        currentIndex = 0;
        nextIndex = 1;
      }

      const p1 = polyline[currentIndex];
      const p2 = polyline[nextIndex];

      const fraction = 0.25;
      const currentLng = p1[0] + (p2[0] - p1[0]) * fraction;
      const currentLat = p1[1] + (p2[1] - p1[1]) * fraction;

      const heading = calculateBearing(p1[0], p1[1], p2[0], p2[1]);
      const speedKmph = Math.max(18, Math.min(65, Math.round(35 + (Math.random() - 0.5) * 12)));
      const engineTempC = Math.round(85 + (Math.random() - 0.5) * 4);

      vehicle.routeProgressIndex = nextIndex;
      vehicle.currentLocation = {
        type: 'Point',
        coordinates: [Number(currentLng.toFixed(6)), Number(currentLat.toFixed(6))]
      };
      vehicle.heading = heading;
      vehicle.speedKmph = speedKmph;
      vehicle.engineTempC = engineTempC;
      vehicle.lastPingAt = new Date();

      await vehicle.save();

      broadcastVehicleUpdate({
        vehicleId: vehicle.vehicleId,
        registrationNumber: vehicle.registrationNumber,
        model: vehicle.model,
        type: vehicle.type,
        currentLocation: vehicle.currentLocation,
        heading,
        speedKmph,
        engineTempC,
        fuelLevelPct: vehicle.fuelLevelPct,
        status: vehicle.status,
        assignedShipmentId: vehicle.assignedShipmentId,
        assignedSegmentId: vehicle.assignedSegmentId,
        lastPingAt: vehicle.lastPingAt
      });
    }
  } catch (err) {
    // Gracefully catch and log warning without stopping timer
    console.warn('[Vehicle Simulation Job] Movement tick notice:', err.message);
  }
}

function startVehicleSimulation(intervalMs = 2500) {
  if (simulationTimer) clearInterval(simulationTimer);
  console.log(`[Vehicle Simulation Job] Starting simulated GPS movement job (every ${intervalMs}ms)...`);
  simulationTimer = setInterval(stepSimulation, intervalMs);
}

function stopVehicleSimulation() {
  if (simulationTimer) {
    clearInterval(simulationTimer);
    simulationTimer = null;
  }
}

module.exports = {
  startVehicleSimulation,
  stopVehicleSimulation
};
