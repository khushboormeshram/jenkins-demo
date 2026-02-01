import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { uploadQuestionImage, deleteQuestionImage, uploadMiddleware, testS3Config } from '../controllers/upload.controller.js';

const router = express.Router();

// @route   POST /api/upload/question-image
// @desc    Upload question image to S3
// @access  Private (Teacher/Admin)
router.post('/question-image', uploadMiddleware, protect, authorize('teacher', 'admin'), uploadQuestionImage);

// @route   DELETE /api/upload/question-image/:key
// @desc    Delete question image from S3
// @access  Private (Teacher/Admin)
router.delete('/question-image/:key', protect, authorize('teacher', 'admin'), deleteQuestionImage);

// @route   GET /api/upload/test-s3
// @desc    Test S3 configuration
// @access  Private (Teacher/Admin)
router.get('/test-s3', protect, authorize('teacher', 'admin'), testS3Config);

export default router;