import React, { useState, useEffect } from 'react';
import { studentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, UserPlus, Edit2, Trash2, ArrowLeft, ArrowRight, X } from 'lucide-react';

export default function Students() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Modal control triggers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // Form Fields
  const [fieldName, setFieldName] = useState('');
  const [fieldEmail, setFieldEmail] = useState('');
  const [fieldPassword, setFieldPassword] = useState('');
  const [fieldRoll, setFieldRoll] = useState('');
  const [fieldAdmission, setFieldAdmission] = useState('');
  const [fieldClass, setFieldClass] = useState('Class 10-A');
  const [fieldGender, setFieldGender] = useState('Male');
  const [fieldPhone, setFieldPhone] = useState('');
  const [fieldDob, setFieldDob] = useState('2007-06-15');
  const [fieldAddress, setFieldAddress] = useState('');

  const [formError, setFormError] = useState('');

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const res = await studentsAPI.getAll(page, 8, search, classFilter);
      if (res.data.success) {
        setStudents(res.data.data);
        setTotalPages(res.data.pages || 1);
        setTotalStudents(res.data.total || 0);
      }
    } catch (err) {
      console.error('Failed loading student registries', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
    // eslint-disable-next-line
  }, [page, classFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadStudents();
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setFieldName('');
    setFieldEmail('');
    setFieldPassword('');
    setFieldRoll(`R-${Math.floor(1000 + Math.random() * 9000)}`);
    setFieldAdmission(`ADM-${Math.floor(10000 + Math.random() * 90000)}`);
    setFieldClass('CS-Section A');
    setFieldGender('Male');
    setFieldPhone('');
    setFieldDob('2006-05-18');
    setFieldAddress('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setFieldName(student.user?.name || '');
    setFieldEmail(student.user?.email || '');
    setFieldPassword(''); // Wipe sensitive password
    setFieldRoll(student.rollNumber || '');
    setFieldAdmission(student.admissionNumber || '');
    setFieldClass(student.class || '');
    setFieldGender(student.gender || 'Male');
    setFieldPhone(student.phone || '');
    // Format Date string for date picker (yyyy-MM-dd)
    const formattedDate = student.dateOfBirth
      ? new Date(student.dateOfBirth).toISOString().slice(0, 10)
      : '2006-05-18';
    setFieldDob(formattedDate);
    setFieldAddress(student.address || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!fieldName || !fieldEmail || !fieldRoll || !fieldAdmission || !fieldClass) {
      setFormError('Please fulfill all required headers');
      return;
    }

    try {
      if (editingStudent) {
        // Edit student flow
        const payload = {
          name: fieldName,
          email: fieldEmail,
          rollNumber: fieldRoll,
          admissionNumber: fieldAdmission,
          class: fieldClass,
          gender: fieldGender,
          phone: fieldPhone,
          dateOfBirth: fieldDob,
          address: fieldAddress,
        };
        await studentsAPI.update(editingStudent._id, payload);
      } else {
        // Add student flow (requires password)
        if (!fieldPassword || fieldPassword.length < 6) {
          setFormError('A login password of at least 6 characters is required for new students.');
          return;
        }

        const payload = {
          name: fieldName,
          email: fieldEmail,
          password: fieldPassword,
          rollNumber: fieldRoll,
          admissionNumber: fieldAdmission,
          class: fieldClass,
          gender: fieldGender,
          phone: fieldPhone,
          dateOfBirth: fieldDob,
          address: fieldAddress,
        };
        await studentsAPI.create(payload);
      }
      setIsModalOpen(false);
      loadStudents();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed saving student detail file');
    }
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm('Are you absolutely sure you want to delete this student and their login user credentials?')) {
      try {
        await studentsAPI.delete(id);
        loadStudents();
      } catch (err) {
        alert(err.response?.data?.message || 'Deletion failed');
      }
    }
  };

  return (
    <div className="space-y-3 max-w-7xl mx-auto px-1 sm:px-2 animate-slide-in">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-2">
        <div>
          <h1 className="text-base font-bold text-slate-900">Registered Students</h1>
          <p className="text-[11px] text-slate-500">Manage student directories, register logins, and edit classes profiles.</p>
        </div>

        {user?.role === 'admin' && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 rounded bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-indigo-500 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Student</span>
          </button>
        )}
      </div>

      {/* Query Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center bg-white p-2 rounded-lg border border-slate-200 shadow-none">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, email, roll no, or admission id..."
            className="w-full rounded border border-slate-250 pl-8 pr-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 placeholder-slate-400"
          />
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </form>

        <div className="flex items-center gap-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class Filter</label>
          <select
            value={classFilter}
            onChange={(e) => {
              setClassFilter(e.target.value);
              setPage(1);
            }}
            className="rounded border border-slate-250 px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 bg-white"
          >
            <option value="">All Classes</option>
            <option value="CS-Section A">CS-Section A</option>
            <option value="CS-Section B">CS-Section B</option>
            <option value="MATH-Section B">MATH-Section B</option>
          </select>
        </div>
      </div>

      {/* Main Students List Grid */}
      {isLoading ? (
        <div className="flex justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        </div>
      ) : students.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2">Student</th>
                  <th className="px-3 py-2">Roll Number</th>
                  <th className="px-3 py-2">Admission ID</th>
                  <th className="px-3 py-2">Class</th>
                  <th className="px-3 py-2">Gender</th>
                  <th className="px-3 py-2">Contact Phone</th>
                  {user?.role === 'admin' && <th className="px-3 py-2 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-1.5">
                      <div>
                        <p className="font-bold text-slate-900 leading-snug">{student.user?.name}</p>
                        <p className="text-[10px] text-slate-400">{student.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-3 py-1.5 font-mono text-[11px] font-medium text-slate-600">{student.rollNumber}</td>
                    <td className="px-3 py-1.5 font-mono text-[11px] font-medium text-slate-600">{student.admissionNumber}</td>
                    <td className="px-3 py-1.5">
                      <span className="inline-flex rounded bg-indigo-50 px-1.5 py-0.2 text-[10px] font-semibold text-indigo-700 border border-indigo-100/40">
                        {student.class}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-slate-600">{student.gender}</td>
                    <td className="px-3 py-1.5 text-slate-600 text-[11px]">{student.phone || '—'}</td>
                    {user?.role === 'admin' && (
                      <td className="px-3 py-1.5 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => openEditModal(student)}
                            className="p-1 rounded text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                            title="Edit student"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student._id)}
                            className="p-1 rounded text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition-colors"
                            title="Delete student"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2 bg-slate-50">
            <span className="text-[10px] text-slate-400 font-medium">
              Page <strong className="text-slate-700">{page}</strong> of <strong className="text-slate-700">{totalPages}</strong> ({totalStudents} students total)
            </span>
            <div className="flex gap-1.5">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                <ArrowLeft className="h-3 w-3" />
                <span>Prev</span>
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                <span>Next</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center bg-white shadow-none">
          <p className="text-slate-400 text-xs">No students found matching current selectors.</p>
        </div>
      )}

      {/* CRUD Overlay Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-3 overflow-y-auto">
          <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-xl border border-slate-150 animate-slide-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-sm font-bold text-slate-900">
                {editingStudent ? 'Edit Student Roll' : 'Create Student Registry'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <div className="mt-2 rounded bg-rose-50 p-2 text-[10px] font-medium text-rose-600 border border-rose-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveStudent} className="mt-2 space-y-2.5 max-h-[75vh] overflow-y-auto pr-0.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    className="w-full rounded border border-slate-250 px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 text-slate-800"
                    placeholder="Alice Smith"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Email *</label>
                  <input
                    type="email"
                    required
                    value={fieldEmail}
                    onChange={(e) => setFieldEmail(e.target.value)}
                    className="w-full rounded border border-slate-250 px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 text-slate-800"
                    placeholder="alice@school.com"
                  />
                </div>
              </div>

              {!editingStudent && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Password Credentials *</label>
                  <input
                    type="password"
                    required
                    value={fieldPassword}
                    onChange={(e) => setFieldPassword(e.target.value)}
                    className="w-full rounded border border-slate-250 px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 text-slate-800"
                    placeholder="Min 6 characters"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Roll Number *</label>
                  <input
                    type="text"
                    required
                    value={fieldRoll}
                    onChange={(e) => setFieldRoll(e.target.value)}
                    className="w-full rounded border border-slate-250 px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 font-mono text-[11px] text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Admission ID *</label>
                  <input
                    type="text"
                    required
                    value={fieldAdmission}
                    onChange={(e) => setFieldAdmission(e.target.value)}
                    className="w-full rounded border border-slate-250 px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 font-mono text-[11px] text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Class/Section *</label>
                  <input
                    type="text"
                    required
                    value={fieldClass}
                    onChange={(e) => setFieldClass(e.target.value)}
                    className="w-full rounded border border-slate-250 px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 text-slate-800"
                    placeholder="CS-Section A"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Gender *</label>
                  <select
                    value={fieldGender}
                    onChange={(e) => setFieldGender(e.target.value)}
                    className="w-full rounded border border-slate-250 px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 bg-white text-slate-800"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Date of Birth</label>
                  <input
                    type="date"
                    value={fieldDob}
                    onChange={(e) => setFieldDob(e.target.value)}
                    className="w-full rounded border border-slate-250 px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Phone Number</label>
                  <input
                    type="text"
                    value={fieldPhone}
                    onChange={(e) => setFieldPhone(e.target.value)}
                    className="w-full rounded border border-slate-250 px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 text-slate-800"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Residence Address</label>
                <input
                  type="text"
                  value={fieldAddress}
                  onChange={(e) => setFieldAddress(e.target.value)}
                  className="w-full rounded border border-slate-250 px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 text-slate-800"
                  placeholder="Street details"
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
                  Save student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
