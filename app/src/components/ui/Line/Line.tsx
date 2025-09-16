import React from "react";

interface LineProps {
  shadowColor?: string;
  children?: React.ReactNode;
}

const Line: React.FC<LineProps> = ({ shadowColor = "#00AC31", children }) => {
  return (
    <div className="w-full max-w-[1200px] mx-auto my-6">
      <div
        className="relative bg-[#2B2B2B] border border-white rounded-2xl p-6 flex items-center justify-between"
        style={{
          boxShadow: `8px 8px 0px ${shadowColor}`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default Line;
