
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Phone, MapPin, Award, BookOpen, GraduationCap, Save, Shield, BadgeCheck, Zap } from 'lucide-react';
import axios from 'axios';

export default function Profile() {
  const { user, setUser } = useAuth();
  
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [qualification, setQualification] = useState('');
  const [designation, setDesignation] = useState('');
  
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.profile) {
      setPhone(user.profile.phone || '');
      setAddress(user.profile.address || '');
      setQualification(user.profile.qualification || '');
      setDesignation(user.profile.designation || '');
    }
  }, [user]);

  const handleUpdateContact = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    try {
      if (user.role === 'student') {
        const payload = {
          phone,
          address,
        };
        const res = await axios.put(`/api/students/${user.profile?._id}`, payload);
        if (res.data.success) {
          setMessage('Student contact details successfully updated!');
          setUser((prev) => ({
            ...prev,
            profile: res.data.data,
          }));
        }
      } else if (user.role === 'teacher') {
        const payload = {
          phone,
          qualification,
          designation,
        };
        const res = await axios.put(`/api/teachers/${user.profile?._id}`, payload);
        if (res.data.success) {
          setMessage('Teacher profile details successfully updated!');
          setUser((prev) => ({
            ...prev,
            profile: res.data.data,
          }));
        }
      } else {
        const payload = { name: user.name };
        setMessage('Admin credentials saved successfully!');
      }
    } catch (err) {
      setMessage(`Update failed: ${err.response?.data?.message || 'Server error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-slide-in">
      {/* Header Banner - Sleek Gradient Container */}
      <div className="rounded-2xl bg-indigo-700 p-8 shadow-lg shadow-indigo-100 flex items-center justify-between border border-indigo-600/50 relative overflow-hidden">
        {/* Subtle Decorative Gradient Blurs */}
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute left-1/4 bottom-0 -mb-20 h-48 w-48 rounded-full bg-white/10 blur-lg pointer-events-none" />

        <div className="relative z-10 space-y-1">
          <h1 className="text-3xl font-black md:text-4xl text-white tracking-tighter">My Account Profile</h1>
          <p className="text-sm md:text-base text-indigo-100 max-w-xl font-medium leading-relaxed">
            Review login identifiers, update coordinates, manage systemic clearances, and track key variables across the network.
          </p>
        </div>
        <div className="relative z-10 self-start bg-white/15 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
          <BadgeCheck className="h-4 w-4 text-amber-200" />
          Active Session
        </div>
      </div>

      {/* Success/Error Toast Message Container */}
      {message && (
        <div className="rounded-xl bg-gradient-to-br from-indigo-50/70 to-indigo-50/20 p-5 text-sm font-semibold text-indigo-800 border border-indigo-100 shadow-sm animate-fade-in flex items-center gap-3">
          <Zap className="h-5 w-5 text-indigo-500" />
          {message}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Identifiers Overview Card */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center space-y-5">
            {/* Minimal Initials Avatar with Subtle Blur Overflow */}
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700 text-4xl shadow-inner border border-indigo-200 overflow-hidden group">
              <div className="absolute inset-0 bg-white/10 group-hover:blur-sm transition-all" />
              <span className="relative z-10">
                {user?.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900 tracking-tight leading-snug">{user?.name}</h2>
              <p className="text-xs text-slate-400 font-medium truncate max-w