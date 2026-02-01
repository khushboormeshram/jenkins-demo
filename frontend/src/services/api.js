// API Client Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
    constructor() {
        this.baseURL = API_URL;
    }

    // Get auth token from localStorage
    getToken() {
        return localStorage.getItem('token');
    }

    // Get default headers
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (includeAuth) {
            const token = this.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(options.auth !== false),
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            
            // Handle network errors or non-JSON responses
            if (!response.ok) {
                let errorMessage = 'Something went wrong';
                try {
                    const data = await response.json();
                    errorMessage = data.message || errorMessage;
                } catch (e) {
                    // Response is not JSON
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Error:', error);
            // Re-throw with more context
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Cannot connect to server. Please make sure the backend is running.');
            }
            throw error;
        }
    }

    // GET request
    async get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    // POST request
    async post(endpoint, data, options = {}) {
        const config = {
            ...options,
            method: 'POST',
        };

        // Handle FormData differently - don't set Content-Type
        if (data instanceof FormData) {
            config.body = data;
            // Remove Content-Type from headers to let browser set it with boundary
            const headers = { ...this.getHeaders(options.auth !== false) };
            delete headers['Content-Type'];
            config.headers = { ...headers, ...options.headers };
        } else {
            config.body = JSON.stringify(data);
            config.headers = {
                ...this.getHeaders(options.auth !== false),
                ...options.headers,
            };
        }

        return this.request(endpoint, config);
    }

    // PUT request
    async put(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // DELETE request
    async delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }
}

export const apiClient = new ApiClient();
export default apiClient;
