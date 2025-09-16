import React from "react";

interface InputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  required?: boolean;
  color?: string;
}

const Input: React.FC<InputProps> = ({
  type = "text",
  placeholder = "input...",
  value,
  onChange,
  className = "",
  required = false,
  color = "white",
}) => {
  return (
    <div
      className={`relative bg-[#2B2B2B] border border-white 
                  rounded-[12px] mx-4 my-6 h-12
                  flex items-center justify-center overflow-clip font-['MontserratAlternates-Light'] ${className}`}
      style={{ boxShadow: `8px 8px 0px ${color}` }}
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
