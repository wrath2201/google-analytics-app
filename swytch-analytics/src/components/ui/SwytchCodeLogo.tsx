import React from 'react';

interface SwytchCodeLogoProps {
  className?: string;
  iconSize?: string;
  textSize?: string;
  theme?: 'light' | 'dark';
  withLabel?: string;
  hideIcon?: boolean;
}

export const SwytchCodeLogo: React.FC<SwytchCodeLogoProps> = ({ 
  className = "", 
  iconSize = "h-4", 
  textSize = "text-[13px]",
  theme = 'light',
  withLabel,
  hideIcon = false
}) => {
  const textColor = theme === 'dark' ? 'text-white' : 'text-[#1A120B]';
  const labelColor = theme === 'dark' ? 'text-[#8C8578]' : 'text-[#7B4A2A]';
  
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {withLabel && (
        <span className={`${textSize} font-black uppercase tracking-[0.1em] ${labelColor} mr-1`}>
          {withLabel}
        </span>
      )}
      {!hideIcon && (
        <div className={`${iconSize} aspect-square flex-shrink-0`}>
          <svg viewBox="0 0 400 400" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="400" fill="#1a1f2e" rx="60"/>
            <path
              d="M 310 120 A 130 130 0 1 0 290 295"
              stroke="#F5A623"
              strokeWidth="28"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 240 60 L 140 210 L 190 210 L 160 340 L 265 185 L 212 185 Z"
              fill="#F5A623"
            />
          </svg>
        </div>
      )}
      <div className={`${textSize} font-black flex items-center tracking-tight ${textColor}`} style={{ fontFamily: "'Inter', sans-serif" }}>
        <span className="font-extrabold">Swytch</span>
        <span className="font-light opacity-85">Code</span>
      </div>
    </div>
  );
};
