import React, { useState, useEffect } from 'react';
import { coursesAPI, teachersAPI, studentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, BookMarked, UserCheck, UserMinus, PlusCircle, Trash, X } from 'lucide-react';

export default function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Administrative Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  // Course Form Fields
  const [fieldName, setFieldName] = useState('');
  const [fieldCode, setFieldCode] = useState('');
  const [fieldDesc, setFieldDesc] = useState('');
  const [fieldTeacherId, setFieldTeacherId] = useState('');
  const [fieldCredits, setFieldCredits] = useState(3);
  const [fieldDuration, setFieldDuration] = useState('1 Semester');

  // Enrolment Modal
  const [enrolCourse, setEnrolCourse] = useState(null);
  const [isEnrolModalOpen, setIsEnrolModalOpen] = useState(false);
  const [enrolStudentId, setEnrolStudentId] = useState('');

  const [formError, setFormError] = useState('');

  const loadCoursesAndFaculty = async () => {
    setIsLoading(true);
    try {
      const [courseRes, teachRes, studRes] = await Promise.all([
        coursesAPI.getAll(search),
        teachersAPI.getAll(),
        studentsAPI.getAll(1, 100), // Get students list for enroll drop-down
      ]);

      if (courseRes.data.success) {
        setCourses(courseRes.data.data);
      }
      if (teachRes.data.success) {
        setTeachers(teachRes.data.data);
      }
      if (studRes.data.success) {
        setStudents(studRes.data.data);
      }
    } catch (err) {
      console.error('Failed loading courses/faculty databases', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCoursesAndFaculty();
    // eslint-disable-next-line
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadCoursesAndFaculty();
  };

  const openAddModal = () => {
    setEditingCourse(null);
    setFieldName('');
    setFieldCode(`CS-${Math.floor(100 + Math.random() * 900)}`);
    setFieldDesc('');
    setFieldTeacherId('');
    setFieldCredits(4);
    setFieldDuration('1 Semester');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setFieldName(course.name || '');
    setFieldCode(course.code || '');
    setFieldDesc(course.description || '');
    setFieldTeacherId(course.teacher?._id || '');
    setFieldCredits(course.credits || 3);
    setFieldDuration(course.duration || '1 Semester');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!fieldName || !fieldCode) {
      setFormError('Please fulfill Subject Title and Course Code *');
      return;
    }

    try {
      const payload = {
        name: fieldName,
        code: fieldCode,
        description: fieldDesc,
        teacher: fieldTeacherId || null,
        credits: parseInt(fieldCredits) || 3,
        duration: fieldDuration,
      };

      if (editingCourse) {
        await coursesAPI.update(editingCourse._id, payload);
      } else {
        await coursesAPI.create(payload);
      }
      setIsModalOpen(false);
      loadCoursesAndFaculty();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error occurred saving course specs');
    }
  };

  const handleDeleteCourse = async (id) => {
    if (window.confirm('Delete this course from school directories permanently?')) {
      try {
        await coursesAPI.delete(id);
        loadCoursesAndFaculty();
      } catch (err) {
        alert(err.response?.data?.message || 'Deletion failed');
      }
    }
  };

  // Student Enrollment Actions
  const openEnrolModal = (course) => {
    setEnrolCourse(course);
    setEnrolStudentId('');
    setIsEnrolModalOpen(true);
  };

  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    if (!enrolStudentId) return;

    try {
      await coursesAPI.enroll(enrolCourse._id, enrolStudentId);
      setIsEnrolModalOpen(false);
      loadCoursesAndFaculty();
    } catch (err) {
      alert(err.response?.data?.message || 'Enrollment failed');
    }
  };

  const handleUnenrollStudent = async (courseId, studentId) => {
    if (window.confirm('Unenroll this student from current course class list?')) {
      try {
        await coursesAPI.unenroll(courseId, studentId);
        loadCoursesAndFaculty();
      } catch (err) {
        alert(err.response?.data?.message || 'Unenrollment failed');
      }
    }
  };

  return (
    <div className="space-y-3 max-w-7xl mx-auto px-1 sm:px-2 animate-slide-in">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-2">
        <div>
          <h1 className="text-base font-bold text-slate-900">Academic Courses</h1>
          <p className="text-[11px] text-slate-500">Formulate subjects, map designated instruction staff, and audit class enrollments.</p>
        </div>

        {user?.role === 'admin' && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 rounded bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-indigo-500 transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create Course</span>
          </button>
        )}
      </div>

      {/* Query Filters */}
      <div className="flex bg-white p-2 rounded-lg border border-slate-200 shadow-none">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by course name or unique subject code (e.g. CS101)..."
            className="w-full rounded border border-slate-250 pl-8 pr-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 placeholder-slate-400"
          />
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </form>
      </div>

      {/* Main Grid */}
      {isLoading ? (
        <div className="flex justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course._id}
              className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-3 shadow-none hover:border-slate-355 transition-all h-full"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100/40">
                    {course.code}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">{course.duration}</span>
                </div>

                <h3 className="mt-2 text-sm font-bold text-slate-900 line-clamp-1">{course.name}</h3>
                <p className="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {course.description || 'No subject syllabus description supplied.'}
                </p>

                {/* Teacher Metadata */}
                <div className="mt-3 border-t border-slate-100 pt-2 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-0.5">Instructor</span>
                  <p className="font-bold text-slate-700 text-xs">
                    {course.teacher?.user?.name || (
                      <span className="text-slate-400 italic text-[11px] font-normal">Unassigned Lecturer</span>
                    )}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{course.teacher?.user?.email}</p>
                </div>

                {/* Enrolled Students lists */}
                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Enrolled Students ({course.students?.length || 0})
                    </span>
                    {user?.role !== 'student' && (
                      <button
                        onClick={() => openEnrolModal(course)}
                        className="text-indigo-600 hover:text-indigo-500 font-bold text-[10px] transition-colors"
                      >
                        Enroll Student
                      </button>
                    )}
                  </div>

                  <div className="max-h-24 overflow-y-auto rounded bg-slate-50 p-1.5 divide-y divide-slate-100 border border-slate-100">
                    {course.students && course.students.length > 0 ? (
                      course.students.map((stud) => (
                        <div key={stud._id} className="flex items-center justify-between py-1 text-[11px]">
                          <div className="truncate pr-2">
                            <span className="font-semibold text-slate-800">{stud.user?.name}</span>
                            <span className="text-slate-400 ml-1 font-mono text-[10px]">({stud.rollNumber})</span>
                          </div>
                          {user?.role !== 'student' && (
                            <button
                              onClick={() => handleUnenrollStudent(course._id, stud._id)}
                              className="text-rose-500 hover:text-rose-700 p-0.5"
                              title="Unenroll student"
                            >
                              <UserMinus className="h-2.5 w-2.5" />
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-center py-2 text-[10px] italic">No students registered.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Course Actions Footer */}
              <div className="mt-3 border-t border-slate-100 pt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>Credits: <strong className="text-slate-800 font-bold">{course.credits}</strong></span>
                {user?.role === 'admin' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(course)}
                      className="text-slate-600 hover:text-indigo-600 font-bold text-[10px]"
                    >
                      Edit specs
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course._id)}
                      className="text-rose-500 hover:text-rose-700 font-bold text-[10px]"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center bg-white shadow-none">
          <p className="text-slate-400 text-xs">No courses registered yet. Use admin login to add courses.</p>
        </div>
      )}

      {/* CRUD Course Overlay Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-3 overflow-y-auto">
          <div className="w-full max-w-sm rounded-lg bg-white p-4 shadow-xl border border-slate-150 animate-slide-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-sm font-bold text-slate-900">
                {editingCourse ? 'Modify Course Variables' : 'Formulate Course Code'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded p-0.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <div className="mt-2 rounded bg-rose-50 p-2 text-[10px] font-medium text-rose-600 border border-rose-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveCourse} className="mt-2 space-y-2.5 animate-slide-in">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Course Title *</label>
                <input
                  type="text"
                  required
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  className="w-full rounded border border-slate-250 px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 text-slate-800"
                  placeholder="e.g. Object Oriented Programming"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Course Code (Unique) *</label>
                <input
                  type="text"
                  required
                  value={fieldCode}
                  onChange={(e) => setFieldCode(e.target.value)}
                  className="w-full rounded border border-slate-250 px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 text-slate-800 font-mono"
                  placeholder="CS101"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Credits allocation</label>
                <select
                  value={fieldCredits}
                  onChange={(e) => setFieldCredits(e.target.value)}
                  className="w-full rounded border border-slate-250 px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 bg-white text-slate-800"
                >
                  <option value={1}>1 Credit</option>
                  <option value={2}>2 Credits</option>
                  <option value={3}>3 Credits</option>
                  <option value={4}>4 Credits</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Assigned Instructor</label>
                <select
                  value={fieldTeacherId}
                  onChange={(e) => setFieldTeacherId(e.target.value)}
                  className="w-full rounded border border-slate-250 px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 bg-white text-slate-800"
                >
                  <option value="">Unassigned</option>
                  {teachers.map((teach) => (
                    <option key={teach._id} value={teach._id}>
                      {teach.user?.name} ({teach.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Academic Duration</label>
                <input
                  type="text"
                  value={fieldDuration}
                  onChange={(e) => setFieldDuration(e.target.value)}
                  className="w-full rounded border border-slate-250 px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 text-slate-800"
                  placeholder="e.g. 1st Semester"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Syllabus Description Summary</label>
                <textarea
                  value={fieldDesc}
                  onChange={(e) => setFieldDesc(e.target.value)}
                  rows={2}
                  className="w-full rounded border border-slate-250 px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 text-slate-800"
                  placeholder="Write topics and targets..."
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 shadow-none"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enroll Student Sub Modal */}
      {isEnrolModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-3">
          <div className="w-full max-w-sm rounded-lg bg-white p-4 shadow-xl border border-slate-150 animate-slide-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-900">Enroll Student</h3>
              <button onClick={() => setIsEnrolModalOpen(false)} className="rounded p-0.5 text-slate-400 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEnrollStudent} className="mt-2 space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Select Student *</label>
                <select
                  required
                  value={enrolStudentId}
                  onChange={(e) => setEnrolStudentId(e.target.value)}
                  className="w-full rounded border border-slate-250 px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 bg-white text-slate-800"
                >
                  <option value="">-- Choose Student --</option>
                  {students
                    .filter((s) => !enrolCourse?.students?.some((curr) => curr._id === s._id))
                    .map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.user?.name} ({s.rollNumber})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3.5">
                <button
                  type="button"
                  onClick={() => setIsEnrolModalOpen(false)}
                  className="rounded border border-slate-250 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-505 shadow-none"
                >
                  Enroll Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
