import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, ShieldAlert, KeyRound, Mail, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const autofill = (role) => {
    if (role === 'admin') {
      setEmail('admin@example.com');
      setPassword('admin123');
    } else if (role === 'teacher') {
      setEmail('teacher@example.com');
      setPassword('teacher123');
    } else if (role === 'student') {
      setEmail('student@example.com');
      setPassword('student123');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-3 py-6 sm:px-4">
      <div className="w-full max-w-sm space-y-4 bg-slate-800 p-5 rounded-lg border border-slate-700/60 shadow-lg animate-slide-in">
        <div className="text-center">
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded bg-indigo-600 text-white shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </div>
          <h2 className="mt-3 text-lg font-bold text-white tracking-tight">
            EduManager Portal
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Online Student Management System
          </p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-1.5 rounded bg-rose-950/40 p-2 text-[11px] text-rose-300 border border-rose-800/40 animate-slide-in">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="space-y-3">
            <div>
              <label htmlFor="email-address" className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded border border-slate-600 bg-slate-900 pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:border-indigo-500 text-xs focus:outline-none"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-500">
                  <KeyRound className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded border border-slate-600 bg-slate-900 pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:border-indigo-500 text-xs focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-none hover:bg-indigo-500 focus:outline-none transition-colors cursor-pointer"
            >
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </div>
        </form>

        {/* Demo Accounts Panel */}
        <div className="border-t border-slate-700/60 pt-3">
          <p className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
            Click to Auto-fill Demo Logins
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => autofill('admin')}
              className="rounded bg-slate-700/30 border border-slate-600 px-2 py-1 text-[10px] font-bold text-indigo-400 hover:bg-slate-700/60 transition-colors cursor-pointer"
            >
              Admin
            </button>
            <button
              onClick={() => autofill('teacher')}
              className="rounded bg-slate-700/30 border border-slate-600 px-2 py-1 text-[10px] font-bold text-emerald-400 hover:bg-slate-700/60 transition-colors cursor-pointer"
            >
              Teacher
            </button>
            <button
              onClick={() => autofill('student')}
              className="rounded bg-slate-700/30 border border-slate-600 px-2 py-1 text-[10px] font-bold text-amber-400 hover:bg-slate-700/60 transition-colors cursor-pointer"
            >
              Student
            </button>
          </div>
        </div>

        <div className="text-center">
          <p className="text-[10px] text-slate-500">
            Need an account?{' '}
            <Link to="/register" className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
              Create login specs
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
