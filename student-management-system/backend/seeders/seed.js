const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Result = require('../models/Result');

// Load env vars
dotenv.config({ path: __dirname + '/../.env' });

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student_management_system';
    console.log(`Connecting to database for seeding at ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    // Clear existing databases
    await User.deleteMany();
    await Student.deleteMany();
    await Teacher.deleteMany();
    await Course.deleteMany();
    await Attendance.deleteMany();
    await Result.deleteMany();

    console.log('Database cleared of existing records.');

    // 1. Create default login accounts
    console.log('Seeding default login users...');

    // Admin
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
    });

    // Teachers
    const teacherUser = await User.create({
      name: 'Professor John Doe',
      email: 'teacher@example.com',
      password: 'teacher123',
      role: 'teacher',
    });

    const teacherUser2 = await User.create({
      name: 'Professor Jane Smith',
      email: 'jane@example.com',
      password: 'teacher123',
      role: 'teacher',
    });

    // Students
    const studentUser = await User.create({
      name: 'Alice Cooper',
      email: 'student@example.com',
      password: 'student123',
      role: 'student',
    });

    const studentUser2 = await User.create({
      name: 'Bob Marley',
      email: 'bob@example.com',
      password: 'student123',
      role: 'student',
    });

    const studentUser3 = await User.create({
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      password: 'student123',
      role: 'student',
    });

    console.log('Core login accounts successfully seeded.');

    // 2. Create sub profiles
    console.log('Building associated Academic Staff & Student sub-profiles...');

    const teacherProfile1 = await Teacher.create({
      user: teacherUser._id,
      employeeId: 'EMP-1001',
      department: 'Computer Science & Engineering',
      qualification: 'PhD in Distributed Systems',
      designation: 'Senior Professor',
      phone: '+1 (555) 234-5678',
    });

    const teacherProfile2 = await Teacher.create({
      user: teacherUser2._id,
      employeeId: 'EMP-1002',
      department: 'Mathematics & Statistics',
      qualification: 'M.Sc. in Applied Mathematics',
      designation: 'Associate Professor',
      phone: '+1 (555) 345-6789',
    });

    const studentProfile1 = await Student.create({
      user: studentUser._id,
      rollNumber: 'R-2026-001',
      admissionNumber: 'ADM-9901',
      class: 'CS-Section A',
      dateOfBirth: new Date('2005-04-12'),
      gender: 'Female',
      phone: '+1 (555) 123-4567',
      address: '742 Evergreen Terrace, Springfield',
    });

    const studentProfile2 = await Student.create({
      user: studentUser2._id,
      rollNumber: 'R-2026-002',
      admissionNumber: 'ADM-9902',
      class: 'CS-Section A',
      dateOfBirth: new Date('2004-11-23'),
      gender: 'Male',
      phone: '+1 (555) 987-6543',
      address: '42 Wallaby Way, Sydney',
    });

    const studentProfile3 = await Student.create({
      user: studentUser3._id,
      rollNumber: 'R-2026-003',
      admissionNumber: 'ADM-9903',
      class: 'MATH-Section B',
      dateOfBirth: new Date('2005-07-09'),
      gender: 'Male',
      phone: '+1 (555) 555-5555',
      address: '123 Fake Street, London',
    });

    // 3. Create Courses
    console.log('Seeding curriculum courses...');

    const course1 = await Course.create({
      name: 'Introduction to Computer Science',
      code: 'CS101',
      description: 'Foundations of programming, binary arithmetic, and standard algorithms in JS/Python.',
      teacher: teacherProfile1._id,
      credits: 4,
      duration: '1st Semester',
      students: [studentProfile1._id, studentProfile2._id],
    });

    const course2 = await Course.create({
      name: 'Algorithms & Data Structures',
      code: 'CS202',
      description: 'Advanced topics in trees, graphs, dynamic programming, and memory complexity paradigms.',
      teacher: teacherProfile1._id,
      credits: 4,
      duration: '2nd Semester',
      students: [studentProfile1._id, studentProfile2._id],
    });

    const course3 = await Course.create({
      name: 'Linear Algebra & Calculus II',
      code: 'MATH201',
      description: 'Vector spaces, eigenvalues, matrix decompositions, and multivariable differentiation.',
      teacher: teacherProfile2._id,
      credits: 3,
      duration: '1st Semester',
      students: [studentProfile1._id, studentProfile3._id],
    });

    console.log('Courses successfully created.');

    // 4. Create Attendance Logs
    console.log('Populating historical attendance charts...');
    const pastDates = [
      new Date('2026-05-24'),
      new Date('2026-05-25'),
      new Date('2026-05-26'),
    ];

    for (const pDate of pastDates) {
      pDate.setHours(0,0,0,0);
      // Course 1 (CS101) Check-ins
      await Attendance.create({
        student: studentProfile1._id,
        course: course1._id,
        date: pDate,
        status: 'Present',
        markedBy: teacherUser._id,
      });
      await Attendance.create({
        student: studentProfile2._id,
        course: course1._id,
        date: pDate,
        status: pDate.getDate() % 2 === 0 ? 'Late' : 'Present',
        markedBy: teacherUser._id,
      });

      // Course 3 Check-ins (MATH201)
      await Attendance.create({
        student: studentProfile1._id,
        course: course3._id,
        date: pDate,
        status: 'Present',
        markedBy: teacherUser2._id,
      });
      await Attendance.create({
        student: studentProfile3._id,
        course: course3._id,
        date: pDate,
        status: pDate.getDate() === 25 ? 'Absent' : 'Present',
        markedBy: teacherUser2._id,
      });
    }

    // 5. Create Exam Results
    console.log('Entering test score archives...');

    // CS101 Final Exam
    await Result.create({
      student: studentProfile1._id,
      course: course1._id,
      marksObtained: 95,
      totalMarks: 100,
      grade: 'A',
      remarks: 'Exceptional visual layouts and code hygiene!',
      term: 'Final',
      enteredBy: teacherUser._id,
    });

    await Result.create({
      student: studentProfile2._id,
      course: course1._id,
      marksObtained: 84,
      totalMarks: 100,
      grade: 'B',
      remarks: 'Strong comprehension, missed a few boundary checks.',
      term: 'Final',
      enteredBy: teacherUser._id,
    });

    // CS101 Midterm Exam
    await Result.create({
      student: studentProfile1._id,
      course: course1._id,
      marksObtained: 92,
      totalMarks: 100,
      grade: 'A',
      remarks: 'Scored high in algorithms.',
      term: 'Midterm',
      enteredBy: teacherUser._id,
    });

    // MATH201 Final Exam
    await Result.create({
      student: studentProfile1._id,
      course: course3._id,
      marksObtained: 88,
      totalMarks: 100,
      grade: 'B',
      remarks: 'Very diligent on calculus proofs.',
      term: 'Final',
      enteredBy: teacherUser2._id,
    });

    await Result.create({
      student: studentProfile3._id,
      course: course3._id,
      marksObtained: 55,
      totalMarks: 100,
      grade: 'F',
      remarks: 'Struggled with linear systems. Remake recommended.',
      term: 'Final',
      enteredBy: teacherUser2._id,
    });

    console.log('Results registry successfully loaded.');
    console.log('Database Seeding Completed Successfully! 🌱');
    process.exit(0);
  } catch (error) {
    console.error('Seeding procedure failed:', error.message);
    process.exit(1);
  }
};

seedData();
