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
      <div className="flex items-center justify-center">
        <div className="text-center bg-[#2B2B2B] border border-white rounded-2xl p-8 shadow-[0.5rem_0.5rem_0px_#00AC31,1rem_1rem_0px_#1FF4FF]">
          <div className="w-12 h-12 border-4 border-[#00AC31] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg font-['MontserratAlternates-Regular']">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center max-w-md mx-auto bg-[#2B2B2B] border border-red-500 rounded-2xl p-8 shadow-[0.5rem_0.5rem_0px_#FF0000]">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-400 text-lg mb-4 font-['MontserratAlternates-Regular']">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="bg-[#2B2B2B] border border-white rounded-2xl p-8 shadow-[0.5rem_0.5rem_0px_#00AC31,1rem_1rem_0px_#1FF4FF]">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-[#00AC31]/20 border border-[#00AC31] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-[#00AC31]">
                  {user.name
                    ? user.name.charAt(0).toUpperCase()
                    : user.email.charAt(0).toUpperCase()}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2 font-['MontserratAlternates-SemiBold']">
                {user.name || "Anonymous User"}
              </h2>
              {user.username && (
                <p className="text-gray-300 text-lg font-['MontserratAlternates-Regular']">
                  @{user.username}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-[#1F1F1F] border border-[#403F3F] rounded-xl">
                <div className="w-3 h-3 bg-[#00AC31] rounded-full shadow-sm"></div>
                <div>
                  <p className="text-sm text-gray-400 font-['MontserratAlternates-Light']">
                    Email
                  </p>
                  <p className="text-white font-medium font-['MontserratAlternates-Regular']">
                    {user.email}
                  </p>
                </div>
              </div>

              {user.id && (
                <div className="flex items-center gap-3 p-4 bg-[#1F1F1F] border border-[#403F3F] rounded-xl">
                  <div className="w-3 h-3 bg-[#1FF4FF] rounded-full shadow-sm"></div>
                  <div>
                    <p className="text-sm text-gray-400 font-['MontserratAlternates-Light']">
                      User ID
                    </p>
                    <p className="text-white font-medium font-['MontserratAlternates-Regular']">
                      #{user.id}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#2B2B2B] border border-white rounded-2xl p-8 shadow-[0.5rem_0.5rem_0px_#00AC31,1rem_1rem_0px_#1FF4FF]">
            <h3 className="text-xl font-bold text-white mb-6 font-['MontserratAlternates-SemiBold']">
              Account Actions
            </h3>

            <div className="space-y-4">
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 
                          text-white font-semibold py-4 px-6 rounded-xl border border-red-500
                          transition-all duration-200 transform hover:scale-105 disabled:scale-100
                          shadow-[0.25rem_0.25rem_0px_#FF0000] hover:shadow-[0.5rem_0.5rem_0px_#FF0000] 
                          disabled:cursor-not-allowed font-['MontserratAlternates-SemiBold']
                          flex items-center justify-center gap-3"
              >
                {loggingOut ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                className="w-full bg-[#00AC31] hover:bg-[#00AC31]/90 text-white 
                          font-semibold py-4 px-6 rounded-xl border border-[#00AC31]
                          transition-all duration-200 transform hover:scale-105
                          shadow-[0.25rem_0.25rem_0px_#1FF4FF] hover:shadow-[0.5rem_0.5rem_0px_#1FF4FF]
                          font-['MontserratAlternates-SemiBold']
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
