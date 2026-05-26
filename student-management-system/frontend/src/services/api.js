import axios from 'axios';

// Users/Auth Services
export const authAPI = {
  login: (email, password) => axios.post('/api/auth/login', { email, password }),
  register: (data) => axios.post('/api/auth/register', data),
  getMe: () => axios.get('/api/auth/me'),
};

// Students Management
export const studentsAPI = {
  getAll: (page = 1, limit = 10, search = '', className = '') =>
    axios.get(`/api/students?page=${page}&limit=${limit}&search=${search}&class=${className}`),
  getById: (id) => axios.get(`/api/students/${id}`),
  create: (data) => axios.post('/api/students', data),
  update: (id, data) => axios.put(`/api/students/${id}`, data),
  delete: (id) => axios.delete(`/api/students/${id}`),
};

// Teacher Management
export const teachersAPI = {
  getAll: (search = '', department = '') =>
    axios.get(`/api/teachers?search=${search}&department=${department}`),
  getById: (id) => axios.get(`/api/teachers/${id}`),
  create: (data) => axios.post('/api/teachers', data),
  update: (id, data) => axios.put(`/api/teachers/${id}`, data),
  delete: (id) => axios.delete(`/api/teachers/${id}`),
};

// Courses Management
export const coursesAPI = {
  getAll: (search = '') => axios.get(`/api/courses?search=${search}`),
  getById: (id) => axios.get(`/api/courses/${id}`),
  create: (data) => axios.post('/api/courses', data),
  update: (id, data) => axios.put(`/api/courses/${id}`, data),
  delete: (id) => axios.delete(`/api/courses/${id}`),
  enroll: (courseId, studentId) => axios.post(`/api/courses/${courseId}/enroll`, { studentId }),
  unenroll: (courseId, studentId) => axios.post(`/api/courses/${courseId}/unenroll`, { studentId }),
};

// Attendance Management
export const attendanceAPI = {
  mark: (courseId, attendanceRecords, date = null) =>
    axios.post('/api/attendance', { courseId, attendanceRecords, date }),
  getStats: (courseId = '', studentId = '', date = '') =>
    axios.get(`/api/attendance?courseId=${courseId}&studentId=${studentId}&date=${date}`),
};

// Results Grading Entries
export const resultsAPI = {
  enter: (data) => axios.post('/api/results', data),
  get: (studentId = '', courseId = '', term = '') =>
    axios.get(`/api/results?studentId=${studentId}&courseId=${courseId}&term=${term}`),
  getReportCard: (studentId) => axios.get(`/api/results/reportcard/${studentId}`),
};
