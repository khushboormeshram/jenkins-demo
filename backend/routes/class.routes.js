import express from 'express';
import {
    getClasses,
    getClass,
    createClass,
    updateClass,
    deleteClass,
    addStudents,
    addBulkStudents,
    getClassStudents,
    removeStudent,
    getClassAnalytics,
    getDashboardOverview
} from '../controllers/class.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require teacher authentication
router.use(protect);
router.use(authorize('teacher', 'admin'));

router.get('/dashboard/overview', getDashboardOverview);
router.get('/', getClasses);
router.post('/', createClass);
router.get('/:id', getClass);
router.put('/:id', updateClass);
router.delete('/:id', deleteClass);
router.get('/:id/students', getClassStudents);
router.post('/:id/students', addStudents);
router.post('/:id/students/bulk', addBulkStudents);
router.delete('/:id/students/:studentId', removeStudent);
router.get('/:id/analytics', getClassAnalytics);

export default router;
