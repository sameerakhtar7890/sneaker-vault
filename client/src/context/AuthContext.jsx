import { createContext, useContext, useEffect, useState } from 'react';
import api from '../utils/api';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('sv_token'));

  useEffect(() => {
    if (!token) return;
    api.get('/auth/me').then(r => setUser(r.data)).catch(() => {});
  }, [token]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('sv_token', data.token);
    setToken(data.token); setUser(data);
  };
  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('sv_token', data.token);
    setToken(data.token); setUser(data);
  };
  const logout = () => { localStorage.removeItem('sv_token'); setToken(null); setUser(null); };

  return <AuthCtx.Provider value={{ user, token, login, register, logout }}>{children}</AuthCtx.Provider>;
}
