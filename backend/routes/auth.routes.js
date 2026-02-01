import express from 'express';
import {
    register,
    login,
    getMe,
    updateProfile,
    forgotPassword,
    resetPassword,
    refreshToken,
    googleAuth
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateRegister, validateLogin } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh-token', refreshToken);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;
