import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Mail, User, KeyRound, AlertCircle, CalendarDays, Phone, MapPin, Loader2 } from 'lucide-react';

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
              rollNumber: rollNumber || `R-${Math.floor(100 + Math.random() * 900)}`,
              admissionNumber: admissionNumber || `A-${Math.floor(1000 + Math.random() * 9000)}`,
              dateOfBirth: dob,
              gender,
              phone: phone || '000-000-0000',
              address: address || '',
            }
          : {
              employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
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

  const inputClass = "block w-full rounded-xl border border-slate-700 bg-slate-900/50 pl-11 pr-4 py-2.5 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm transition focus:outline-none";
  const labelClass = "block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider";
  const selectClass = "block w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition appearance-none cursor-pointer";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
      {/* Abstract background glows */}
      <div className="absolute top-1/4 left-1/3 h-96 w-96 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/3 h-64 w-64 rounded-full bg-purple-500/10 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-xl space-y-8 backdrop-blur-sm bg-slate-900/60 p-10 rounded-3xl border border-slate-800/80 shadow-2xl animate-fade-in relative z-10">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 border border-indigo-500">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h2 className="mt-6 text-3xl font-black text-white tracking-tighter">
            Join the Portal
          </h2>
          <p className="mt-2 text-slate-400 max-w-sm mx-auto">
            Create your account to access the student management system.
          </p>
        </div>

        {errorMsg && (
          <div className="flex items-start gap-3 rounded-xl bg-rose-500/10 p-4 text-sm text-rose-300 border border-rose-500/20 animate-slide-in">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold text-rose-200">Registration Error:</span> {errorMsg}
            </div>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleRegister}>
          {/* Section 1: Base credentials */}
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="group">
                <label className={labelClass}>Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    placeholder="e.g. John Miller"
                  />
                </div>
              </div>

              <div className="group">
                <label className={labelClass}>Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="john.m@school.edu"
                  />
                </div>
              </div>
            </div>

            <div className="group">
              <label className={labelClass}>Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <KeyRound className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  placeholder="Choose a strong password (min 6 chars)"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Role Selector */}
          <div className="border-t border-slate-800 pt-6">
            <label className={`${labelClass} mb-3`}>Select Your Role</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`group flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all cursor-pointer text-center ${role === 'student' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-900 border-slate-700 hover:border-slate-600 text-slate-300'}`}
              >
                <div className={`p-3 rounded-xl transition-colors ${role === 'student' ? 'bg-white/20' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
                    <User className={`h-6 w-6 ${role === 'student' ? 'text-white' : 'text-indigo-400'}`} />
                </div>
                <div className="flex-1">
                    <span className="font-bold text-sm block">Student</span>
                    <span className={`text-xs mt-0.5 block ${role === 'student' ? 'text-indigo-100' : 'text-slate-400'}`}>View grades & profile</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('teacher')}
                className={`group flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all cursor-pointer text-center ${role === 'teacher' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-900 border-slate-700 hover:border-slate-600 text-slate-300'}`}
              >
                <div className={`p-3 rounded-xl transition-colors ${role === 'teacher' ? 'bg-white/20' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
                    <GraduationCap className={`h-6 w-6 ${role === 'teacher' ? 'text-white' : 'text-indigo-400'}`} />
                </div>
                <div className="flex-1">
                    <span className="font-bold text-sm block">Teacher / Professor</span>
                    <span className={`text-xs mt-0.5 block ${role === 'teacher' ? 'text-indigo-100' : 'text-slate-400'}`}>Manage classes & marks</span>
                </div>
              </button>
            </div>
          </div>

          {/* Section 3: Dynamic Profile Fields */}
          <div className="border-t border-slate-800 pt-6 space-y-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span className="h-px w-6 bg-slate-700"></span>
                Additional {role} Details
                <span className="h-px flex-1 bg-slate-700"></span>
            </h3>

            {role === 'student' ? (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Class / Grade</label>
                    <input
                      type="text"
                      value={studentClass}
                      onChange={(e) => setStudentClass(e.target.value)}
                      className={selectClass.replace('appearance-none', '')} // standard input, no appearance override
                      placeholder="e.g. Class 10-A"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Gender</label>
                    <div className="relative">
                        <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className={selectClass}
                        >
                            <option value="Male" className="bg-slate-900">Male</option>
                            <option value="Female" className="bg-slate-900">Female</option>
                            <option value="Other" className="bg-slate-900">Other</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500">
                           <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="group">
                    <label className={labelClass}>Date of Birth</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none">
                            <CalendarDays className="h-5 w-5" />
                        </div>
                        <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className={`${inputClass} !py-2`} // Slight padding adjustment for date input
                        />
                    </div>
                  </div>
                  <div className="group">
                    <label className={labelClass}>Contact Phone</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                            <Phone className="h-5 w-5" />
                        </div>
                        <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={inputClass}
                        placeholder="+1 (555) 000-0000"
                        />
                    </div>
                  </div>
                </div>

                 <div className="group pt-1">
                    <label className={labelClass}>Residence Address</label>
                    <div className="relative">
                        <div className="absolute top-3 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                            <MapPin className="h-5 w-5" />
                        </div>
                        <textarea
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className={`${inputClass} !pl-11 min-h-[70px] resize-none`}
                            rows={2}
                            placeholder="e.g. 123 School Lane, Apt 4, Boston, MA"
                        />
                    </div>
                </div>
              </div>
            ) : (
              // Teacher fields
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className={inputClass.replace('pl-11', 'px-4')}
                      placeholder="e.g. Computer Science"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Designation</label>
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className={inputClass.replace('pl-11', 'px-4')}
                      placeholder="e.g. Associate Professor"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                        <label className={labelClass}>Qualification</label>
                        <input
                        type="text"
                        value={qualification}
                        onChange={(e) => setQualification(e.target.value)}
                        className={inputClass.replace('pl-11', 'px-4')}
                        placeholder="e.g. PhD Computer Science"
                        />
                    </div>
                    <div className="group">
                        <label className={labelClass}>Contact Phone</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                                <Phone className="h-5 w-5" />
                            </div>
                            <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className={inputClass}
                            placeholder="+1 (555) 000-0000"
                            />
                        </div>
                    </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-800">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-3 w-full justify-center rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Initializing Profile...
                </>
              ) : 'Complete System Registration'}
            </button>
          </div>
        </form>

        <div className="text-center pt-2">
          <p className="text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition ml-1">
              Return to Login Portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}