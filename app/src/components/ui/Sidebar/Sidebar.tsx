"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FiLogOut, FiMenu } from "react-icons/fi";
import { useAuth } from "@/lib/AuthContext";

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
      className={`flex items-center gap-2 text-sm w-full rounded-md px-3 py-2 hover:bg-white/5 text-white/90`}
    >
      <FiLogOut size={16} />
      {!collapsed && <span>Logout</span>}
    </button>
  );
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menu = [
    { id: "resize", label: "Resize", src: "/icons/mynaui_sidebar.svg" },
    {
      id: "projects",
      label: "Projects",
      src: "/icons/fluent_tab-new-24-filled.svg",
    },
    {
      id: "team",
      label: "Team",
      src: "/icons/material-symbols_search-rounded.svg",
    },
  ];

  return (
    <>
      <div className="md:hidden flex items-center justify-between p-3 bg-[#1F1F1F] border-b border-[#403F3F]">
        <div className="flex items-center gap-3">
          <button
            aria-label="toggle sidebar"
            onClick={() => setMobileOpen((s) => !s)}
            className="p-2 rounded-md focus:outline-none"
          >
            <FiMenu size={20} />
          </button>
          <div className="text-white font-semibold">App Name</div>
        </div>
      </div>

      <aside
        className={`fixed top-0 left-0 h-full transform z-40 transition-all duration-300 ease-in-out bg-[#1F1F1F] border-r-2 border-[#403F3F]
          ${collapsed ? "w-20" : "w-64"}
          md:translate-x-0
          ${
            mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        style={{ minHeight: "100vh" }}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 p-4">
            <div
              className="h-10 w-10 rounded-sm flex items-center justify-center text-sm font-bold text-white"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <Image src="/icons/icon.svg" alt="Logo" width={24} height={24} />
            </div>
            {!collapsed && (
              <div className="text-white font-semibold">FloatChat</div>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {menu.map((m) => (
                <li key={m.id}>
                  {m.id === "resize" ? (
                    <button
                      onClick={() => setCollapsed((c) => !c)}
                      className={`w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-150 hover:bg-white/5 text-white/90 ${
                        collapsed ? "justify-center" : "justify-start"
                      }`}
                    >
                      <Image src={m.src} alt={m.label} width={18} height={18} />
                      {!collapsed && (
                        <span className="truncate">{m.label}</span>
                      )}
                    </button>
                  ) : (
                    <a
                      href="#"
                      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-150 hover:bg-white/5 text-white/90 ${
                        collapsed ? "justify-center" : "justify-start"
                      }`}
                    >
                      <Image src={m.src} alt={m.label} width={18} height={18} />
                      {!collapsed && (
                        <span className="truncate">{m.label}</span>
                      )}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t border-[#403F3F]">
            <div
              className={`flex items-center gap-3 ${
                collapsed ? "flex-col" : ""
              }`}
            >
              <LogoutButton collapsed={collapsed} />
            </div>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
        />
      )}

      <div className={`hidden md:block ${collapsed ? "w-20" : "w-64"}`} />
    </>
  );
}
