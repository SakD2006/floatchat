import React from "react";

interface InputProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

const Input: React.FC<InputProps> = ({
  placeholder = "input...",
  value,
  onChange,
  className = "",
}) => {
  return (
    <div
      className={`relative w-[488px] h-[73px] bg-[#2B2B2B] border border-white 
                  shadow-[8px_8px_0px_#00AC31] rounded-[20px] 
                  flex items-center justify-center ${className}`}
    >
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-[82px] h-[30px] text-white bg-transparent 
                   font-[300] text-[25px] leading-[30px] 
                   font-['Montserrat_Alternates'] 
                   opacity-50 text-center focus:outline-none"
      />
    </div>
  );
};

export default Input;
