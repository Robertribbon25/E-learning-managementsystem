const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const generateToken = require('../utils/generateToken');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Find extra profile details if any
      let profile = null;
      if (user.role === 'student') {
        profile = await Student.findOne({ user: user._id });
      } else if (user.role === 'teacher') {
        profile = await Teacher.findOne({ user: user._id });
      }

      res.status(200).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profile: profile || undefined,
        },
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new user (and create student/teacher profiles if needed)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  const { name, email, password, role, profileData } = req.body;

  try {
    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please provide name, email, and password');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists with that email');
    }

    // Create base user
    const userRole = role || 'student';
    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
    });

    let profile = null;

    // Create role profile if student/teacher
    if (userRole === 'student') {
      const data = profileData || {};
      const generatedRoll = data.rollNumber || `S-${Math.floor(100000 + Math.random() * 900000)}`;
      const generatedAdd = data.admissionNumber || `ADM-${Math.floor(1000 + Math.random() * 9000)}`;

      profile = await Student.create({
        user: user._id,
        rollNumber: generatedRoll,
        admissionNumber: generatedAdd,
        class: data.class || 'Class 10A',
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : new Date('2007-01-01'),
        gender: data.gender || 'Male',
        phone: data.phone || '000-000-0000',
        address: data.address || 'Not Provided',
      });
    } else if (userRole === 'teacher') {
      const data = profileData || {};
      const generatedEmp = data.employeeId || `T-${Math.floor(1000 + Math.random() * 9000)}`;

      profile = await Teacher.create({
        user: user._id,
        employeeId: generatedEmp,
        department: data.department || 'General Science',
        qualification: data.qualification || 'Bachelor of Science / Education',
        designation: data.designation || 'Lecturer',
        phone: data.phone || '000-000-0000',
      });
    }

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: profile || undefined,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      let profile = null;
      if (user.role === 'student') {
        profile = await Student.findOne({ user: user._id });
      } else if (user.role === 'teacher') {
        profile = await Teacher.findOne({ user: user._id });
      }

      res.status(200).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profile,
        },
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { loginUser, registerUser, getMe };
