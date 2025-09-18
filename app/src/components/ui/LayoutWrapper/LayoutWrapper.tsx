"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/ui";
import { useSidebar } from "@/lib/SidebarContext";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { collapsed } = useSidebar();
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

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          !isMobile
            ? collapsed
              ? "ml-16 lg:ml-20"
              : "ml-64 lg:ml-80"
            : "mb-20" // Bottom margin for mobile bottombar
        }`}
      >
        <main
          className={`flex flex-col gap-2 sm:gap-4 lg:gap-6 p-2 sm:p-3 lg:p-4 min-h-screen ${
            isMobile ? "pb-4" : "" // Extra bottom padding on mobile
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
