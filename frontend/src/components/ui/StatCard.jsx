import React from 'react';
import { clsx } from 'clsx';
import { Card } from './Card';

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'primary', // 'primary' | 'safe' | 'warning' | 'danger'
  className = ''
}) {
  const iconVariants = {
    primary: 'bg-sky-500/10 text-sky-400 border border-sky-500/30 shadow-[0_0_12px_rgba(56,189,248,0.2)]',
    safe: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(34,197,94,0.2)]',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.25)]'
  };

  return (
    <Card className={clsx('relative overflow-hidden hover:border-slate-700 transition duration-200', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h4 className="text-2xl font-extrabold text-slate-100 tracking-tight font-mono">{value}</h4>
            {trend && (
              <span className={clsx('text-xs font-semibold', trend.isPositive ? 'text-emerald-400' : 'text-red-400')}>
                {trend.isPositive ? '↑' : '↓'} {trend.text}
              </span>
            )}
          </div>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={clsx('p-3 rounded-xl flex items-center justify-center', iconVariants[variant])}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </Card>
  );
}

export function Tabs({ tabs = [], activeTab, onChange, className = '' }) {
  return (
    <div className={clsx('flex items-center gap-1.5 p-1 bg-slate-900/80 border border-slate-800 rounded-xl', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer',
              isActive
                ? 'bg-sky-600 text-white shadow-glow-primary border border-sky-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            )}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {tab.label}
            {tab.badge !== undefined && (
              <span
                className={clsx(
                  'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                  isActive ? 'bg-sky-900 text-sky-200' : 'bg-slate-800 text-slate-400'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
