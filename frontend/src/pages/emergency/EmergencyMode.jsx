import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  Radio,
  FileText,
  Sparkles,
  ShieldCheck,
  Truck,
  CheckCircle2,
  RefreshCw,
  Power,
  Layers,
  Send
} from 'lucide-react';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { MapContainer } from '../../components/map/MapContainer';
import { emergencyService, alertService } from '../../services/domainServices';
import { useEmergencyStore } from '../../features/useEmergencyStore';
import { useAuthStore } from '../../features/useAuthStore';

export function EmergencyMode() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    isEmergencyActive,
    emergencyTitle,
    operationalSummary,
    toggleEmergency,
    sitRep,
    loadingSitRep,
    fetchSitRep
  } = useEmergencyStore();

  const [toggling, setToggling] = useState(false);
  const [broadcastSent, setBroadcastSent] = useState(false);

  const { data: emergencyData, refetch } = useQuery({
    queryKey: ['emergencyStatus'],
    queryFn: () => emergencyService.getEmergencyStatus()
  });

  const metrics = emergencyData?.metrics || {
    blockedCount: 2,
    safeCorridorCount: 8,
    criticalIncidentsCount: 3,
    priorityConvoysCount: 5
  };

  const blockedSegments = emergencyData?.blockedSegments || [];
  const safeCorridors = emergencyData?.safeCorridors || [];

  const handleToggleState = async () => {
    setToggling(true);
    try {
      await toggleEmergency(!isEmergencyActive, emergencyTitle, operationalSummary);
      refetch();
    } finally {
      setToggling(false);
    }
  };

  const handleSendSOSBroadcast = async () => {
    try {
      await alertService.broadcastAlert({
        title: 'EMERGENCY SOS: CLEAR CORRIDORS FOR RELIEF CONVOYS',
        message: 'All commercial transit halted on NH-6 & NH-13. Emergency Medical Convoys have absolute priority.',
        severity: 'critical',
        scope: 'all',
        channels: ['in_app', 'sms', 'push']
      });
      setBroadcastSent(true);
      setTimeout(() => setBroadcastSent(false), 3000);
    } catch (err) {
      console.warn('Broadcast error:', err);
    }
  };

  return (
    <PageShell
      title="Joint Emergency Command & Crisis Operations Console"
      subtitle="High-priority green corridor clearance, live BRO taskforce coordination, and automated military-grade SitRep synthesis"
      breadcrumbs={['Dashboard', 'Emergency Mode']}
      actionSlot={
        <div className="flex items-center gap-2">
          {user?.role === 'admin' && (
            <Button
              variant={isEmergencyActive ? 'outline' : 'danger'}
              size="sm"
              loading={toggling}
              onClick={handleToggleState}
              icon={Power}
            >
              {isEmergencyActive ? 'Deactivate Emergency Protocol' : 'Activate Red Alert'}
            </Button>
          )}
          <Button variant="danger" size="sm" onClick={handleSendSOSBroadcast} icon={Radio}>
            Dispatch Emergency SOS Ping
          </Button>
        </div>
      }
    >
      {/* Alert Header Box */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950 via-red-900 to-slate-900 border-2 border-red-500/80 shadow-[0_0_30px_rgba(239,68,68,0.35)] space-y-3 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-600 text-white animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-red-300">
                DISASTER PROTOCOL ACTIVE • PHASE 2 MONSOON ESCALATION
              </span>
              <h2 className="text-base md:text-xl font-black uppercase tracking-wide">
                {emergencyTitle}
              </h2>
            </div>
          </div>
          <Badge variant="emergency" size="md">
            CRISIS LEVEL 1
          </Badge>
        </div>
        <p className="text-xs text-red-200 leading-relaxed font-sans">{operationalSummary}</p>
        {broadcastSent && (
          <div className="p-2 rounded-lg bg-black/40 border border-red-400 text-xs font-bold text-red-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> SOS Alert dispatched across Push, SMS, and In-App!
          </div>
        )}
      </div>

      {/* Emergency Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Blocked Corridors"
          value={metrics.blockedCount}
          subtitle="Impassable to standard traffic"
          icon={AlertTriangle}
          variant="danger"
        />
        <StatCard
          title="Guaranteed Green Corridors"
          value={metrics.safeCorridorCount}
          subtitle="Enforced by Border Roads Org"
          icon={ShieldCheck}
          variant="safe"
        />
        <StatCard
          title="Critical Field Emergencies"
          value={metrics.criticalIncidentsCount}
          subtitle="Active mudslide / flood zones"
          icon={ShieldAlert}
          variant="danger"
        />
        <StatCard
          title="Priority Medical Convoys"
          value={metrics.priorityConvoysCount}
          subtitle="Escorted under GPS watch"
          icon={Truck}
          variant="primary"
        />
      </div>

      {/* Grid: Tactical Map & SitRep Synthesis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Emergency Corridors Map (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card header="Corridor Integrity & Blockage Map" className="p-0 overflow-hidden">
            <MapContainer
              roadSegments={[...blockedSegments, ...safeCorridors]}
              height="500px"
            />
          </Card>
        </div>

        {/* Gemini Military SitRep Generator (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card
            header={
              <div className="flex items-center justify-between w-full">
                <span className="flex items-center gap-2 text-sky-300">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  Gemini Tactical Situation Report (SitRep)
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  loading={loadingSitRep}
                  onClick={fetchSitRep}
                  icon={RefreshCw}
                >
                  Generate SitRep
                </Button>
              </div>
            }
          >
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 font-mono max-h-[420px] overflow-y-auto space-y-3 leading-relaxed whitespace-pre-wrap">
              {sitRep || (
                <div className="text-center py-12 space-y-3">
                  <FileText className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-slate-400 text-xs">
                    Click "Generate SitRep" to synthesize ground data, blocked corridors, and relief convoy statuses into an official disaster situation report.
                  </p>
                  <Button variant="primary" size="sm" onClick={fetchSitRep} icon={Sparkles}>
                    Synthesize SitRep Now
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
