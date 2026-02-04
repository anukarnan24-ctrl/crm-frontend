import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // load user from token on first mount
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await api.me();
        if (mounted) setUser(res.user);
      } catch {
        localStorage.removeItem("token");
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      async login(email, password) {
        const res = await api.login({ email, password });
        localStorage.setItem("token", res.token);
        setUser(res.user);
      },
      async signup(name, email, password) {
        const res = await api.signup({ name, email, password });
        localStorage.setItem("token", res.token);
        setUser(res.user);
      },
      logout() {
        localStorage.removeItem("token");
        setUser(null);
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}