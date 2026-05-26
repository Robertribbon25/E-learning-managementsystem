import React, { useState, useEffect } from 'react';
import { resultsAPI, studentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, FileSpreadsheet, CheckCircle2, AlertTriangle, Printer, HelpCircle } from 'lucide-react';
import axios from 'axios';

export default function Reports() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [reportCard, setReportCard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadInitialData = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      if (user?.role !== 'student') {
        const studentRes = await studentsAPI.getAll(1, 100);
        if (studentRes.data.success) {
          const list = studentRes.data.data;
          setStudents(list);
          if (list.length > 0) {
            setSelectedStudentId(list[0]._id);
          }
        }
      } else {
        // Find current student profile to get report directly
        const studentRes = await axios.get('/api/students');
        const myProfile = studentRes.data.data?.find((s) => s.user?._id === user._id);
        if (myProfile) {
          setSelectedStudentId(myProfile._id);
        } else {
          setErrorMessage('Could not discover matching student profile credentials.');
        }
      }
    } catch (err) {
      console.error('Failed loading initial data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line
  }, [user]);

  useEffect(() => {
    const fetchReportCard = async () => {
      if (!selectedStudentId) return;
      setIsLoading(true);
      setErrorMessage('');
      try {
        const res = await resultsAPI.getReportCard(selectedStudentId);
        if (res.data.success) {
          setReportCard(res.data.data);
        }
      } catch (err) {
        console.error('Failed fetching compiled report card', err);
        setReportCard(null);
        setErrorMessage('Failed fetching report card for this student. Verify if marks are registered.');
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedStudentId) {
      fetchReportCard();
    }
  }, [selectedStudentId]);

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 animate-slide-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Academic Score Sheets</h1>
          <p className="text-sm text-slate-500 font-normal">Inspect school GPAs, compiled final pass sheets, and printable student score cards.</p>
        </div>

        {reportCard && (
          <button
            onClick={triggerPrint}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <Printer className="h-5 w-5" />
            <span>Print Report Card</span>
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center py-6">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      )}

      {errorMessage && (
        <div className="rounded-lg bg-rose-50 p-4 text-sm font-semibold text-rose-800 border border-rose-150 animate-slide-in">
          {errorMessage}
        </div>
      )}

      {/* Selector Area (Admin/Teacher only) */}
      {user?.role !== 'student' && students.length > 0 && (
        <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Select Student Scorecard *</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 bg-white text-slate-800"
          >
            {students.map((st) => (
              <option key={st._id} value={st._id}>
                {st.user?.name} ({st.rollNumber})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Main Report Card Display */}
      {reportCard ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Summary stats */}
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-xl border border-slate-200 bg-indigo-700 text-white p-6 shadow-sm space-y-4">
              <span className="text-xs uppercase font-bold tracking-widest text-indigo-200">Total Average GPA</span>
              <p className="text-6xl font-extrabold">{reportCard.summary?.gpa || '0.00'}</p>
              <div className="border-t border-indigo-600 pt-4 text-xs font-medium text-indigo-100 flex items-center justify-between">
                <span>Core Passing Rate:</span>
                <span className="font-bold text-white">{reportCard.summary?.overallPercentage}%</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 text-slate-700 text-sm">
              <h2 className="text-md font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-500" />
                <span>Exams Performance Metrics</span>
              </h2>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                  <span className="text-slate-500">Subject Enrolled Loads:</span>
                  <span className="font-bold text-slate-900">{reportCard.summary?.totalCourses} Courses</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                  <span className="text-slate-500 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Passed Credits:
                  </span>
                  <span className="font-bold text-slate-900">{reportCard.summary?.passed} Subjects</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                    Failing Retake Marks:
                  </span>
                  <span className="font-bold text-rose-600">{reportCard.summary?.failed} Recourses</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Course Sheet card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 space-y-4">
            <h2 className="text-md font-bold text-slate-850 flex items-center gap-2 border-b border-slate-50 pb-3">
              <FileSpreadsheet className="h-4 w-4 text-indigo-500" />
              <span>Official Academic Transcript Records</span>
            </h2>

            <div className="space-y-4">
              <div className="justify-between flex flex-col sm:flex-row text-xs text-slate-400 font-semibold gap-2">
                <div>
                  <span className="block text-slate-500 uppercase tracking-widest">Student Target:</span>
                  <span className="block text-sm font-bold text-slate-800 mt-1">{reportCard.student?.name}</span>
                </div>
                <div>
                  <span className="block text-slate-500 uppercase tracking-widest">Roll Number:</span>
                  <span className="block text-sm font-bold text-slate-800 font-mono mt-1">{reportCard.student?.rollNumber}</span>
                </div>
                <div>
                  <span className="block text-slate-500 uppercase tracking-widest">Class Room:</span>
                  <span className="block text-sm font-bold text-slate-800 mt-1">{reportCard.student?.class}</span>
                </div>
              </div>

              {/* Sub list */}
              {reportCard.subjects && reportCard.subjects.length > 0 ? (
                <div className="overflow-x-auto border border-slate-100 rounded-lg">
                  <table className="w-full text-left text-xs text-slate-500">
                    <thead className="bg-slate-50 uppercase text-slate-400 font-bold">
                      <tr>
                        <th className="px-4 py-3">Subject Name</th>
                        <th className="px-4 py-3">Term</th>
                        <th className="px-4 py-3">Credits</th>
                        <th className="px-4 py-3 text-center">Marks Obtained</th>
                        <th className="px-4 py-3 text-right">Final Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-705">
                      {reportCard.subjects.map((sub) => (
                        <tr key={sub._id}>
                          <td className="px-4 py-3">
                            <p className="font-bold text-slate-905">{sub.course?.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{sub.course?.code}</p>
                          </td>
                          <td className="px-4 py-3">{sub.term}</td>
                          <td className="px-4 py-3 font-mono">{sub.course?.credits}</td>
                          <td className="px-4 py-3 text-center font-mono">{sub.marksObtained} / {sub.totalMarks}</td>
                          <td className="px-4 py-3 text-right font-bold">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded font-mono text-xs ${
                                sub.grade === 'A'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : sub.grade === 'B'
                                  ? 'bg-indigo-50 text-indigo-700'
                                  : sub.grade === 'F'
                                  ? 'bg-rose-50 text-rose-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {sub.grade}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-400 text-center py-6 text-xs italic">
                  No courses graded for current reports slot card. Check back soon.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center bg-white shadow-sm animate-slide-in">
          <FileSpreadsheet className="h-10 w-10 text-slate-350 mx-auto opacity-55" />
          <h3 className="mt-3 text-sm font-semibold text-slate-600">No report card details to compile!</h3>
          <p className="text-slate-400 text-xs mt-1">Submit test scores in results page to populate compiled records graphs.</p>
        </div>
      )}
    </div>
  );
}
