const Course = require('../models/Course');
const Student = require('../models/Student');

// @desc    Get all courses with details
// @route   GET /api/courses
// @access  Private
const getCourses = async (req, res, next) => {
  try {
    const searchQuery = req.query.search || '';
    const query = {};

    if (searchQuery) {
      query.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { code: { $regex: searchQuery, $options: 'i' } },
      ];
    }

    const courses = await Course.find(query)
      .populate({
        path: 'teacher',
        populate: { path: 'user', select: 'name email' },
      })
      .populate({
        path: 'students',
        populate: { path: 'user', select: 'name email' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get course by ID
// @route   GET /api/courses/:id
// @access  Private
const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate({
        path: 'teacher',
        populate: { path: 'user', select: 'name email' },
      })
      .populate({
        path: 'students',
        populate: { path: 'user', select: 'name email' },
      });

    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create course
// @route   POST /api/courses
// @access  Private (Admin)
const createCourse = async (req, res, next) => {
  const { name, code, description, teacher, credits, duration } = req.body;

  try {
    if (!name || !code) {
      res.status(400);
      throw new Error('Please provide course name and unique code');
    }

    const courseExists = await Course.findOne({ code });
    if (courseExists) {
      res.status(400);
      throw new Error('Course code already exists');
    }

    const course = await Course.create({
      name,
      code,
      description,
      teacher: teacher || null,
      credits: credits || 3,
      duration: duration || '1 Semester',
    });

    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Admin)
const updateCourse = async (req, res, next) => {
  const { name, code, description, teacher, credits, duration } = req.body;

  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    if (code && code !== course.code) {
      const codeExists = await Course.findOne({ code });
      if (codeExists) {
        res.status(400);
        throw new Error('Code is already assigned to another course');
      }
      course.code = code;
    }

    if (name) course.name = name;
    if (description !== undefined) course.description = description;
    if (teacher !== undefined) course.teacher = teacher || null;
    if (credits) course.credits = credits;
    if (duration) course.duration = duration;

    await course.save();

    const updatedCourse = await Course.findById(course._id)
      .populate({
        path: 'teacher',
        populate: { path: 'user', select: 'name email' },
      })
      .populate({
        path: 'students',
        populate: { path: 'user', select: 'name email' },
      });

    res.status(200).json({
      success: true,
      data: updatedCourse,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Admin)
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Course has been deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Enroll student in course
// @route   POST /api/courses/:id/enroll
// @access  Private (Admin & Teacher)
const enrollStudent = async (req, res, next) => {
  const { studentId } = req.body;

  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404);
      throw new Error('Student not found');
    }

    // Check if already enrolled
    if (course.students.includes(studentId)) {
      res.status(400);
      throw new Error('Student is already registered in this course');
    }

    course.students.push(studentId);
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Student enrolled successfully',
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unenroll student from course
// @route   POST /api/courses/:id/unenroll
// @access  Private (Admin & Teacher)
const unenrollStudent = async (req, res, next) => {
  const { studentId } = req.body;

  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    course.students = course.students.filter((id) => id.toString() !== studentId.toString());
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Student unenrolled successfully',
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollStudent,
  unenrollStudent,
};
