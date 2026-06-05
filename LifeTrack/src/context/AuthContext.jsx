import { createContext, useCallback, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

const STORAGE_KEY = "lifetrack.auth";
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "http://localhost:8080/api";

const getStoredSession = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { isAuthenticated: false, userEmail: "", token: null, user: null };
    const parsed = JSON.parse(raw);
    if (parsed?.isAuthenticated && parsed?.token) {
      return {
        isAuthenticated: true,
        userEmail: parsed.email || "",
        token: parsed.token,
        user: parsed.user || null,
      };
    }
  } catch {
    // ignore
  }
  return { isAuthenticated: false, userEmail: "", token: null, user: null };
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(getStoredSession);
  const { isAuthenticated, userEmail, token, user } = session;

  // Persist session
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // ignore
    }
  }, [session]);

  const login = useCallback(async (email, password) => {
    const safeEmail = String(email ?? "").trim();
    const safePassword = String(password ?? "").trim();
    if (!safeEmail || !safePassword) return { ok: false, error: "Email and password required." };

    // Try real API first
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: safeEmail, password: safePassword }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setSession({
          isAuthenticated: true,
          userEmail: safeEmail,
          token: data.token,
          user: data.user || null,
        });
        return { ok: true };
      }
      return { ok: false, error: data.error || "Invalid credentials." };
    } catch (err) {
      return { ok: false, error: "Connection error: Could not reach backend." };
    }
  }, []);

  const register = useCallback(async (firstName, lastName, username, email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, username, email, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setSession({
          isAuthenticated: true,
          userEmail: email,
          token: data.token,
          user: data.user || null,
        });
        return { ok: true };
      }
      return { ok: false, error: data.error || "Registration failed." };
    } catch (err) {
      return { ok: false, error: "Connection error: Could not reach backend." };
    }
  }, []);

  const logout = useCallback(() => {
    setSession({ isAuthenticated: false, userEmail: "", token: null, user: null });
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setSession((prev) => ({
      ...prev,
      userEmail: updatedUser.email || prev.userEmail,
      user: { ...prev.user, ...updatedUser },
    }));
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, userEmail, token, user, login, logout, register, updateUser }),
    [isAuthenticated, userEmail, token, user, login, logout, register, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
export const API_BASE_URL = API_BASE;
