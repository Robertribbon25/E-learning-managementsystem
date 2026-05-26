import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, KeyRound, Mail, AlertCircle, Loader2 } from 'lucide-react';

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
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black px-4 py-8 relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[350px] w-[350px] rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 h-[250px] w-[250px] rounded-full bg-purple-500/5 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 backdrop-blur-xl bg-slate-900/60 p-8 rounded-2xl border border-slate-800/80 shadow-2xl relative z-10 transition-all">
        {/* Header section */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-white tracking-tight">
            EduManager Portal
          </h2>
          <p className="mt-1.5 text-sm text-slate-400 font-medium">
            Online Student Management System
          </p>
        </div>

        {/* Error notification banner */}
        {errorMsg && (
          <div className="flex items-start gap-2.5 rounded-xl bg-rose-500/10 p-3.5 text-sm text-rose-400 border border-rose-500/20 animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-500 mt-0.5" />
            <span className="font-medium leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Main core credentials form */}
        <form className="space-y-5" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
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
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950/80 pl-10 pr-4 py-3 text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm focus:outline-none transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
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
                  className="block w-full rounded-xl border border-slate-800 bg-slate-950/80 pl-10 pr-4 py-3 text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm focus:outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/10 hover:from-indigo-500 hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Quick sandbox access platform panel */}
        <div className="border-t border-slate-800 pt-4">
          <p className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
            Quick Auto-fill Demo Access
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => autofill('admin')}
              className="rounded-xl bg-indigo-500/5 border border-indigo-500/10 px-3 py-2 text-xs font-bold text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all cursor-pointer text-center"
            >
              Admin
            </button>
            <button
              onClick={() => autofill('teacher')}
              className="rounded-xl bg-emerald-500/5 border border-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all cursor-pointer text-center"
            >
              Teacher
            </button>
            <button
              onClick={() => autofill('student')}
              className="rounded-xl bg-amber-500/5 border border-amber-500/10 px-3 py-2 text-xs font-bold text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/30 transition-all cursor-pointer text-center"
            >
              Student
            </button>
          </div>
        </div>

        {/* Portal Registration Navigation details */}
        <div className="text-center pt-2">
          <p className="text-xs text-slate-500 font-medium">
            Need an account?{' '}
            <Link to="/register" className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors ml-0.5">
              Create login specs
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}