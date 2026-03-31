import React from 'react';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  textSize?: string;
  iconSize?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = "", 
  iconOnly = false,
  textSize = "text-2xl",
  iconSize = "h-8"
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${iconSize} aspect-square flex items-center justify-center`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="bar1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#326295" />
              <stop offset="100%" stopColor="#254D75" />
            </linearGradient>
            <linearGradient id="bar2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4A90C0" />
              <stop offset="100%" stopColor="#3578A6" />
            </linearGradient>
            <linearGradient id="bar3" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#5DB0A6" />
              <stop offset="100%" stopColor="#489188" />
            </linearGradient>
            <linearGradient id="bar4" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F2B16F" />
              <stop offset="100%" stopColor="#D99A59" />
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
              <feOffset dx="0" dy="1" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          <g filter="url(#shadow)">
            {/* Bars */}
            <rect x="6" y="62" width="16" height="28" rx="4" fill="url(#bar1)" />
            <rect x="29" y="52" width="16" height="38" rx="4" fill="url(#bar2)" />
            <rect x="52" y="38" width="16" height="52" rx="4" fill="url(#bar3)" />
            <rect x="75" y="22" width="16" height="68" rx="4" fill="url(#bar4)" />
            
            {/* Smooth Growth Arrow */}
            <path
              d="M6 58C28 53 65 38 88 12"
              stroke="#5DB0A6"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="M72 18L88 12L94 28"
              stroke="#5DB0A6"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      </div>
      {!iconOnly && (
        <span className={`${textSize} font-[900] tracking-tighter text-[#1A1814] leading-none`} style={{ fontFamily: "'Inter', sans-serif" }}>
          Statsy
        </span>
      )}
    </div>
  );
};
