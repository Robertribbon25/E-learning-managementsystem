import React from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPinOff } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center text-center px-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-50/50 via-white to-white">
      
      {/* Enhanced Stacked Visual Composition */}
      <div className="relative mb-10 flex items-center justify-center">
        {/* Subtle background glow */}
        <div className="absolute inset-0 h-32 w-32 rounded-full bg-indigo-500/10 blur-xl animate-pulse" />
        
        {/* Decorative background shapes */}
        <div className="absolute -top-6 -left-6 h-14 w-14 rounded-3xl bg-purple-100 rotate-12" />
        <div className="absolute -bottom-4 -right-4 h-10 w-10 rounded-full bg-amber-100" />

        {/* Primary Stacked Icons */}
        <div className="relative h-28 w-28 bg-white rounded-3xl border border-slate-100 shadow-lg shadow-indigo-100/50 flex items-center justify-center z-10 hover:shadow-xl transition-shadow group">
          <MapPinOff className="h-12 w-12 text-slate-400 group-hover:scale-110 group-hover:text-amber-500 transition-all duration-300" />
        </div>
        
        {/* Secondary overlapping icon */}
        <div className="absolute -bottom-2 -left-2 h-16 w-16 bg-white rounded-2xl border border-slate-100 shadow-md shadow-indigo-100/30 flex items-center justify-center z-20 group-hover:bg-indigo-50 transition-colors">
          <Search className="h-7 w-7 text-indigo-500" />
        </div>
      </div>

      {/* Main text content */}
      <div className="space-y-4 max-w-xl">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tighter sm:text-5xl">
          <span className="bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">404</span> - Not Found
        </h1>
        <p className="mt-2 text-base sm:text-lg text-slate-600 max-w-lg mx-auto font-medium leading-relaxed">
          The directory page or clearance requested does not map correctly to systemic parameters.
          <span className="block mt-1 text-sm text-slate-400">Please re-verify the intended endpoint.</span>
        </p>
      </div>
      
      {/* Refined Navigation Button */}
      <Link
        to="/dashboard"
        className="mt-12 group flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:from-indigo-500 hover:to-indigo-400 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        <span>Return to Safety Box Dashboard</span>
        <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
      </Link>
    </div>
  );
}