import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Package,
  Truck,
  MapPin,
  Clock,
  Thermometer,
  ShieldCheck,
  CheckCircle2,
  Route,
  ArrowLeft,
  AlertTriangle,
  Radio
} from 'lucide-react';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { shipmentService } from '../../services/domainServices';
import { formatDate } from '../../utils/formatters';

export function ShipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: shipmentRes, isLoading } = useQuery({
    queryKey: ['shipment', id],
    queryFn: () => shipmentService.getShipmentById(id)
  });

  const shipment = shipmentRes?.data;

  if (isLoading) {
    return (
      <PageShell title="Loading Consignment Manifest...">
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500"></div>
        </div>
      </PageShell>
    );
  }

  if (!shipment) {
    return (
      <PageShell title="Consignment Not Found">
        <Card className="text-center py-12 space-y-3">
          <p className="text-slate-400">No consignment manifest registered for ID: {id}</p>
          <Button variant="primary" onClick={() => navigate('/shipments')} icon={ArrowLeft}>
            Back to Manifest
          </Button>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell
      title={`Consignment: ${shipment.shipmentId}`}
      subtitle={`${shipment.title} • Priority: ${shipment.priority?.toUpperCase()}`}
      breadcrumbs={['Dashboard', 'Consignments', shipment.shipmentId]}
      actionSlot={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/shipments')} icon={ArrowLeft}>
            All Consignments
          </Button>
          <Button
            variant="warning"
            size="sm"
            onClick={() => navigate(`/routes/planner?origin=${shipment.originDistrictId}&destination=${shipment.destinationDistrictId}`)}
            icon={Route}
          >
            Dynamic Reroute Bypass
          </Button>
        </div>
      }
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Cargo Type"
          value={shipment.cargoType}
          subtitle={`Payload: ${shipment.weightKg} kg`}
          icon={Package}
          variant="primary"
        />
        <StatCard
          title="Cargo Temperature"
          value={shipment.currentTempC || '4.2°C'}
          subtitle={`Target: ${shipment.tempRequirementC}`}
          icon={Thermometer}
          variant="safe"
        />
        <StatCard
          title="Assigned Vehicle"
          value={shipment.assignedVehicleId || 'NER-CONVOY-101'}
          subtitle="Tata 4x4 High-Terrain"
          icon={Truck}
          variant="primary"
        />
        <StatCard
          title="Consignment Status"
          value={shipment.status?.replace('_', ' ').toUpperCase()}
          subtitle="GPS Live Tracking Active"
          icon={Radio}
          variant={shipment.status === 'rerouted' ? 'warning' : 'safe'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Waypoint Milestones (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card header="Transit Chain of Custody & Waypoint Milestones">
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {shipment.milestones?.map((m, i) => (
                <div key={i} className="relative flex items-start justify-between">
                  <div className={`absolute -left-6 mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    m.completed ? 'bg-emerald-500 border-emerald-400' : 'bg-slate-900 border-slate-700'
                  }`}>
                    {m.completed && <CheckCircle2 className="w-3 h-3 text-slate-950" />}
                  </div>

                  <div>
                    <h4 className={`text-xs font-bold ${m.completed ? 'text-slate-100' : 'text-slate-400'}`}>
                      {m.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {m.completed ? 'Checkpoint Cleared' : 'Pending Passage'}
                    </p>
                  </div>

                  <span className="text-xs font-mono font-bold text-sky-400">{m.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Consignment Notes & Reroute History (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card header="Origin & Staging Logistics">
            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-slate-500 block text-[10px]">ORIGIN HUB:</span>
                <b className="text-slate-200 text-sm">{shipment.originName}</b>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-slate-500 block text-[10px]">DESTINATION RECEIVING BAY:</span>
                <b className="text-emerald-400 text-sm">{shipment.destinationName}</b>
              </div>
            </div>
          </Card>

          {shipment.rerouteHistory?.length > 0 && (
            <Card header="Dynamic Reroute Audit Log">
              <div className="space-y-2 text-xs">
                {shipment.rerouteHistory.map((rh, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/80 text-amber-300 space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono">{formatDate(rh.timestamp)}</span>
                    <p className="font-semibold">{rh.reason}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </PageShell>
  );
}
