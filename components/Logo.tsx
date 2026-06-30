import React from "react";

interface LogoProps {
  className?: string;
}

export default function Logo({ className = "w-10 h-10" }: LogoProps) {
  return (
    <div className={className}>
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb">
              <animate attributeName="stop-color" dur="4s" repeatCount="indefinite" values="#2563eb;#4edea3;#2563eb" />
            </stop>
            <stop offset="100%" stopColor="#1e3a8a">
              <animate attributeName="stop-color" dur="4s" repeatCount="indefinite" values="#1e3a8a;#2563eb;#1e3a8a" />
            </stop>
          </linearGradient>
        </defs>
        {/* Scale/Pulse group */}
        <g>
          <animateTransform 
            additive="sum" 
            attributeName="transform" 
            dur="3s" 
            repeatCount="indefinite" 
            type="scale" 
            values="1;1.05;1" 
            {...{ pivot: "50 50" }} 
          />
          {/* Outer Hexagon/Shield */}
          <path d="M50 5 L85 25 L85 75 L50 95 L15 75 L15 25 Z" fill="none" stroke="url(#logo-grad)" strokeWidth="4">
            <animate attributeName="stroke-dasharray" dur="4s" repeatCount="indefinite" values="0,300;300,0;0,300" />
          </path>
          {/* Inner Scanning Bar */}
          <rect fill="#4edea3" height="4" opacity="0.8" width="60" x="20" y="48">
            <animate attributeName="y" dur="2s" repeatCount="indefinite" values="30;70;30" />
            <animate attributeName="opacity" dur="2s" repeatCount="indefinite" values="0.2;0.8;0.2" />
          </rect>
          {/* Document Lines */}
          <path d="M35 40 H65 M35 50 H65 M35 60 H55" opacity="0.6" stroke="#F8FAFC" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}
