"use client";

import { SubHeading } from "@/components/ui";
import ChatInput from "./ChatInput/ChatInput";
import ChatMessages from "./ChatMessages/ChatMessages";
import { useAuth } from "@/lib/AuthContext";
import { useChat } from "@/lib/ChatContext";

export default function Chat() {
  const { user, isAuthenticated } = useAuth();
  const { clearMessages, clearError } = useChat();

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
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <SubHeading text={getGreeting()} />
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-white/70 max-w-md">
            <div className="text-lg font-light mb-4">
              Please sign in to start chatting with FloatChat AI
            </div>
            <div className="text-sm text-white/50">
              Get insights from oceanographic data and marine research
            </div>
          </div>
        </div>

        <div className="mt-6">
          <ChatInput />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <SubHeading text={getGreeting()} />
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

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ChatMessages />
      </div>

      {/* Input Area */}
      <div className="mt-6">
        <ChatInput />
      </div>
    </div>
  );
}
