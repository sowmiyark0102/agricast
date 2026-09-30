import React, { createContext, useContext, useState, useCallback } from "react";
import { api } from "../services/api";
import { User } from "../types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<User>;
  register: (payload: Record<string, any>) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("agricast_user");
    return raw ? (JSON.parse(raw) as User) : null;
  });
  const [loading, setLoading] = useState(false);

  const persist = (t: string, u: User) => {
    localStorage.setItem("agricast_token", t);
    localStorage.setItem("agricast_user", JSON.stringify(u));
    setUser(u);
  };

  const login = useCallback(async (phone: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { phone, password });
      persist(res.data.token, res.data.user);
      return res.data.user as User;
    } finally { setLoading(false); }
  }, []);

  const register = useCallback(async (payload: Record<string, any>) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/register", payload);
      persist(res.data.token, res.data.user);
      return res.data.user as User;
    } finally { setLoading(false); }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("agricast_token");
    localStorage.removeItem("agricast_user");
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get("/auth/me");
      localStorage.setItem("agricast_user", JSON.stringify(res.data.user));
      setUser(res.data.user);
    } catch { /* non-critical: keep the cached user */ }
  }, []);

  return <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
