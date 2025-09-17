"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import {
  ChatMessage,
  ChatResponse,
  chatAPI,
  generateSessionId,
  generateMessageId,
} from "@/utils/api";
import { useAuth } from "./AuthContext";

interface ChatContextType {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sessionId: string;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState(() => generateSessionId());
  const { isAuthenticated } = useAuth();

  // Clear messages when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setMessages([]);
      setError(null);
    }
  }, [isAuthenticated]);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      setIsLoading(true);
      setError(null);

      // Add user message immediately
      const userMessage: ChatMessage = {
        id: generateMessageId(),
        content: content.trim(),
        role: "user",
        timestamp: new Date(),
      };
      addMessage(userMessage);

      try {
        // Send to AI service
        const response: ChatResponse = await chatAPI.sendMessage(
          content.trim(),
          sessionId
        );

        // Add AI response
        const aiMessage: ChatMessage = {
          id: generateMessageId(),
          content: response.summary,
          role: "assistant",
          timestamp: new Date(),
          data: response.data || undefined,
        };
        addMessage(aiMessage);
      } catch (err) {
        console.error("[Chat] Failed to send message:", err);

        // Add error message
        const errorMessage: ChatMessage = {
          id: generateMessageId(),
          content:
            "Sorry, I'm having trouble responding right now. Please try again later.",
          role: "assistant",
          timestamp: new Date(),
        };
        addMessage(errorMessage);

        setError("Failed to send message. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, sessionId, addMessage]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: ChatContextType = {
    messages,
    isLoading,
    error,
    sessionId,
    sendMessage,
    clearMessages,
    clearError,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
