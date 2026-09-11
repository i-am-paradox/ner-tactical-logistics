import React from 'react';
import { clsx } from 'clsx';

export function Table({ headers = [], children, className = '' }) {
  return (
    <div className={clsx('w-full overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/40', className)}>
      <table className="w-full text-left text-sm border-collapse">
        <thead className="bg-slate-900/90 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-slate-200">
          {children}
        </tbody>
      </table>
    </div>
  );
}

export function TableRow({ children, className = '', onClick }) {
  return (
    <tr
      onClick={onClick}
      className={clsx(
        'hover:bg-slate-800/40 transition duration-150',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className = '' }) {
  return <td className={clsx('px-4 py-3 align-middle text-xs font-medium', className)}>{children}</td>;
}
