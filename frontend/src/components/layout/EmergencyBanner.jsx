import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { useEmergencyStore } from '../../features/useEmergencyStore';

export function EmergencyBanner() {
  const { isEmergencyActive, emergencyTitle } = useEmergencyStore();
  const navigate = useNavigate();

  if (!isEmergencyActive) return null;

  return (
    <div className="bg-gradient-to-r from-red-900/90 via-red-800/90 to-red-950/90 border-b border-red-500/50 px-4 py-2.5 shadow-lg flex items-center justify-between text-white z-40 sticky top-0">
      <div className="flex items-center gap-3">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-300 animate-bounce" />
          <span className="text-xs font-black uppercase tracking-widest bg-red-950/80 px-2 py-0.5 rounded border border-red-400/40 text-red-200">
            EMERGENCY PROTOCOL ACTIVE
          </span>
          <span className="text-xs font-semibold text-slate-100 hidden md:inline">
            {emergencyTitle}
          </span>
        </div>
      </div>

      <button
        onClick={() => navigate('/emergency')}
        className="flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition shadow-[0_0_12px_rgba(239,68,68,0.5)] cursor-pointer"
      >
        Crisis Console <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
