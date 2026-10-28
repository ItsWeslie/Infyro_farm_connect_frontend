import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authApi } from "../api/client";

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
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    let active = true;
    const onAuthExpired = () => clearSession();
    window.addEventListener("ifc_auth_expired", onAuthExpired);

    // The HttpOnly cookie is the source of truth. Never read or store the JWT in JS.
    authApi.validate()
      .then((response) => {
        if (!active) return;
        if (response?.isLoggedIn ?? response?.loggedIn) {
          setUser(toUser(response));
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
    const response = await authApi.login({ email: email.trim(), password, loginType: "jwt" });
    if (!(response?.isLoggedIn ?? response?.loggedIn)) {
      throw new Error(response?.message || "We couldn't sign you in. Please try again.");
    }
    setUser(toUser(response, email.trim()));
    setIsAuthenticated(true);
    return response;
  };

  const signup = async ({ name, email, password }) => {
    return authApi.signup({ name: name.trim(), email: email.trim(), password });
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Clear local UI state even if the server is temporarily unreachable.
    } finally {
      clearSession();
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
