import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Radio,
  Shield,
  MapPin,
  Route,
  AlertTriangle,
  WifiOff,
  Cpu,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export function Landing() {
  const navigate = useNavigate();

  const states = [
    'Assam', 'Meghalaya', 'Arunachal Pradesh', 'Nagaland',
    'Manipur', 'Mizoram', 'Tripura', 'Sikkim'
  ];

  return (
    <div className="min-h-screen bg-ner-bg text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Top Tactical Banner */}
      <header className="h-20 tactical-glass-header px-6 md:px-12 flex items-center justify-between border-b border-slate-800/80 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white shadow-glow-primary">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base md:text-lg font-black tracking-wider uppercase flex items-center gap-2 text-slate-100">
              NER-LECS <span className="text-xs px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-bold">TACTICAL</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">North East Logistics & Disaster Command</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
            Officer Login
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/dashboard')} icon={ArrowRight}>
            Enter Command Center
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 md:px-12 py-16 md:py-24 max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-sky-400 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            DEFENSE & DISASTER GRADE LOGISTICS PLATFORM ACROSS 8 NER STATES
          </div>

          <h2 className="text-3xl md:text-6xl font-extrabold tracking-tight uppercase text-slate-100 leading-tight">
            Resilient Mountain Logistics & <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">Live Emergency Command</span>
          </h2>

          <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Deterministic risk calculation, graph-based route optimization, Google Gemini multimodal AI hazard analysis, and offline PWA sync engineered for challenging Himalayan terrain.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button size="lg" variant="primary" onClick={() => navigate('/dashboard')} icon={Activity}>
              Launch Live Dashboard
            </Button>
            <Button size="lg" variant="secondary" onClick={() => navigate('/map')} icon={MapPin}>
              Inspect Live Convoys
            </Button>
            <Button size="lg" variant="danger" onClick={() => navigate('/emergency')} icon={ShieldAlert}>
              Emergency Console
            </Button>
          </div>
        </div>

        {/* Live Operational Metrics Ticker */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-5xl mx-auto w-full">
          <Card className="text-center p-4 border-slate-800/80">
            <p className="text-[10px] uppercase font-bold text-slate-400">Tracked Convoys</p>
            <p className="text-2xl md:text-3xl font-mono font-black text-sky-400 mt-1">100% LIVE</p>
            <p className="text-[10px] text-slate-500 mt-0.5">2.5s GPS Telemetry</p>
          </Card>
          <Card className="text-center p-4 border-slate-800/80">
            <p className="text-[10px] uppercase font-bold text-slate-400">Risk Engine</p>
            <p className="text-2xl md:text-3xl font-mono font-black text-emerald-400 mt-1">DETERMINISTIC</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Rain + Slope + DEM</p>
          </Card>
          <Card className="text-center p-4 border-slate-800/80">
            <p className="text-[10px] uppercase font-bold text-slate-400">AI Visual Analysis</p>
            <p className="text-2xl md:text-3xl font-mono font-black text-amber-400 mt-1">GEMINI 1.5</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Multimodal Slope Severity</p>
          </Card>
          <Card className="text-center p-4 border-slate-800/80">
            <p className="text-[10px] uppercase font-bold text-slate-400">Zero Connectivity</p>
            <p className="text-2xl md:text-3xl font-mono font-black text-cyan-400 mt-1">OFFLINE PWA</p>
            <p className="text-[10px] text-slate-500 mt-0.5">IndexedDB Background Sync</p>
          </Card>
        </div>

        {/* State Badges Strip */}
        <div className="mt-12 text-center space-y-3">
          <p className="text-xs uppercase font-bold tracking-widest text-slate-500">
            OPERATING ACROSS ALL 8 NORTH EASTERN REGION STATES
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {states.map((st) => (
              <span
                key={st}
                className="px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-300"
              >
                {st}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="tactical-glass-header py-6 px-6 md:px-12 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>© 2026 NER Tactical Logistics & Emergency Command System (NER-LECS). Built for Smart India Hackathon.</p>
        <div className="flex items-center gap-4 text-slate-400">
          <span className="hover:text-sky-400 cursor-pointer" onClick={() => navigate('/login')}>Login</span>
          <span>•</span>
          <span className="hover:text-sky-400 cursor-pointer" onClick={() => navigate('/emergency')}>Emergency SitRep</span>
        </div>
      </footer>
    </div>
  );
}
