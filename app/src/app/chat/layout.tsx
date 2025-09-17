"use client";

import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

export default function ChatLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, refreshAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await refreshAuth();
      if (!isAuth) {
        router.push("/auth/login");
      }
    };

    checkAuth();
  }, [refreshAuth, router]);

  // Show loading or nothing while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
