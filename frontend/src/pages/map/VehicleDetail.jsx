import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Truck,
  User,
  Phone,
  Shield,
  Gauge,
  Thermometer,
  Zap,
  Navigation,
  Route,
  ArrowLeft,
  Package,
  Clock,
  Radio,
  AlertTriangle
} from 'lucide-react';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { MapContainer } from '../../components/map/MapContainer';
import { vehicleService } from '../../services/domainServices';
import { formatDate } from '../../utils/formatters';

export function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: vehicleRes, isLoading } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => vehicleService.getVehicleById(id),
    refetchInterval: 3000
  });

  const vehicle = vehicleRes?.data;
  const shipment = vehicle?.activeShipment;

  if (isLoading) {
    return (
      <PageShell title="Loading Vehicle Telemetry...">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500"></div>
        </div>
      </PageShell>
    );
  }

  if (!vehicle) {
    return (
      <PageShell title="Vehicle Not Found">
        <Card className="text-center py-12 space-y-4">
          <p className="text-slate-400">No telemetry stream available for vehicle ID: {id}</p>
          <Button variant="primary" onClick={() => navigate('/map')} icon={ArrowLeft}>
            Return to Fleet Map
          </Button>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell
      title={`Telemetry: ${vehicle.vehicleId}`}
      subtitle={`${vehicle.model} • ${vehicle.registrationNumber}`}
      breadcrumbs={['Dashboard', 'Live Map', vehicle.vehicleId]}
      actionSlot={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/map')} icon={ArrowLeft}>
            Fleet Map
          </Button>
          <Button
            variant="warning"
            size="sm"
            onClick={() => navigate(`/routes/planner?vehicleId=${vehicle.vehicleId}`)}
            icon={Route}
          >
            Emergency Reroute
          </Button>
        </div>
      }
    >
      {/* Telemetry Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Current Speed"
          value={`${vehicle.speedKmph} km/h`}
          subtitle={`Heading: ${vehicle.heading}°`}
          icon={Gauge}
          variant="primary"
        />
        <StatCard
          title="Altitude Level"
          value={`${vehicle.altitudeM || 850} m`}
          subtitle="Mountain Slope Gauge"
          icon={Navigation}
          variant="safe"
        />
        <StatCard
          title="Fuel Reserve"
          value={`${vehicle.fuelLevelPct}%`}
          subtitle="100L High-Grade Diesel"
          icon={Zap}
          variant="safe"
        />
        <StatCard
          title="Engine Temperature"
          value={`${vehicle.engineTempC}°C`}
          subtitle="Optimal Range: 80-95°C"
          icon={Thermometer}
          variant={vehicle.engineTempC > 92 ? 'warning' : 'primary'}
        />
      </div>

      {/* Main Grid: Map & Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Focused Map (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <Card header="Live Coordinate Telemetry" className="p-0 overflow-hidden">
            <MapContainer
              center={vehicle.currentLocation?.coordinates || [91.8150, 25.8850]}
              zoom={10}
              vehicles={[vehicle]}
              height="450px"
            />
          </Card>
        </div>

        {/* Driver & Consignment Details (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Driver Card */}
          <Card header="Assigned Convoy Lead">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400 font-bold text-base">
                  {vehicle.driver?.name?.[0] || 'D'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{vehicle.driver?.name}</h4>
                  <p className="text-xs text-slate-400">{vehicle.driver?.experienceYears} Yrs Mountain Driving</p>
                  <div className="flex items-center gap-1 text-xs text-amber-400 mt-0.5">
                    ★ {vehicle.driver?.rating || 4.9} Rating
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-500">Contact:</span>
                  <span className="font-mono text-sky-400">{vehicle.driver?.phone}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-500">License No:</span>
                  <span className="font-mono">{vehicle.driver?.license}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Shipment Card */}
          <Card header="Active Consignment Manifest">
            {shipment ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="primary" size="sm">{shipment.cargoType}</Badge>
                  <Badge variant={shipment.priority === 'critical' ? 'danger' : 'safe'} size="sm">
                    {shipment.priority}
                  </Badge>
                </div>
                <h4 className="text-xs font-bold text-slate-100">{shipment.title}</h4>
                <div className="text-xs text-slate-300 space-y-1 font-mono bg-slate-950/50 p-2.5 rounded-lg">
                  <div>Origin: <b>{shipment.originName}</b></div>
                  <div>Dest: <b>{shipment.destinationName}</b></div>
                  <div>Payload: <b>{shipment.weightKg} kg</b></div>
                  <div>Temp: <b className="text-cyan-400">{shipment.currentTempC}</b></div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(`/shipments/${shipment.shipmentId}`)}
                >
                  View Full Consignment Chain
                </Button>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">No active consignment assigned to this vehicle.</p>
            )}
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
