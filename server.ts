import express from 'express';
import path from 'path';
import fs from 'fs';
import AdmZip from 'adm-zip';
import { createServer as createViteServer } from 'vite';

// In-Memory Database Replication for live-testing preview
let users = [
  { _id: 'u-1', name: 'System Administrator', email: 'admin@example.com', password: 'admin123', role: 'admin' },
  { _id: 'u-2', name: 'Professor John Doe', email: 'teacher@example.com', password: 'teacher123', role: 'teacher' },
  { _id: 'u-3', name: 'Professor Jane Smith', email: 'jane@example.com', password: 'teacher123', role: 'teacher' },
  { _id: 'u-4', name: 'Alice Cooper', email: 'student@example.com', password: 'student123', role: 'student' },
  { _id: 'u-5', name: 'Bob Marley', email: 'bob@example.com', password: 'student123', role: 'student' },
  { _id: 'u-6', name: 'Charlie Brown', email: 'charlie@example.com', password: 'student123', role: 'student' }
];

let teachers = [
  { _id: 't-1', user: { _id: 'u-2', name: 'Professor John Doe', email: 'teacher@example.com' }, employeeId: 'EMP-1001', department: 'Computer Science & Engineering', qualification: 'PhD in Distributed Systems', designation: 'Senior Professor', phone: '+1 (555) 234-5678' },
  { _id: 't-2', user: { _id: 'u-3', name: 'Professor Jane Smith', email: 'jane@example.com' }, employeeId: 'EMP-1002', department: 'Mathematics & Statistics', qualification: 'M.Sc. in Applied Mathematics', designation: 'Associate Professor', phone: '+1 (555) 345-6789' }
];

let students = [
  { _id: 's-1', user: { _id: 'u-4', name: 'Alice Cooper', email: 'student@example.com' }, rollNumber: 'R-2026-001', admissionNumber: 'ADM-9901', class: 'CS-Section A', dateOfBirth: '2005-04-12', gender: 'Female', phone: '+1 (555) 123-4567', address: '742 Evergreen Terrace, Springfield' },
  { _id: 's-2', user: { _id: 'u-5', name: 'Bob Marley', email: 'bob@example.com' }, rollNumber: 'R-2026-002', admissionNumber: 'ADM-9902', class: 'CS-Section A', dateOfBirth: '2004-11-23', gender: 'Male', phone: '+1 (555) 987-6543', address: '42 Wallaby Way, Sydney' },
  { _id: 's-3', user: { _id: 'u-6', name: 'Charlie Brown', email: 'charlie@example.com' }, rollNumber: 'R-2026-003', admissionNumber: 'ADM-9903', class: 'MATH-Section B', dateOfBirth: '2005-07-09', gender: 'Male', phone: '+1 (555) 555-5555', address: '123 Fake Street, London' }
];

let courses = [
  { _id: 'c-1', name: 'Introduction to Computer Science', code: 'CS101', description: 'Foundations of programming, binary arithmetic, and standard algorithms in JS/Python.', teacher: teachers[0], credits: 4, duration: '1st Semester', students: [students[0], students[1]] },
  { _id: 'c-2', name: 'Algorithms & Data Structures', code: 'CS202', description: 'Advanced topics in trees, graphs, dynamic programming, and memory complexity paradigms.', teacher: teachers[0], credits: 4, duration: '2nd Semester', students: [students[0], students[1]] },
  { _id: 'c-3', name: 'Linear Algebra & Calculus II', code: 'MATH201', description: 'Vector spaces, eigenvalues, matrix decompositions, and multivariable differentiation.', teacher: teachers[1], credits: 3, duration: '1st Semester', students: [students[0], students[2]] }
];

let attendance = [
  { _id: 'a-1', student: students[0], course: { _id: 'c-1', name: 'Introduction to Computer Science', code: 'CS101' }, date: '25 May 2026', status: 'Present', markedBy: 'System' },
  { _id: 'a-2', student: students[1], course: { _id: 'c-1', name: 'Introduction to Computer Science', code: 'CS101' }, date: '25 May 2026', status: 'Present', markedBy: 'System' },
  { _id: 'a-3', student: students[0], course: { _id: 'c-3', name: 'Linear Algebra & Calculus II', code: 'MATH201' }, date: '25 May 2026', status: 'Present', markedBy: 'System' },
  { _id: 'a-4', student: students[2], course: { _id: 'c-3', name: 'Linear Algebra & Calculus II', code: 'MATH201' }, date: '25 May 2026', status: 'Absent', markedBy: 'System' }
];

let results = [
  { _id: 'r-1', student: students[0], course: { _id: 'c-1', name: 'Introduction to Computer Science', code: 'CS101', credits: 4 }, marksObtained: 95, totalMarks: 100, grade: 'A', remarks: 'Exceptional layouts and logic!', term: 'Final', examDate: '24 May 2026' },
  { _id: 'r-2', student: students[1], course: { _id: 'c-1', name: 'Introduction to Computer Science', code: 'CS101', credits: 4 }, marksObtained: 84, totalMarks: 100, grade: 'B', remarks: 'Strong parameters comprehension.', term: 'Final', examDate: '24 May 2026' },
  { _id: 'r-3', student: students[0], course: { _id: 'c-3', name: 'Linear Algebra & Calculus II', code: 'MATH201', credits: 3 }, marksObtained: 88, totalMarks: 100, grade: 'B', remarks: 'Diligence on mathematical vectors.', term: 'Final', examDate: '25 May 2026' },
  { _id: 'r-4', student: students[2], course: { _id: 'c-3', name: 'Linear Algebra & Calculus II', code: 'MATH201', credits: 3 }, marksObtained: 55, totalMarks: 100, grade: 'F', remarks: 'Needs further systems practice.', term: 'Final', examDate: '25 May 2026' }
];

const startServer = async () => {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Helper auth check middleware
  const getAuthUser = (req: any) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const match = users.find((u) => u._id === token || u.email === token);
      return match || null;
    }
    return null;
  };

  // 1. ZIP DOWNLOAD API ROUTE
  app.get('/api/download-zip', (req, res) => {
    try {
      const zip = new AdmZip();
      const folderPath = path.join(process.cwd(), 'student-management-system');

      if (!fs.existsSync(folderPath)) {
        return res.status(404).json({ success: false, message: 'Source folder directory not found.' });
      }

      // Add student-management-system folder recursion
      zip.addLocalFolder(folderPath, 'student-management-system');

      const willSendbuffer = zip.toBuffer();

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename=student-management-system.zip');
      res.send(willSendbuffer);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 2. MOCK API HANDLERS (Powers interactive simulation)
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find((u) => u.email === email && u.password === password);
    if (user) {
      let profile = null;
      if (user.role === 'student') profile = students.find((s) => s.user?._id === user._id);
      if (user.role === 'teacher') profile = teachers.find((t) => t.user?._id === user._id);

      res.json({
        success: true,
        user: { ...user, profile },
        token: user._id, // Simplistic user-id as token for mock
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials. Use presets: admin@example.com/admin123' });
    }
  });

  app.post('/api/auth/register', (req, res) => {
    const { name, email, password, role, profileData } = req.body;
    if (users.find((u) => u.email === email)) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const newUser = { _id: `u-${Date.now()}`, name, email, password, role };
    users.push(newUser);

    let profile = null;
    if (role === 'student') {
      profile = {
        _id: `s-${Date.now()}`,
        user: { _id: newUser._id, name: newUser.name, email: newUser.email },
        rollNumber: profileData?.rollNumber || `R-${Date.now().toString().slice(-4)}`,
        admissionNumber: profileData?.admissionNumber || `ADM-${Date.now().toString().slice(-4)}`,
        class: profileData?.class || 'CS-Section A',
        dateOfBirth: profileData?.dateOfBirth || '2006-05-18',
        gender: profileData?.gender || 'Male',
        phone: profileData?.phone || '000-000-0000',
        address: profileData?.address || '',
      };
      students.push(profile);
    } else if (role === 'teacher') {
      profile = {
        _id: `t-${Date.now()}`,
        user: { _id: newUser._id, name: newUser.name, email: newUser.email },
        employeeId: profileData?.employeeId || `EMP-${Date.now().toString().slice(-4)}`,
        department: profileData?.department || 'Computer Science',
        qualification: profileData?.qualification || 'PhD Computer Science',
        designation: profileData?.designation || 'Lecturer',
        phone: profileData?.phone || '000-000-0000',
      };
      teachers.push(profile);
    }

    res.json({
      success: true,
      user: { ...newUser, profile },
      token: newUser._id,
    });
  });

  app.get('/api/auth/me', (req, res) => {
    const user = getAuthUser(req);
    if (user) {
      let profile = null;
      if (user.role === 'student') profile = students.find((s) => s.user?._id === user._id);
      if (user.role === 'teacher') profile = teachers.find((t) => t.user?._id === user._id);
      res.json({ success: true, user: { ...user, profile } });
    } else {
      res.status(401).json({ success: false, message: 'Session expired' });
    }
  });

  // STUDENT REST APIS (MOCK)
  app.get('/api/students', (req, res) => {
    const search = (req.query.search as string || '').toLowerCase();
    const classFilter = req.query.class as string || '';

    let filtered = students;
    if (classFilter) {
      filtered = filtered.filter((s) => s.class === classFilter);
    }

    if (search) {
      filtered = filtered.filter(
        (s) =>
          s.user?.name.toLowerCase().includes(search) ||
          s.user?.email.toLowerCase().includes(search) ||
          s.rollNumber.toLowerCase().includes(search)
      );
    }

    res.json({
      success: true,
      data: filtered,
      page: 1,
      pages: 1,
      total: filtered.length,
    });
  });

  app.post('/api/students', (req, res) => {
    const { name, email, password, rollNumber, admissionNumber, class: cls, dateOfBirth, gender, phone, address } = req.body;

    const newUser = { _id: `u-${Date.now()}`, name, email, password, role: 'student' };
    users.push(newUser);

    const newStudent = {
      _id: `s-${Date.now()}`,
      user: newUser,
      rollNumber,
      admissionNumber,
      class: cls,
      dateOfBirth,
      gender,
      phone,
      address,
    };
    students.push(newStudent);

    res.json({ success: true, data: newStudent });
  });

  app.put('/api/students/:id', (req, res) => {
    const target = students.find((s) => s._id === req.params.id);
    if (target) {
      Object.assign(target, req.body);
      // Update linked user name
      const usr = users.find((u) => u._id === target.user?._id);
      if (usr && req.body.name) usr.name = req.body.name;
    }
    res.json({ success: true, data: target });
  });

  app.delete('/api/students/:id', (req, res) => {
    students = students.filter((s) => s._id !== req.params.id);
    res.json({ success: true, message: 'Deleted student profiles' });
  });

  // TEACHER REST APIS (MOCK)
  app.get('/api/teachers', (req, res) => {
    res.json({ success: true, data: teachers });
  });

  app.post('/api/teachers', (req, res) => {
    const { name, email, password, employeeId, department, qualification, designation, phone } = req.body;
    const newUser = { _id: `u-${Date.now()}`, name, email, password, role: 'teacher' };
    users.push(newUser);

    const newTeacher = {
      _id: `t-${Date.now()}`,
      user: newUser,
      employeeId,
      department,
      qualification,
      designation,
      phone,
    };
    teachers.push(newTeacher);
    res.json({ success: true, data: newTeacher });
  });

  app.put('/api/teachers/:id', (req, res) => {
    const target = teachers.find((t) => t._id === req.params.id);
    if (target) {
      Object.assign(target, req.body);
    }
    res.json({ success: true, data: target });
  });

  app.delete('/api/teachers/:id', (req, res) => {
    teachers = teachers.filter((t) => t._id !== req.params.id);
    res.json({ success: true, message: 'Deleted teacher profiles' });
  });

  // COURSE REST APIS (MOCK)
  app.get('/api/courses', (req, res) => {
    res.json({ success: true, data: courses });
  });

  app.get('/api/courses/:id', (req, res) => {
    const match = courses.find((c) => c._id === req.params.id);
    if (match) res.json({ success: true, data: match });
    else res.status(404).json({ success: false, message: 'Course not found' });
  });

  app.post('/api/courses', (req, res) => {
    const { name, code, description, teacher, credits, duration } = req.body;
    const matchTeach = teachers.find((t) => t._id === teacher) || null;

    const newCourse = {
      _id: `c-${Date.now()}`,
      name,
      code,
      description,
      teacher: matchTeach,
      credits: parseInt(credits) || 3,
      duration,
      students: [],
    };
    courses.push(newCourse);
    res.json({ success: true, data: newCourse });
  });

  app.put('/api/courses/:id', (req, res) => {
    const course = courses.find((c) => c._id === req.params.id);
    if (course) {
      Object.assign(course, req.body);
      if (req.body.teacher) {
        course.teacher = teachers.find((t) => t._id === req.body.teacher) || null;
      }
    }
    res.json({ success: true, data: course });
  });

  app.delete('/api/courses/:id', (req, res) => {
    courses = courses.filter((c) => c._id !== req.params.id);
    res.json({ success: true, message: 'Deleted course' });
  });

  app.post('/api/courses/:id/enroll', (req, res) => {
    const { studentId } = req.body;
    const course = courses.find((c) => c._id === req.params.id);
    const mockStudent = students.find((s) => s._id === studentId);

    if (course && mockStudent) {
      if (!course.students.some((s) => s._id === studentId)) {
        course.students.push(mockStudent);
      }
      res.json({ success: true, data: course });
    } else {
      res.status(404).json({ success: false, message: 'Param not found' });
    }
  });

  app.post('/api/courses/:id/unenroll', (req, res) => {
    const { studentId } = req.body;
    const course = courses.find((c) => c._id === req.params.id);
    if (course) {
      course.students = course.students.filter((s) => s._id !== studentId);
      res.json({ success: true, data: course });
    } else {
      res.status(404).json({ success: false, message: 'Not found' });
    }
  });

  // ATTENDANCE REST APIS (MOCK)
  app.get('/api/attendance', (req, res) => {
    const { studentId, courseId } = req.query;
    let filtered = attendance;

    if (studentId) {
      filtered = filtered.filter((a) => a.student?._id === studentId);
    }
    if (courseId) {
      filtered = filtered.filter((a) => a.course?._id === courseId);
    }

    const total = filtered.length;
    const present = filtered.filter((f) => f.status === 'Present').length;
    const absent = filtered.filter((f) => f.status === 'Absent').length;
    const late = filtered.filter((f) => f.status === 'Late').length;

    res.json({
      success: true,
      data: filtered,
      stats: {
        total,
        present,
        absent,
        late,
        percentage: total > 0 ? ((present + late) / total) * 100 : 0,
      },
    });
  });

  app.post('/api/attendance', (req, res) => {
    const { courseId, attendanceRecords, date } = req.body;
    const targetCourse = courses.find((c) => c._id === courseId);

    if (targetCourse && Array.isArray(attendanceRecords)) {
      const formattedD = date ? new Date(date).toLocaleDateString() : new Date().toLocaleDateString();
      
      attendanceRecords.forEach((record) => {
        const matchingS = students.find((s) => s._id === record.studentId);
        if (matchingS) {
          // Remove duplicate mock check-in
          attendance = attendance.filter((a) => !(a.student?._id === record.studentId && a.course?._id === courseId && a.date === formattedD));
          
          attendance.push({
            _id: `a-${Date.now()}-${record.studentId}`,
            student: matchingS,
            course: { _id: targetCourse._id, name: targetCourse.name, code: targetCourse.code },
            date: formattedD,
            status: record.status || 'Present',
            markedBy: 'Faculty Educator',
          });
        }
      });
    }

    res.json({ success: true, message: 'Marked' });
  });

  // RESULTS REST APIS (MOCK)
  app.get('/api/results', (req, res) => {
    const { studentId } = req.query;
    let filtered = results;
    if (studentId) {
      filtered = filtered.filter((r) => r.student?._id === studentId);
    }
    res.json({ success: true, data: filtered });
  });

  app.post('/api/results', (req, res) => {
    const { studentId, courseId, marksObtained, totalMarks, remarks, term } = req.body;
    const targetCourse = courses.find((c) => c._id === courseId);
    const targetStudent = students.find((s) => s._id === studentId);

    if (targetCourse && targetStudent) {
      let lGrade = 'A';
      const pct = (marksObtained / totalMarks) * 100;
      if (pct >= 90) lGrade = 'A';
      else if (pct >= 80) lGrade = 'B';
      else if (pct >= 70) lGrade = 'C';
      else if (pct >= 60) lGrade = 'D';
      else lGrade = 'F';

      // Clear existing terms duplicates
      results = results.filter((r) => !(r.student?._id === studentId && r.course?._id === courseId && r.term === term));

      results.push({
        _id: `r-${Date.now()}`,
        student: targetStudent,
        course: { _id: targetCourse._id, name: targetCourse.name, code: targetCourse.code, credits: targetCourse.credits },
        marksObtained,
        totalMarks,
        grade: lGrade,
        remarks,
        term,
        examDate: new Date().toLocaleDateString(),
      });
    }

    res.json({ success: true });
  });

  app.get('/api/results/reportcard/:studentId', (req, res) => {
    const target = students.find((s) => s._id === req.params.studentId);
    if (!target) return res.status(404).json({ success: false, message: 'Student not found' });

    const grades = results.filter((r) => r.student?._id === req.params.studentId);

    let totalMarksObtained = 0;
    let totalMaxMarks = 0;
    let passedCount = 0;

    grades.forEach((g) => {
      totalMarksObtained += g.marksObtained;
      totalMaxMarks += g.totalMarks;
      if (g.grade !== 'F') passedCount++;
    });

    const averagePercentage = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : 0;
    const gpa = (averagePercentage / 105) * 4.0;

    res.json({
      success: true,
      data: {
        student: target,
        subjects: grades,
        summary: {
          totalCourses: grades.length,
          passed: passedCount,
          failed: grades.length - passedCount,
          gpa: Math.min(4.0, gpa).toFixed(2),
          overallPercentage: averagePercentage.toFixed(1),
        },
      },
    });
  });

  // 3. VITE MIDDLEWARE HANDLING & ROUTING FALLBACKS
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      root: path.join(process.cwd(), 'student-management-system/frontend'),
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Live Preview mock server running on port ${PORT}`);
  });
};

startServer();
