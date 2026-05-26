import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Award,
  CalendarCheck,
  GraduationCap,
  TrendingUp,
  User,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { user, logout } = useAuth();

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'teacher', 'student'],
    },
    {
      name: 'Students',
      path: '/students',
      icon: Users,
      roles: ['admin', 'teacher'],
    },
    {
      name: 'Teachers',
      path: '/teachers',
      icon: GraduationCap,
      roles: ['admin'],
    },
    {
      name: 'Courses',
      path: '/courses',
      icon: BookOpen,
      roles: ['admin', 'teacher', 'student'],
    },
    {
      name: 'Attendance',
      path: '/attendance',
      icon: CalendarCheck,
      roles: ['admin', 'teacher', 'student'],
    },
    {
      name: 'Results & Marks',
      path: '/results',
      icon: Award,
      roles: ['admin', 'teacher', 'student'],
    },
    {
      name: 'Reports',
      path: '/reports',
      icon: TrendingUp,
      roles: ['admin', 'teacher', 'student'],
    },
    {
      name: 'My Profile',
      path: '/profile',
      icon: User,
      roles: ['admin', 'teacher', 'student'],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-900/40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-56 flex-col bg-slate-900 text-slate-300 transition-transform duration-300 md:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-11 items-center border-b border-slate-800 px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-indigo-600 text-xs font-bold text-white">
              S
            </div>
            <span className="text-sm font-bold tracking-wide text-white">
              EduManager
            </span>
          </div>
        </div>

        {/* User Quick Info */}
        <div className="border-b border-slate-800 p-3">
          <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="inline-flex items-center rounded bg-indigo-900/40 px-1 py-0.2 text-[10px] font-semibold text-indigo-400 capitalize border border-indigo-800/20">
              {user?.role}
            </span>
            <p className="text-[10px] text-slate-500 truncate max-w-[100px]">{user?.email}</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-0.5 px-2 py-2 overflow-y-auto">
          {filteredMenuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 768) toggleSidebar();
              }}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="border-t border-slate-800 p-2">
          <button
            onClick={logout}
            className="flex w-full items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
