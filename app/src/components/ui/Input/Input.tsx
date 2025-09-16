import React from "react";

interface InputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  required?: boolean;
}

const Input: React.FC<InputProps> = ({
  type = "text",
  placeholder = "input...",
  value,
  onChange,
  className = "",
  required = false,
}) => {
  return (
    <div
      className={`relative bg-[#2B2B2B] border border-white 
                  shadow-[8px_8px_0px_#00AC31] rounded-[24px] mx-4 my-6 h-12
                  flex items-center justify-center overflow-clip ${className}`}
    >
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="text-white bg-transparent 
                   font-[300] text-[25px] leading-[30px]
                   opacity-50 text-center focus:outline-none"
        required={required}
      />
    </div>
  );
};

export default Input;
