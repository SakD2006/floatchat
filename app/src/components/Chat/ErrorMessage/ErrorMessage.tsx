"use client";

import React from "react";
import { useChat } from "@/lib/ChatContext";

interface ErrorMessageProps {
  error: string;
}

export default function ErrorMessage({ error }: ErrorMessageProps) {
  const { retryLastMessage, clearError, isLoading } = useChat();

  const handleRetry = async () => {
    clearError();
    await retryLastMessage();
  };

  return (
    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-100 text-sm space-y-3">
      <div className="flex items-start space-x-2">
        <span className="text-red-400">⚠️</span>
        <div className="flex-1">
          <div className="text-red-100">{error}</div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={handleRetry}
          disabled={isLoading}
          className="
            px-3 py-1 text-xs
            bg-red-500/30 hover:bg-red-500/50
            border border-red-400/50 hover:border-red-400
            rounded transition-colors
            text-red-100 hover:text-white
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {isLoading ? "Retrying..." : "Retry"}
        </button>

        <button
          onClick={clearError}
          className="
            px-3 py-1 text-xs
            bg-gray-500/30 hover:bg-gray-500/50
            border border-gray-400/50 hover:border-gray-400
            rounded transition-colors
            text-gray-100 hover:text-white
          "
        >
          Dismiss
        </button>
      </div>

      <div className="text-xs text-red-200/70 mt-2">
        💡 Tips: Try rephrasing your question, or check if the AI service is
        running properly.
      </div>
    </div>
  );
}
