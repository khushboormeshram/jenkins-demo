import apiClient from './api';

class UploadService {
    // Upload question image to S3
    async uploadQuestionImage(file) {
        const formData = new FormData();
        formData.append('questionImage', file);

        // Use fetch directly to avoid API client's automatic Content-Type header
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/upload/question-image`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                // Don't set Content-Type - let browser set it with boundary for FormData
            },
            body: formData
        });

        if (!response.ok) {
            let errorMessage = 'Upload failed';
            try {
                const data = await response.json();
                errorMessage = data.message || errorMessage;
            } catch (e) {
                errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }

        return await response.json();
    }

    // Delete question image from S3
    async deleteQuestionImage(imageUrl) {
        // Extract the key from the URL or use the URL directly
        let key = imageUrl;
        
        // If it's a full S3 URL, extract the key part
        if (imageUrl.startsWith('http')) {
            try {
                const url = new URL(imageUrl);
                if (url.hostname.includes('.s3.')) {
                    // Format: https://bucket-name.s3.region.amazonaws.com/path/to/file
                    key = url.pathname.substring(1); // Remove leading slash
                } else if (url.hostname.startsWith('s3.')) {
                    // Format: https://s3.region.amazonaws.com/bucket-name/path/to/file
                    const pathParts = url.pathname.split('/');
                    key = pathParts.slice(2).join('/'); // Remove bucket name and leading slash
                }
            } catch (error) {
                console.error('Error parsing S3 URL:', error);
                // Use the original URL as key if parsing fails
            }
        }
        
        // Encode the key to handle special characters in URLs
        const encodedKey = encodeURIComponent(key);
        return await apiClient.delete(`/upload/question-image/${encodedKey}`);
    }

    // Test S3 configuration
    async testS3Config() {
        return await apiClient.get('/upload/test-s3');
    }

    // Get full image URL (for S3, URLs are already complete)
    getImageUrl(imagePath) {
        if (!imagePath) return null;
        
        // If it's already a full URL (S3 URL), return as is
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        
        // For backward compatibility with local files
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        return `${baseUrl}${imagePath}`;
    }

    // Validate image file
    validateImageFile(file) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(file.type)) {
            throw new Error('Only JPEG, JPG, PNG, GIF, and WebP images are allowed');
        }

        if (file.size > maxSize) {
            throw new Error('Image size must be less than 5MB');
        }

        return true;
    }

    // Check if URL is an S3 URL
    isS3Url(url) {
        if (!url || typeof url !== 'string') return false;
        return url.includes('.s3.') || url.includes('s3.amazonaws.com');
    }

    // Extract filename from S3 URL for display purposes
    getFilenameFromUrl(url) {
        if (!url) return '';
        
        try {
            if (this.isS3Url(url)) {
                const urlObj = new URL(url);
                const pathParts = urlObj.pathname.split('/');
                return pathParts[pathParts.length - 1]; // Get the last part (filename)
            }
            
            // For local files
            return url.split('/').pop();
        } catch (error) {
            console.error('Error extracting filename from URL:', error);
            return 'image';
        }
    }
}

export const uploadService = new UploadService();
export default uploadService;