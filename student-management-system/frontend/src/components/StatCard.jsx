import React from 'react';

export default function StatCard({ title, value, icon: Icon, colorClass = 'bg-indigo-600', textClass = 'text-indigo-600', description }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 shadow-none hover:border-slate-300 transition-colors">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
        <p className="mt-1 text-xl font-bold text-slate-900 leading-none">{value}</p>
        {description && (
          <p className="mt-0.5 text-[11px] text-slate-400">{description}</p>
        )}
      </div>

      <div className={`rounded p-1.5 text-white ${colorClass}`}>
        <Icon className="h-4 w-4" />
      </div>
    </div>
  );
}
