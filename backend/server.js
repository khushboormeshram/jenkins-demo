import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import problemRoutes from './routes/problem.routes.js';
import submissionRoutes from './routes/submission.routes.js';
import contestRoutes from './routes/contest.routes.js';
import classRoutes from './routes/class.routes.js';
import announcementRoutes from './routes/announcement.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    // origin: '*',
    credentials: true
}));

// Upload routes - MUST be before body parsing middleware
app.use('/api/upload', uploadRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory (for local storage fallback)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/announcements', announcementRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Test upload endpoint
app.get('/api/upload/test', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Upload routes are working',
        uploadDir: path.join(__dirname, 'uploads/images')
    });
});

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);

    // Check Judge0 configuration
    console.log('DEBUG: All env vars related to JUDGE0:', Object.keys(process.env).filter(key => key.includes('JUDGE')));
    console.log('DEBUG: JUDGE0_API_URL value:', process.env.JUDGE0_API_URL);
    console.log('DEBUG: JUDGE0_API_URL type:', typeof process.env.JUDGE0_API_URL);

    if (!process.env.JUDGE0_API_URL) {
        console.warn('⚠️  WARNING: JUDGE0_API_URL is not configured!');
        console.warn('   Code execution will not work until you set JUDGE0_API_URL in your .env file');
        console.warn('   Example: JUDGE0_API_URL=https://ce.judge0.com');
    } else {
        console.log(`✅ Judge0 API configured: ${process.env.JUDGE0_API_URL}`);
    }
});
