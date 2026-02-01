import express from 'express';
import {
    getContests,
    getContest,
    createContest,
    updateContest,
    deleteContest,
    registerForContest,
    getLeaderboard,
    downloadContestReport,
    getStudentContestSubmissions,
    sendContestNotifications,
    testEmailConfig
} from '../controllers/contest.controller.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes (with optional auth to check user role)
router.get('/', optionalAuth, getContests);
router.get('/:id', optionalAuth, getContest);
router.get('/:id/leaderboard', getLeaderboard);

// Protected routes
router.post('/:id/register', protect, registerForContest);

// Teacher/Admin only
router.post('/', protect, authorize('teacher', 'admin'), createContest);
router.put('/:id', protect, authorize('teacher', 'admin'), updateContest);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteContest);
router.get('/:id/report', protect, authorize('teacher', 'admin'), downloadContestReport);
router.get('/:id/student/:studentId/submissions', protect, authorize('teacher', 'admin'), getStudentContestSubmissions);

// Email notification routes
router.post('/:id/notify', protect, authorize('teacher', 'admin'), sendContestNotifications);
router.get('/test-email', protect, authorize('teacher', 'admin'), testEmailConfig);

export default router;
