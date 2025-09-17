"use client";

import React, { useEffect, useRef } from "react";
import { useChat } from "@/lib/ChatContext";
import ChatMessageComponent from "../ChatMessage/ChatMessage";
import TypingIndicator from "../TypingIndicator/TypingIndicator";
import ErrorMessage from "../ErrorMessage/ErrorMessage";

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
      {error && <ErrorMessage error={error} />}

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

      {/* Enhanced Loading indicator */}
      <TypingIndicator isLoading={isLoading} />

      <div ref={messagesEndRef} />
    </div>
  );
}
