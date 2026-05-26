const express = require('express');
const router = express.Router();
const { enterResult, getResults, getStudentReportCard } = require('../controllers/resultController');
const { protect, authorize } = require('../middleware/authMiddleware');

router
  .route('/')
  .post(protect, authorize('admin', 'teacher'), enterResult)
  .get(protect, getResults);

router.get('/reportcard/:studentId', protect, getStudentReportCard);

module.exports = router;
