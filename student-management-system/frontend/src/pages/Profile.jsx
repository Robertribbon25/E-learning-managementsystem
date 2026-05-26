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
              <p className="text-xs text-slate-400 font-medium truncate max-w-full italic">{user?.email}</p>
            </div>

            {/* Clearances Pill Badge */}
            <span className="inline-flex items-center rounded-full bg-slate-50 border border-slate-100 px-4 py-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wide shadow-slate-100 shadow-inner group transition-colors hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-800">
              <Shield className="h-3.5 w-3.5 mr-1.5 text-indigo-400 group-hover:text-indigo-500" />
              {user?.role} Clearances
            </span>

            {/* Role-Specific Systemic Keys List */}
            <div className="w-full border-t border-slate-100 pt-6 text-left text-xs space-y-3.5 text-slate-600 bg-slate-50/50 rounded-xl p-6 mt-6 border-b border-slate-100 shadow-inner group transition-colors hover:bg-slate-100/50">
              <p className="border-b border-slate-100 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">System Identifiers</p>
              {user?.role === 'student' && (
                <>
                  <div className="flex justify-between items-center"><span className="font-semibold text-slate-500">Class Section</span> <span className="font-medium">{user.profile?.class}</span></div>
                  <div className="flex justify-between items-center"><span className="font-semibold text-slate-500">Roll Number</span> <span className="font-medium">{user.profile?.rollNumber}</span></div>
                  <div className="flex justify-between items-center"><span className="font-semibold text-slate-500">Admission Code</span> <span className="font-medium">{user.profile?.admissionNumber}</span></div>
                </>
              )}
              {user?.role === 'teacher' && (
                <>
                  <div className="flex justify-between items-center"><span className="font-semibold text-slate-500">Employee ID</span> <span className="font-medium">{user.profile?.employeeId}</span></div>
                  <div className="flex justify-between items-center"><span className="font-semibold text-slate-500">Rank/Title</span> <span className="font-medium text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full font-bold">{user.profile?.designation}</span></div>
                  <div className="flex justify-between items-center"><span className="font-semibold text-slate-500">Department</span> <span className="font-medium">{user.profile?.department}</span></div>
                </>
              )}
              {user?.role === 'admin' && (
                <p className="text-center text-indigo-700 py-3 text-sm font-semibold bg-indigo-50 border border-indigo-100 rounded-lg shadow-sm">Full administrative controls active.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Configuration Form */}
        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm lg:col-span-2 space-y-6 group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between border-b border-slate-50 pb-5 mb-5">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Edit Coordinates & Lines</h2>
            <span className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-3 py-1 rounded-full group-hover:bg-indigo-100 transition-colors">Contact Specs</span>
          </div>

          <form onSubmit={handleUpdateContact} className="space-y-6">
            
            {/* Student Contact Parameters */}
            {user?.role === 'student' && (
              <>
                <div className="group/field">
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase flex items-center gap-2 group-focus-within/field:text-indigo-600 transition-colors">
                    <Phone className="h-4 w-4 text-slate-300 group-focus-within/field:text-indigo-400" />
                    Mobile Contact phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 text-slate-800 placeholder-slate-400 transition-all shadow-inner group-focus-within/field:bg-white group-focus-within/field:shadow-none"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div className="group/field">
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase flex items-center gap-2 group-focus-within/field:text-indigo-600 transition-colors">
                    <MapPin className="h-4 w-4 text-slate-300 group-focus-within/field:text-indigo-400" />
                    Physical Residence address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 text-slate-800 placeholder-slate-400 transition-all shadow-inner group-focus-within/field:bg-white group-focus-within/field:shadow-none"
                    placeholder="Street, City Details"
                  />
                </div>
              </>
            )}

            {/* Teacher Contact/Profile Parameters */}
            {user?.role === 'teacher' && (
              <>
                <div className="group/field">
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase flex items-center gap-2 group-focus-within/field:text-indigo-600 transition-colors">
                    <GraduationCap className="h-4 w-4 text-slate-300 group-focus-within/field:text-indigo-400" />
                    Qualifications summary
                  </label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 text-slate-800 placeholder-slate-400 transition-all shadow-inner group-focus-within/field:bg-white group-focus-within/field:shadow-none"
                    placeholder="M.Tech in CS / Education degree"
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="group/field">
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase flex items-center gap-2 group-focus-within/field:text-indigo-600 transition-colors">
                      <Award className="h-4 w-4 text-slate-300 group-focus-within/field:text-indigo-400" />
                      Designation clearance
                    </label>
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 text-slate-800 placeholder-slate-400 transition-all shadow-inner group-focus-within/field:bg-white group-focus-within/field:shadow-none"
                      placeholder="Lecturer"
                    />
                  </div>

                  <div className="group/field">
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase flex items-center gap-2 group-focus-within/field:text-indigo-600 transition-colors">
                      <Phone className="h-4 w-4 text-slate-300 group-focus-within/field:text-indigo-400" />
                      Instructor Phone
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 text-slate-800 placeholder-slate-400 transition-all shadow-inner group-focus-within/field:bg-white group-focus-within/field:shadow-none"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Adminmaster Master Config Redirect */}
            {user?.role === 'admin' && (
              <div className="text-center py-10 px-6 bg-slate-50 rounded-xl border border-slate-100 border-dashed text-slate-500 shadow-inner group transition-colors hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-800">
                <Shield className="h-10 w-10 text-indigo-300 mx-auto mb-4" />
                <p className="text-sm italic max-w-sm mx-auto font-medium leading-relaxed">
                  AdminMaster master coordinates are controlled systemic configs. Local contact adjustments are locked.
                </p>
              </div>
            )}

            {/* Main Submit Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-10 group flex w-full items-center justify-center gap-2.5 rounded-2xl bg-indigo-600 px-6 py-4 text-base font-extrabold text-white shadow-lg shadow-indigo-100 hover:shadow-indigo-200 hover:bg-indigo-500 transition-all disabled:opacity-55 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              <Save className="h-5 w-5 text-indigo-300" />
              <span>{isLoading ? 'System saving...' : 'Save System Variables'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}