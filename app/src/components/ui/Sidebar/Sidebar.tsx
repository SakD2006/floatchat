"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FiLogOut, FiMenu } from "react-icons/fi";
import { useAuth } from "@/lib/AuthContext";
import { useSidebar } from "@/lib/SidebarContext";
import { SidebarSessionInfo } from "@/components/ui";

function LogoutButton({ collapsed }: { collapsed: boolean }) {
  const { logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <button
      onClick={handleLogout}
      className={`flex items-center gap-2 text-sm w-full rounded-md px-3 py-3 sm:py-2 hover:bg-white/5 focus:bg-white/10 focus:outline-none transition-colors text-white/90 min-h-[44px] ${
        collapsed ? "justify-center" : "justify-start"
      }`}
    >
      <FiLogOut size={18} className="flex-shrink-0" />
      {!collapsed && <span className="truncate">Logout</span>}
    </button>
  );
}

export default function Sidebar() {
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar();

  const menu = [
    { id: "resize", label: "Resize", src: "/icons/mynaui_sidebar.svg" },
    {
      id: "new-chat",
      label: "New Chat",
      src: "/icons/fluent_tab-new-24-filled.svg",
    },
    {
      id: "search",
      label: "Search",
      src: "/icons/material-symbols_search-rounded.svg",
    },
  ];

  return (
    <>
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-3 sm:p-4 bg-[#1F1F1F] border-b border-[#403F3F] min-h-[60px]">
        <button
          aria-label="toggle sidebar"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 transition-colors"
        >
          <FiMenu size={20} className="text-white" />
        </button>
        <div className="text-white font-semibold text-base sm:text-lg">
          FloatChat
        </div>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-40 transition-all duration-300 ease-in-out bg-[#1F1F1F] border-r-2 border-[#403F3F] will-change-transform
          ${collapsed ? "w-16 sm:w-20" : "w-64 sm:w-72 lg:w-80"}
          md:translate-x-0 md:top-0
          ${
            mobileOpen
              ? "translate-x-0 top-[60px]"
              : "-translate-x-full md:translate-x-0 md:top-0"
          }
          ${mobileOpen ? "h-[calc(100vh-60px)] md:h-full" : "h-full"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 p-3 sm:p-4 hover:bg-white/5 transition-colors rounded-lg mx-2 mt-2"
          >
            <div
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-sm flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <Image
                src="/icons/icon.svg"
                alt="Logo"
                width={collapsed ? 20 : 24}
                height={collapsed ? 20 : 24}
              />
            </div>
            {!collapsed && (
              <div className="text-white font-semibold text-sm sm:text-base truncate">
                FloatChat
              </div>
            )}
          </Link>

          {/* Nav Menu */}
          <nav className="flex-1 overflow-y-auto py-2 sm:py-4">
            <ul className="space-y-1 px-2">
              {menu.map((m) => (
                <li key={m.id}>
                  {m.id === "resize" ? (
                    <button
                      onClick={() => setCollapsed(!collapsed)}
                      className={`w-full flex items-center gap-3 rounded-md px-3 py-3 sm:py-2 text-sm transition-colors duration-150 hover:bg-white/5 focus:bg-white/10 focus:outline-none text-white/90 min-h-[44px] ${
                        collapsed ? "justify-center" : "justify-start"
                      }`}
                    >
                      <Image
                        src={m.src}
                        alt={m.label}
                        width={18}
                        height={18}
                        className="flex-shrink-0"
                      />
                      {!collapsed && (
                        <span className="truncate text-left">{m.label}</span>
                      )}
                    </button>
                  ) : (
                    <a
                      href="#"
                      className={`flex items-center gap-3 rounded-md px-3 py-3 sm:py-2 text-sm transition-colors duration-150 hover:bg-white/5 focus:bg-white/10 focus:outline-none text-white/90 min-h-[44px] ${
                        collapsed ? "justify-center" : "justify-start"
                      }`}
                    >
                      <Image
                        src={m.src}
                        alt={m.label}
                        width={18}
                        height={18}
                        className="flex-shrink-0"
                      />
                      {!collapsed && (
                        <span className="truncate text-left">{m.label}</span>
                      )}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Session Info */}
          <div className="px-2 sm:px-4 py-2">
            <SidebarSessionInfo collapsed={collapsed} />
          </div>

          {/* Logout */}
          <div className="p-2 sm:p-4 border-t border-[#403F3F]">
            <LogoutButton collapsed={collapsed} />
          </div>
        </div>
      </aside>
    </>
  );
}
