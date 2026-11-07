import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('healthmate_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('healthmate_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const me = await authApi.getMe();
          setUser(me);
          localStorage.setItem('healthmate_user', JSON.stringify(me));
        } catch (err) {
          console.warn('Failed to verify token', err);
          logout();
        }
      }
      setLoading(false);
    }

    loadUser();

    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [token]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem('healthmate_token', res.access_token);
    const userData = {
      id: res.user_id,
      email: res.email,
      full_name: res.full_name,
      onboarding_completed: res.onboarding_completed,
    };
    localStorage.setItem('healthmate_user', JSON.stringify(userData));
    setToken(res.access_token);
    setUser(userData);
    return res;
  };

  const register = async (fullName, email, password, confirmPassword) => {
    const res = await authApi.register({
      full_name: fullName,
      email,
      password,
      confirm_password: confirmPassword,
    });
    localStorage.setItem('healthmate_token', res.access_token);
    const userData = {
      id: res.user_id,
      email: res.email,
      full_name: res.full_name,
      onboarding_completed: res.onboarding_completed,
    };
    localStorage.setItem('healthmate_user', JSON.stringify(userData));
    setToken(res.access_token);
    setUser(userData);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('healthmate_token');
    localStorage.removeItem('healthmate_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('healthmate_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
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

