"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Heading } from "@/components/ui";
import api from "../utils/api";

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
        const res = await api.get("/api/auth/me", { withCredentials: true });
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
      // Don't need to handle redirect here - AuthContext handles it
    } catch (err) {
      console.error("Logout failed:", err);
      // AuthContext already handles redirect, but ensure we reset state
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Heading text="Profile" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Profile Card */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
            <div className="text-center mb-8">
              {/* Avatar */}
              <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-primary">
                  {user.name
                    ? user.name.charAt(0).toUpperCase()
                    : user.email.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Name and Username */}
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {user.name || "Anonymous User"}
              </h2>
              {user.username && (
                <p className="text-muted-foreground text-lg">
                  @{user.username}
                </p>
              )}
            </div>

            {/* User Details */}
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

              {user.google_id && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Account Type
                    </p>
                    <p className="text-foreground font-medium">
                      Google Account
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions Card */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
            <h3 className="text-xl font-bold text-foreground mb-6">
              Account Actions
            </h3>

            <div className="space-y-4">
              {/* Logout Button */}
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

              {/* Navigation Button */}
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

              {/* Settings Placeholder */}
              <button
                disabled
                className="w-full bg-muted text-muted-foreground 
                          font-semibold py-4 px-6 rounded-xl cursor-not-allowed
                          flex items-center justify-center gap-3"
              >
                <span className="text-lg">⚙️</span>
                Settings (Coming Soon)
              </button>
            </div>
          </div>
        </div>

        {/* Debug Info (Development Only) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-12 bg-muted/30 border border-border rounded-lg p-6">
            <h4 className="text-lg font-semibold text-foreground mb-4">
              Debug Information
            </h4>
            <pre className="text-sm text-muted-foreground bg-background/50 p-4 rounded-lg overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
