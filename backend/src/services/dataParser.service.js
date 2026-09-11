const { parse } = require('csv-parse/sync');

/**
 * Robust Dataset Parser Service for .sql, .csv, and raw formats
 */
class DataParserService {
  /**
   * Parse uploaded buffer based on filename extension
   */
  async parseFile(buffer, fileName) {
    const ext = (fileName.split('.').pop() || '').toLowerCase();
    const content = buffer.toString('utf-8');

    if (ext === 'sql') {
      return this.parseSql(content, fileName);
    } else if (ext === 'csv') {
      return this.parseCsv(content, fileName);
    } else if (ext === 'json' || ext === 'geojson') {
      return this.parseJson(content, fileName);
    } else {
      // Default: attempt SQL then CSV
      try {
        if (content.includes('INSERT INTO') || content.includes('CREATE TABLE')) {
          return this.parseSql(content, fileName);
        }
        return this.parseCsv(content, fileName);
      } catch (err) {
        return {
          fileType: 'unknown',
          detectedTables: [],
          entityCounts: { districts: 0, incidents: 0, roadSegments: 0, vehicles: 0, customRecords: 0 },
          data: { districts: [], incidents: [], roadSegments: [], vehicles: [] }
        };
      }
    }
  }

  /**
   * 1. SQL Parser: Extracts INSERT statements across tactical schemas
   */
  parseSql(sqlText, fileName) {
    const detectedTables = new Set();
    const result = {
      fileType: 'sql',
      detectedTables: [],
      entityCounts: { districts: 0, incidents: 0, roadSegments: 0, vehicles: 0, customRecords: 0 },
      data: {
        districts: [],
        incidents: [],
        roadSegments: [],
        vehicles: []
      }
    };

    // Regex to match INSERT statements
    const insertRegex = /INSERT\s+INTO\s+[`"']?([a-zA-Z0-9_]+)[`"']?\s*(?:\(([^)]+)\))?\s*VALUES\s*([\s\S]+?);/gi;
    let match;

    while ((match = insertRegex.exec(sqlText)) !== null) {
      const tableName = match[1].toLowerCase().replace(/[`"']/g, '');
      const columnsRaw = match[2] ? match[2].split(',').map(c => c.trim().replace(/[`"']/g, '')) : null;
      const valuesBlock = match[3];

      detectedTables.add(tableName);

      // Parse tuples like (val1, val2, ...), (val3, val4, ...)
      const tupleRegex = /\(([^)]+)\)/g;
      let tupleMatch;

      while ((tupleMatch = tupleRegex.exec(valuesBlock)) !== null) {
        const rawValues = this.parseSqlValueList(tupleMatch[1]);
        const record = {};

        if (columnsRaw) {
          columnsRaw.forEach((col, idx) => {
            record[col] = rawValues[idx] !== undefined ? rawValues[idx] : null;
          });
        } else {
          rawValues.forEach((v, idx) => {
            record[`col_${idx}`] = v;
          });
        }

        // Categorize into domain models
        if (tableName.includes('district')) {
          result.data.districts.push(this.normalizeDistrict(record));
        } else if (tableName.includes('incident') || tableName.includes('hazard') || tableName.includes('blockage')) {
          result.data.incidents.push(this.normalizeIncident(record));
        } else if (tableName.includes('road') || tableName.includes('corridor') || tableName.includes('segment')) {
          result.data.roadSegments.push(this.normalizeRoadSegment(record));
        } else if (tableName.includes('vehicle') || tableName.includes('fleet') || tableName.includes('convoy')) {
          result.data.vehicles.push(this.normalizeVehicle(record));
        } else {
          result.entityCounts.customRecords++;
        }
      }
    }

    result.detectedTables = Array.from(detectedTables);
    result.entityCounts.districts = result.data.districts.length;
    result.entityCounts.incidents = result.data.incidents.length;
    result.entityCounts.roadSegments = result.data.roadSegments.length;
    result.entityCounts.vehicles = result.data.vehicles.length;

    return result;
  }

  /**
   * Helper to split SQL value tokens respecting quotes
   */
  parseSqlValueList(str) {
    const values = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if ((char === "'" || char === '"') && (i === 0 || str[i - 1] !== '\\')) {
        if (!inQuotes) {
          inQuotes = true;
          quoteChar = char;
        } else if (quoteChar === char) {
          inQuotes = false;
        } else {
          current += char;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(this.cleanSqlValue(current.trim()));
        current = '';
      } else {
        current += char;
      }
    }
    if (current.trim()) {
      values.push(this.cleanSqlValue(current.trim()));
    }
    return values;
  }

  cleanSqlValue(val) {
    if (val === 'NULL' || val === 'null') return null;
    if (val.startsWith("'") && val.endsWith("'")) return val.slice(1, -1).replace(/''/g, "'");
    if (val.startsWith('"') && val.endsWith('"')) return val.slice(1, -1);
    if (!isNaN(val) && val !== '') return Number(val);
    if (val === 'true' || val === 'TRUE') return true;
    if (val === 'false' || val === 'FALSE') return false;
    return val;
  }

  /**
   * 2. CSV Parser: Header recognition and normalization
   */
  parseCsv(csvText, fileName) {
    const result = {
      fileType: 'csv',
      detectedTables: [],
      entityCounts: { districts: 0, incidents: 0, roadSegments: 0, vehicles: 0, customRecords: 0 },
      data: {
        districts: [],
        incidents: [],
        roadSegments: [],
        vehicles: []
      }
    };

    let records = [];
    try {
      records = parse(csvText, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
    } catch (err) {
      console.warn('[DataParserService] csv-parse error, falling back to manual split:', err.message);
      const lines = csvText.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length > 1) {
        const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
        records = lines.slice(1).map(line => {
          const cells = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
          const row = {};
          headers.forEach((h, i) => { row[h] = cells[i]; });
          return row;
        });
      }
    }

    if (!records.length) return result;

    // Detect target model based on column keywords in first row
    const headers = Object.keys(records[0]).map(k => k.toLowerCase());
    const hasCol = (term) => headers.some(h => h.includes(term));

    let detectedModel = 'custom';
    if (hasCol('severity') || hasCol('incident') || hasCol('blockage') || hasCol('landslide')) {
      detectedModel = 'incidents';
      result.detectedTables.push('Incidents');
    } else if (hasCol('flood_depth') || hasCol('road') || hasCol('corridor') || hasCol('segment')) {
      detectedModel = 'roadSegments';
      result.detectedTables.push('RoadSegments');
    } else if (hasCol('speed') || hasCol('driver') || hasCol('vehicle') || hasCol('plate')) {
      detectedModel = 'vehicles';
      result.detectedTables.push('Vehicles');
    } else if (hasCol('district') || hasCol('state') || hasCol('hq') || hasCol('accessibility')) {
      detectedModel = 'districts';
      result.detectedTables.push('Districts');
    } else {
      result.detectedTables.push('ImportedDataset');
    }

    records.forEach(row => {
      if (detectedModel === 'incidents') {
        result.data.incidents.push(this.normalizeIncident(row));
      } else if (detectedModel === 'roadSegments') {
        result.data.roadSegments.push(this.normalizeRoadSegment(row));
      } else if (detectedModel === 'vehicles') {
        result.data.vehicles.push(this.normalizeVehicle(row));
      } else if (detectedModel === 'districts') {
        result.data.districts.push(this.normalizeDistrict(row));
      } else {
        result.entityCounts.customRecords++;
      }
    });

    result.entityCounts.districts = result.data.districts.length;
    result.entityCounts.incidents = result.data.incidents.length;
    result.entityCounts.roadSegments = result.data.roadSegments.length;
    result.entityCounts.vehicles = result.data.vehicles.length;

    return result;
  }

  /**
   * 3. JSON Parser
   */
  parseJson(jsonText, fileName) {
    const result = {
      fileType: 'json',
      detectedTables: [],
      entityCounts: { districts: 0, incidents: 0, roadSegments: 0, vehicles: 0, customRecords: 0 },
      data: { districts: [], incidents: [], roadSegments: [], vehicles: [] }
    };

    try {
      const parsed = JSON.parse(jsonText);
      if (Array.isArray(parsed)) {
        parsed.forEach(item => {
          if (item.severity || item.incidentType) {
            result.data.incidents.push(this.normalizeIncident(item));
          } else if (item.fromNode || item.roadType || item.floodDepthM !== undefined) {
            result.data.roadSegments.push(this.normalizeRoadSegment(item));
          } else if (item.driver || item.speedKmph !== undefined) {
            result.data.vehicles.push(this.normalizeVehicle(item));
          } else if (item.state || item.districtId) {
            result.data.districts.push(this.normalizeDistrict(item));
          }
        });
      } else if (parsed.features && Array.isArray(parsed.features)) {
        // GeoJSON FeatureCollection
        parsed.features.forEach(f => {
          const props = f.properties || {};
          if (f.geometry?.type === 'LineString') {
            props.geometry = f.geometry;
            result.data.roadSegments.push(this.normalizeRoadSegment(props));
          } else if (f.geometry?.type === 'Point') {
            props.location = f.geometry;
            result.data.incidents.push(this.normalizeIncident(props));
          }
        });
      }
    } catch (err) {
      console.warn('[DataParserService] JSON parse error:', err.message);
    }

    if (result.data.districts.length) result.detectedTables.push('Districts');
    if (result.data.incidents.length) result.detectedTables.push('Incidents');
    if (result.data.roadSegments.length) result.detectedTables.push('RoadSegments');
    if (result.data.vehicles.length) result.detectedTables.push('Vehicles');

    result.entityCounts.districts = result.data.districts.length;
    result.entityCounts.incidents = result.data.incidents.length;
    result.entityCounts.roadSegments = result.data.roadSegments.length;
    result.entityCounts.vehicles = result.data.vehicles.length;

    return result;
  }

  // Normalization Helpers with resilient defaults
  normalizeDistrict(row) {
    const id = row.districtId || row.district_id || row.id || `dist-${Math.random().toString(36).substring(2, 7)}`;
    const name = row.name || row.district_name || row.district || 'NER District';
    const state = row.state || 'Assam';
    const lng = Number(row.lng || row.longitude || row.centroid_lng || 92.5);
    const lat = Number(row.lat || row.latitude || row.centroid_lat || 26.0);

    return {
      districtId: String(id),
      name: String(name),
      state: String(state),
      hq: String(row.hq || name),
      centroid: [lng, lat],
      elevationM: Number(row.elevationM || row.elevation || 650),
      avgSlopeDeg: Number(row.avgSlopeDeg || row.slope || 14),
      floodSusceptibility: row.floodSusceptibility || 'moderate',
      landslideSusceptibility: row.landslideSusceptibility || 'moderate',
      baseAccessibilityScore: Number(row.baseAccessibilityScore || 80),
      currentAccessibilityScore: Number(row.currentAccessibilityScore || 75)
    };
  }

  normalizeIncident(row) {
    const uuid = row.clientUuid || row.uuid || row.incident_id || `inc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const lng = Number(row.lng || row.longitude || row.location_lng || 91.736);
    const lat = Number(row.lat || row.latitude || row.location_lat || 26.144);

    return {
      clientUuid: String(uuid),
      incidentType: row.incidentType || row.incident_type || row.type || 'landslide',
      severity: Number(row.severity || 3),
      title: row.title || row.name || 'Hazard Reported via Dataset Import',
      description: row.description || row.desc || 'Operational hazard imported from external dataset.',
      districtId: String(row.districtId || row.district_id || 'dist-kamrup-metro'),
      districtName: String(row.districtName || row.district_name || 'Kamrup Metropolitan'),
      roadSegmentId: row.roadSegmentId || row.road_segment_id || 'RS-NH27-01',
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      status: row.status || 'reported',
      capturedAt: row.capturedAt ? new Date(row.capturedAt) : new Date()
    };
  }

  normalizeRoadSegment(row) {
    const segId = row.segmentId || row.segment_id || row.id || `RS-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const name = row.name || row.road_name || 'NER Highway Corridor';
    const status = (row.status || 'clear').toLowerCase();
    const floodDepth = Number(row.floodDepthM || row.flood_depth_m || row.flood_depth || 0);

    return {
      segmentId: String(segId),
      name: String(name),
      fromNode: String(row.fromNode || row.from_node || 'NODE_A'),
      toNode: String(row.toNode || row.to_node || 'NODE_B'),
      distanceKm: Number(row.distanceKm || row.distance_km || 45),
      baseDurationMin: Number(row.baseDurationMin || row.duration_min || 60),
      roadType: row.roadType || row.road_type || 'Mountain Highway',
      avgSlopeDeg: Number(row.avgSlopeDeg || 12),
      maxElevationM: Number(row.maxElevationM || 800),
      status: floodDepth > 0 ? 'flooded' : status,
      floodDepthM: floodDepth,
      blockageReason: row.blockageReason || row.blockage_reason || (floodDepth > 0 ? 'River Overflow & Water Inundation' : ''),
      currentRiskScore: Number(row.currentRiskScore || (status === 'blocked' ? 85 : floodDepth > 0 ? 90 : 25)),
      geometry: row.geometry || {
        type: 'LineString',
        coordinates: [
          [91.736, 26.144],
          [92.100, 26.250]
        ]
      }
    };
  }

  normalizeVehicle(row) {
    const vid = row.vehicleId || row.vehicle_id || row.plate || `NER-${Math.floor(1000 + Math.random() * 9000)}`;
    const lng = Number(row.lng || row.longitude || 91.736);
    const lat = Number(row.lat || row.latitude || 26.144);

    return {
      vehicleId: String(vid),
      type: row.type || 'Heavy All-Terrain Truck (4x4)',
      model: row.model || 'Tata LPTA 1623 4x4',
      status: row.status || 'in_transit',
      driver: {
        name: row.driverName || row.driver || 'Assigned Driver',
        phone: row.driverPhone || '+91 94350 00000'
      },
      currentLocation: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      speedKmph: Number(row.speedKmph || row.speed || 42),
      fuelLevelPct: Number(row.fuelLevelPct || row.fuel || 85)
    };
  }
}

module.exports = new DataParserService();
