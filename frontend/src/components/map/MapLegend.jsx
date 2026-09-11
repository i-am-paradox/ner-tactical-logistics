import React from 'react';
import { Layers, ShieldCheck, AlertTriangle, AlertOctagon, Truck, Droplets, Radio } from 'lucide-react';
import { useUIStore } from '../../features/useUIStore';

export function MapLegend() {
  const { mapLayers, toggleMapLayer } = useUIStore();

  return (
    <div className="absolute bottom-4 right-4 z-10 tactical-glass p-3 rounded-xl border border-slate-700/80 shadow-2xl text-xs space-y-2.5 max-w-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 font-bold uppercase tracking-wider text-slate-300 text-[10px]">
        <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-sky-400" /> Operational Overlays</span>
        <span className="text-[9px] text-sky-400 font-mono">NRSC / BRO</span>
      </div>

      {/* Layer Toggles */}
      <div className="space-y-1.5 text-slate-300">
        <label className="flex items-center justify-between hover:text-white cursor-pointer select-none">
          <span className="flex items-center gap-2 text-[11px]">
            <span className="w-2.5 h-1 bg-emerald-500 rounded"></span> Road Corridors
          </span>
          <input
            type="checkbox"
            checked={mapLayers.roadRisk}
            onChange={() => toggleMapLayer('roadRisk')}
            className="rounded border-slate-700 text-sky-500 focus:ring-0 bg-slate-900"
          />
        </label>

        <label className="flex items-center justify-between hover:text-white cursor-pointer select-none">
          <span className="flex items-center gap-2 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span> Live Convoys (GPS)
          </span>
          <input
            type="checkbox"
            checked={mapLayers.activeConvoys}
            onChange={() => toggleMapLayer('activeConvoys')}
            className="rounded border-slate-700 text-sky-500 focus:ring-0 bg-slate-900"
          />
        </label>
      </div>

      {/* Road Segment Status Key */}
      <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[10px] font-mono">
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Clear Passable
          </span>
          <span className="text-emerald-400 font-bold">CLEAR</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Restricted / Mud
          </span>
          <span className="text-amber-400 font-bold">CAUTION</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Blocked / Inundated
          </span>
          <span className="text-red-400 font-bold">BLOCKED</span>
        </div>
        <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/50">
          <span className="flex items-center gap-1.5 text-red-300">
            <span className="w-3 h-1.5 bg-red-500/80 rounded animate-pulse"></span> Pulsing Red Glow
          </span>
          <span className="text-red-400 font-bold flex items-center gap-0.5">
            <Droplets className="w-3 h-3" /> Flood &gt; 0m
          </span>
        </div>
      </div>
    </div>
  );
}
