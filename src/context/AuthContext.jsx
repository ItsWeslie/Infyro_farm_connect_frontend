import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authApi, clearAccessToken } from "../api/client";

const AuthContext = createContext(null);

function toUser(response, fallbackEmail = "") {
  const username = response?.username || fallbackEmail;
  return {
    username,
    name: response?.name || (username.includes("@") ? username.split("@")[0] : username),
    email: response?.email || fallbackEmail || (username.includes("@") ? username : ""),
    role: response?.role || null,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    clearAccessToken();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const establishSession = useCallback(async (fallbackEmail = "") => {
    const validation = await authApi.validate();
    if (!(validation?.isLoggedIn ?? validation?.loggedIn)) {
      throw new Error("Your session could not be validated. Please sign in again.");
    }
    setUser(toUser(validation, fallbackEmail));
    setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    let active = true;
    const onAuthExpired = () => clearSession();
    window.addEventListener("ifc_auth_expired", onAuthExpired);

    // The refresh cookie is HttpOnly. Rotate it to obtain a fresh access token,
    // then validate that token before rendering the authenticated workspace.
    authApi.refresh()
      .then(async () => {
        if (!active) return;
        const validation = await authApi.validate();
        if (!active) return;
        if (validation?.isLoggedIn ?? validation?.loggedIn) {
          setUser(toUser(validation));
          setIsAuthenticated(true);
        } else {
          clearSession();
        }
      })
      .catch(() => {
        if (active) clearSession();
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      window.removeEventListener("ifc_auth_expired", onAuthExpired);
    };
  }, [clearSession]);

  const login = async (email, password) => {
    const response = await authApi.login({
      email: email.trim(),
      password,
      loginType: "jwt",
    });
    if (!response?.accessToken) {
      clearSession();
      throw new Error("The login response did not include an access token.");
    }
    try {
      await establishSession(email.trim());
    } catch (error) {
      clearSession();
      throw error;
    }
    return response;
  };

  const signup = async ({ name, email, password }) => {
    return authApi.signup({ name: name.trim(), email: email.trim(), password });
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Always clear local authentication, even when the backend is unavailable.
    } finally {
      clearSession();
    }
  };

  const logoutAll = async () => {
    try {
      await authApi.logoutAll();
    } finally {
      clearSession();
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      login,
      signup,
      logout,
      logoutAll,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
