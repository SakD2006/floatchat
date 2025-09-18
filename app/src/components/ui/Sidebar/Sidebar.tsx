"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiLogOut, FiMoreHorizontal } from "react-icons/fi";
import { useAuth } from "@/lib/AuthContext";
import { useSidebar } from "@/lib/SidebarContext";
import { SidebarSessionInfo } from "@/components/ui";

function LogoutButton({
  collapsed,
  isMobile,
}: {
  collapsed: boolean;
  isMobile?: boolean;
}) {
  const { logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!isAuthenticated) return null;

  if (isMobile) {
    return (
      <button
        onClick={handleLogout}
        className="flex flex-col items-center justify-center gap-1 p-2 hover:bg-white/10 focus:bg-white/15 focus:outline-none transition-colors text-white/90 rounded-lg min-w-[60px] min-h-[60px]"
        title="Logout"
      >
        <FiLogOut size={20} className="flex-shrink-0" />
        <span className="text-xs truncate">Logout</span>
      </button>
    );
  }

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

function MobileSessionModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/60 md:hidden"
        onClick={onClose}
      />
      <div className="fixed bottom-20 left-4 right-4 z-50 bg-[#1F1F1F] border border-[#403F3F] rounded-lg p-4 md:hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Session Info</h3>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1"
          >
            ×
          </button>
        </div>
        <SidebarSessionInfo collapsed={false} />
        {user && (
          <div className="mt-4 pt-4 border-t border-[#403F3F]">
            <div className="text-white/70 text-sm">
              <div className="flex items-center justify-between">
                <span>User:</span>
                <span className="text-white">
                  {user.name || user.email.split("@")[0]}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function Sidebar() {
  const { collapsed, setCollapsed } = useSidebar();
  const [showMobileModal, setShowMobileModal] = useState(false);

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
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex fixed top-0 left-0 h-full z-40 transition-all duration-300 ease-in-out bg-[#1F1F1F] border-r-2 border-[#403F3F] will-change-transform
          ${collapsed ? "w-16 lg:w-20" : "w-64 lg:w-80"}
        `}
      >
        <div className="flex flex-col h-full w-full">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 p-3 lg:p-4 hover:bg-white/5 transition-colors rounded-lg mx-2 mt-2"
          >
            <div
              className="h-8 w-8 lg:h-10 lg:w-10 rounded-sm flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
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
              <div className="text-white font-semibold text-sm lg:text-base truncate">
                FloatChat
              </div>
            )}
          </Link>

          {/* Nav Menu */}
          <nav className="flex-1 overflow-y-auto py-2 lg:py-4">
            <ul className="space-y-1 px-2">
              {menu.map((m) => (
                <li key={m.id}>
                  {m.id === "resize" ? (
                    <button
                      onClick={() => setCollapsed(!collapsed)}
                      className={`w-full flex items-center gap-3 rounded-md px-3 py-3 lg:py-2 text-sm transition-colors duration-150 hover:bg-white/5 focus:bg-white/10 focus:outline-none text-white/90 min-h-[44px] ${
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
                    <Link
                      href={m.id === "new-chat" ? "/chat" : "#"}
                      className={`flex items-center gap-3 rounded-md px-3 py-3 lg:py-2 text-sm transition-colors duration-150 hover:bg-white/5 focus:bg-white/10 focus:outline-none text-white/90 min-h-[44px] ${
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
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Session Info */}
          <div className="px-2 lg:px-4 py-2">
            <SidebarSessionInfo collapsed={collapsed} />
          </div>

          {/* Logout */}
          <div className="p-2 lg:p-4 border-t border-[#403F3F]">
            <LogoutButton collapsed={collapsed} />
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1F1F1F] border-t-2 border-[#403F3F]">
        <div className="flex items-center justify-around py-2 px-4">
          {/* Logo/Home */}
          <Link
            href="/"
            className="flex flex-col items-center justify-center gap-1 p-2 hover:bg-white/10 focus:bg-white/15 focus:outline-none transition-colors text-white/90 rounded-lg min-w-[60px] min-h-[60px]"
          >
            <div
              className="h-6 w-6 rounded-sm flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <Image src="/icons/icon.svg" alt="Home" width={16} height={16} />
            </div>
            <span className="text-xs truncate">Home</span>
          </Link>

          {/* New Chat */}
          <Link
            href="/chat"
            className="flex flex-col items-center justify-center gap-1 p-2 hover:bg-white/10 focus:bg-white/15 focus:outline-none transition-colors text-white/90 rounded-lg min-w-[60px] min-h-[60px]"
          >
            <Image
              src="/icons/fluent_tab-new-24-filled.svg"
              alt="New Chat"
              width={20}
              height={20}
              className="flex-shrink-0"
            />
            <span className="text-xs truncate">New</span>
          </Link>

          {/* Search */}
          <a
            href="#"
            className="flex flex-col items-center justify-center gap-1 p-2 hover:bg-white/10 focus:bg-white/15 focus:outline-none transition-colors text-white/90 rounded-lg min-w-[60px] min-h-[60px]"
          >
            <Image
              src="/icons/material-symbols_search-rounded.svg"
              alt="Search"
              width={20}
              height={20}
              className="flex-shrink-0"
            />
            <span className="text-xs truncate">Search</span>
          </a>

          {/* Session Info Modal Trigger */}
          <button
            onClick={() => setShowMobileModal(true)}
            className="flex flex-col items-center justify-center gap-1 p-2 hover:bg-white/10 focus:bg-white/15 focus:outline-none transition-colors text-white/90 rounded-lg min-w-[60px] min-h-[60px]"
            title="Session Info"
          >
            <FiMoreHorizontal size={20} className="flex-shrink-0" />
            <span className="text-xs truncate">More</span>
          </button>

          {/* Logout */}
          <LogoutButton collapsed={false} isMobile={true} />
        </div>
      </nav>

      {/* Mobile Session Modal */}
      <MobileSessionModal
        isOpen={showMobileModal}
        onClose={() => setShowMobileModal(false)}
      />
    </>
  );
}
