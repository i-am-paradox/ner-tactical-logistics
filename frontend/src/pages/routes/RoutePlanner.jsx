import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Route,
  Navigation,
  ShieldCheck,
  Zap,
  Sparkles,
  MapPin,
  Clock,
  TrendingUp,
  CloudRain,
  Save,
  Truck,
  CheckCircle2
} from 'lucide-react';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Input';
import { MapContainer } from '../../components/map/MapContainer';
import { routeService, districtService } from '../../services/domainServices';
import { formatDistance, formatDuration } from '../../utils/formatters';

export function RoutePlanner() {
  const navigate = useNavigate();
  const [originId, setOriginId] = useState('AS-KAM'); // Guwahati
  const [destinationId, setDestinationId] = useState('ML-EKH'); // Shillong
  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load districts for dropdowns
  const { data: districtsData } = useQuery({
    queryKey: ['districts'],
    queryFn: () => districtService.getDistricts()
  });

  const districts = districtsData?.data || [];

  // Generate candidate routes query
  const {
    data: routesData,
    isLoading: isGenerating,
    refetch: generateRoutes
  } = useQuery({
    queryKey: ['generatedRoutes', originId, destinationId],
    queryFn: () => routeService.generateRoutes(originId, destinationId),
    enabled: Boolean(originId && destinationId && originId !== destinationId)
  });

  const candidates = routesData?.candidates || [];
  const activeRoute = candidates[selectedRouteIdx] || candidates[0];

  const handleCalculate = (e) => {
    e.preventDefault();
    if (originId === destinationId) {
      alert('Origin and destination must be distinct districts.');
      return;
    }
    setSaveSuccess(false);
    generateRoutes();
  };

  const handleSaveRoute = async () => {
    if (!activeRoute) return;
    try {
      await routeService.saveRoute(activeRoute);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.warn('Save route error:', err);
    }
  };

  return (
    <PageShell
      title="AI Multi-Criteria Route Optimizer"
      subtitle="Deterministic graph pathfinding (Fastest, Safest, Balanced) with Google Gemini terrain rationale"
      breadcrumbs={['Dashboard', 'Route Optimizer']}
    >
      {/* Route Generator Bar */}
      <Card className="border-slate-800 p-4">
        <form onSubmit={handleCalculate} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5">
            <Select
              label="Origin Hub (NER Dispatch Point)"
              value={originId}
              onChange={(e) => setOriginId(e.target.value)}
              options={districts.map((d) => ({
                value: d.districtId,
                label: `${d.name} (${d.state})`
              }))}
            />
          </div>

          <div className="md:col-span-5">
            <Select
              label="Destination Staging Node"
              value={destinationId}
              onChange={(e) => setDestinationId(e.target.value)}
              options={districts.map((d) => ({
                value: d.districtId,
                label: `${d.name} (${d.state})`
              }))}
            />
          </div>

          <div className="md:col-span-2">
            <Button
              type="submit"
              variant="primary"
              loading={isGenerating}
              className="w-full h-10"
              icon={Navigation}
            >
              Analyze Corridors
            </Button>
          </div>
        </form>
      </Card>

      {/* Main Grid: Candidate Options & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Candidate Cards & AI Reasoning (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Evaluated Path Candidates ({candidates.length})
            </h3>
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Route Saved!
              </span>
            )}
          </div>

          {candidates.map((cand, idx) => (
            <div
              key={cand.routeId}
              onClick={() => setSelectedRouteIdx(idx)}
              className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                selectedRouteIdx === idx
                  ? 'bg-sky-950/80 border-sky-500 shadow-[0_0_15px_rgba(2,132,199,0.3)]'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-100 uppercase">{cand.type} Option</span>
                  {cand.type === 'safest' && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                  {cand.type === 'fastest' && <Zap className="w-4 h-4 text-amber-400" />}
                </div>
                <Badge variant={cand.riskBand} size="sm">
                  Risk: {cand.overallRiskScore}/100
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-slate-950/50 p-2.5 rounded-lg text-slate-300">
                <div>
                  <span className="text-slate-500 text-[10px] block">DISTANCE</span>
                  <b>{formatDistance(cand.distanceKm)}</b>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">DURATION</span>
                  <b>{formatDuration(cand.durationMin)}</b>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">MAX SLOPE</span>
                  <b>24.8°</b>
                </div>
              </div>
            </div>
          ))}

          {/* Gemini AI Reasoning Card */}
          {activeRoute && (
            <Card
              className="border-sky-500/40 bg-gradient-to-br from-slate-900/90 to-sky-950/40"
              header={
                <span className="flex items-center gap-2 text-sky-300">
                  <Sparkles className="w-4 h-4 text-sky-400 animate-spin" />
                  Gemini Grounded Route Rationale
                </span>
              }
            >
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {activeRoute.aiReasoning}
              </p>
              <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 font-mono flex items-center justify-between">
                <span>Weather: {activeRoute.weatherConditionSummary}</span>
                <span className="text-sky-400">Model: Gemini 1.5 Flash</span>
              </div>
            </Card>
          )}

          {/* Actions */}
          {activeRoute && (
            <div className="flex gap-2">
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => navigate(`/shipments?newRoute=${activeRoute.routeId}`)}
                icon={Truck}
              >
                Dispatch Convoy on this Route
              </Button>
              <Button variant="secondary" onClick={handleSaveRoute} icon={Save}>
                Save Route
              </Button>
            </div>
          )}
        </div>

        {/* Map Preview & Elevation (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card header="Corridor Geometry & Elevation Visualization" className="p-0 overflow-hidden">
            <MapContainer
              highlightedRoute={activeRoute}
              districts={districts}
              height="480px"
            />
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
