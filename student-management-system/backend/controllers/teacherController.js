const Teacher = require('../models/Teacher');
const User = require('../models/User');

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Private (Admin & Teacher & Student)
const getTeachers = async (req, res, next) => {
  try {
    const searchQuery = req.query.search || '';
    const departmentFilter = req.query.department || '';

    let userIds = [];
    if (searchQuery) {
      const matchingUsers = await User.find({
        role: 'teacher',
        name: { $regex: searchQuery, $options: 'i' },
      });
      userIds = matchingUsers.map((u) => u._id);
    }

    const query = {};
    if (departmentFilter) {
      query.department = departmentFilter;
    }

    if (searchQuery) {
      query.$or = [
        { employeeId: { $regex: searchQuery, $options: 'i' } },
        { phone: { $regex: searchQuery, $options: 'i' } },
      ];
      if (userIds.length > 0) {
        query.$or.push({ user: { $in: userIds } });
      }
    }

    const teachers = await Teacher.find(query).populate('user', '-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: teachers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get teacher by ID
// @route   GET /api/teachers/:id
// @access  Private
const getTeacherById = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('user', '-password');

    if (!teacher) {
      res.status(404);
      throw new Error('Teacher registry not found');
    }

    res.status(200).json({
      success: true,
      data: teacher,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a teacher (Creates User and Teacher companion profiles)
// @route   POST /api/teachers
// @access  Private (Admin)
const createTeacher = async (req, res, next) => {
  const { name, email, password, employeeId, department, qualification, designation, phone } = req.body;

  try {
    if (!name || !email || !password || !employeeId || !department) {
      res.status(400);
      throw new Error('Required files name, email, password, employeeId, department must be filled');
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error('Email already registered');
    }

    const employeeIdExists = await Teacher.findOne({ employeeId });
    if (employeeIdExists) {
      res.status(400);
      throw new Error('Employee ID already assigned');
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'teacher',
    });

    const teacher = await Teacher.create({
      user: user._id,
      employeeId,
      department,
      qualification: qualification || 'Master Degree',
      designation: designation || 'Lecturer',
      phone: phone || '000-000-0000',
    });

    res.status(201).json({
      success: true,
      data: {
        _id: teacher._id,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        employeeId: teacher.employeeId,
        department: teacher.department,
        qualification: teacher.qualification,
        designation: teacher.designation,
        phone: teacher.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update teacher profile
// @route   PUT /api/teachers/:id
// @access  Private (Admin)
const updateTeacher = async (req, res, next) => {
  const { name, email, employeeId, department, qualification, designation, phone } = req.body;

  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      res.status(404);
      throw new Error('Teacher record not found');
    }

    const user = await User.findById(teacher.user);
    if (!user) {
      res.status(404);
      throw new Error('User record mismatch');
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        res.status(400);
        throw new Error('Email already details active user');
      }
      user.email = email;
    }

    if (employeeId && employeeId !== teacher.employeeId) {
      const empExists = await Teacher.findOne({ employeeId });
      if (empExists) {
        res.status(400);
        throw new Error('Employee ID in use');
      }
      teacher.employeeId = employeeId;
    }

    if (name) user.name = name;
    await user.save();

    if (department) teacher.department = department;
    if (qualification) teacher.qualification = qualification;
    if (designation) teacher.designation = designation;
    if (phone) teacher.phone = phone;

    await teacher.save();

    const updatedTeacher = await Teacher.findById(teacher._id).populate('user', '-password');

    res.status(200).json({
      success: true,
      data: updatedTeacher,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a teacher record and user account
// @route   DELETE /api/teachers/:id
// @access  Private (Admin)
const deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      res.status(404);
      throw new Error('Teacher record not found');
    }

    await User.findByIdAndDelete(teacher.user);
    await Teacher.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Teacher record and user profile deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
};
