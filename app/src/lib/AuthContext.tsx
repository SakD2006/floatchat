"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api } from "@/utils/api";

type User = {
  email: string;
  name?: string;
  id: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  setAuthenticated: (auth: boolean) => void;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const logout = async () => {
    try {
      await api.post("/api/auth/logout", {}, { withCredentials: true });
      setAuthenticated(false);
      setUser(null);
      // Clear any stored state
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Logout error:", err);
      // Force logout on frontend even if backend fails
      setAuthenticated(false);
      setUser(null);
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  };

  const refreshAuth = async (): Promise<boolean> => {
    try {
      console.log("[AUTH_CONTEXT] Refreshing auth state...");

      // Log cookies for debugging
      if (typeof document !== "undefined") {
        console.log("[AUTH_CONTEXT] All cookies:", document.cookie);
        const cookies = document.cookie.split(";").map((c) => c.trim());
        console.log("[AUTH_CONTEXT] Cookie list:", cookies);
        const sessionCookie = cookies.find((c) => c.startsWith("connect.sid="));
        console.log("[AUTH_CONTEXT] Session cookie found:", !!sessionCookie);
        if (sessionCookie) {
          console.log("[AUTH_CONTEXT] Session cookie value:", sessionCookie);
        }
      }

      const res = await api.get("/api/auth/profile", {
        withCredentials: true,
      });

      console.log("[AUTH_CONTEXT] Session check result:", res.data);

      if (res.data?.user) {
        setAuthenticated(true);
        setUser(res.data.user);
        console.log("[AUTH_CONTEXT] User authenticated:", res.data.user.email);
        return true;
      } else {
        setAuthenticated(false);
        setUser(null);
        console.log("[AUTH_CONTEXT] No user data in response");
        return false;
      }
    } catch (err) {
      const error = err as { response?: { status?: number; data?: unknown } };
      console.log(
        "[AUTH_CONTEXT] Session check error:",
        error.response?.status,
        error.response?.data
      );
      setAuthenticated(false);
      setUser(null);
      return false;
    }
  };

  useEffect(() => {
    // Small delay to ensure cookies are available on initial load
    const timer = setTimeout(() => {
      refreshAuth();
    }, 100);

    // Also check when the window regains focus
    const handleFocus = () => refreshAuth();
    window.addEventListener("focus", handleFocus);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        setAuthenticated,
        setUser,
        logout,
        refreshAuth,
      }}
    >
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
