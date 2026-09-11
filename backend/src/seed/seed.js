const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { connectDB, closeDB } = require('../config/db');
const User = require('../models/User');
const District = require('../models/District');
const RoadSegment = require('../models/RoadSegment');
const Vehicle = require('../models/Vehicle');
const Shipment = require('../models/Shipment');
const Incident = require('../models/Incident');
const Alert = require('../models/Alert');

async function seedDatabase() {
  console.log('=== [NER Logistics Platform] Database Seeding Initiated ===');
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }

  try {
    // 1. Seed Users (Demo Accounts for all 4 roles)
    console.log('[Seed] Clearing & creating tactical user accounts...');
    await User.deleteMany({});

    const demoUsers = [
      {
        name: 'Commandant R. K. Sharma',
        email: 'admin@nerlogistics.gov.in',
        password: 'Password@123',
        role: 'admin',
        districtId: 'AS-KAM',
        districtName: 'Kamrup Metropolitan',
        phone: '+91 94350 99001',
        preferredLanguage: 'en',
        badgeNumber: 'NER-HQ-ADM-01',
        department: 'NER Inter-Agency Logistics Command'
      },
      {
        name: 'District Officer P. Sangma',
        email: 'officer@nerlogistics.gov.in',
        password: 'Password@123',
        role: 'district_officer',
        districtId: 'ML-EKH',
        districtName: 'East Khasi Hills',
        phone: '+91 98620 11922',
        preferredLanguage: 'en',
        badgeNumber: 'ML-DIS-OFF-04',
        department: 'Meghalaya Disaster Management Authority'
      },
      {
        name: 'Field Agent J. Lyngdoh',
        email: 'agent@nerlogistics.gov.in',
        password: 'Password@123',
        role: 'field_agent',
        districtId: 'ML-EKH',
        districtName: 'East Khasi Hills',
        phone: '+91 98560 44819',
        preferredLanguage: 'en',
        badgeNumber: 'NER-FLD-AGT-12',
        department: 'Rapid Road Assessment Mobile Unit'
      },
      {
        name: 'Convoy Lead Bikash Borah',
        email: 'driver@nerlogistics.gov.in',
        password: 'Password@123',
        role: 'driver',
        districtId: 'AS-KAM',
        districtName: 'Kamrup Metropolitan',
        phone: '+91 94350 11234',
        preferredLanguage: 'as',
        badgeNumber: 'NER-DRV-101',
        department: 'Emergency Relief Fleet Division'
      }
    ];

    for (const u of demoUsers) {
      await User.create(u);
    }
    console.log(`[Seed] Created ${demoUsers.length} user accounts.`);

    // 2. Seed Districts from GeoJSON
    console.log('[Seed] Importing real NER districts GeoJSON...');
    await District.deleteMany({});
    const districtsPath = path.join(__dirname, '../../../data/ner-districts.geojson');
    if (fs.existsSync(districtsPath)) {
      const districtsData = JSON.parse(fs.readFileSync(districtsPath, 'utf8'));
      for (const feat of districtsData.features) {
        const p = feat.properties;
        await District.create({
          districtId: p.id,
          name: p.name,
          state: p.state,
          hq: p.hq,
          centroid: p.centroid,
          boundaryCoordinates: feat.geometry.coordinates,
          elevationM: p.elevation_m || 300,
          avgSlopeDeg: p.slope_deg || 10,
          floodSusceptibility: p.flood_susceptibility || 'moderate',
          landslideSusceptibility: p.landslide_susceptibility || 'moderate',
          baseAccessibilityScore: p.base_accessibility || 80,
          currentAccessibilityScore: p.base_accessibility || 80,
          activeConvoysCount: Math.floor(Math.random() * 4) + 1,
          activeIncidentsCount: p.landslide_susceptibility === 'critical' ? 2 : 0,
          emergencyContacts: [
            { title: 'District Control Room', name: `${p.hq} EOC Cell`, phone: '+91 361 2234000' },
            { title: 'Border Roads Task Force', name: 'BRO Control Desk', phone: '+91 364 2501000' }
          ],
          checkpoints: [
            { name: `${p.hq} Entry Checkpost`, coordinates: p.centroid, status: 'open' }
          ],
          weather: {
            tempC: p.elevation_m > 1500 ? 16 : 26,
            rainfallMm: p.landslide_susceptibility === 'critical' ? 45 : 8,
            condition: p.landslide_susceptibility === 'critical' ? 'Heavy Rain / Mist' : 'Partly Cloudy',
            windKmph: 12
          }
        });
      }
      console.log(`[Seed] Seeded ${districtsData.features.length} NER districts.`);
    }

    // 3. Seed Road Network Segments from GeoJSON
    console.log('[Seed] Importing NER road network GeoJSON...');
    await RoadSegment.deleteMany({});
    const roadPath = path.join(__dirname, '../../../data/ner-road-network.geojson');
    if (fs.existsSync(roadPath)) {
      const roadData = JSON.parse(fs.readFileSync(roadPath, 'utf8'));
      for (const feat of roadData.features) {
        const p = feat.properties;
        await RoadSegment.create({
          segmentId: p.segment_id,
          name: p.name,
          fromNode: p.from_node,
          toNode: p.to_node,
          distanceKm: p.distance_km,
          baseDurationMin: p.base_duration_min,
          roadType: p.road_type,
          avgSlopeDeg: p.avg_slope_deg,
          maxElevationM: p.max_elevation_m,
          baseRiskScore: p.base_risk_score,
          currentRiskScore: p.base_risk_score,
          riskBand: p.base_risk_score >= 70 ? 'high' : p.base_risk_score >= 40 ? 'moderate' : 'safe',
          isBlocked: p.base_risk_score >= 80,
          isDegraded: p.base_risk_score >= 60,
          isSafeCorridor: Boolean(p.is_safe_corridor),
          bridgeCount: p.bridge_count || 4,
          criticalCulverts: p.critical_culverts || 8,
          geometry: feat.geometry
        });
      }
      console.log(`[Seed] Seeded ${roadData.features.length} road network segments.`);
    }

    // 4. Seed Vehicles, Shipments, Incidents, Alerts
    console.log('[Seed] Importing seed vehicles, shipments, incidents, and alerts...');
    const seedPath = path.join(__dirname, '../../../data/seed-vehicles-shipments.json');
    if (fs.existsSync(seedPath)) {
      const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

      await Vehicle.deleteMany({});
      if (seedData.vehicles) {
        for (const v of seedData.vehicles) {
          await Vehicle.create(v);
        }
        console.log(`[Seed] Seeded ${seedData.vehicles.length} tactical vehicles.`);
      }

      await Shipment.deleteMany({});
      if (seedData.shipments) {
        for (const s of seedData.shipments) {
          await Shipment.create(s);
        }
        console.log(`[Seed] Seeded ${seedData.shipments.length} consignments.`);
      }

      await Incident.deleteMany({});
      if (seedData.incidents) {
        for (const inc of seedData.incidents) {
          await Incident.create(inc);
        }
        console.log(`[Seed] Seeded ${seedData.incidents.length} field incidents.`);
      }

      await Alert.deleteMany({});
      if (seedData.alerts) {
        for (const alt of seedData.alerts) {
          await Alert.create(alt);
        }
        console.log(`[Seed] Seeded ${seedData.alerts.length} emergency alerts.`);
      }
    }

    console.log('=== [NER Logistics Platform] Seeding Completed Successfully ===');
  } catch (err) {
    console.error('[Seed] Error seeding database:', err);
    throw err;
  }
}

// Execute standalone if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('[Seed] Exiting process.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed] Fatal error:', err);
      process.exit(1);
    });
}

module.exports = seedDatabase;
