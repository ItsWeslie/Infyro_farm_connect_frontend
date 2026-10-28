import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ifc_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('ifc_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkToken() {
      if (token) {
        try {
          await authApi.validate();
        } catch (err) {
          // Token is invalid/expired
          logout();
        }
      }
      setLoading(false);
    }

    const onAuthExpired = () => logout();
    window.addEventListener('ifc_auth_expired', onAuthExpired);
    checkToken();

    return () => window.removeEventListener('ifc_auth_expired', onAuthExpired);
  }, [token]);

  const login = async (username, password) => {
    const res = await authApi.login({ username, password });
    // Backend LoginResponse returns { jwtToken, username, ... }
    const jwtToken = res.jwtToken || res.token || res.data?.jwtToken;
    const userData = {
      username: res.username || username,
      name: res.name || username.split('@')[0],
      email: username,
    };
    if (jwtToken) {
      localStorage.setItem('ifc_token', jwtToken);
      localStorage.setItem('ifc_user', JSON.stringify(userData));
      setToken(jwtToken);
      setUser(userData);
    }
    return res;
  };

  const signup = async (payload) => {
    // payload: { name, email, password, userType: 'USER' }
    return await authApi.signup({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      userType: 'USER',
    });
  };

  const logout = async () => {
    try {
      if (token) await authApi.logout();
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('ifc_token');
      localStorage.removeItem('ifc_user');
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

