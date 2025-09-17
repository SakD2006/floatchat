"use client";

import React from "react";
import Link from "next/link";

const GetStarted: React.FC = () => {
  return (
    <div className="flex justify-center items-center w-full py-8">
      <Link href="/chat">
        <button
          className="flex justify-center items-center px-6 py-4 rounded-2xl border-2 border-white 
        bg-[#2B2B2B] shadow-[8px_8px_0px_#1FF4FF,16px_16px_0px_#00AC31]
        max-w-md w-[90%] text-white text-2xl sm:text-3xl md:text-4xl lg:text-3xl text-center text-nowrap"
        >
          Get Started
        </button>
      </Link>
    </div>
  );
};

export default GetStarted;
