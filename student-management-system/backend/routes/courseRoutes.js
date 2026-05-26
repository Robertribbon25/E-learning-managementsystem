const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollStudent,
  unenrollStudent,
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(protect, getCourses)
  .post(protect, authorize('admin'), createCourse);

router
  .route('/:id')
  .get(protect, getCourseById)
  .put(protect, authorize('admin'), updateCourse)
  .delete(protect, authorize('admin'), deleteCourse);

router.post('/:id/enroll', protect, authorize('admin', 'teacher'), enrollStudent);
router.post('/:id/unenroll', protect, authorize('admin', 'teacher'), unenrollStudent);

module.exports = router;
