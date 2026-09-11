const axios = require('axios');
const FormData = require('form-data');

async function testImport() {
  console.log('Testing /api/v1/import/upload ...');

  const sampleSql = `-- Sample Test SQL
INSERT INTO districts (district_id, name, state, hq, lat, lng, flood_susceptibility) VALUES
('dist-majuli', 'Majuli Island', 'Assam', 'Garamur', 26.9667, 94.1667, 'critical');

INSERT INTO road_segments (segment_id, name, from_node, to_node, distance_km, flood_depth, status, blockage_reason) VALUES
('RS-NH715-MAJ', 'NH-715 Majuli River Crossing', 'Jorhat', 'Majuli', 18, 1.85, 'flooded', 'Brahmaputra Major Spillage (1.85m Water Depth)');

INSERT INTO incidents (incident_id, title, incident_type, severity, district_name, lat, lng, description) VALUES
('inc-maj-01', 'Kamalabari Ghat Ferry Ramp Inundated', 'flood', 5, 'Majuli', 26.9200, 94.1800, 'Heavy flood surge submerged passenger ramp and vehicle barge berth.');

INSERT INTO vehicles (vehicle_id, driver_name, speed_kmph, fuel, lat, lng, type) VALUES
('NER-9901', 'Naik R. Bora', 28, 95, 26.9667, 94.1667, 'High-Clearance Amphibious Truck');
`;

  const form = new FormData();
  form.append('dataset', Buffer.from(sampleSql), {
    filename: 'majuli_flood_emergency.sql',
    contentType: 'text/sql'
  });

  try {
    const res = await axios.post('http://localhost:5000/api/v1/import/upload', form, {
      headers: form.getHeaders()
    });

    console.log('Upload & Analysis Response Status:', res.status);
    console.log('Detected Tables:', res.data.data.detectedTables);
    console.log('Entity Counts:', res.data.data.entityCounts);
    console.log('\n--- GEMINI 3.7 FLASH SITUATION ANALYSIS ---');
    console.log('Executive Summary:\n', res.data.data.aiSynthesis?.executiveSummary);
    console.log('\nKey Insights:\n', res.data.data.aiSynthesis?.keyInsights);
    console.log('\nRisk Warnings:\n', res.data.data.aiSynthesis?.riskWarnings);
    console.log('\nRecommended Actions:\n', res.data.data.aiSynthesis?.recommendedActions);

    const auditId = res.data.data.auditId;

    console.log('\nTesting /api/v1/import/commit/' + auditId + ' ...');
    const commitRes = await axios.post(`http://localhost:5000/api/v1/import/commit/${auditId}`);
    console.log('Commit Response:', commitRes.data);

    console.log('\nTesting /api/v1/import/history ...');
    const historyRes = await axios.get('http://localhost:5000/api/v1/import/history');
    console.log('History Count:', historyRes.data.data.length);
    console.log('Latest Record Status:', historyRes.data.data[0]?.status);

  } catch (err) {
    console.error('Test Error:', err.response?.data || err.message);
  }
}

testImport();
