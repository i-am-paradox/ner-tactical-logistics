const dataParserService = require('../services/dataParser.service');
const geminiService = require('../services/gemini.service');
const ImportAudit = require('../models/ImportAudit');
const District = require('../models/District');
const Incident = require('../models/Incident');
const RoadSegment = require('../models/RoadSegment');
const Vehicle = require('../models/Vehicle');
const { getIO } = require('../sockets/liveTracking.socket');

/**
 * Controller for Dataset Ingestion & AI Situation Analysis
 */
class ImportController {
  /**
   * 1. Upload file, parse schema, and generate Gemini situation analysis
   */
  async uploadAndAnalyze(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No dataset file provided. Please upload a .sql, .csv, or .json file.'
        });
      }

      const { originalname, size, buffer } = req.file;

      // 1. Parse dataset
      const parsed = await dataParserService.parseFile(buffer, originalname);

      // 2. Synthesize situation analysis using Google Gemini 3.7 Flash
      const aiSynthesis = await geminiService.synthesizeSituationImport({
        fileName: originalname,
        detectedTables: parsed.detectedTables,
        entityCounts: parsed.entityCounts,
        sampleIncidents: parsed.data.incidents,
        sampleRoads: parsed.data.roadSegments
      });

      // 3. Create Audit Record in DB
      const audit = new ImportAudit({
        fileName: originalname,
        fileType: parsed.fileType,
        fileSizeBytes: size,
        detectedTables: parsed.detectedTables,
        entityCounts: parsed.entityCounts,
        status: 'analyzed',
        aiSynthesis,
        parsedDataCache: parsed.data,
        importedBy: {
          userId: req.user?.id || 'usr-admin',
          role: req.user?.role || 'admin',
          name: req.user?.name || 'Commandant User'
        }
      });

      await audit.save();

      return res.status(200).json({
        success: true,
        message: 'Dataset successfully parsed and analyzed by Gemini Intelligence',
        data: {
          auditId: audit._id,
          fileName: audit.fileName,
          fileType: audit.fileType,
          fileSizeBytes: audit.fileSizeBytes,
          detectedTables: audit.detectedTables,
          entityCounts: audit.entityCounts,
          aiSynthesis: audit.aiSynthesis,
          preview: {
            districtsCount: parsed.data.districts.length,
            incidentsCount: parsed.data.incidents.length,
            roadSegmentsCount: parsed.data.roadSegments.length,
            vehiclesCount: parsed.data.vehicles.length
          }
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * 2. Commit parsed dataset into live MongoDB collections
   */
  async commitImport(req, res, next) {
    try {
      const { auditId } = req.params;
      const audit = await ImportAudit.findById(auditId);

      if (!audit) {
        return res.status(404).json({
          success: false,
          message: 'Import audit record not found.'
        });
      }

      if (audit.status === 'imported') {
        return res.status(400).json({
          success: false,
          message: 'This dataset has already been committed to the live database.'
        });
      }

      const cache = audit.parsedDataCache || {};
      const stats = { districts: 0, incidents: 0, roadSegments: 0, vehicles: 0 };

      // Upsert Districts
      if (cache.districts && cache.districts.length) {
        for (const dist of cache.districts) {
          if (dist.districtId) {
            await District.findOneAndUpdate({ districtId: dist.districtId }, dist, { upsert: true, new: true });
            stats.districts++;
          }
        }
      }

      // Upsert Incidents
      if (cache.incidents && cache.incidents.length) {
        for (const inc of cache.incidents) {
          if (inc.clientUuid) {
            await Incident.findOneAndUpdate({ clientUuid: inc.clientUuid }, inc, { upsert: true, new: true });
            stats.incidents++;
          }
        }
      }

      // Upsert Road Segments
      if (cache.roadSegments && cache.roadSegments.length) {
        for (const road of cache.roadSegments) {
          if (road.segmentId) {
            await RoadSegment.findOneAndUpdate({ segmentId: road.segmentId }, road, { upsert: true, new: true });
            stats.roadSegments++;
          }
        }
      }

      // Upsert Vehicles
      if (cache.vehicles && cache.vehicles.length) {
        for (const veh of cache.vehicles) {
          if (veh.vehicleId) {
            await Vehicle.findOneAndUpdate({ vehicleId: veh.vehicleId }, veh, { upsert: true, new: true });
            stats.vehicles++;
          }
        }
      }

      audit.status = 'imported';
      audit.importedAt = new Date();
      await audit.save();

      // Emit live socket update
      try {
        const io = getIO();
        if (io) {
          io.emit('dataset:imported', {
            auditId: audit._id,
            fileName: audit.fileName,
            committedStats: stats
          });
        }
      } catch (socketErr) {
        console.warn('[ImportController] Socket emit warning:', socketErr.message);
      }

      return res.status(200).json({
        success: true,
        message: 'Dataset entities successfully committed to live tactical platform',
        data: {
          auditId: audit._id,
          committedStats: stats,
          status: audit.status,
          importedAt: audit.importedAt
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * 3. Get history of all imports
   */
  async getHistory(req, res, next) {
    try {
      const audits = await ImportAudit.find()
        .select('-parsedDataCache')
        .sort({ createdAt: -1 })
        .limit(25);

      return res.status(200).json({
        success: true,
        data: audits
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * 4. Get specific import detail with AI synthesis
   */
  async getById(req, res, next) {
    try {
      const audit = await ImportAudit.findById(req.params.id);
      if (!audit) {
        return res.status(404).json({
          success: false,
          message: 'Import record not found.'
        });
      }

      return res.status(200).json({
        success: true,
        data: audit
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ImportController();
