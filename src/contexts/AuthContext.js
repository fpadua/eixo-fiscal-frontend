'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { authApi, setAccessToken, setRefreshToken, getRefreshToken } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedRefresh = getRefreshToken();
    if (savedRefresh) {
      authApi.refresh(savedRefresh)
        .then(r => {
          setAccessToken(r.data.token);
          return authApi.profile();
        })
        .then(r => { setUser(r.data.user); })
        .catch(() => { setRefreshToken(null); setUser(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authApi.login(email, password);
      const { token, refreshToken: rt, user: userData } = response.data;
      setAccessToken(token);
      setRefreshToken(rt);
      setUser(userData);
      return response.data;
    } catch (err) {
      if (err.response?.status === 401) {
        setRefreshToken(null);
        setUser(null);
      }
      throw err;
    }
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}