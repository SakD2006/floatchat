"use client";

import React from "react";
import { ChatMessage } from "@/utils/api";
import { BiUser, BiBot } from "react-icons/bi";

interface ChatMessageProps {
  message: ChatMessage;
}

export default function ChatMessageComponent({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const timestamp = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`flex w-full mb-4 ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex max-w-[80%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        } gap-3`}
      >
        {/* Avatar */}
        <div
          className={`
            flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
            ${isUser ? "bg-blue-500 text-white" : "bg-green-500 text-white"}
          `}
        >
          {isUser ? <BiUser size={16} /> : <BiBot size={16} />}
        </div>

        {/* Message Content */}
        <div
          className={`
            rounded-2xl px-4 py-3 shadow-md
            ${
              isUser
                ? "bg-blue-500 text-white"
                : "bg-[#2B2B2B] text-white border border-white/20"
            }
          `}
        >
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>

          {/* Data visualization placeholder */}
          {message.data && message.data.length > 0 && (
            <div className="mt-3 p-3 bg-black/20 rounded-lg">
              <div className="text-xs text-white/70 mb-2">
                Data ({message.data.length} records)
              </div>
              <div className="text-xs text-white/50">
                📊 Data visualization will be rendered here
              </div>
              {/* TODO: Implement data visualization component */}
            </div>
          )}

          <div
            className={`
              text-xs mt-2 opacity-70
              ${isUser ? "text-right" : "text-left"}
            `}
          >
            {timestamp}
          </div>
        </div>
      </div>
    </div>
  );
}
