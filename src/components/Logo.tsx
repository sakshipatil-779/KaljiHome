'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md',
  showSubtitle = true 
}) => {
  const [imageError, setImageError] = useState(false);
  const iconDimension = size === 'sm' ? 40 : size === 'lg' ? 60 : 48;
  const textSize = size === 'sm' ? 'text-2xl' : size === 'lg' ? 'text-4xl' : 'text-3xl';
  const badgeSize = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`} role="banner" aria-label="KaljiHome Official Logo">
      {/* Official Uploaded Logo Image */}
      <div 
        className="relative flex-shrink-0 rounded-2xl overflow-hidden shadow-sm border border-teal-100 bg-white"
        style={{ width: iconDimension, height: iconDimension }}
      >
        {!imageError ? (
          <Image
            src="/assets/kaljihome_official_logo.jpg"
            alt="KaljiHome Official Emblem"
            width={iconDimension}
            height={iconDimension}
            className="w-full h-full object-cover"
            priority
            onError={() => setImageError(true)}
          />
        ) : (
          <svg 
            width={iconDimension} 
            height={iconDimension} 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            aria-hidden="true"
          >
            <circle cx="50" cy="50" r="46" fill="#F0FDFA" stroke="#0D9488" strokeWidth="2.5" />
            <path d="M22 56 C24 38, 38 24, 50 18 C62 24, 76 38, 78 56 C74 54, 68 50, 64 52 C58 54, 54 44, 50 42 C46 44, 42 54, 36 52 C32 50, 26 54, 22 56 Z" fill="#0D9488" />
            <path d="M50 14 L30 32 L34 35 L50 20 L66 35 L70 32 Z" fill="#C2410C" />
            <path d="M26 62 C26 76, 36 84, 50 84 C64 84, 74 76, 74 62 C68 66, 62 66, 58 63 C54 60, 52 64, 50 64 C48 64, 46 60, 42 63 C38 66, 32 66, 26 62 Z" fill="#0F766E" />
            <path d="M50 46 C44 40, 37 46, 37 52 C37 60, 47 67, 50 70 C53 67, 63 60, 63 52 C63 46, 56 40, 50 46 Z" fill="#EA580C" />
            <circle cx="50" cy="53" r="3" fill="#FEF3C7" />
          </svg>
        )}
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`font-extrabold tracking-tight ${textSize}`}>
            <span className="text-kalji-800">Kalji</span>
            <span className="text-terracotta-700">Home</span>
          </span>
          <span className={`inline-flex items-center rounded-full bg-terracotta-50 border border-terracotta-200 text-terracotta-800 font-bold ${badgeSize}`}>
            काळजी
          </span>
        </div>
        {showSubtitle && size !== 'sm' && (
          <span className="text-xs md:text-sm font-medium text-slate-600 -mt-0.5">
            Elderly Care &amp; Daily Medication Companion
          </span>
        )}
      </div>
    </div>
  );
};
