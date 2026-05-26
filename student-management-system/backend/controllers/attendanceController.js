const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

// @desc    Mark attendance for multiple students
// @route   POST /api/attendance
// @access  Private (Admin & Teacher)
const markAttendance = async (req, res, next) => {
  const { courseId, date, attendanceRecords } = req.body; // records: [{ studentId, status: 'Present'|'Absent'|'Late' }]

  try {
    if (!courseId || !attendanceRecords || !Array.isArray(attendanceRecords)) {
      res.status(400);
      throw new Error('Please supply courseId and a list of student attendance records');
    }

    const attendanceDate = date ? new Date(date) : new Date();
    // Normalize date to remove time portion (so check-ins are recorded once per day)
    attendanceDate.setHours(0, 0, 0, 0);

    const savedRecords = [];

    for (const record of attendanceRecords) {
      const { studentId, status } = record;

      // Upsert attendance record
      const updatedRecord = await Attendance.findOneAndUpdate(
        {
          student: studentId,
          course: courseId,
          date: attendanceDate,
        },
        {
          status: status || 'Present',
          markedBy: req.user._id,
        },
        {
          upstert: true,
          new: true,
          setDefaultsOnInsert: true,
          upsert: true, // spell check update
        }
      );

      savedRecords.push(updatedRecord);
    }

    res.status(200).json({
      success: true,
      message: `Attendance marked successfully for ${savedRecords.length} student(s)`,
      data: savedRecords,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance records with stats
// @route   GET /api/attendance
// @access  Private
const getAttendance = async (req, res, next) => {
  const { courseId, studentId, date } = req.query;

  try {
    const query = {};
    if (courseId) query.course = courseId;
    if (studentId) query.student = studentId;

    if (date) {
      const queryDate = new Date(date);
      queryDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(queryDate);
      nextDay.setDate(queryDate.getDate() + 1);

      query.date = {
        $gte: queryDate,
        $lt: nextDay,
      };
    }

    const attendanceList = await Attendance.find(query)
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email' },
      })
      .populate('course', 'name code')
      .populate('markedBy', 'name')
      .sort({ date: -1 });

    // Calculate metadata/statistics
    const totalCount = attendanceList.length;
    const presentCount = attendanceList.filter((a) => a.status === 'Present').length;
    const absentCount = attendanceList.filter((a) => a.status === 'Absent').length;
    const lateCount = attendanceList.filter((a) => a.status === 'Late').length;

    res.status(200).json({
      success: true,
      data: attendanceList,
      stats: {
        total: totalCount,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        percentage: totalCount > 0 ? ((presentCount + lateCount) / totalCount) * 100 : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  markAttendance,
  getAttendance,
};
