import { createContext, useContext, useState, useEffect } from 'react';
import { tokenStorage } from '../utils/tokenStorage';
import { userService } from '../services/userService';

const AuthContext = createContext(null);

// ID ролей відповідно до бекенду (seeder: 1=Member, 2=Manager, 3=Admin)
const ROLE_NAMES = { 1: 'Member', 2: 'Manager', 3: 'Admin' };

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchCurrentUser = async () => {
        const token = tokenStorage.getAccessToken();
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const response = await userService.getMe();
            setUser(response.data);
        } catch {
            tokenStorage.clearTokens();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    const login = (userData, accessToken, refreshToken) => {
        tokenStorage.setTokens(accessToken, refreshToken);
        setUser(userData);
    };

    const logout = () => {
        tokenStorage.clearTokens();
        setUser(null);
    };

    const roleName = user ? (ROLE_NAMES[user.role_id] || 'Member') : null;
    const isManager = roleName === 'Manager' || roleName === 'Admin';
    const isAdmin = roleName === 'Admin';

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            isAuthenticated: !!user,
            role: roleName,
            isManager,
            isAdmin,
            login,
            logout,
            refreshUser: fetchCurrentUser,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
