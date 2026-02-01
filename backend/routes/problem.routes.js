import express from 'express';
import {
    getProblems,
    getProblem,
    createProblem,
    updateProblem,
    deleteProblem,
    getProblemStats
} from '../controllers/problem.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getProblems);
router.get('/stats', getProblemStats);
router.get('/:id', getProblem);

// Protected routes (Teacher/Admin only)
router.post('/', protect, authorize('teacher', 'admin'), createProblem);
router.put('/:id', protect, authorize('teacher', 'admin'), updateProblem);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteProblem);

export default router;
