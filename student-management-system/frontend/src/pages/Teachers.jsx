import React, { useState, useEffect } from 'react';
import { teachersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, UserPlus, Edit2, Trash2, X } from 'lucide-react';

export default function Teachers() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal variables
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  // Form Fields
  const [fieldName, setFieldName] = useState('');
  const [fieldEmail, setFieldEmail] = useState('');
  const [fieldPassword, setFieldPassword] = useState('');
  const [fieldEmpId, setFieldEmpId] = useState('');
  const [fieldDept, setFieldDept] = useState('Computer Science');
  const [fieldQualify, setFieldQualify] = useState('M.Tech / PhD CS');
  const [fieldDesignation, setFieldDesignation] = useState('Lecturer');
  const [fieldPhone, setFieldPhone] = useState('');

  const [formError, setFormError] = useState('');

  const loadTeachers = async () => {
    setIsLoading(true);
    try {
      const res = await teachersAPI.getAll(search, departmentFilter);
      if (res.data.success) {
        setTeachers(res.data.data);
      }
    } catch (err) {
      console.error('Failed loading teacher roster', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
    // eslint-disable-next-line
  }, [departmentFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadTeachers();
  };

  const openAddModal = () => {
    setEditingTeacher(null);
    setFieldName('');
    setFieldEmail('');
    setFieldPassword('');
    setFieldEmpId(`EMP-${Math.floor(1000 + Math.random() * 9000)}`);
    setFieldDept('Computer Science & Engineering');
    setFieldQualify('PhD Computer Science');
    setFieldDesignation('Associate Professor');
    setFieldPhone('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (teacher) => {
    setEditingTeacher(teacher);
    setFieldName(teacher.user?.name || '');
    setFieldEmail(teacher.user?.email || '');
    setFieldPassword('');
    setFieldEmpId(teacher.employeeId || '');
    setFieldDept(teacher.department || '');
    setFieldQualify(teacher.qualification || '');
    setFieldDesignation(teacher.designation || 'Lecturer');
    setFieldPhone(teacher.phone || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveTeacher = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!fieldName || !fieldEmail || !fieldEmpId || !fieldDept) {
      setFormError('Please fulfill all required fields (*)');
      return;
    }

    try {
      if (editingTeacher) {
        const payload = {
          name: fieldName,
          email: fieldEmail,
          employeeId: fieldEmpId,
          department: fieldDept,
          qualification: fieldQualify,
          designation: fieldDesignation,
          phone: fieldPhone,
        };
        await teachersAPI.update(editingTeacher._id, payload);
      } else {
        if (!fieldPassword || fieldPassword.length < 6) {
          setFormError('A secret portal password (min 6 chars) is required for new accounts.');
          return;
        }
        const payload = {
          name: fieldName,
          email: fieldEmail,
          password: fieldPassword,
          employeeId: fieldEmpId,
          department: fieldDept,
          qualification: fieldQualify,
          designation: fieldDesignation,
          phone: fieldPhone,
        };
        await teachersAPI.create(payload);
      }
      setIsModalOpen(false);
      loadTeachers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error saving faculty details');
    }
  };

  const handleDeleteTeacher = async (id) => {
    if (window.confirm('Delete this faculty record and block portal access?')) {
      try {
        await teachersAPI.delete(id);
        loadTeachers();
      } catch (err) {
        alert(err.response?.data?.message || 'Deletion failed');
      }
    }
  };

  return (
    <div className="space-y-3 max-w-7xl mx-auto px-1 sm:px-2 animate-slide-in">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-2">
        <div>
          <h1 className="text-base font-bold text-slate-900">Academic Staff Directory</h1>
          <p className="text-[11px] text-slate-500">Manage school educators, design degrees, and update faculty portfolios.</p>
        </div>

        {user?.role === 'admin' && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 rounded bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-indigo-500 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Teacher</span>
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
            placeholder="Search by teacher name, employee ID, or phone..."
            className="w-full rounded border border-slate-250 pl-8 pr-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 placeholder-slate-400"
          />
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </form>

        <div className="flex items-center gap-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department</label>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="rounded border border-slate-250 px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 bg-white"
          >
            <option value="">All Departments</option>
            <option value="Computer Science & Engineering">Computer Science</option>
            <option value="Mathematics & Statistics">Mathematics</option>
            <option value="Physics & Electronics">Physics</option>
          </select>
        </div>
      </div>

      {/* Roster Grid */}
      {isLoading ? (
        <div className="flex justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        </div>
      ) : teachers.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher) => (
            <div
              key={teacher._id}
              className="group relative flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-3 shadow-none hover:border-slate-350 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded bg-indigo-50 font-bold text-indigo-700 text-sm">
                    {teacher.user?.name ? teacher.user.name.split(' ').map((n) => n[0]).join('').slice(0, 2) : 'T'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-xs">
                      {teacher.user?.name}
                    </h3>
                    <p className="text-[10px] font-mono text-slate-400 leading-none mt-0.5">{teacher.employeeId}</p>
                  </div>
                </div>

                <div className="mt-3 space-y-2 border-t border-slate-100 pt-2 text-xs text-slate-600">
                  <p>
                    <strong className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Department
                    </strong>
                    <span className="font-medium text-slate-800">{teacher.department}</span>
                  </p>
                  <p>
                    <strong className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Designation & Degree
                    </strong>
                    <span className="font-medium text-slate-800">{teacher.designation}</span> • <span className="text-[11px] text-slate-500 italic">{teacher.qualification}</span>
                  </p>
                  <p>
                    <strong className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Email Address
                    </strong>
                    <span className="text-xs truncate block max-w-full text-slate-700">{teacher.user?.email}</span>
                  </p>
                  <p>
                    <strong className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Contact Line
                    </strong>
                    <span className="text-xs text-slate-700">{teacher.phone || 'N/A'}</span>
                  </p>
                </div>
              </div>

              {user?.role === 'admin' && (
                <div className="mt-3 flex justify-end gap-1.5 border-t border-slate-100 pt-2">
                  <button
                    onClick={() => openEditModal(teacher)}
                    className="inline-flex items-center gap-1 rounded bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-150 transition-colors"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteTeacher(teacher._id)}
                    className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-100 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center bg-white shadow-none animate-slide-in">
          <p className="text-slate-400 text-xs">No teachers registered matching search queries.</p>
        </div>
      )}

      {/* CRUD Overlay Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-3 overflow-y-auto">
          <div className="w-full max-w-sm rounded-lg bg-white p-4 shadow-xl border border-slate-150 animate-slide-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-sm font-bold text-slate-900">
                {editingTeacher ? 'Edit Educator Record' : 'Enroll New Educator'}
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

            <form onSubmit={handleSaveTeacher} className="mt-2 space-y-2.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Teacher Full Name *</label>
                <input
                  type="text"
                  required
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  className="w-full rounded border border-slate-250 px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 text-slate-800"
                  placeholder="Professor John Doe"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Email Address *</label>
                <input
                  type="email"
                  required
                  value={fieldEmail}
                  onChange={(e) => setFieldEmail(e.target.value)}
                  className="w-full rounded border border-slate-250 px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 text-slate-800"
                  placeholder="professor@university.com"
                />
              </div>

              {!editingTeacher && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Secret Access Password *</label>
                  <input
                    type="password"
                    required
                    value={fieldPassword}
                    onChange={(e) => setFieldPassword(e.target.value)}
                    className="w-full rounded border border-slate-250 px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 text-slate-800"
                    placeholder="Set faculty passwords"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Employee ID *</label>
                  <input
                    type="text"
                    required
                    value={fieldEmpId}
                    onChange={(e) => setFieldEmpId(e.target.value)}
                    className="w-full rounded border border-slate-250 px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 font-mono text-[11px] text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Department *</label>
                  <input
                    type="text"
                    required
                    value={fieldDept}
                    onChange={(e) => setFieldDept(e.target.value)}
                    className="w-full rounded border border-slate-250 px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 text-slate-800"
                    placeholder="e.g. Mathematics"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 font-normal text-slate-800 border-0">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Qualifications</label>
                  <input
                    type="text"
                    value={fieldQualify}
                    onChange={(e) => setFieldQualify(e.target.value)}
                    className="w-full rounded border border-slate-250 px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 text-slate-800"
                    placeholder="PhD Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Designation</label>
                  <input
                    type="text"
                    value={fieldDesignation}
                    onChange={(e) => setFieldDesignation(e.target.value)}
                    className="w-full rounded border border-slate-250 px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 text-slate-800"
                    placeholder="e.g. Associate Professor"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Contact Phone</label>
                <input
                  type="text"
                  value={fieldPhone}
                  onChange={(e) => setFieldPhone(e.target.value)}
                  className="w-full rounded border border-slate-250 px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 text-slate-800"
                  placeholder="+1 (555) 000-0000"
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
                  Save Educator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
