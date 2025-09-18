"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/ui";
import { useSidebar } from "@/lib/SidebarContext";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { collapsed, mobileOpen, setMobileOpen } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Overlay (only on mobile when open) */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          !isMobile
            ? collapsed
              ? "ml-16 sm:ml-20"
              : "ml-64 sm:ml-72 lg:ml-80"
            : "mt-[60px]"
        }`}
      >
        <main className="flex flex-col gap-2 sm:gap-4 lg:gap-6 p-2 sm:p-3 lg:p-4 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
