import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Search,
  Filter,
  MapPin,
  Truck,
  CloudRain,
  ShieldCheck,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input, Select } from '../../components/ui/Input';
import { districtService } from '../../services/domainServices';

export function DistrictDirectory() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('all');

  const { data: districtsData, isLoading } = useQuery({
    queryKey: ['districts'],
    queryFn: () => districtService.getDistricts()
  });

  const districts = districtsData?.data || [];

  const states = [
    'all',
    'Assam',
    'Meghalaya',
    'Arunachal Pradesh',
    'Nagaland',
    'Manipur',
    'Mizoram',
    'Tripura',
    'Sikkim'
  ];

  const filteredDistricts = districts.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.hq?.toLowerCase().includes(search.toLowerCase()) ||
      d.state.toLowerCase().includes(search.toLowerCase());
    const matchesState = selectedState === 'all' || d.state === selectedState;
    return matchesSearch && matchesState;
  });

  return (
    <PageShell
      title="North East Region District Directory"
      subtitle="Strategic logistics nodes, real-time accessibility indexes, and weather monitoring across all 8 NER states"
      breadcrumbs={['Dashboard', 'Districts']}
    >
      {/* Search & State Filter */}
      <Card className="p-4 border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-8">
            <Input
              placeholder="Search district name, headquarters, or state..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={Search}
            />
          </div>
          <div className="sm:col-span-4">
            <Select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              options={states.map((st) => ({
                value: st,
                label: st === 'all' ? 'All 8 NER States' : st
              }))}
            />
          </div>
        </div>
      </Card>

      {/* District Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDistricts.map((dist) => (
          <div
            key={dist.districtId}
            onClick={() => navigate(`/districts/${dist.districtId}`)}
            className="tactical-glass p-5 rounded-2xl border border-slate-800 hover:border-sky-500/70 hover:bg-slate-900/90 transition-all cursor-pointer space-y-3 group"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider">
                  {dist.state} • {dist.districtId}
                </span>
                <h3 className="text-base font-bold text-slate-100 group-hover:text-sky-300 transition">
                  {dist.name}
                </h3>
                <p className="text-xs text-slate-400">HQ: {dist.hq}</p>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Accessibility</span>
                <span className={`text-lg font-mono font-black ${
                  dist.currentAccessibilityScore >= 80 ? 'text-emerald-400' : dist.currentAccessibilityScore >= 60 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {dist.currentAccessibilityScore} / 100
                </span>
              </div>
            </div>

            {/* Weather & Active Convoys Strip */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Truck className="w-3.5 h-3.5 text-sky-400" />
                <span>{dist.activeConvoysCount || 2} Convoys Active</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                <span>{dist.weather?.tempC || 24}°C • {dist.weather?.rainfallMm || 0}mm</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <Badge variant={dist.landslideSusceptibility === 'critical' ? 'danger' : 'safe'} size="sm">
                Landslide: {dist.landslideSusceptibility}
              </Badge>

              <span className="text-sky-400 text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition">
                District Command <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
