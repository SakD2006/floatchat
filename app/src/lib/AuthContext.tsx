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
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Log cookies for debugging
        if (typeof document !== "undefined") {
          console.log("[FRONTEND] Cookies:", document.cookie);
        }
        const res = await api.get("/api/auth/me");
        console.log("[FRONTEND] Session check result:", res.data);
        setAuthenticated(!!res.data.user);
      } catch (err) {
        console.log("[FRONTEND] Session check error:", err);
        setAuthenticated(false);
      }
    };
    checkSession();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setAuthenticated }}>
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
