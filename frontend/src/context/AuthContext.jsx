import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../apis/authApi';
import axiosInstance from '../apis/axiosInstance';

const AuthContext = createContext(null);

// Token storage key
const TOKEN_KEY = 'memoryverse_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // On mount, try to restore session from stored token
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setIsLoadingUser(false);
        return;
      }
      try {
        const res = await axiosInstance.get('/auth/me');
        setUser(res.data);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
      } finally {
        setIsLoadingUser(false);
      }
    };
    restoreSession();
  }, []);

  /** Register and store token */
  const register = async (name, email, password) => {
    const data = await authApi.register(name, email, password);
    return data;
  };

  /** Login, store token, set user */
  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    return data.user;
  };

  /** Logout — clear token and user state */
  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  /** Update user data in context (e.g. after profile save) */
  const updateUser = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  return (
    <AuthContext.Provider value={{ user, isLoadingUser, login, logout, register, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Hook to use auth context in any component */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
