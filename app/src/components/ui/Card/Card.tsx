import React from "react";

interface UICardProps {
  children: React.ReactNode;
  className?: string;
}

const UICard: React.FC<UICardProps> = ({ children, className }) => {
  return (
    <div
      className={`
        m-10
        bg-[#2B2B2B]
        border border-white
        rounded-2xl
        shadow-[0.5rem_0.5rem_0px_#00AC31,1rem_1rem_0px_#1FF4FF]
        p-6
        w-full max-w-lg
        sm:p-8
        ${className || ""}
      `}
    >
      {children}
    </div>
  );
};

export default UICard;
