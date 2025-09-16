import React from "react";

interface FrameHeadingProps {
  text: string;
}

const FrameHeading: React.FC<FrameHeadingProps> = ({ text }) => {
  return (
    <div
      className="
        flex justify-center items-center
        p-2 sm:p-3 gap-2
        relative select-none
      "
      style={{
        filter:
          "drop-shadow(4px 4px 0px #00AC31) drop-shadow(4px 4px 0px #1FF4FF)",
      }}
    >
      <span
        className="
          font-semibold
          text-white
          px-4 py-2
          text-3xl sm:text-4xl md:text-6xl lg:text-8xl
          leading-tight
          inline-block
        "
        style={{
          WebkitTextStroke: "1px black",
          WebkitTextFillColor: "white",
        }}
      >
        {text}
      </span>
    </div>
  );
};

export default FrameHeading;
