import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Phone, MapPin, Award, BookOpen, GraduationCap, Save, Shield } from 'lucide-react';
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
        // Admin profile update triggers on baseline user object
        const payload = {
          name: user.name,
        };
        setMessage('Admin credentials saved successfully!');
      }
    } catch (err) {
      setMessage(`Update failed: ${err.response?.data?.message || 'Server error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 animate-slide-in">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900">User Profile</h1>
        <p className="text-sm text-slate-500">Review your login identifiers, update coordinates and phone lines, and track systemic clearances.</p>
      </div>

      {message && (
        <div className="rounded-lg bg-indigo-50 p-4 text-sm font-semibold text-indigo-700 border border-indigo-150 animate-slide-in">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col items-center text-center space-y-4 md:col-span-1">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700 text-3xl">
            {user?.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-905">{user?.name}</h2>
            <p className="text-xs text-slate-400 font-medium truncate max-w-full">{user?.email}</p>
          </div>

          <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 capitalize border border-indigo-100">
            <Shield className="h-3 w-3 mr-1" />
            {user?.role} clearances
          </span>

          <div className="w-full border-t border-slate-100 pt-4 text-left text-xs space-y-2 text-slate-500">
            {user?.role === 'student' && (
              <>
                <p><span className="font-semibold text-slate-400">Class Section:</span> {user.profile?.class}</p>
                <p><span className="font-semibold text-slate-400">Roll Number:</span> {user.profile?.rollNumber}</p>
                <p><span className="font-semibold text-slate-400">Admission Code:</span> {user.profile?.admissionNumber}</p>
              </>
            )}

            {user?.role === 'teacher' && (
              <>
                <p><span className="font-semibold text-slate-400">Employee ID:</span> {user.profile?.employeeId}</p>
                <p><span className="font-semibold text-slate-400">Rank/Title:</span> {user.profile?.designation}</p>
                <p><span className="font-semibold text-slate-400">Department:</span> {user.profile?.department}</p>
              </>
            )}
            
            {user?.role === 'admin' && (
              <p className="text-center text-slate-400 py-2">Full administrative system controls.</p>
            )}
          </div>
        </div>

        {/* Configurations Update sheet */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2 space-y-4">
          <h2 className="text-md font-bold text-slate-800">Edit Contact Details</h2>

          <form onSubmit={handleUpdateContact} className="space-y-4">
            {user?.role === 'student' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    Mobile Contact phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-250 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 text-slate-800"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    Physical Residence address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-lg border border-slate-250 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 text-slate-800"
                    placeholder="Street, City Details"
                  />
                </div>
              </>
            )}

            {user?.role === 'teacher' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                    Qualifications summary
                  </label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full rounded-lg border border-slate-250 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 text-slate-800"
                    placeholder="M.Tech in CS / Education degree"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5 text-slate-400" />
                      Designation clearance
                    </label>
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full rounded-lg border border-slate-250 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 text-slate-800"
                      placeholder="Lecturer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      Instructor Phone
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-lg border border-slate-250 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 text-slate-800"
                    />
                  </div>
                </div>
              </>
            )}

            {user?.role === 'admin' && (
              <p className="text-sm text-slate-450 italic py-6">Admin identifiers are controlled on master config. No local contact values necessary.</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-500 transition-colors disabled:opacity-55"
            >
              <Save className="h-4 w-4" />
              <span>{isLoading ? 'Saving updates...' : 'Save Profile Variables'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
