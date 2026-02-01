import apiClient from './api';

class AuthService {
    // Register new user
    async register(userData) {
        const response = await apiClient.post('/auth/register', userData, { auth: false });
        if (response.success && response.data.token) {
            this.setToken(response.data.token);
            this.setUser(response.data.user);
        }
        return response;
    }

    // Login user
    async login(credentials) {
        const response = await apiClient.post('/auth/login', credentials, { auth: false });
        if (response.success && response.data.token) {
            this.setToken(response.data.token);
            this.setUser(response.data.user);
            if (response.data.refreshToken) {
                localStorage.setItem('refreshToken', response.data.refreshToken);
            }
        }
        return response;
    }

    // Google OAuth login
    async googleLogin(credential) {
        const response = await apiClient.post('/auth/google', { credential }, { auth: false });
        if (response.success && response.data.token) {
            this.setToken(response.data.token);
            this.setUser(response.data.user);
            if (response.data.refreshToken) {
                localStorage.setItem('refreshToken', response.data.refreshToken);
            }
        }
        return response;
    }

    // Google OAuth login with role selection (for new users)
    async googleLoginWithRole(credential, role) {
        const response = await apiClient.post('/auth/google', { credential, role }, { auth: false });
        if (response.success && response.data.token) {
            this.setToken(response.data.token);
            this.setUser(response.data.user);
            if (response.data.refreshToken) {
                localStorage.setItem('refreshToken', response.data.refreshToken);
            }
        }
        return response;
    }

    // Logout user
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }

    // Get current user
    async getCurrentUser() {
        try {
            const response = await apiClient.get('/auth/me');
            if (response.success) {
                this.setUser(response.data.user);
                return response.data.user;
            }
        } catch (error) {
            console.error('Failed to get current user:', error);
            return null;
        }
    }

    // Update profile
    async updateProfile(profileData) {
        const response = await apiClient.put('/auth/profile', profileData);
        if (response.success) {
            this.setUser(response.data.user);
        }
        return response;
    }

    // Forgot password
    async forgotPassword(email) {
        return await apiClient.post('/auth/forgot-password', { email }, { auth: false });
    }

    // Reset password
    async resetPassword(token, password) {
        return await apiClient.post('/auth/reset-password', { token, password }, { auth: false });
    }

    // Set token in localStorage
    setToken(token) {
        localStorage.setItem('token', token);
    }

    // Get token from localStorage
    getToken() {
        return localStorage.getItem('token');
    }

    // Set user in localStorage
    setUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    }

    // Get user from localStorage
    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.getToken();
    }

    // Check if user is teacher
    isTeacher() {
        const user = this.getUser();
        return user && (user.role === 'teacher' || user.role === 'admin');
    }

    // Check if user is admin
    isAdmin() {
        const user = this.getUser();
        return user && user.role === 'admin';
    }
}

export const authService = new AuthService();
export default authService;
