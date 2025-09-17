"use client";

import React, { useEffect, useRef } from "react";
import { useChat } from "@/lib/ChatContext";
import ChatMessageComponent from "../ChatMessage/ChatMessage";

export default function ChatMessages() {
  const { messages, isLoading, error } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      {/* Error message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-100 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Messages */}
      {messages.length === 0 && !isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-white/50 max-w-md">
            <div className="text-lg font-light mb-2">Welcome to FloatChat!</div>
            <div className="text-sm">
              Ask me anything about oceanographic data, marine research, or get
              insights from our ARGO float database.
            </div>
          </div>
        </div>
      )}

      {messages.map((message) => (
        <ChatMessageComponent key={message.id} message={message} />
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-start">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
            </div>
            <div className="bg-[#2B2B2B] border border-white/20 rounded-2xl px-4 py-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-white/50 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-2 h-2 bg-white/50 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
