import React, { useState, useEffect } from 'react';
import { coursesAPI, attendanceAPI, studentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, CheckCircle2, XCircle, AlertTriangle, Filter } from 'lucide-react';
import axios from 'axios';

export default function Attendance() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [studentsInCourse, setStudentsInCourse] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({}); // studentId -> 'Present' | 'Absent' | 'Late'
  
  // Student audit metrics
  const [studentStats, setStudentStats] = useState(null);
  const [studentLogs, setStudentLogs] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadBaseData = async () => {
    setIsLoading(true);
    try {
      const courseRes = await coursesAPI.getAll();
      if (courseRes.data.success) {
        const list = courseRes.data.data;
        setCourses(list);

        if (user?.role === 'student') {
          // Find student profile and load their logs
          const studRes = await axios.get('/api/students');
          const profile = studRes.data.data?.find((s) => s.user?._id === user._id);
          if (profile) {
            const attRes = await attendanceAPI.getStats('', profile._id);
            setStudentStats(attRes.data.stats);
            setStudentLogs(attRes.data.data);
          }
        } else if (list.length > 0) {
          setSelectedCourseId(list[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed loading base data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBaseData();
    // eslint-disable-next-line
  }, [user]);

  // Load students for chosen course to mark attendance (Teacher / Admin)
  useEffect(() => {
    const loadStudentsForAttendance = async () => {
      if (!selectedCourseId || user?.role === 'student') return;
      setIsLoading(true);
      setMessage('');
      try {
        const courseRes = await coursesAPI.getById(selectedCourseId);
        if (courseRes.data.success) {
          const courseDetail = courseRes.data.data;
          const studList = courseDetail.students || [];
          setStudentsInCourse(studList);

          // Preload existing attendance for this date if any
          const existingRes = await attendanceAPI.getStats(selectedCourseId, '', selectedDate);
          const currentRecords = {};

          studList.forEach((st) => {
            currentRecords[st._id] = 'Present'; // default
          });

          if (existingRes.data.success && existingRes.data.data?.length > 0) {
            existingRes.data.data.forEach((att) => {
              currentRecords[att.student?._id] = att.status;
            });
            setMessage('Preloaded existing attendance records for chosen date.');
          }

          setAttendanceRecords(currentRecords);
        }
      } catch (err) {
        console.error('Failed loading curriculum classes students', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedCourseId) {
      loadStudentsForAttendance();
    }
  }, [selectedCourseId, selectedDate, user]);

  const toggleStudentStatus = (studentId, status) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const saveAttendance = async () => {
    setMessage('');
    setIsLoading(true);
    try {
      const recordsArray = Object.entries(attendanceRecords).map(([studentId, status]) => ({
        studentId,
        status,
      }));

      const res = await attendanceAPI.mark(selectedCourseId, recordsArray, selectedDate);
      if (res.data.success) {
        setMessage('Attendance sheet successfully registered and compiled!');
      }
    } catch (err) {
      setMessage(`Save failed: ${err.response?.data?.message || 'Server error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3 max-w-7xl mx-auto px-1 sm:px-2 animate-slide-in">
      {/* Header */}
      <div className="border-b border-slate-200 pb-2">
        <h1 className="text-base font-bold text-slate-900">Attendance Register</h1>
        <p className="text-[11px] text-slate-500">Record daily academic presence, manage absentees, and inspect student attendance ratios.</p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        </div>
      )}

      {/* Message Banner */}
      {message && (
        <div className="rounded bg-indigo-50 p-2 text-[11px] font-semibold text-indigo-700 border border-indigo-150 shadow-none animate-slide-in">
          {message}
        </div>
      )}

      {/* Teacher / Admin Controls */}
      {user?.role !== 'student' ? (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 animate-slide-in">
          {/* Pick Course & Date Panel */}
          <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-none h-fit space-y-2.5">
            <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <span>Session Parameters</span>
            </h2>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Choose Course *</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full rounded border border-slate-250 px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 bg-white text-slate-800"
              >
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name} ({course.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Session Date *</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full rounded border border-slate-250 px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 text-slate-800"
              />
            </div>

            <button
              onClick={saveAttendance}
              disabled={studentsInCourse.length === 0}
              className="mt-1 w-full inline-flex justify-center items-center rounded bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-none hover:bg-indigo-505 transition-colors disabled:opacity-50"
            >
              Save Attendance Sheet
            </button>
          </div>

          {/* Student list marking grid */}
          <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-none lg:col-span-2 space-y-2.5">
            <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>Class Attendance Sheet ({studentsInCourse.length} Students)</span>
            </h2>

            {studentsInCourse.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-500">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="px-3 py-1.5">Student Name / Roll</th>
                      <th className="px-3 py-1.5 text-center">Status Toggle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 border-b border-slate-150">
                    {studentsInCourse.map((stud) => (
                      <tr key={stud._id} className="hover:bg-slate-50/55">
                        <td className="px-3 py-1.5">
                          <p className="font-bold text-slate-900 leading-snug">{stud.user?.name}</p>
                          <p className="text-[10px] text-slate-450 font-mono mt-0.5">{stud.rollNumber}</p>
                        </td>
                        <td className="px-3 py-1.5">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => toggleStudentStatus(stud._id, 'Present')}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded border transition-colors ${
                                attendanceRecords[stud._id] === 'Present'
                                  ? 'bg-emerald-110 bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : 'bg-white hover:bg-slate-50 text-slate-500 border-slate-200'
                              }`}
                            >
                              <CheckCircle2 className="h-2.5 w-2.5" />
                              <span>Present</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleStudentStatus(stud._id, 'Absent')}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded border transition-colors ${
                                attendanceRecords[stud._id] === 'Absent'
                                  ? 'bg-rose-110 bg-rose-50 text-rose-800 border-rose-300'
                                  : 'bg-white hover:bg-slate-50 text-slate-500 border-slate-200'
                              }`}
                            >
                              <XCircle className="h-2.5 w-2.5" />
                              <span>Absent</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleStudentStatus(stud._id, 'Late')}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded border transition-colors ${
                                attendanceRecords[stud._id] === 'Late'
                                  ? 'bg-amber-110 bg-amber-50 text-amber-800 border-amber-300'
                                  : 'bg-white hover:bg-slate-50 text-slate-500 border-slate-200'
                              }`}
                            >
                              <AlertTriangle className="h-2.5 w-2.5" />
                              <span>Late</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-400 text-center py-6 text-[11px] italic">
                No students are currently enrolled in this class. Enrol students under Courses prior to checking.
              </p>
            )}
          </div>
        </div>
      ) : (
        /* Student Audit Mode */
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4 animate-slide-in">
          <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-none md:col-span-1 space-y-2.5">
            <h2 className="text-xs font-bold text-slate-800">My Attendance Ratio</h2>
            
            {studentStats ? (
              <div className="text-center space-y-1.5 py-2">
                <p className="text-3xl font-extrabold text-indigo-600 leading-none">{Math.round(studentStats.percentage)}%</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pb-1.5 border-b border-slate-100">Overall Attendance Rate</p>

                <div className="grid grid-cols-3 gap-1.5 text-[11px] pt-3 font-semibold text-slate-500">
                  <div className="bg-slate-50 p-1 rounded">
                    <span className="block font-bold text-slate-800 text-xs">{studentStats.present}</span>
                    Present
                  </div>
                  <div className="bg-slate-50 p-1 rounded">
                    <span className="block font-bold text-rose-600 text-xs">{studentStats.absent}</span>
                    Absent
                  </div>
                  <div className="bg-slate-50 p-1 rounded">
                    <span className="block font-bold text-amber-600 text-xs">{studentStats.late}</span>
                    Late
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-[10px]">Loading analytics data...</p>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-none md:col-span-3 space-y-2.5">
            <h2 className="text-xs font-bold text-slate-800">Class Check-In History Log</h2>

            {studentLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-500">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="px-3 py-1.5">Subject Date</th>
                      <th className="px-3 py-1.5">Course Code</th>
                      <th className="px-3 py-1.5">Course Title</th>
                      <th className="px-3 py-1.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 border-b border-slate-150 text-slate-700">
                    {studentLogs.map((log) => (
                      <tr key={log._id}>
                        <td className="px-3 py-1.5 font-semibold text-slate-900 leading-snug">
                          {new Date(log.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-3 py-1.5 font-mono text-[10px] text-slate-500">{log.course?.code}</td>
                        <td className="px-3 py-1.5 text-slate-650 font-medium">{log.course?.name}</td>
                        <td className="px-3 py-1.5 text-right">
                          <span
                            className={`inline-flex rounded px-1.5 py-0.2 text-[10px] font-semibold ${
                              log.status === 'Present'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-250'
                                : log.status === 'Absent'
                                ? 'bg-rose-100 text-rose-800 border border-rose-250'
                                : 'bg-amber-100 text-amber-800 border border-amber-250'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-400 text-center py-6 italic text-[11px]">No historical attendance checks registered.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
