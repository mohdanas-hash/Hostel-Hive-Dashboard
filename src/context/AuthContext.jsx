import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/endpoints';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const userData = await authApi.getMe();
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } catch {
          // Token expired or invalid
          setUser(null);
          setToken(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  };

  const register = async (registerData) => {
    const data = await authApi.register(registerData);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isCentralAdmin = user?.role === 'central_admin';
  const isStudent = user?.role === 'student';
  const isVisitor = user?.role === 'visitor';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token,
        isCentralAdmin,
        isStudent,
        isVisitor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
