import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  MapPin,
  Truck,
  CloudRain,
  Phone,
  ShieldCheck,
  ArrowLeft,
  Navigation,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { MapContainer } from '../../components/map/MapContainer';
import { districtService } from '../../services/domainServices';

export function DistrictDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: districtRes, isLoading } = useQuery({
    queryKey: ['district', id],
    queryFn: () => districtService.getDistrictById(id)
  });

  const district = districtRes?.data;

  if (isLoading) {
    return (
      <PageShell title="Loading District Dossier...">
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500"></div>
        </div>
      </PageShell>
    );
  }

  if (!district) {
    return (
      <PageShell title="District Not Found">
        <Card className="text-center py-12 space-y-3">
          <p className="text-slate-400">No district records found with ID: {id}</p>
          <Button variant="primary" onClick={() => navigate('/districts')} icon={ArrowLeft}>
            Back to Directory
          </Button>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell
      title={`District Command: ${district.name}`}
      subtitle={`${district.state} • Headquarters: ${district.hq} • Code: ${district.districtId}`}
      breadcrumbs={['Dashboard', 'Districts', district.name]}
      actionSlot={
        <Button variant="outline" size="sm" onClick={() => navigate('/districts')} icon={ArrowLeft}>
          All Districts
        </Button>
      }
    >
      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Accessibility Score"
          value={`${district.currentAccessibilityScore} / 100`}
          subtitle="Real-time road viability"
          icon={ShieldCheck}
          variant={district.currentAccessibilityScore >= 80 ? 'safe' : 'warning'}
        />
        <StatCard
          title="Mean Elevation"
          value={`${district.elevationM || 500} m`}
          subtitle={`Avg Slope: ${district.avgSlopeDeg || 15}°`}
          icon={Navigation}
          variant="primary"
        />
        <StatCard
          title="Live Weather Condition"
          value={`${district.weather?.tempC || 24}°C`}
          subtitle={district.weather?.condition || 'Monsoon Mist'}
          icon={CloudRain}
          variant="primary"
        />
        <StatCard
          title="Active Convoys"
          value={district.activeVehicles?.length || 2}
          subtitle="Currently within borders"
          icon={Truck}
          variant="safe"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* District Map (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card header="District Boundary & Road Network Topology" className="p-0 overflow-hidden">
            <MapContainer
              center={district.centroid}
              zoom={9.5}
              districts={[district]}
              roadSegments={district.roadSegments || []}
              vehicles={district.activeVehicles || []}
              height="450px"
            />
          </Card>
        </div>

        {/* Checkpoints & Emergency Contacts (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Emergency Operations Roster */}
          <Card header="District Disaster Cell & BRO Contacts">
            <div className="space-y-3 text-xs">
              {district.emergencyContacts?.map((c, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block">{c.title}</span>
                    <b className="text-slate-200">{c.name}</b>
                  </div>
                  <a href={`tel:${c.phone}`} className="flex items-center gap-1 font-mono text-sky-400 hover:text-sky-300">
                    <Phone className="w-3.5 h-3.5" /> {c.phone}
                  </a>
                </div>
              ))}
            </div>
          </Card>

          {/* Strategic Highway Checkpoints */}
          <Card header="Highway Checkpoints & Security Gates">
            <div className="space-y-2 text-xs">
              {district.checkpoints?.map((cp, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-slate-200">{cp.name}</span>
                  </div>
                  <Badge variant="safe" size="sm">
                    {cp.status || 'OPEN'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
