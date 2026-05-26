import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex h-[75vh] flex-col items-center justify-center text-center px-4">
      <HelpCircle className="h-16 w-16 text-indigo-500 animate-pulse" />
      <h1 className="mt-4 text-3xl font-extrabold text-slate-900">404 - Not Found</h1>
      <p className="mt-2 text-slate-500 max-w-md">The directory page or clearance requested does not map correctly to systemic parameters.</p>
      
      <Link
        to="/dashboard"
        className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-505 transition-colors"
      >
        Return to Safety Box Dashboard
      </Link>
    </div>
  );
}
