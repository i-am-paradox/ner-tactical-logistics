import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  Search,
  Filter,
  Navigation,
  Gauge,
  Thermometer,
  Zap,
  Radio,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { PageShell } from '../../components/layout/PageShell';
import { MapContainer } from '../../components/map/MapContainer';
import { MapLegend } from '../../components/map/MapLegend';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { vehicleService, districtService, roadService } from '../../services/domainServices';

export function LiveMap() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehicleService.getVehicles()
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
  const districts = districtsData?.data || [];
  const roadSegments = roadsData?.data || [];

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.vehicleId.toLowerCase().includes(search.toLowerCase()) ||
      v.driver?.name?.toLowerCase().includes(search.toLowerCase()) ||
      v.model?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <PageShell
      title="Live Tactical Map & Fleet Telemetry"
      subtitle="Real-time GPS tracking across mountainous terrain with dynamic road risk overlays"
      breadcrumbs={['Dashboard', 'Live Map']}
      fluid
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-190px)] min-h-[600px]">
        {/* Vehicles Sidebar (4 cols) */}
        <div className="lg:col-span-4 flex flex-col tactical-glass rounded-2xl border border-slate-800 p-4 space-y-4 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
                Fleet Roster ({filteredVehicles.length})
              </h3>
            </div>
            <Badge variant="safe" size="sm">
              Socket Live
            </Badge>
          </div>

          {/* Search & Filter Controls */}
          <div className="space-y-2">
            <Input
              placeholder="Search vehicle ID, driver, cargo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={Search}
              className="py-1.5 text-xs"
            />
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
              {['all', 'in_transit', 'caution_zone', 'delayed', 'idle'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition cursor-pointer ${
                    statusFilter === st
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {filteredVehicles.map((v) => (
              <div
                key={v.vehicleId}
                onClick={() => setSelectedVehicle(v)}
                className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 ${
                  selectedVehicle?.vehicleId === v.vehicleId
                    ? 'bg-sky-950/80 border-sky-500 shadow-[0_0_15px_rgba(2,132,199,0.3)]'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-slate-800 text-sky-400 font-bold font-mono text-xs">
                      {v.vehicleId}
                    </span>
                    <span className="text-xs font-semibold text-slate-200 truncate">{v.driver?.name}</span>
                  </div>
                  <Badge variant={v.status === 'caution_zone' ? 'warning' : 'safe'} size="sm" pulsing={v.status === 'in_transit'}>
                    {v.status?.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400 font-mono bg-slate-950/40 p-2 rounded-lg">
                  <div>
                    <span className="text-slate-500 block text-[9px]">SPEED</span>
                    <b className="text-slate-200">{v.speedKmph} km/h</b>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">ALTITUDE</span>
                    <b className="text-slate-200">{v.altitudeM || 850} m</b>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">FUEL</span>
                    <b className="text-emerald-400">{v.fuelLevelPct}%</b>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-slate-400 text-[10px] truncate">{v.type}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/map/vehicle/${v.vehicleId}`);
                    }}
                    className="text-sky-400 hover:text-sky-300 font-bold text-[11px] flex items-center gap-1"
                  >
                    Telemetry <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map View (8 cols) */}
        <div className="lg:col-span-8 relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
          <MapContainer
            vehicles={vehicles}
            districts={districts}
            roadSegments={roadSegments}
            onVehicleClick={(v) => setSelectedVehicle(v)}
            height="100%"
          />
          <MapLegend />
        </div>
      </div>
    </PageShell>
  );
}
