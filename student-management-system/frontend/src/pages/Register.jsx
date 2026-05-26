import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, ArrowLeft, Mail, User, KeyRound, AlertCircle } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');

  // Student specific fields
  const [studentClass, setStudentClass] = useState('Class 10-A');
  const [rollNumber, setRollNumber] = useState('');
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [dob, setDob] = useState('2006-03-15');
  const [gender, setGender] = useState('Male');

  // Teacher specific fields
  const [department, setDepartment] = useState('Computer Science');
  const [qualification, setQualification] = useState('Master of Technology');
  const [designation, setDesignation] = useState('Lecturer');

  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg('Please populate name, email, and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const profileData =
        role === 'student'
          ? {
              class: studentClass,
              rollNumber: rollNumber || `R-${Math.floor(100+Math.random()*900)}`,
              admissionNumber: admissionNumber || `A-${Math.floor(1000+Math.random()*9000)}`,
              dateOfBirth: dob,
              gender,
              phone: phone || '000-000-0000',
              address: address || '',
            }
          : {
              employeeId: `EMP-${Math.floor(1000+Math.random()*9000)}`,
              department,
              qualification,
              designation,
              phone: phone || '000-000-0000',
            };

      await register(name, email, password, role, profileData);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Try again with a different email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-3 py-6 sm:px-4">
      <div className="w-full max-w-md space-y-4 bg-slate-800 p-5 rounded-lg border border-slate-700/60 shadow-lg animate-slide-in">
        <div className="text-center">
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded bg-indigo-600 text-white shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </div>
          <h2 className="mt-2.5 text-lg font-bold text-white tracking-tight">
            Create Portal Account
          </h2>
          <p className="mt-0.5 text-[10px] text-slate-400">
            Register your credentials in the student management system
          </p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-1.5 rounded bg-rose-950/40 p-2 text-[11px] text-rose-300 border border-rose-800/40">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form className="space-y-3" onSubmit={handleRegister}>
          {/* Base credentials */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-500">
                  <User className="h-3.5 w-3.5" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded border border-slate-600 bg-slate-900 pl-8 pr-2 py-1 text-slate-200 placeholder-slate-500 focus:outline-none text-xs"
                  placeholder="e.g. John Miller"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-500">
                  <Mail className="h-3.5 w-3.5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded border border-slate-600 bg-slate-900 pl-8 pr-2 py-1 text-slate-200 placeholder-slate-500 focus:outline-none text-xs"
                  placeholder="e.g. john@example.com"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-500">
                  <KeyRound className="h-3.5 w-3.5" />
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded border border-slate-600 bg-slate-900 pl-8 pr-2 py-1 text-slate-200 placeholder-slate-500 focus:outline-none text-xs"
                  placeholder="Min 6 chars"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">System Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="block w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-slate-200 focus:outline-none text-xs bg-white/5"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher / Professor</option>
              </select>
            </div>
          </div>

          <div className="border-t border-slate-700/45 pt-2.5">
            <h3 className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide">
              {role} Information Parameters
            </h3>

            {role === 'student' ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Class/Grade</label>
                  <input
                    type="text"
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                    className="block w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. CS-Section A"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="block w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 bg-white/5"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="block w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-slate-200 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-slate-200 text-xs focus:outline-none"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="block w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-slate-200 text-xs focus:outline-none"
                    placeholder="e.g. Mathematics"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Qualification</label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="block w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-slate-200 text-xs focus:outline-none"
                    placeholder="e.g. PhD CS"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="block w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-slate-200 text-xs focus:outline-none"
                    placeholder="e.g. Associate Professor"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-slate-200 text-xs focus:outline-none"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            )}
            
            {role === 'student' && (
              <div className="mt-2">
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Residence Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="block w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-slate-200 text-xs focus:outline-none"
                  placeholder="e.g. Apartment, Street, City"
                />
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isLoading ? 'Creating Profile...' : 'Complete Register'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-[10px] text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
              Return to login portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
