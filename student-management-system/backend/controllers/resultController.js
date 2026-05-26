const Result = require('../models/Result');
const Student = require('../models/Student');
const Course = require('../models/Course');

// Helper to determine letter grade
const calculateGrade = (score, outOf = 100) => {
  const percentage = (score / outOf) * 100;
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
};

// @desc    Enter or update a student result
// @route   POST /api/results
// @access  Private (Admin & Teacher)
const enterResult = async (req, res, next) => {
  const { studentId, courseId, marksObtained, totalMarks, remarks, term, examDate } = req.body;

  try {
    if (!studentId || !courseId || marksObtained === undefined) {
      res.status(400);
      throw new Error('Please provide studentId, courseId and marksObtained');
    }

    const calculatedTotal = totalMarks || 100;
    const grade = calculateGrade(marksObtained, calculatedTotal);

    // Upsert Result record
    const result = await Result.findOneAndUpdate(
      {
        student: studentId,
        course: courseId,
        term: term || 'Final',
      },
      {
        marksObtained,
        totalMarks: calculatedTotal,
        grade,
        remarks: remarks || '',
        examDate: examDate ? new Date(examDate) : new Date(),
        enteredBy: req.user._id,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({
      success: true,
      message: 'Result entered successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get results
// @route   GET /api/results
// @access  Private
const getResults = async (req, res, next) => {
  const { studentId, courseId, term } = req.query;

  try {
    const query = {};
    if (studentId) query.student = studentId;
    if (courseId) query.course = courseId;
    if (term) query.term = term;

    const results = await Result.find(query)
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email' },
      })
      .populate('course', 'name code credits')
      .populate('enteredBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get compiled student report card
// @route   GET /api/results/reportcard/:studentId
// @access  Private
const getStudentReportCard = async (req, res, next) => {
  const { studentId } = req.params;

  try {
    const student = await Student.findById(studentId).populate('user', 'name email');
    if (!student) {
      res.status(404);
      throw new Error('Student profile not found');
    }

    // Auth verification: Students can only fetch their own scorecards
    if (req.user.role === 'student' && student.user._id.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Access denied. You cannot view other students scorecards.');
    }

    const results = await Result.find({ student: studentId })
      .populate('course', 'name code credits duration')
      .populate('enteredBy', 'name');

    // Calculate cumulative grade variables
    let totalMarksObtained = 0;
    let totalMaxMarks = 0;
    let passedCount = 0;

    results.forEach((r) => {
      totalMarksObtained += r.marksObtained;
      totalMaxMarks += r.totalMarks;
      if (r.grade !== 'F') {
        passedCount++;
      }
    });

    const averagePercentage = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : 0;
    const finalGPA = (averagePercentage / 100) * 4.0; // Estimate on standard 4.0 scale

    res.status(200).json({
      success: true,
      data: {
        student: {
          _id: student._id,
          name: student.user.name,
          email: student.user.email,
          rollNumber: student.rollNumber,
          class: student.class,
        },
        subjects: results,
        summary: {
          totalCourses: results.length,
          passed: passedCount,
          failed: results.length - passedCount,
          gpa: finalGPA.toFixed(2),
          overallPercentage: averagePercentage.toFixed(1),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  enterResult,
  getResults,
  getStudentReportCard,
};
