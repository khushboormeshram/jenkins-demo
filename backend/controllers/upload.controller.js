import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if S3 is configured
const isS3Configured = () => {
    return !!(
        process.env.AWS_ACCESS_KEY_ID &&
        process.env.AWS_SECRET_ACCESS_KEY &&
        process.env.AWS_REGION &&
        process.env.AWS_S3_BUCKET_NAME
    );
};

// Lazy load S3 service only when needed
let s3Service = null;
const getS3Service = async () => {
    if (!s3Service && isS3Configured()) {
        try {
            const { default: S3Service } = await import('../services/s3Service.js');
            s3Service = S3Service;
        } catch (error) {
            console.error('Failed to load S3 service:', error);
            return null;
        }
    }
    return s3Service;
};

// Setup local storage directory
const uploadsDir = path.join(__dirname, '../uploads/images');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Always use memory storage for now to handle both S3 and local
const storage = multer.memoryStorage();

// File filter to only allow images
const fileFilter = (req, file, cb) => {
    console.log('File filter called:', {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype
    });

    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed!'));
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: fileFilter
});

// @desc    Upload question image (S3 or local)
// @route   POST /api/upload/question-image
// @access  Private (Teacher)
export const uploadQuestionImage = async (req, res) => {
    try {
        console.log('Upload controller called');
        console.log('Request file:', req.file);
        console.log('Request body:', req.body);

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded. Make sure to select a file and use the field name "questionImage".'
            });
        }

        console.log('File received:', {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });

        // Try S3 upload first if configured
        if (isS3Configured()) {
            console.log('S3 is configured, attempting S3 upload...');
            const s3 = await getS3Service();
            if (s3) {
                try {
                    const uploadResult = await s3.uploadFile(req.file);
                    
                    if (uploadResult.success) {
                        console.log('S3 upload successful');
                        return res.status(200).json({
                            success: true,
                            message: 'Image uploaded successfully to S3',
                            data: {
                                filename: uploadResult.data.key,
                                originalName: uploadResult.data.originalName,
                                size: uploadResult.data.size,
                                url: uploadResult.data.url,
                                bucket: uploadResult.data.bucket,
                                contentType: uploadResult.data.contentType,
                                storage: 'S3'
                            }
                        });
                    } else {
                        console.error('S3 upload failed:', uploadResult.error);
                        // Fall back to local storage
                    }
                } catch (s3Error) {
                    console.error('S3 upload error:', s3Error);
                    // Fall back to local storage
                }
            }
        }

        // Local storage fallback
        console.log('Using local storage fallback...');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(req.file.originalname);
        const filename = `question-${uniqueSuffix}${extension}`;
        const filePath = path.join(uploadsDir, filename);

        // Write file to local storage
        fs.writeFileSync(filePath, req.file.buffer);
        
        const imageUrl = `/uploads/images/${filename}`;
        
        console.log('Local storage successful:', imageUrl);
        
        res.status(200).json({
            success: true,
            message: isS3Configured() ? 'Image uploaded to local storage (S3 fallback)' : 'Image uploaded successfully to local storage',
            data: {
                filename: filename,
                originalName: req.file.originalname,
                size: req.file.size,
                url: imageUrl,
                storage: 'Local'
            }
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete uploaded image (S3 or local)
// @route   DELETE /api/upload/question-image/:key
// @access  Private (Teacher)
export const deleteQuestionImage = async (req, res) => {
    try {
        const { key } = req.params;
        console.log('Delete request for key:', key);

        // Check if it's an S3 URL
        if (key.startsWith('http') && (key.includes('.s3.') || key.includes('s3.amazonaws.com'))) {
            const s3 = await getS3Service();
            if (s3) {
                try {
                    let s3Key = s3.extractKeyFromUrl(key);
                    if (!s3Key) {
                        return res.status(400).json({
                            success: false,
                            message: 'Invalid S3 URL format'
                        });
                    }

                    const deleteResult = await s3.deleteFile(s3Key);
                    
                    if (deleteResult.success) {
                        return res.status(200).json({
                            success: true,
                            message: 'Image deleted successfully from S3'
                        });
                    } else {
                        return res.status(500).json({
                            success: false,
                            message: `Failed to delete from S3: ${deleteResult.error}`
                        });
                    }
                } catch (s3Error) {
                    console.error('S3 delete error:', s3Error);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to delete from S3'
                    });
                }
            }
        }

        // Local file deletion
        const filename = key.includes('/') ? key.split('/').pop() : key;
        const filePath = path.join(uploadsDir, filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        fs.unlinkSync(filePath);

        res.status(200).json({
            success: true,
            message: 'Image deleted successfully from local storage'
        });

    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Test S3 configuration
// @route   GET /api/upload/test-s3
// @access  Private (Teacher/Admin)
export const testS3Config = async (req, res) => {
    try {
        if (!isS3Configured()) {
            return res.status(400).json({
                success: false,
                message: 'S3 configuration is incomplete. Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, and AWS_S3_BUCKET_NAME in your environment variables.',
                config: {
                    hasAccessKeyId: !!process.env.AWS_ACCESS_KEY_ID,
                    hasSecretAccessKey: !!process.env.AWS_SECRET_ACCESS_KEY,
                    hasRegion: !!process.env.AWS_REGION,
                    hasBucketName: !!process.env.AWS_S3_BUCKET_NAME
                }
            });
        }

        const s3 = await getS3Service();
        if (!s3) {
            return res.status(500).json({
                success: false,
                message: 'Failed to initialize S3 service'
            });
        }

        const configValidation = s3.validateConfig();
        
        if (configValidation.success) {
            res.status(200).json({
                success: true,
                message: 'S3 configuration is valid and ready to use',
                config: {
                    region: process.env.AWS_REGION,
                    bucket: process.env.AWS_S3_BUCKET_NAME,
                    hasCredentials: true
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: configValidation.message
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `S3 test failed: ${error.message}`
        });
    }
};

// @desc    Get storage info
// @route   GET /api/upload/storage-info
// @access  Private (Teacher/Admin)
export const getStorageInfo = async (req, res) => {
    try {
        const storageType = isS3Configured() ? 'S3' : 'Local';
        
        res.status(200).json({
            success: true,
            data: {
                storageType,
                isS3Configured: isS3Configured(),
                config: isS3Configured() ? {
                    region: process.env.AWS_REGION,
                    bucket: process.env.AWS_S3_BUCKET_NAME
                } : {
                    localPath: uploadsDir
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Export the multer upload middleware with error handling
export const uploadMiddleware = (req, res, next) => {
    const multerUpload = upload.single('questionImage');
    
    multerUpload(req, res, (err) => {
        if (err) {
            console.error('Multer error:', err);
            
            // Handle multer errors
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'File size too large. Maximum size is 5MB.'
                });
            }
            if (err.message.includes('Only image files')) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
            if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                return res.status(400).json({
                    success: false,
                    message: 'Unexpected field name. Use "questionImage" as the field name.'
                });
            }
            return res.status(400).json({
                success: false,
                message: err.message || 'File upload error'
            });
        }
        
        console.log('Multer processed successfully, file:', req.file ? 'present' : 'missing');
        next();
    });
};