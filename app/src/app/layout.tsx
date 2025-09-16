import type { Metadata } from "next";
import "./globals.css";
import { DotGrid } from "@/components/ui/ui";

export const metadata: Metadata = {
  title: "FloatChat",
  description:
    "AI Powered Conversational Interface for ARGO Data Discovery and Visualization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased relative"
        style={{ minHeight: "100vh", overflow: "hidden" }}
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
          <a href="/auth" style={{ position: "absolute", top: 16, right: 16 }}>
            Auth
          </a>
          <a href="/me" style={{ position: "absolute", top: 16, right: 80 }}>
            Me
          </a>
          {children}
        </div>
      </body>
    </html>
  );
}
