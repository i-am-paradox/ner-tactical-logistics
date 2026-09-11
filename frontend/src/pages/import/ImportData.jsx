import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UploadCloud,
  FileText,
  Database,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Layers,
  Clock,
  Download,
  Check,
  Zap,
  Info
} from 'lucide-react';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, TableRow, TableCell } from '../../components/ui/Table';
import { importService } from '../../services/domainServices';
import { formatDate } from '../../utils/formatters';

export function ImportData() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [commitResult, setCommitResult] = useState(null);
  const [sampleLoaded, setSampleLoaded] = useState(false);

  // Fetch Import History
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['importHistory'],
    queryFn: () => importService.getImportHistory()
  });

  const history = historyData?.data || [];

  // Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: (formData) => importService.uploadDataset(formData),
    onSuccess: (res) => {
      setUploadResult(res.data);
      setCommitResult(null);
      queryClient.invalidateQueries(['importHistory']);
    }
  });

  // Commit Mutation
  const commitMutation = useMutation({
    mutationFn: (auditId) => importService.commitImport(auditId),
    onSuccess: (res) => {
      setCommitResult(res.data);
      queryClient.invalidateQueries(['importHistory']);
      queryClient.invalidateQueries(['districts']);
      queryClient.invalidateQueries(['incidents']);
      queryClient.invalidateQueries(['roads']);
      queryClient.invalidateQueries(['vehicles']);
    }
  });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleRunAnalysis = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('dataset', file);
    uploadMutation.mutate(formData);
  };

  // Pre-load a sample SQL dataset for immediate 1-click testing
  const loadSampleSql = () => {
    const sampleSql = `-- North East Region Tactical Emergency Operations Dataset (Monsoon Response)
-- Table 1: Districts
INSERT INTO districts (district_id, name, state, hq, lat, lng, elevation, flood_susceptibility) VALUES
('dist-cachar', 'Cachar', 'Assam', 'Silchar', 24.8333, 92.7789, 21, 'critical'),
('dist-karimganj', 'Karimganj', 'Assam', 'Karimganj', 24.8667, 92.3500, 18, 'high'),
('dist-west-tripura', 'West Tripura', 'Tripura', 'Agartala', 23.8315, 91.2868, 12, 'high');

-- Table 2: Road Segments & Flood Corridors
INSERT INTO road_segments (segment_id, name, from_node, to_node, distance_km, flood_depth, status, blockage_reason) VALUES
('RS-NH37-SIL', 'NH-37 Badarpur-Silchar Floodway', 'Badarpur', 'Silchar', 32, 1.25, 'flooded', 'Barak River Overflow (Water 1.25m above embankment)'),
('RS-NH44-AGR', 'NH-44 Agartala Bypass Corridor', 'Teliamura', 'Agartala', 42, 0.45, 'restricted', 'Flash waterlogging across low-lying culverts'),
('RS-NH08-KRG', 'NH-8 Karimganj Link Road', 'Churaibari', 'Karimganj', 28, 0.00, 'clear', 'Clear for 4x4 relief convoys');

-- Table 3: Field Hazard Incidents
INSERT INTO incidents (incident_id, title, incident_type, severity, district_name, lat, lng, description) VALUES
('inc-barak-01', 'Barak River Embankment Breach at Annapurna Ghat', 'flood', 5, 'Cachar', 24.8250, 92.7900, 'Severe river overflow inundating trunk transit artery. Water velocity 3.2 m/s.'),
('inc-tel-02', 'Culvert Submersion near Teliamura Ghat', 'road_blockage', 3, 'West Tripura', 23.8400, 91.5800, 'Submerged culvert with debris buildup. Single-lane 4x4 movement only.');

-- Table 4: Emergency Fleet Units
INSERT INTO vehicles (vehicle_id, driver_name, speed_kmph, fuel, lat, lng, type) VALUES
('NER-8821', 'Subedar D. Gogoi', 38, 92, 24.8333, 92.7789, 'Heavy 4x4 Water Rescue Unit'),
('NER-8822', 'Havildar T. Debbarma', 45, 88, 23.8315, 91.2868, 'All-Terrain Medical Escort');
`;

    const blob = new Blob([sampleSql], { type: 'text/sql' });
    const sampleFile = new File([blob], 'ner_monsoon_operations_dataset.sql', { type: 'text/sql' });
    setFile(sampleFile);
    setSampleLoaded(true);
  };

  const loadSampleCsv = () => {
    const sampleCsv = `segment_id,name,from_node,to_node,distance_km,flood_depth,status,blockage_reason
RS-NH102-IMP,NH-102 Imphal-Moreh Mountain Corridor,Imphal,Moreh,105,0.00,clear,Open for high-priority logistics
RS-NH29-KOH,NH-29 Dimapur-Kohima Heavy Pass,Dimapur,Kohima,74,0.65,restricted,Heavy mudflow and continuous rockfalls
RS-NH53-SIL,NH-53 Jiribam-Silchar River Corridor,Jiribam,Silchar,85,1.10,flooded,Jiri River Spillage impassable for light vehicles
`;
    const blob = new Blob([sampleCsv], { type: 'text/csv' });
    const sampleFile = new File([blob], 'ner_highway_flood_assessment.csv', { type: 'text/csv' });
    setFile(sampleFile);
    setSampleLoaded(true);
  };

  return (
    <PageShell
      title="Dataset Ingestion & AI Situation Analysis"
      subtitle="Ingest regional disaster records, road networks, and telemetry with instant Google Gemini 3.7 Flash tactical synthesis"
      breadcrumbs={['Dashboard', 'Dataset Ingestion']}
    >
      {/* Top Banner & Quick Templates */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/70 via-slate-900 to-indigo-950/70 border border-sky-800/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/20 border border-sky-400/40 text-sky-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              Gemini 3.7 Flash Multi-Schema Parser & Synthesizer
              <Badge variant="safe" size="sm">Active Engine</Badge>
            </h3>
            <p className="text-xs text-slate-400">
              Supports <code className="text-sky-300">.sql</code> (INSERT statements), <code className="text-sky-300">.csv</code>, and <code className="text-sky-300">.json</code> formats with schema tolerance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadSampleSql} icon={FileText}>
            Load Sample SQL
          </Button>
          <Button variant="outline" size="sm" onClick={loadSampleCsv} icon={FileText}>
            Load Sample CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload & Table Detector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card
            header={
              <div className="flex items-center justify-between w-full">
                <span className="flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-sky-400" />
                  Dataset Upload Zone
                </span>
                {file && (
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                )}
              </div>
            }
          >
            {/* Drag & Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition-all ${
                isDragging
                  ? 'border-sky-400 bg-sky-950/40'
                  : file
                  ? 'border-emerald-500/60 bg-emerald-950/20'
                  : 'border-slate-700/80 bg-slate-900/40 hover:border-slate-600'
              }`}
            >
              {file ? (
                <div className="space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-100">{file.name}</p>
                    <p className="text-xs text-slate-400 font-mono">
                      Type: {file.name.split('.').pop()?.toUpperCase()} • {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <label className="text-xs text-sky-400 hover:text-sky-300 font-semibold cursor-pointer underline block pt-1">
                    Choose different file
                    <input type="file" accept=".sql,.csv,.json,.geojson" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 text-slate-400 flex items-center justify-center">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-200">Drag & drop your dataset here</p>
                    <p className="text-xs text-slate-500 mt-0.5">Supports .SQL, .CSV, .JSON (Max 25MB)</p>
                  </div>
                  <label className="inline-block px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs cursor-pointer transition">
                    Browse Files
                    <input type="file" accept=".sql,.csv,.json,.geojson" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <Button
                variant="primary"
                onClick={handleRunAnalysis}
                disabled={!file || uploadMutation.isPending}
                icon={Sparkles}
                className="w-full"
              >
                {uploadMutation.isPending ? 'Parsing & Synthesizing via Gemini...' : 'Run AI Situation Analysis'}
              </Button>
            </div>
          </Card>

          {/* Recognized Schema Preview Badge Box */}
          {uploadResult && (
            <Card
              header={
                <span className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  Ingestion Schema Verification
                </span>
              }
            >
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {uploadResult.detectedTables?.map((tbl) => (
                    <span
                      key={tbl}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5"
                    >
                      <Check className="w-3 h-3 text-emerald-400" /> {tbl}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center font-mono">
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">DISTRICTS</span>
                    <b className="text-sky-400 text-sm">{uploadResult.entityCounts?.districts || 0}</b>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">HAZARDS</span>
                    <b className="text-red-400 text-sm">{uploadResult.entityCounts?.incidents || 0}</b>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">ROADS</span>
                    <b className="text-amber-400 text-sm">{uploadResult.entityCounts?.roadSegments || 0}</b>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">VEHICLES</span>
                    <b className="text-emerald-400 text-sm">{uploadResult.entityCounts?.vehicles || 0}</b>
                  </div>
                </div>

                {/* Commit to Live DB Button */}
                <div className="pt-3 border-t border-slate-800">
                  {commitResult ? (
                    <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-700/80 text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>
                        Committed <b>{commitResult.committedStats?.roadSegments || 0} roads</b>,{' '}
                        <b>{commitResult.committedStats?.incidents || 0} hazards</b> to live command DB!
                      </span>
                    </div>
                  ) : (
                    <Button
                      variant="safe"
                      onClick={() => commitMutation.mutate(uploadResult.auditId)}
                      disabled={commitMutation.isPending}
                      icon={CheckCircle2}
                      className="w-full"
                    >
                      {commitMutation.isPending ? 'Committing to MongoDB...' : 'Commit Ingested Dataset to Live Platform'}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Gemini 3.7 Flash Situation Analysis Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {uploadResult?.aiSynthesis ? (
            <div className="space-y-4">
              {/* Executive Summary Card */}
              <Card
                header={
                  <div className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-2 text-sky-300 font-bold">
                      <Sparkles className="w-4 h-4 text-sky-400" />
                      Executive Situation Summary (Gemini 3.7 Flash)
                    </span>
                    <Badge variant="primary" size="sm">
                      Grounded Synthesis
                    </Badge>
                  </div>
                }
                className="border-sky-500/40 bg-slate-950/80 shadow-2xl"
              >
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {uploadResult.aiSynthesis.executiveSummary}
                </p>
              </Card>

              {/* Key Insights & Bottlenecks */}
              <Card
                header={
                  <span className="flex items-center gap-2 text-amber-300">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Key Actionable Operational Insights
                  </span>
                }
              >
                <div className="space-y-2">
                  {uploadResult.aiSynthesis.keyInsights?.map((insight, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Risk Warnings & Data Gaps */}
              <Card
                header={
                  <span className="flex items-center gap-2 text-red-300">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    Critical Risk Warnings & Telemetry Gaps
                  </span>
                }
              >
                <div className="space-y-2">
                  {uploadResult.aiSynthesis.riskWarnings?.map((warning, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-red-950/30 border border-red-900/60 text-xs text-red-200 flex items-start gap-2.5"
                    >
                      <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>{warning}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recommended Directives */}
              <Card
                header={
                  <span className="flex items-center gap-2 text-emerald-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Recommended Incident Directives
                  </span>
                }
              >
                <div className="space-y-2">
                  {uploadResult.aiSynthesis.recommendedActions?.map((action, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-900/50 text-xs text-emerald-200 flex items-start gap-2.5"
                    >
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ) : (
            <Card className="h-full min-h-[380px] flex flex-col items-center justify-center text-center p-8 border-dashed">
              <div className="w-16 h-16 rounded-full bg-slate-800/80 text-slate-500 flex items-center justify-center mb-4">
                <Database className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-200 text-sm">No Dataset Ingested Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Upload a field dataset or click <b>"Load Sample SQL"</b> above to trigger automated table recognition and Google Gemini 3.7 Flash situation synthesis.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Historical Dataset Imports Audit Table */}
      <Card
        header={
          <div className="flex items-center justify-between w-full">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" />
              Dataset Ingestion Audit History ({history.length})
            </span>
            <span className="text-xs text-slate-400 font-mono">Immutable Compliance Log</span>
          </div>
        }
      >
        <Table headers={['File Name', 'Format', 'File Size', 'Detected Tables', 'Entities Parsed', 'Status', 'Timestamp']}>
          {history.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-slate-500 py-6">
                No previous datasets imported in this session.
              </TableCell>
            </TableRow>
          ) : (
            history.map((h) => (
              <TableRow key={h._id}>
                <TableCell className="font-mono text-sky-400 font-bold">{h.fileName}</TableCell>
                <TableCell>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] uppercase">
                    {h.fileType}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-slate-400 text-xs">
                  {((h.fileSizeBytes || 0) / 1024).toFixed(1)} KB
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {h.detectedTables?.slice(0, 3).map((t) => (
                      <span key={t} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] text-slate-300">
                        {t}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-300">
                  {h.entityCounts ? (
                    <span>
                      {h.entityCounts.districts}D • {h.entityCounts.incidents}H • {h.entityCounts.roadSegments}R • {h.entityCounts.vehicles}V
                    </span>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={h.status === 'imported' ? 'safe' : h.status === 'analyzed' ? 'warning' : 'default'} size="sm">
                    {h.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-400 font-mono text-xs">{formatDate(h.createdAt)}</TableCell>
              </TableRow>
            ))
          )}
        </Table>
      </Card>
    </PageShell>
  );
}
