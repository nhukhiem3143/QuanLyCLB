import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (ten_dang_nhap, mat_khau) => {
    const res = await api.post('/auth/login', { ten_dang_nhap, mat_khau });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const refreshProfile = async () => {
    const res = await api.get('/auth/profile');
    localStorage.setItem('user', JSON.stringify(res.data));
    setUser(res.data);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setLoading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
