import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  AlertTriangle,
  ShieldCheck,
  Radio,
  Plus,
  Route,
  Bell,
  ArrowRight,
  CloudRain,
  MapPin,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { PageShell } from '../../components/layout/PageShell';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, TableRow, TableCell } from '../../components/ui/Table';
import { MapContainer } from '../../components/map/MapContainer';
import { vehicleService, incidentService, shipmentService, alertService, districtService, roadService } from '../../services/domainServices';
import { formatDate, formatDuration } from '../../utils/formatters';

export function Overview() {
  const navigate = useNavigate();

  // Queries
  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehicleService.getVehicles()
  });

  const { data: shipmentsData } = useQuery({
    queryKey: ['shipments'],
    queryFn: () => shipmentService.getShipments()
  });

  const { data: incidentsData } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => incidentService.getIncidents()
  });

  const { data: alertsData } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => alertService.getAlerts()
  });

  const { data: districtsData } = useQuery({
    queryKey: ['districts'],
    queryFn: () => districtService.getDistricts()
  });

  const { data: roadsData } = useQuery({
    queryKey: ['roads'],
    queryFn: () => roadService.getRoadSegments()
  });

  const vehicles = vehiclesData?.data || [];
  const shipments = shipmentsData?.data || [];
  const incidents = incidentsData?.data || [];
  const alerts = alertsData?.data || [];
  const districts = districtsData?.data || [];
  const roadSegments = roadsData?.data || [];

  const activeVehicles = vehicles.filter(v => ['in_transit', 'caution_zone'].includes(v.status));
  const criticalIncidents = incidents.filter(i => i.severity >= 4 && i.status !== 'resolved');
  const activeAlerts = alerts.filter(a => a.isActive);

  return (
    <PageShell
      title="Tactical Command Overview"
      subtitle="Real-time regional logistics situation and emergency monitoring across North East India"
      actionSlot={
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={() => navigate('/routes/planner')} icon={Route}>
            Plan Route
          </Button>
          <Button variant="danger" size="sm" onClick={() => navigate('/incidents/new')} icon={AlertTriangle}>
            Report Incident
          </Button>
        </div>
      }
    >
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Convoys in Transit"
          value={activeVehicles.length}
          subtitle="Real-time GPS telemetry stream"
          icon={Truck}
          variant="primary"
        />
        <StatCard
          title="Critical Field Incidents"
          value={criticalIncidents.length}
          subtitle="Landslides & corridor blockages"
          icon={AlertTriangle}
          variant="danger"
        />
        <StatCard
          title="Emergency Advisories"
          value={activeAlerts.length}
          subtitle="Active corridor & district alerts"
          icon={Bell}
          variant="warning"
        />
        <StatCard
          title="Safe Corridors Open"
          value="8 / 10"
          subtitle="Green rated transit highways"
          icon={ShieldCheck}
          variant="safe"
        />
      </div>

      {/* Main Map & Incident Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tactical Map View (Left 8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <Card
            header={
              <div className="flex items-center justify-between w-full">
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-sky-400" />
                  Live Fleet & Corridor Heatmap
                </span>
                <button
                  onClick={() => navigate('/map')}
                  className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  Full Tactical Map <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            }
            className="p-0 overflow-hidden"
          >
            <MapContainer
              vehicles={vehicles}
              districts={districts}
              roadSegments={roadSegments}
              onVehicleClick={(v) => navigate(`/map/vehicle/${v.vehicleId}`)}
              height="420px"
            />
          </Card>
        </div>

        {/* Live Field Incident Stream (Right 4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card
            header={
              <div className="flex items-center justify-between w-full">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Recent Hazard Reports
                </span>
                <button
                  onClick={() => navigate('/incidents')}
                  className="text-xs text-sky-400 hover:text-sky-300 font-semibold"
                >
                  View All ({incidents.length})
                </button>
              </div>
            }
          >
            <div className="space-y-3 max-h-[390px] overflow-y-auto pr-1">
              {incidents.slice(0, 4).map((inc) => (
                <div
                  key={inc.clientUuid || inc._id}
                  onClick={() => navigate(`/incidents/${inc.clientUuid || inc._id}`)}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant={inc.severity >= 4 ? 'danger' : inc.severity === 3 ? 'warning' : 'safe'} size="sm">
                      Level {inc.severity} • {inc.incidentType?.replace('_', ' ')}
                    </Badge>
                    <span className="text-[10px] text-slate-500 font-mono">{formatDate(inc.capturedAt)}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 line-clamp-1">{inc.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{inc.description}</p>
                  {inc.aiClassification?.shortDescription && (
                    <div className="mt-1 pt-1.5 border-t border-slate-800/80 text-[10px] text-sky-300 font-mono flex items-center gap-1">
                      <span className="font-bold text-sky-400">AI:</span> {inc.aiClassification.shortDescription.slice(0, 55)}...
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Active Consignments Table */}
      <Card
        header={
          <div className="flex items-center justify-between w-full">
            <span className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-sky-400" />
              Active Priority Shipments in Transit
            </span>
            <Button variant="outline" size="sm" onClick={() => navigate('/shipments')} icon={ArrowRight}>
              All Consignments
            </Button>
          </div>
        }
      >
        <Table headers={['Shipment ID', 'Consignment Title', 'Route & Destination', 'Cargo Type', 'Priority', 'Assigned Vehicle', 'Status']}>
          {shipments.slice(0, 5).map((shp) => (
            <TableRow key={shp.shipmentId} onClick={() => navigate(`/shipments/${shp.shipmentId}`)}>
              <TableCell className="font-mono text-sky-400 font-bold">{shp.shipmentId}</TableCell>
              <TableCell className="font-semibold text-slate-100">{shp.title}</TableCell>
              <TableCell>
                <div className="text-slate-300">{shp.originName} → <b className="text-slate-100">{shp.destinationName}</b></div>
              </TableCell>
              <TableCell>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs font-medium">
                  {shp.cargoType}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant={shp.priority === 'critical' ? 'danger' : shp.priority === 'high' ? 'warning' : 'default'} size="sm">
                  {shp.priority}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-slate-300">{shp.assignedVehicleId || 'Unassigned'}</TableCell>
              <TableCell>
                <Badge variant={shp.status === 'rerouted' ? 'warning' : 'safe'} size="sm" pulsing={shp.status === 'in_transit'}>
                  {shp.status?.replace('_', ' ')}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </Card>
    </PageShell>
  );
}
