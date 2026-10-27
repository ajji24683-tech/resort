import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('yashiii_token'));

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      const savedToken = localStorage.getItem('yashiii_token');
      if (savedToken) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data.data.user);
          setToken(savedToken);
        } catch {
          localStorage.removeItem('yashiii_token');
          localStorage.removeItem('yashiii_user');
          setToken(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { user: userData, token: newToken } = res.data.data;
    localStorage.setItem('yashiii_token', newToken);
    localStorage.setItem('yashiii_user', JSON.stringify(userData));
    setUser(userData);
    setToken(newToken);
    return userData;
  }, []);

  const phoneLogin = useCallback(async (phoneData) => {
    const res = await authAPI.phoneLogin(phoneData);
    const { user: userData, token: newToken } = res.data.data;
    localStorage.setItem('yashiii_token', newToken);
    localStorage.setItem('yashiii_user', JSON.stringify(userData));
    setUser(userData);
    setToken(newToken);
    return userData;
  }, []);

  const phoneRegister = useCallback(async (regData) => {
    const res = await authAPI.phoneRegister(regData);
    const { user: userData, token: newToken } = res.data.data;
    localStorage.setItem('yashiii_token', newToken);
    localStorage.setItem('yashiii_user', JSON.stringify(userData));
    setUser(userData);
    setToken(newToken);
    return userData;
  }, []);

  const checkPhone = useCallback(async (phone) => {
    const res = await authAPI.checkPhone({ phone });
    return res.data.data;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authAPI.register(data);
    const { user: userData, token: newToken } = res.data.data;
    localStorage.setItem('yashiii_token', newToken);
    localStorage.setItem('yashiii_user', JSON.stringify(userData));
    setUser(userData);
    setToken(newToken);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('yashiii_token');
    localStorage.removeItem('yashiii_user');
    setUser(null);
    setToken(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('yashiii_user', JSON.stringify(updatedUser));
  }, []);

  const value = {
    user,
    token,
    loading,
    login,
    phoneLogin,
    phoneRegister,
    checkPhone,
    register,
    logout,
    updateUser,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager',
    isStaff: user?.role === 'staff',
    isCustomer: user?.role === 'customer',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
