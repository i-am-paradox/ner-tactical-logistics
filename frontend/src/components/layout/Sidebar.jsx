import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Route,
  AlertOctagon,
  Bell,
  BarChart3,
  Building2,
  Package,
  ShieldAlert,
  Radio,
  ChevronRight,
  Shield,
  Database
} from 'lucide-react';
import { useAuthStore } from '../../features/useAuthStore';
import { useEmergencyStore } from '../../features/useEmergencyStore';
import { useUIStore } from '../../features/useUIStore';

export function Sidebar() {
  const { user, switchRole } = useAuthStore();
  const { isEmergencyActive } = useEmergencyStore();
  const { sidebarOpen } = useUIStore();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Live Map & Convoys', path: '/map', icon: MapPin },
    { label: 'AI Route Planner', path: '/routes/planner', icon: Route },
    { label: 'Incident Command', path: '/incidents', icon: AlertOctagon },
    { label: 'Alerts & Broadcasts', path: '/alerts', icon: Bell },
    { label: 'Analytics & Insights', path: '/analytics', icon: BarChart3 },
    { label: 'Districts of NER', path: '/districts', icon: Building2 },
    { label: 'Consignments', path: '/shipments', icon: Package },
    { label: 'Dataset Ingestion', path: '/import-data', icon: Database },
    { label: 'Emergency Mode', path: '/emergency', icon: ShieldAlert, highlight: isEmergencyActive }
  ];

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-30 flex flex-col bg-ner-card border-r border-slate-800 transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Platform Brand Header */}
      <div className="h-16 px-4 flex items-center gap-3 border-b border-slate-800/80 bg-slate-950/60">
        <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white shadow-glow-primary flex-shrink-0">
          <Radio className="w-5 h-5 animate-pulse" />
        </div>
        {sidebarOpen && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-black tracking-wider text-slate-100 uppercase">
              NER-LECS <span className="text-[10px] text-sky-400 font-bold">TACTICAL</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium truncate">Logistics & Emergency Command</p>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-glow-primary border border-sky-400/40'
                    : item.highlight
                    ? 'bg-red-950/50 text-red-300 border border-red-800/60 hover:bg-red-900/60'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`
              }
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${item.highlight ? 'text-red-400 animate-pulse' : ''}`} />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
              {sidebarOpen && item.highlight && (
                <span className="ml-auto px-1.5 py-0.2 rounded text-[9px] font-black bg-red-600 text-white animate-pulse">
                  ALERT
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Role Switcher Drawer for Demo */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/80">
        {sidebarOpen ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Shield className="w-3 h-3 text-sky-400" /> Active Role
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-sky-950 text-sky-300 border border-sky-800">
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
            <select
              value={user?.role || 'admin'}
              onChange={(e) => switchRole(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
            >
              <option value="admin">Commandant (Admin)</option>
              <option value="district_officer">District Disaster Officer</option>
              <option value="field_agent">Mobile Field Agent</option>
              <option value="driver">Convoy Fleet Driver</option>
            </select>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="w-8 h-8 rounded-lg bg-sky-950 border border-sky-800 text-sky-300 font-bold text-xs flex items-center justify-center uppercase">
              {user?.role?.[0] || 'A'}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
