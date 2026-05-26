import React, { useState, useEffect } from 'react';
import { coursesAPI, resultsAPI, studentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Award, FileEdit, GraduationCap, Percent, BookOpen } from 'lucide-react';
import axios from 'axios';

export default function Results() {
  const { user } = useAuth();
  
  // Lists
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [resultsList, setResultsList] = useState([]);

  // Form Fields
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('Final');
  const [marks, setMarks] = useState('');
  const [totalMarks, setTotalMarks] = useState(100);
  const [remarks, setRemarks] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [errorHeader, setErrorHeader] = useState('');

  const loadBaseGradesData = async () => {
    setIsLoading(true);
    setMessage('');
    setErrorHeader('');
    try {
      const [coursesRes, studListRes] = await Promise.all([
        coursesAPI.getAll(),
        studentsAPI.getAll(1, 100),
      ]);

      if (coursesRes.data.success) {
        setCourses(coursesRes.data.data);
        if (coursesRes.data.data.length > 0) {
          setSelectedCourseId(coursesRes.data.data[0]._id);
        }
      }

      if (studListRes.data.success) {
        setStudents(studListRes.data.data);
      }

      // Load initial grades roster or student personal scorecard
      if (user?.role === 'student') {
        const studentProfile = studListRes.data.data?.find((s) => s.user?._id === user._id);
        if (studentProfile) {
          const res = await resultsAPI.get(studentProfile._id);
          setResultsList(res.data.data);
        }
      } else {
        const res = await resultsAPI.get();
        setResultsList(res.data.data);
      }
    } catch (err) {
      console.error('Failed loading resources', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBaseGradesData();
    // eslint-disable-next-line
  }, [user]);

  // Update selection of enrolled students when changing the course selection
  useEffect(() => {
    if (!selectedCourseId || user?.role === 'student') return;
    const selectedCourse = courses.find((c) => c._id === selectedCourseId);
    if (selectedCourse?.students && selectedCourse.students.length > 0) {
      setStudents(selectedCourse.students);
      setSelectedStudentId(selectedCourse.students[0]._id);
    } else {
      setStudents([]);
      setSelectedStudentId('');
    }
  }, [selectedCourseId, courses, user]);

  const enterGradeSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setErrorHeader('');

    if (!selectedCourseId || !selectedStudentId || marks === '') {
      setErrorHeader('Please select Course, Student, and enter score.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        studentId: selectedStudentId,
        courseId: selectedCourseId,
        term: selectedTerm,
        marksObtained: parseFloat(marks),
        totalMarks: parseInt(totalMarks) || 100,
        remarks,
      };

      const res = await resultsAPI.enter(payload);
      if (res.data.success) {
        setMessage('Student exam score entered successfully and grade lettered!');
        // Reload grades list
        const listRes = await resultsAPI.get();
        setResultsList(listRes.data.data);
        
        // Reset inputs
        setMarks('');
        setRemarks('');
      }
    } catch (err) {
      setErrorHeader(err.response?.data?.message || 'Error occurred entering exam result');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 animate-slide-in">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900">Academic Results & Grades</h1>
        <p className="text-sm text-slate-500">Record final and midterm test marks, compute automatic letter grades, and view grade reports.</p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-6">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      )}

      {message && (
        <div className="rounded-lg bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 border border-emerald-150 shadow-sm animate-slide-in">
          {message}
        </div>
      )}

      {errorHeader && (
        <div className="rounded-lg bg-rose-50 p-4 text-sm font-semibold text-rose-800 border border-rose-150 shadow-sm animate-slide-in">
          {errorHeader}
        </div>
      )}

      {/* Educator Enter Marks Column */}
      {user?.role !== 'student' ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Submission Form */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm h-fit space-y-4">
            <h2 className="text-md font-bold text-slate-800 flex items-center gap-2">
              <FileEdit className="h-4 w-4 text-indigo-500" />
              <span>Enter Exam Score Sheet</span>
            </h2>

            <form onSubmit={enterGradeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Course Select *</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full rounded-lg border border-slate-250 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 bg-white text-slate-800"
                >
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.name} ({course.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Select Student *</label>
                {students.length > 0 ? (
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full rounded-lg border border-slate-250 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 bg-white text-slate-800"
                  >
                    {students.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.user?.name || 'Unknown Student'} ({student.rollNumber})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-rose-500 italic">No students enrolled in chosen course!</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Term Slot</label>
                  <select
                    value={selectedTerm}
                    onChange={(e) => setSelectedTerm(e.target.value)}
                    className="w-full rounded-lg border border-slate-250 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 bg-white text-slate-800"
                  >
                    <option value="Final">Final Exam</option>
                    <option value="Midterm">Midterm Exam</option>
                    <option value="Quiz">Quick Quiz</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Total Marks</label>
                  <input
                    type="number"
                    min="1"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)}
                    className="w-full rounded-lg border border-slate-250 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Score Obtained *</label>
                <input
                  type="number"
                  min="0"
                  max={totalMarks}
                  step="0.5"
                  required
                  placeholder="e.g. 88"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  className="w-full rounded-lg border border-slate-250 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Remarks / Feedback</label>
                <input
                  type="text"
                  placeholder="Excellent comprehension!"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full rounded-lg border border-slate-250 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 text-slate-800"
                />
              </div>

              <button
                type="submit"
                disabled={students.length === 0}
                className="w-full inline-flex justify-center items-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-500 transition-colors disabled:opacity-50"
              >
                Submit Score Record
              </button>
            </form>
          </div>

          {/* Grades Logged Table */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 space-y-4">
            <h2 className="text-md font-bold text-slate-800 flex items-center gap-2">
              <Award className="h-4 w-4 text-indigo-555" />
              <span>Curriculum Score Index</span>
            </h2>

            {resultsList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-500">
                  <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3">Student Name / Roll</th>
                      <th className="px-4 py-3">Course Code</th>
                      <th className="px-4 py-3">Exam Term</th>
                      <th className="px-4 py-3">Marks</th>
                      <th className="px-4 py-3 text-right">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 border-b border-slate-150 text-slate-700">
                    {resultsList.map((res) => (
                      <tr key={res._id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3.5">
                          <p className="font-bold text-slate-900">{res.student?.user?.name || 'Deleted Log'}</p>
                          <p className="text-xs text-slate-400 font-mono">{res.student?.rollNumber}</p>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs">{res.course?.code}</td>
                        <td className="px-4 py-3.5">{res.term}</td>
                        <td className="px-4 py-3.5 font-mono text-xs">{res.marksObtained} / {res.totalMarks}</td>
                        <td className="px-4 py-3.5 text-right font-bold text-indigo-650">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-55/75 font-semibold text-indigo-700 bg-indigo-50">
                            {res.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-400 text-center py-10 text-sm">No exam scores entered yet.</p>
            )}
          </div>
        </div>
      ) : (
        /* Student Results Audit */
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-md font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>My Grade Sheets Overview</span>
          </h2>

          {resultsList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-500">
                <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5">Course Code</th>
                    <th className="px-5 py-3.5">Course Name</th>
                    <th className="px-5 py-3.5">Credits</th>
                    <th className="px-5 py-3.5">Exam Term</th>
                    <th className="px-5 py-3.5">Score</th>
                    <th className="px-5 py-3.5">Teacher Feedback</th>
                    <th className="px-5 py-3.5 text-right">Letter Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 border-b border-slate-150 text-slate-700">
                  {resultsList.map((res) => (
                    <tr key={res._id}>
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-900">{res.course?.code}</td>
                      <td className="px-5 py-3.5 font-medium">{res.course?.name}</td>
                      <td className="px-5 py-3.5 font-mono text-xs">{res.course?.credits}</td>
                      <td className="px-5 py-3.5">{res.term} Exam</td>
                      <td className="px-5 py-3.5 font-mono text-xs">{res.marksObtained} / {res.totalMarks}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-500 italic max-w-xs truncate">{res.remarks || 'No remarks provided.'}</td>
                      <td className="px-5 py-3.5 text-right font-bold text-indigo-650">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                          {res.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-400 text-center py-10 italic text-sm">Your exam marks cards aren't entered by instructors yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
