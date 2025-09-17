"use client";

import { useState } from "react";
import { BiRightArrow } from "react-icons/bi";
import { useChat } from "@/lib/ChatContext";
import { useAuth } from "@/lib/AuthContext";

export default function ChatInput({
  onSend,
}: {
  onSend?: (message: string) => void;
}) {
  const [message, setMessage] = useState("");
  const { sendMessage, isLoading } = useChat();
  const { isAuthenticated } = useAuth();

  const handleSend = async () => {
    if (!message.trim() || isLoading || !isAuthenticated) return;

    const messageToSend = message.trim();
    setMessage("");

    // Use the chat context to send the message
    if (onSend) {
      onSend(messageToSend);
    } else {
      await sendMessage(messageToSend);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative w-full flex justify-center px-4">
      <div
        className="
          flex items-center justify-between
          w-full max-w-5xl
          bg-[#2B2B2B] border-2 border-white
          shadow-[8px_8px_0px_#00AC31,16px_16px_0px_#1FF4FF]
          rounded-2xl
          p-3
        "
      >
        <input
          type="text"
          placeholder={
            !isAuthenticated
              ? "Please sign in to start chatting..."
              : isLoading
              ? "Sending message..."
              : "How can we help today..."
          }
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={!isAuthenticated || isLoading}
          className="
            flex-1 bg-transparent outline-none
            placeholder-white/70 text-white
            text-lg font-light
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || isLoading || !isAuthenticated}
          className="
            flex items-center justify-center
            p-2 rounded-full
            hover:bg-white/10 transition
            text-white/70 hover:text-white
            disabled:opacity-50 disabled:cursor-not-allowed
            disabled:hover:bg-transparent disabled:hover:text-white/70
          "
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/30 border-t-white" />
          ) : (
            <BiRightArrow size={28} />
          )}
        </button>
      </div>
    </div>
  );
}
