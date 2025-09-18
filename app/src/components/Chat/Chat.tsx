"use client";

import { SubHeading } from "@/components/ui";
import ChatInput from "./ChatInput/ChatInput";
import ChatMessages from "./ChatMessages/ChatMessages";
import ChatSessionInfo from "./ChatSessionInfo/ChatSessionInfo";
import ConnectionStatus from "./ConnectionStatus/ConnectionStatus";
import { useAuth } from "@/lib/AuthContext";
import { useChat } from "@/lib/ChatContext";
import { useState } from "react";
import { BiChevronDown, BiChevronUp } from "react-icons/bi";

export default function Chat() {
  const { user, isAuthenticated } = useAuth();
  const { messages, clearMessages, clearError } = useChat();
  const [showSessionInfo, setShowSessionInfo] = useState(false);

  const getGreeting = () => {
    if (user?.name) {
      return `Welcome back, ${user.name}`;
    }
    if (user?.email) {
      const name = user.email.split("@")[0];
      return `Welcome back, ${name}`;
    }
    return isAuthenticated ? "Welcome back!" : "Welcome to FloatChat";
  };

  const handleClearChat = () => {
    clearMessages();
    clearError();
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col h-full p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6 flex-shrink-0">
          <SubHeading text={getGreeting()} />
        </div>

        <div className="flex-1 flex items-center justify-center min-h-0">
          <div className="text-center text-white/70 max-w-md px-4">
            <div className="text-lg sm:text-xl font-light mb-4">
              Please sign in to start chatting with FloatChat AI
            </div>
            <div className="text-sm sm:text-base text-white/50">
              Get insights from oceanographic data and marine research
            </div>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 flex-shrink-0">
          <ChatInput />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 sm:p-6">
      {/* Header - Show greeting only if no messages exist */}
      {messages.length === 0 ? (
        <div className="mb-4 sm:mb-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <SubHeading text={getGreeting()} />
              <ConnectionStatus className="mt-1" />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSessionInfo(!showSessionInfo)}
                className="
                  px-3 py-2 text-sm flex items-center gap-2
                  bg-white/5 hover:bg-white/10
                  border border-white/20 hover:border-white/30
                  rounded-lg transition-colors
                  text-white/70 hover:text-white
                "
              >
                Session Info
                {showSessionInfo ? (
                  <BiChevronUp size={16} />
                ) : (
                  <BiChevronDown size={16} />
                )}
              </button>
              <button
                onClick={handleClearChat}
                className="
                  px-4 py-2 text-sm
                  bg-white/5 hover:bg-white/10
                  border border-white/20 hover:border-white/30
                  rounded-lg transition-colors
                  text-white/70 hover:text-white
                "
              >
                Clear Chat
              </button>
            </div>
          </div>

          {/* Collapsible Session Info */}
          {showSessionInfo && (
            <div className="mt-4 animate-in slide-in-from-top-2 duration-200">
              <ChatSessionInfo />
            </div>
          )}
        </div>
      ) : (
        // Compact header when messages exist - just the action buttons
        <div className="mb-4 flex-shrink-0">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setShowSessionInfo(!showSessionInfo)}
              className="
                px-3 py-2 text-sm flex items-center gap-2
                bg-white/5 hover:bg-white/10
                border border-white/20 hover:border-white/30
                rounded-lg transition-colors
                text-white/70 hover:text-white
              "
            >
              Session Info
              {showSessionInfo ? (
                <BiChevronUp size={16} />
              ) : (
                <BiChevronDown size={16} />
              )}
            </button>
            <button
              onClick={handleClearChat}
              className="
                px-4 py-2 text-sm
                bg-white/5 hover:bg-white/10
                border border-white/20 hover:border-white/30
                rounded-lg transition-colors
                text-white/70 hover:text-white
              "
            >
              Clear Chat
            </button>
          </div>

          {/* Collapsible Session Info */}
          {showSessionInfo && (
            <div className="mt-4 animate-in slide-in-from-top-2 duration-200">
              <ChatSessionInfo />
            </div>
          )}
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden min-h-0">
        <ChatMessages />
      </div>

      {/* Input Area */}
      <div className="mt-4 sm:mt-6 flex-shrink-0">
        <ChatInput />
      </div>
    </div>
  );
}
