import React from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ toggleSidebar }) {
  const { user } = useAuth();

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="flex h-11 w-full items-center justify-between border-b border-slate-200 bg-white px-4 shadow-none">
      {/* Left items */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="rounded p-0.5 text-slate-600 hover:bg-slate-100 md:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>
        <span className="hidden text-xs font-semibold text-slate-400 md:inline-block">
          <strong className="text-indigo-600 font-bold">{formattedDate}</strong>
        </span>
      </div>

      {/* Right items */}
      <div className="flex items-center gap-3">
        <button className="relative rounded p-1 text-slate-600 hover:bg-slate-100">
          <Bell className="h-4 w-4" />
          <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
        </button>

        <div className="h-4 w-px bg-slate-200"></div>

        {/* User Info dropdown / summary */}
        <div className="flex items-center gap-2">
          <div className="hidden text-right md:block">
            <span className="block text-xs font-bold text-slate-800 leading-tight">{user?.name}</span>
            <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{user?.role}</span>
          </div>

          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-150 font-bold text-indigo-700 text-xs">
            {user?.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0,2).toUpperCase() : <User className="h-4 w-4" />}
          </div>
        </div>
      </div>
    </header>
  );
}
