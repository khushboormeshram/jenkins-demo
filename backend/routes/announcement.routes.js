import express from 'express';
import {
    getAnnouncements,
    getAnnouncement,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement
} from '../controllers/announcement.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public/Student routes
router.get('/', protect, getAnnouncements);
router.get('/:id', protect, getAnnouncement);

// Teacher/Admin only
router.post('/', protect, authorize('teacher', 'admin'), createAnnouncement);
router.put('/:id', protect, authorize('teacher', 'admin'), updateAnnouncement);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteAnnouncement);

export default router;
