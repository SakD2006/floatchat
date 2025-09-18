"use client";

import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { Loader } from "@/components/ui";

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
    return <Loader />;
  }

  // Create a proper chat container that takes full available height
  // Account for: sidebar margins + main padding + some buffer for header/footer
  return (
    <div className="h-[calc(100vh-6rem)] sm:h-[calc(100vh-5rem)] lg:h-[calc(100vh-4rem)] flex flex-col">
      {children}
    </div>
  );
}
