const mongoose = require('mongoose');

const ImportAuditSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileType: { type: String, required: true, enum: ['sql', 'csv', 'db', 'json'] },
  fileSizeBytes: { type: Number, default: 0 },
  detectedTables: [{ type: String }],
  entityCounts: {
    districts: { type: Number, default: 0 },
    incidents: { type: Number, default: 0 },
    roadSegments: { type: Number, default: 0 },
    vehicles: { type: Number, default: 0 },
    customRecords: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['parsed', 'analyzed', 'imported', 'failed'],
    default: 'parsed'
  },
  aiSynthesis: {
    executiveSummary: { type: String, default: '' },
    keyInsights: [{ type: String }],
    riskWarnings: [{ type: String }],
    recommendedActions: [{ type: String }]
  },
  parsedDataCache: {
    districts: [mongoose.Schema.Types.Mixed],
    incidents: [mongoose.Schema.Types.Mixed],
    roadSegments: [mongoose.Schema.Types.Mixed],
    vehicles: [mongoose.Schema.Types.Mixed]
  },
  importedBy: {
    userId: { type: String, default: 'usr-admin' },
    role: { type: String, default: 'admin' },
    name: { type: String, default: 'Commandant User' }
  },
  importedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('ImportAudit', ImportAuditSchema);
