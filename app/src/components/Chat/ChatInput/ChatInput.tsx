"use client";

import { useState } from "react";
import { BiRightArrow } from "react-icons/bi";

export default function ChatInput({
  onSend,
}: {
  onSend?: (message: string) => void;
}) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;
    onSend?.(message);
    setMessage("");
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
          placeholder="How can we help today..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          className="
            flex-1 bg-transparent outline-none
            placeholder-white/70 text-white
            text-lg font-light
          "
        />
        <button
          onClick={handleSend}
          className="
            flex items-center justify-center
            p-2 rounded-full
            hover:bg-white/10 transition
            text-white/70 hover:text-white
          "
        >
          <BiRightArrow size={28} />
        </button>
      </div>
    </div>
  );
}
