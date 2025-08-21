import express from 'express';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';
import {
  checkIn,
  checkOut,
  getMyToday,
  getMyHistory,
  adminList,
  adminWeeklyReport,
} from '../controller/attendanceController.js';

const router = express.Router();

// Employee (self)
router.post('/checkin', protect, checkIn);
router.post('/checkout', protect, checkOut);
router.get('/today', protect, getMyToday);
router.get('/history', protect, getMyHistory);

// Admin
router.get('/admin/records', protect, requireAdmin, adminList);
router.get('/admin/report/weekly', protect, requireAdmin, adminWeeklyReport);

export default router;
