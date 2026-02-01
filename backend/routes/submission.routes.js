import express from 'express';
import {
    createSubmission,
    getUserSubmissions,
    getProblemSubmissions,
    getSubmission,
    getUserStats,
    getAllSubmissions,
    runCode,
    updateSubmissionScore
} from '../controllers/submission.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/run', runCode);
router.post('/', createSubmission);
router.get('/stats/user', getUserStats);
router.get('/', authorize('teacher', 'admin'), getAllSubmissions);
router.get('/user/:userId', getUserSubmissions);
router.get('/problem/:problemId', authorize('teacher', 'admin'), getProblemSubmissions);
router.put('/:id/score', authorize('teacher', 'admin'), updateSubmissionScore);
router.get('/:id', getSubmission);

export default router;
