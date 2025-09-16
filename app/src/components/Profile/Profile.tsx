"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { api } from "@/utils/api";

type User = {
  id?: number;
  email: string;
  name?: string;
  username?: string;
  google_id?: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/api/auth/profile", {
          withCredentials: true,
        });
        setUser(res.data.user);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setError("Failed to load profile. Redirecting to login...");
        setTimeout(() => {
          window.location.href = "/auth/login";
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="text-destructive text-6xl mb-4">⚠️</div>
          <p className="text-destructive text-lg mb-4">{error}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-primary">
                  {user.name
                    ? user.name.charAt(0).toUpperCase()
                    : user.email.charAt(0).toUpperCase()}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-foreground mb-2">
                {user.name || "Anonymous User"}
              </h2>
              {user.username && (
                <p className="text-muted-foreground text-lg">
                  @{user.username}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-foreground font-medium">{user.email}</p>
                </div>
              </div>

              {user.id && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div>
                    <p className="text-sm text-muted-foreground">User ID</p>
                    <p className="text-foreground font-medium">#{user.id}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
            <h3 className="text-xl font-bold text-foreground mb-6">
              Account Actions
            </h3>

            <div className="space-y-4">
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full bg-destructive hover:bg-destructive/90 disabled:bg-destructive/50 
                          text-destructive-foreground font-semibold py-4 px-6 rounded-xl
                          transition-all duration-200 transform hover:scale-105 disabled:scale-100
                          shadow-lg hover:shadow-xl disabled:cursor-not-allowed
                          flex items-center justify-center gap-3"
              >
                {loggingOut ? (
                  <>
                    <div className="w-5 h-5 border-2 border-destructive-foreground border-t-transparent rounded-full animate-spin"></div>
                    Logging out...
                  </>
                ) : (
                  <>
                    <span className="text-lg">🚪</span>
                    Logout
                  </>
                )}
              </button>

              <button
                onClick={() => (window.location.href = "/")}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground 
                          font-semibold py-4 px-6 rounded-xl
                          transition-all duration-200 transform hover:scale-105
                          shadow-lg hover:shadow-xl
                          flex items-center justify-center gap-3"
              >
                <span className="text-lg">🏠</span>
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
