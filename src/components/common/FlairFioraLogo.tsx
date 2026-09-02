import React from 'react';

interface LogoProps {
  className?: string;
  size?: number | string;
  glow?: boolean;
  strokeWidth?: number;
}

export default function FlairFioraLogo({ 
  className = 'w-8 h-8', 
  size, 
  glow = true,
  strokeWidth = 7.5
}: LogoProps) {
  const customStyle = size ? { width: size, height: size } : undefined;

  return (
    <div 
      className={`inline-flex items-center justify-center relative select-none flex-shrink-0 ${className}`}
      style={customStyle}
    >
      <svg 
        viewBox="0 0 300 520" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full object-contain ${glow ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]' : ''}`}
      >
        <defs>
          <linearGradient id="ff-logo-grad-comp" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F1F5F9" />
          </linearGradient>
        </defs>

        <g stroke="url(#ff-logo-grad-comp)" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          {/* Top Feather Quill Stroke */}
          <path d="M 64 274 
                   C 42 248 46 200 78 152 
                   C 114 100 166 62 208 58 
                   C 218 58 224 64 224 74 
                   C 224 88 214 108 194 130 
                   L 86 284 
                   C 78 292 68 284 64 274 Z" 
          />

          {/* Middle Parallel Blade Stroke */}
          <path d="M 88 316 
                   L 174 196 
                   C 192 196 214 208 226 232 
                   C 232 246 228 266 210 292 
                   L 138 370 
                   C 126 382 110 380 98 368 
                   C 86 354 82 334 88 316 Z" 
          />

          {/* Bottom Sector Arc Stroke */}
          <path d="M 152 380 
                   L 216 316 
                   C 238 340 248 376 228 410 
                   C 218 424 200 436 184 426 
                   L 156 394 
                   C 148 386 148 382 152 380 Z" 
          />
        </g>
      </svg>
    </div>
  );
}
