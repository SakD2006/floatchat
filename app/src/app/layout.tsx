import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import { NotificationProvider } from "@/components/ui";
import React from "react";
import { DotGrid, Sidebar } from "@/components/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "FloatChat",
  description:
    "AI Powered Conversational Interface for ARGO Data Discovery and Visualization",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationProvider>
      <AuthProvider>
        <html lang="en">
          <body
            className="antialiased relative"
            style={{
              minHeight: "100vh",
              overflowX: "hidden",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 0,
                pointerEvents: "none",
              }}
            >
              <DotGrid
                dotSize={4}
                gap={23}
                baseColor={"#403F3F"}
                activeColor={"#00AC31"}
                proximity={120}
                shockRadius={90}
                shockStrength={16}
                resistance={750}
                returnDuration={2.1}
              />
            </div>

            <div style={{ position: "relative", zIndex: 1 }}>
              <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
                {children}
              </main>
            </div>
          </body>
        </html>
      </AuthProvider>
    </NotificationProvider>
  );
}
