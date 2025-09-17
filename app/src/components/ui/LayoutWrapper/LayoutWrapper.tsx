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
      <Sidebar />

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main content area */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          !isMobile ? (collapsed ? "ml-20" : "ml-64") : ""
        }`}
      >
        <main className="flex flex-col gap-[32px] items-center sm:items-start p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
