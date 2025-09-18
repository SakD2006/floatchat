"use client";

import React, { useState, useEffect } from "react";

interface TypingIndicatorProps {
  isLoading: boolean;
}

const TYPING_MESSAGES = [
  "Processing your request...",
  "Searching the database...",
  "Analyzing oceanographic data...",
  "Generating insights...",
  "Almost done, please wait...",
];

export default function TypingIndicator({ isLoading }: TypingIndicatorProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setMessageIndex(0);
      setElapsedTime(0);
      return;
    }

    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading) return;

    const messageTimer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % TYPING_MESSAGES.length);
    }, 3000); // Change message every 3 seconds

    return () => clearInterval(messageTimer);
  }, [isLoading]);

  if (!isLoading) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex justify-start">
      <div className="flex gap-2 sm:gap-3">
        <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
          <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white/30 border-t-white" />
        </div>
        <div className="bg-[#2B2B2B] border border-white/20 rounded-2xl px-3 py-2 sm:px-4 sm:py-3 min-w-[200px] sm:min-w-[250px] max-w-[85%] sm:max-w-[80%]">
          <div className="flex items-center space-x-3">
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
            <span className="text-white/70 text-xs sm:text-sm">
              {TYPING_MESSAGES[messageIndex]}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-white/50">
            <span>Processing time: {formatTime(elapsedTime)}</span>
            {elapsedTime > 30 && (
              <span className="text-yellow-400">Complex query detected</span>
            )}
          </div>
          {elapsedTime > 60 && (
            <div className="mt-1 text-xs text-blue-400">
              💡 Large datasets may require extended processing time
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
