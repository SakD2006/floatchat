"use client";

import React, { useState, useEffect } from "react";
import { chatAPI } from "@/utils/api";

interface ConnectionStatusProps {
  className?: string;
}

export default function ConnectionStatus({
  className = "",
}: ConnectionStatusProps) {
  const [aiStatus, setAiStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkAiHealth = async () => {
    try {
      const isHealthy = await chatAPI.checkHealth();
      setAiStatus(isHealthy ? "connected" : "disconnected");
      setLastCheck(new Date());
    } catch (error) {
      console.log("[ConnectionStatus] AI health check failed:", error);
      setAiStatus("disconnected");
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    // Initial check
    checkAiHealth();

    // Check every 30 seconds
    const interval = setInterval(checkAiHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (aiStatus) {
      case "connected":
        return "text-green-400";
      case "disconnected":
        return "text-red-400";
      case "connecting":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusText = () => {
    switch (aiStatus) {
      case "connected":
        return "AI Online";
      case "disconnected":
        return "AI Offline";
      case "connecting":
        return "Connecting...";
      default:
        return "Unknown";
    }
  };

  const getStatusIcon = () => {
    switch (aiStatus) {
      case "connected":
        return "●";
      case "disconnected":
        return "●";
      case "connecting":
        return "◐";
      default:
        return "○";
    }
  };

  return (
    <div className={`flex items-center gap-2 text-xs ${className}`}>
      <span
        className={`${getStatusColor()} ${
          aiStatus === "connecting" ? "animate-spin" : ""
        }`}
      >
        {getStatusIcon()}
      </span>
      <span className={getStatusColor()}>{getStatusText()}</span>
      {lastCheck && (
        <span className="text-white/30">
          {lastCheck.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      )}
    </div>
  );
}
