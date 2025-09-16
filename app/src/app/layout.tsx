import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import LayoutWrapped from "./LayoutWrapped";
import { NotificationProvider } from "@/components/ui";
import React from "react";

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
        <LayoutWrapped>{children}</LayoutWrapped>
      </AuthProvider>
    </NotificationProvider>
  );
}
