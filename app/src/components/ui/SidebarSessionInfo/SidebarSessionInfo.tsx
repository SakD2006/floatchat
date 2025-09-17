"use client";

import React from "react";
import { useChat } from "@/lib/ChatContext";
import { useAuth } from "@/lib/AuthContext";
import { BiHash, BiMessage, BiTime } from "react-icons/bi";

interface SidebarSessionInfoProps {
  collapsed?: boolean;
}

export default function SidebarSessionInfo({
  collapsed = false,
}: SidebarSessionInfoProps) {
  const { sessionId, messages, sessionStartTime } = useChat();
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  // Calculate session statistics
  const userMessages = messages.filter((msg) => msg.role === "user");
  const assistantMessages = messages.filter((msg) => msg.role === "assistant");

  // Format session ID for display (show first 6 characters)
  const shortSessionId = sessionId.substring(0, 6);

  // Calculate session duration
  const sessionDuration = new Date().getTime() - sessionStartTime.getTime();

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(minutes / 60);

    if (collapsed) {
      if (hours > 0) return `${hours}h`;
      return `${minutes}m`;
    }

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return "<1m";
    }
  };

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-2 p-2 bg-white/5 rounded-md text-white/70 text-xs">
        <div
          className="flex items-center gap-1"
          title={`Session: ${sessionId}`}
        >
          <BiHash size={12} />
          <span className="font-mono">{shortSessionId}</span>
        </div>
        {messages.length > 0 && (
          <>
            <div
              className="flex items-center gap-1"
              title={`${userMessages.length} sent, ${assistantMessages.length} received`}
            >
              <BiMessage size={12} />
              <span>{userMessages.length + assistantMessages.length}</span>
            </div>
            <div
              className="flex items-center gap-1"
              title={`Session duration: ${formatDuration(sessionDuration)}`}
            >
              <BiTime size={12} />
              <span>{formatDuration(sessionDuration)}</span>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="p-3 bg-white/5 rounded-md text-white/70 text-xs space-y-2">
      <div className="font-semibold text-white/90 text-center">
        Current Session
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span>ID:</span>
          <span className="font-mono text-[#00AC31]">{shortSessionId}...</span>
        </div>

        {user && (
          <div className="flex items-center justify-between">
            <span>User:</span>
            <span className="truncate max-w-20" title={user.email}>
              {user.name || user.email.split("@")[0]}
            </span>
          </div>
        )}

        {messages.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <span>Messages:</span>
              <span>{userMessages.length + assistantMessages.length}</span>
            </div>

            <div className="flex items-center justify-between">
              <span>Duration:</span>
              <span>{formatDuration(sessionDuration)}</span>
            </div>
          </>
        )}
      </div>

      {messages.length === 0 && (
        <div className="text-center text-white/50 italic text-xs">
          No messages yet
        </div>
      )}
    </div>
  );
}
