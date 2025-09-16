import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import LayoutWrapped from "./LayoutWrapped";

export const metadata: Metadata = {
  title: "FloatChat",
  description:
    "AI Powered Conversational Interface for ARGO Data Discovery and Visualization",
};

// LayoutContent removed. Logic moved to LayoutWrapped.

import React from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <LayoutWrapped>{children}</LayoutWrapped>
    </AuthProvider>
  );
}
