"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api } from "@/utils/api";

type AuthContextType = {
  isAuthenticated: boolean;
  setAuthenticated: (auth: boolean) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setAuthenticated] = useState(false);

  const logout = async () => {
    try {
      await api.post("/api/auth/logout", {}, { withCredentials: true });
      setAuthenticated(false);
      // Clear any stored state
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Logout error:", err);
      // Force logout on frontend even if backend fails
      setAuthenticated(false);
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Log cookies for debugging
        if (typeof document !== "undefined") {
          console.log("[FRONTEND] Cookies:", document.cookie);
        }

        const res = await api.get("/api/auth/me", {
          withCredentials: true,
        });

        console.log("[FRONTEND] Session check result:", res.data);
        console.log("[FRONTEND] Response headers:", res.headers);

        setAuthenticated(!!res.data.user);
      } catch (err) {
        const error = err as { response?: { status?: number; data?: unknown } };
        console.log(
          "[FRONTEND] Session check error:",
          error.response?.status,
          error.response?.data
        );
        setAuthenticated(false);
      }
    };

    // Small delay to ensure cookies are available
    const timer = setTimeout(checkSession, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
