"use client";

import React from "react";
import { ChatMessage } from "@/utils/api";
import { BiUser, BiBot } from "react-icons/bi";
import DataVisualization from "../DataVisualization/DataVisualization";
import MessageFormatter from "../MessageFormatter/MessageFormatter";

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
        className={`flex max-w-[85%] sm:max-w-[80%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        } gap-2 sm:gap-3`}
      >
        {/* Avatar */}
        <div
          className={`
            flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center
            ${isUser ? "bg-blue-500 text-white" : "bg-green-500 text-white"}
          `}
        >
          {isUser ? (
            <BiUser size={14} className="sm:w-4 sm:h-4" />
          ) : (
            <BiBot size={14} className="sm:w-4 sm:h-4" />
          )}
        </div>

        {/* Message Content */}
        <div
          className={`
            rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-md
            ${
              isUser
                ? "bg-blue-500 text-white"
                : "bg-[#2B2B2B] text-white border border-white/20"
            }
          `}
        >
          <div className="text-sm leading-relaxed">
            <MessageFormatter content={message.content} isUser={isUser} />
          </div>

          {/* Data visualization */}
          {message.data && message.data.length > 0 && (
            <DataVisualization data={message.data} />
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
