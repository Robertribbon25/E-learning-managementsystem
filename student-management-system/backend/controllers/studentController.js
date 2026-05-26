const Student = require('../models/Student');
const User = require('../models/User');

// @desc    Get all students with pagination and search
// @route   GET /api/students
// @access  Private (Admin & Teacher)
const getStudents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const searchQuery = req.query.search || '';
    const classFilter = req.query.class || '';

    // Handle user name search via aggregation/populate or subquery
    let userIds = [];
    if (searchQuery) {
      const matchingUsers = await User.find({
        role: 'student',
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { email: { $regex: searchQuery, $options: 'i' } },
        ],
      });
      userIds = matchingUsers.map((u) => u._id);
    }

    // Prepare query for Student
    const query = {};
    if (classFilter) {
      query.class = classFilter;
    }

    if (searchQuery) {
      query.$or = [
        { rollNumber: { $regex: searchQuery, $options: 'i' } },
        { admissionNumber: { $regex: searchQuery, $options: 'i' } },
        { phone: { $regex: searchQuery, $options: 'i' } },
      ];
      if (userIds.length > 0) {
        query.$or.push({ user: { $in: userIds } });
      }
    }

    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .populate('user', '-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: students,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private (Admin, Teacher, or Student themselves)
const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).populate('user', '-password');

    if (!student) {
      res.status(404);
      throw new Error('Student profile not found');
    }

    // Role verification: Student should only see themselves
    if (req.user.role === 'student' && student.user._id.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Access denied. You can only view your own profile.');
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a student (Creates User and Student profile)
// @route   POST /api/students
// @access  Private (Admin)
const createStudent = async (req, res, next) => {
  const { name, email, password, rollNumber, admissionNumber, class: className, dateOfBirth, gender, phone, address } = req.body;

  try {
    // Basic verification
    if (!name || !email || !password || !rollNumber || !admissionNumber || !className) {
      res.status(400);
      throw new Error('All required fields (name, email, password, rollNumber, admissionNumber, class) must be supplied');
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error('Email is already registered in the system');
    }

    const rollExists = await Student.findOne({ rollNumber });
    if (rollExists) {
      res.status(400);
      throw new Error('Roll number already assigned to another student');
    }

    const admissionExists = await Student.findOne({ admissionNumber });
    if (admissionExists) {
      res.status(400);
      throw new Error('Admission number already assigned to another student');
    }

    // Create User record
    const user = await User.create({
      name,
      email,
      password,
      role: 'student',
    });

    // Create companion Student profile
    const student = await Student.create({
      user: user._id,
      rollNumber,
      admissionNumber,
      class: className,
      dateOfBirth: new Date(dateOfBirth || '2005-01-01'),
      gender: gender || 'Male',
      phone: phone || '000-000-0000',
      address: address || '',
    });

    res.status(201).json({
      success: true,
      data: {
        _id: student._id,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        rollNumber: student.rollNumber,
        admissionNumber: student.admissionNumber,
        class: student.class,
        dateOfBirth: student.dateOfBirth,
        gender: student.gender,
        phone: student.phone,
        address: student.address,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student details
// @route   PUT /api/students/:id
// @access  Private (Admin & Teacher)
const updateStudent = async (req, res, next) => {
  const { name, email, rollNumber, admissionNumber, class: className, dateOfBirth, gender, phone, address, avatar } = req.body;

  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      res.status(404);
      throw new Error('Student profile not found');
    }

    const user = await User.findById(student.user);
    if (!user) {
      res.status(404);
      throw new Error('User profile mismatch');
    }

    // Verify uniques if roll/admission/email is changed
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        res.status(400);
        throw new Error('Email already details active user');
      }
      user.email = email;
    }

    if (rollNumber && rollNumber !== student.rollNumber) {
      const rollExists = await Student.findOne({ rollNumber });
      if (rollExists) {
        res.status(400);
        throw new Error('Roll Number in use');
      }
      student.rollNumber = rollNumber;
    }

    if (admissionNumber && admissionNumber !== student.admissionNumber) {
      const admExists = await Student.findOne({ admissionNumber });
      if (admExists) {
        res.status(400);
        throw new Error('Admission Number in use');
      }
      student.admissionNumber = admissionNumber;
    }

    // Update fields
    if (name) user.name = name;
    await user.save();

    if (className) student.class = className;
    if (dateOfBirth) student.dateOfBirth = new Date(dateOfBirth);
    if (gender) student.gender = gender;
    if (phone) student.phone = phone;
    if (address) student.address = address;
    if (avatar !== undefined) student.avatar = avatar;

    await student.save();

    const updatedStudent = await Student.findById(student._id).populate('user', '-password');

    res.status(200).json({
      success: true,
      data: updatedStudent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a student record and user account
// @route   DELETE /api/students/:id
// @access  Private (Admin)
const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      res.status(404);
      throw new Error('Student profile not found');
    }

    // Delete user
    await User.findByIdAndDelete(student.user);
    // Delete profile
    await Student.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Student account and profile deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
