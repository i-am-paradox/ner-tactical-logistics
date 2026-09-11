import React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { EmergencyBanner } from './EmergencyBanner';
import { useUIStore } from '../../features/useUIStore';

export function PageShell({
  title,
  subtitle,
  actionSlot,
  breadcrumbs = [],
  children,
  fluid = false
}) {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen bg-ner-bg text-slate-100 flex flex-col">
      <EmergencyBanner />
      <div className="flex flex-1">
        <Sidebar />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
          <Topbar />
          <main className="flex-1 p-4 md:p-6 space-y-6">
            {(title || actionSlot || breadcrumbs.length > 0) && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                <div>
                  {breadcrumbs.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                      {breadcrumbs.map((b, i) => (
                        <React.Fragment key={i}>
                          {i > 0 && <span>/</span>}
                          <span className={i === breadcrumbs.length - 1 ? 'text-sky-400 font-semibold' : ''}>
                            {b}
                          </span>
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                  {title && (
                    <h1 className="text-xl md:text-2xl font-black text-slate-100 tracking-tight uppercase">
                      {title}
                    </h1>
                  )}
                  {subtitle && <p className="text-xs md:text-sm text-slate-400 mt-0.5">{subtitle}</p>}
                </div>
                {actionSlot && <div className="flex items-center gap-2.5">{actionSlot}</div>}
              </div>
            )}
            <div className={fluid ? 'w-full' : 'max-w-7xl mx-auto w-full'}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
