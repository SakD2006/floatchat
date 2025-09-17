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
  sessionStartTime: Date;
  sendMessage: (content: string) => Promise<void>;
  retryLastMessage: () => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState(() => generateSessionId());
  const [sessionStartTime] = useState(() => new Date());
  const [lastUserMessage, setLastUserMessage] = useState<string>("");
  const { isAuthenticated } = useAuth();

  // Load messages from localStorage on mount
  useEffect(() => {
    if (isAuthenticated && typeof window !== "undefined") {
      const savedMessages = localStorage.getItem(
        `floatchat_messages_${sessionId}`
      );
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages).map(
            (msg: ChatMessage) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            })
          );
          setMessages(parsedMessages);
        } catch (err) {
          console.error("[Chat] Failed to load saved messages:", err);
        }
      }
    }
  }, [isAuthenticated, sessionId]);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (
      isAuthenticated &&
      messages.length > 0 &&
      typeof window !== "undefined"
    ) {
      localStorage.setItem(
        `floatchat_messages_${sessionId}`,
        JSON.stringify(messages)
      );
    }
  }, [messages, isAuthenticated, sessionId]);

  // Clear messages when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setMessages([]);
      setError(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem(`floatchat_messages_${sessionId}`);
      }
    }
  }, [isAuthenticated, sessionId]);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const sendMessageInternal = useCallback(
    async (content: string, isRetry: boolean = false) => {
      if (!content.trim() || isLoading) return;

      setIsLoading(true);
      setError(null);

      if (!isRetry) {
        setLastUserMessage(content.trim());
        // Add user message immediately
        const userMessage: ChatMessage = {
          id: generateMessageId(),
          content: content.trim(),
          role: "user",
          timestamp: new Date(),
        };
        addMessage(userMessage);
      }

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

        // Determine specific error message
        let errorContent =
          "Sorry, I'm having trouble responding right now. Please try again later.";
        let errorDetail = "Failed to send message. Please try again.";

        if (err instanceof Error) {
          if (
            err.message.includes("Network Error") ||
            err.message.includes("ERR_NETWORK")
          ) {
            errorContent =
              "Unable to connect to the AI service. Please check if the AI server is running.";
            errorDetail = "Network error: AI service unavailable.";
          } else if (err.message.includes("timeout")) {
            errorContent =
              "The AI is taking longer than expected to process your query. This might be due to a complex request that requires extensive data analysis. Please try rephrasing your question or try again in a moment.";
            errorDetail = "Request timeout after 2 minutes. Please try again.";
          } else if (
            err.message.includes("ECONNABORTED") ||
            err.message.includes("Request failed")
          ) {
            errorContent =
              "The connection was interrupted while the AI was processing your request. This can happen with complex queries that take time to analyze.";
            errorDetail = "Connection aborted. Please try again.";
          }
        }

        // Add error message with retry option
        const errorMessage: ChatMessage = {
          id: generateMessageId(),
          content:
            errorContent +
            (isRetry
              ? ""
              : " You can retry your last message by clicking the retry button."),
          role: "assistant",
          timestamp: new Date(),
        };
        addMessage(errorMessage);

        setError(errorDetail);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, sessionId, addMessage, setLastUserMessage]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      await sendMessageInternal(content, false);
    },
    [sendMessageInternal]
  );

  const retryLastMessage = useCallback(async () => {
    if (!lastUserMessage || isLoading) return;
    await sendMessageInternal(lastUserMessage, true);
  }, [lastUserMessage, isLoading, sendMessageInternal]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setLastUserMessage("");
    if (typeof window !== "undefined") {
      localStorage.removeItem(`floatchat_messages_${sessionId}`);
    }
  }, [sessionId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: ChatContextType = {
    messages,
    isLoading,
    error,
    sessionId,
    sessionStartTime,
    sendMessage,
    retryLastMessage,
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
