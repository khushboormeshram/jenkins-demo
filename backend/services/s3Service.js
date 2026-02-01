import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import path from 'path';

class S3Service {
    constructor() {
        this.s3Client = new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });
        this.bucketName = process.env.AWS_S3_BUCKET_NAME;
    }

    // Generate unique filename
    generateFileName(originalName) {
        const timestamp = Date.now();
        const randomString = crypto.randomBytes(8).toString('hex');
        const extension = path.extname(originalName);
        return `question-images/${timestamp}-${randomString}${extension}`;
    }

    // Upload file to S3
    async uploadFile(file, folder = 'question-images') {
        try {
            const fileName = this.generateFileName(file.originalname);
            
            const uploadParams = {
                Bucket: this.bucketName,
                Key: fileName,
                Body: file.buffer,
                ContentType: file.mimetype,
                ContentDisposition: 'inline'
                // Removed ACL since modern S3 buckets don't support it
                // Public access is handled by bucket policy
            };

            const command = new PutObjectCommand(uploadParams);
            const result = await this.s3Client.send(command);

            // Generate the public URL
            const publicUrl = `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

            return {
                success: true,
                data: {
                    key: fileName,
                    url: publicUrl,
                    bucket: this.bucketName,
                    etag: result.ETag,
                    size: file.size,
                    originalName: file.originalname,
                    contentType: file.mimetype,
                }
            };
        } catch (error) {
            console.error('S3 Upload Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Delete file from S3
    async deleteFile(key) {
        try {
            const deleteParams = {
                Bucket: this.bucketName,
                Key: key,
            };

            const command = new DeleteObjectCommand(deleteParams);
            await this.s3Client.send(command);

            return {
                success: true,
                message: 'File deleted successfully from S3'
            };
        } catch (error) {
            console.error('S3 Delete Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Generate presigned URL for temporary access (if needed)
    async getPresignedUrl(key, expiresIn = 3600) {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });

            return {
                success: true,
                url: signedUrl
            };
        } catch (error) {
            console.error('S3 Presigned URL Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Validate S3 configuration
    validateConfig() {
        const requiredEnvVars = [
            'AWS_ACCESS_KEY_ID',
            'AWS_SECRET_ACCESS_KEY',
            'AWS_REGION',
            'AWS_S3_BUCKET_NAME'
        ];

        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

        if (missingVars.length > 0) {
            return {
                success: false,
                message: `Missing AWS S3 configuration: ${missingVars.join(', ')}`
            };
        }

        return {
            success: true,
            message: 'AWS S3 configuration is valid'
        };
    }

    // Extract S3 key from URL
    extractKeyFromUrl(url) {
        try {
            // Handle both formats:
            // https://bucket-name.s3.region.amazonaws.com/path/to/file
            // https://s3.region.amazonaws.com/bucket-name/path/to/file
            
            const urlObj = new URL(url);
            
            if (urlObj.hostname.includes('.s3.')) {
                // Format: https://bucket-name.s3.region.amazonaws.com/path/to/file
                return urlObj.pathname.substring(1); // Remove leading slash
            } else if (urlObj.hostname.startsWith('s3.')) {
                // Format: https://s3.region.amazonaws.com/bucket-name/path/to/file
                const pathParts = urlObj.pathname.split('/');
                return pathParts.slice(2).join('/'); // Remove bucket name and leading slash
            }
            
            return null;
        } catch (error) {
            console.error('Error extracting S3 key from URL:', error);
            return null;
        }
    }
}

export const s3Service = new S3Service();
export default s3Service;