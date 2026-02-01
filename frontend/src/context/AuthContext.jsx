import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check if user is logged in on mount
        const initAuth = async () => {
            const token = authService.getToken();
            if (token) {
                try {
                    const currentUser = await authService.getCurrentUser();
                    if (currentUser) {
                        setUser(currentUser);
                        setIsAuthenticated(true);
                    }
                } catch (error) {
                    console.error('Failed to get current user:', error);
                    authService.logout();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (credentials) => {
        try {
            const response = await authService.login(credentials);
            if (response.success) {
                setUser(response.data.user);
                setIsAuthenticated(true);
                return { success: true };
            }
            return { success: false, message: response.message };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    const register = async (userData) => {
        try {
            const response = await authService.register(userData);
            if (response.success) {
                setUser(response.data.user);
                setIsAuthenticated(true);
                return { success: true };
            }
            return { success: false, message: response.message };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        authService.setUser(updatedUser);
    };

    const value = useMemo(() => ({
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
        isTeacher: user?.role === 'teacher' || user?.role === 'admin',
        isAdmin: user?.role === 'admin',
    }), [user, loading, isAuthenticated]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
