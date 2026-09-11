import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getRiskBadgeClasses } from '../../utils/riskColors';

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  pulsing = false,
  className = '',
  ...props
}) {
  const variants = {
    default: 'bg-slate-800 text-slate-300 border border-slate-700',
    primary: 'bg-sky-950/70 text-sky-400 border border-sky-800/80 shadow-[0_0_10px_rgba(56,189,248,0.2)]',
    safe: 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/80 shadow-[0_0_10px_rgba(34,197,94,0.2)]',
    warning: 'bg-amber-950/70 text-amber-400 border border-amber-800/80 shadow-[0_0_10px_rgba(245,158,11,0.2)]',
    danger: 'bg-red-950/70 text-red-400 border border-red-800/80 shadow-[0_0_10px_rgba(239,68,68,0.2)]',
    emergency: 'bg-red-600 text-white font-bold animate-pulse'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] font-medium tracking-wide',
    md: 'px-2.5 py-1 text-xs font-semibold tracking-wider',
    lg: 'px-3 py-1.5 text-sm font-semibold'
  };

  let computedStyle = variants[variant] || variants.default;
  if (['safe', 'warning', 'danger', 'high', 'moderate', 'low'].includes(variant)) {
    computedStyle = getRiskBadgeClasses(variant);
  }

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 rounded-full uppercase tracking-wider',
          computedStyle,
          sizes[size],
          className
        )
      )}
      {...props}
    >
      {pulsing && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
        </span>
      )}
      {children}
    </span>
  );
}
