import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  MapPin,
  Clock,
  User,
  CheckCircle2,
  HardHat,
  FileText
} from 'lucide-react';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { MapContainer } from '../../components/map/MapContainer';
import { incidentService } from '../../services/domainServices';
import { formatDate } from '../../utils/formatters';

export function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [resolutionNotes, setResolutionNotes] = useState('');

  const { data: incidentRes, isLoading } = useQuery({
    queryKey: ['incident', id],
    queryFn: () => incidentService.getIncidentById(id)
  });

  const incident = incidentRes?.data;

  const updateStatusMutation = useMutation({
    mutationFn: (status) =>
      incidentService.updateStatus(id, { status, resolutionNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incident', id] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    }
  });

  if (isLoading) {
    return (
      <PageShell title="Loading Incident Dossier...">
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500"></div>
        </div>
      </PageShell>
    );
  }

  if (!incident) {
    return (
      <PageShell title="Incident Not Found">
        <Card className="text-center py-12 space-y-3">
          <p className="text-slate-400">No incident recorded with ID: {id}</p>
          <Button variant="primary" onClick={() => navigate('/incidents')} icon={ArrowLeft}>
            Back to Incident Matrix
          </Button>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell
      title={`Hazard Report: ${incident.clientUuid}`}
      subtitle={`${incident.incidentType?.toUpperCase()} • ${incident.districtName}`}
      breadcrumbs={['Dashboard', 'Incidents', incident.clientUuid]}
      actionSlot={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/incidents')} icon={ArrowLeft}>
            All Incidents
          </Button>
          {incident.status !== 'resolved' && (
            <Button
              variant="safe"
              size="sm"
              loading={updateStatusMutation.isPending}
              onClick={() => updateStatusMutation.mutate('resolved')}
              icon={CheckCircle2}
            >
              Mark Road Cleared & Resolved
            </Button>
          )}
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Details & Evidence (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card header="Hazard Specification & Ground Description">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant={incident.severity >= 4 ? 'danger' : incident.severity === 3 ? 'warning' : 'safe'} size="md">
                  Severity Level {incident.severity} / 5
                </Badge>
                <span className="text-xs text-slate-400 font-mono">
                  Captured: {formatDate(incident.capturedAt)}
                </span>
              </div>

              <h2 className="text-base font-bold text-slate-100">{incident.title}</h2>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">{incident.description}</p>

              {/* Photo Evidence if any */}
              {incident.photoBase64 && (
                <div className="mt-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Field Photo Evidence</h4>
                  <img
                    src={incident.photoBase64}
                    alt="Field evidence"
                    className="w-full max-h-72 object-cover rounded-xl border border-slate-800"
                  />
                </div>
              )}

              {/* Gemini AI Classification Breakdown */}
              {incident.aiClassification && (
                <div className="p-4 rounded-xl bg-slate-900/90 border border-sky-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> Gemini AI Multimodal Findings
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Confidence: {Math.round((incident.aiClassification.confidence || 0.9) * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    {incident.aiClassification.shortDescription}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Action Dispatch Panel */}
          <Card header="Response Dispatch & BRO Engineering Actions">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => updateStatusMutation.mutate('crew_dispatched')}
                  icon={HardHat}
                >
                  Dispatch BRO Bulldozers
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => navigate('/emergency')}
                  icon={ShieldAlert}
                >
                  Trigger Emergency Protocol
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Location & Reporter (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card header="Geographic Incident Pinpoint" className="p-0 overflow-hidden">
            <MapContainer
              center={incident.location?.coordinates || [92.3500, 25.2800]}
              zoom={11}
              height="300px"
            />
          </Card>

          <Card header="Field Reporter Metadata">
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500">Reporter:</span>
                <b className="text-slate-100">{incident.reporterName}</b>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500">Designation:</span>
                <span className="capitalize">{incident.reporterRole?.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500">Contact:</span>
                <span className="font-mono text-sky-400">{incident.reporterPhone || '+91 94350 00000'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500">Server Logged:</span>
                <span className="font-mono">{formatDate(incident.receivedAt)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
