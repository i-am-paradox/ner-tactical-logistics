import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Card({
  children,
  className = '',
  header,
  headerAction,
  riskBorder = null, // 'safe' | 'warning' | 'danger' | null
  ...props
}) {
  const riskClasses = {
    safe: 'risk-glow-safe border-emerald-500/40',
    warning: 'risk-glow-warning border-amber-500/40',
    danger: 'risk-glow-danger border-red-500/40'
  };

  return (
    <div
      className={twMerge(
        clsx(
          'tactical-glass rounded-xl shadow-tactical-card transition-all duration-200',
          riskBorder && riskClasses[riskBorder],
          className
        )
      )}
      {...props}
    >
      {header && (
        <div className="px-4 py-3.5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="font-semibold text-slate-100 text-sm tracking-wide flex items-center gap-2">
            {header}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
