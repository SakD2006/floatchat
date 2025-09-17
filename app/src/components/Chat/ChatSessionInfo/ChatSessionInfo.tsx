"use client";

import React, { useState } from "react";
import { useChat } from "@/lib/ChatContext";
import { useAuth } from "@/lib/AuthContext";
import {
  BiCopy,
  BiCheck,
  BiTime,
  BiMessage,
  BiUser,
  BiHash,
} from "react-icons/bi";

export default function ChatSessionInfo() {
  const { sessionId, messages, sessionStartTime } = useChat();
  const { user } = useAuth();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Calculate session statistics
  const userMessages = messages.filter((msg) => msg.role === "user");
  const assistantMessages = messages.filter((msg) => msg.role === "assistant");

  // Format session ID for display (show first 8 characters)
  const shortSessionId = sessionId.substring(0, 8);

  // Calculate session duration
  const sessionDuration =
    messages.length > 0 ? new Date().getTime() - sessionStartTime.getTime() : 0;

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div className="bg-[#1F1F1F] border border-[#403F3F] rounded-lg p-4 text-white/90 text-sm">
      <div className="flex items-center gap-2 mb-3">
        <BiHash className="text-[#00AC31]" size={16} />
        <span className="font-semibold text-white">Session Information</span>
      </div>

      <div className="space-y-3">
        {/* Session ID */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BiHash size={14} className="text-white/50" />
            <span className="text-white/70">Session ID:</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[#00AC31] text-xs">
              {shortSessionId}...
            </span>
            <button
              onClick={() => copyToClipboard(sessionId, "sessionId")}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              title="Copy full session ID"
            >
              {copiedField === "sessionId" ? (
                <BiCheck className="text-green-400" size={14} />
              ) : (
                <BiCopy className="text-white/50" size={14} />
              )}
            </button>
          </div>
        </div>

        {/* User */}
        {user && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BiUser size={14} className="text-white/50" />
              <span className="text-white/70">User:</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/90 text-xs truncate max-w-32">
                {user.name || user.email.split("@")[0]}
              </span>
              <button
                onClick={() => copyToClipboard(user.email, "userEmail")}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title="Copy email"
              >
                {copiedField === "userEmail" ? (
                  <BiCheck className="text-green-400" size={14} />
                ) : (
                  <BiCopy className="text-white/50" size={14} />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Message Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BiMessage size={14} className="text-white/50" />
            <span className="text-white/70">Messages:</span>
          </div>
          <span className="text-white/90 text-xs">
            {userMessages.length} sent, {assistantMessages.length} received
          </span>
        </div>

        {/* Session Duration */}
        {messages.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BiTime size={14} className="text-white/50" />
              <span className="text-white/70">Duration:</span>
            </div>
            <span className="text-white/90 text-xs">
              {formatDuration(sessionDuration)}
            </span>
          </div>
        )}

        {/* Session Started */}
        {messages.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BiTime size={14} className="text-white/50" />
              <span className="text-white/70">Started:</span>
            </div>
            <span className="text-white/90 text-xs">
              {sessionStartTime.toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      {messages.length === 0 && (
        <div className="text-center text-white/50 text-xs mt-2 italic">
          Start a conversation to see session statistics
        </div>
      )}
    </div>
  );
}
