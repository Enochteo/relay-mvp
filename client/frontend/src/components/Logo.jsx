import React from 'react';

export default function Logo({ size = 44 }) {
  return (
    <svg
      className="logo-svg"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Relay logo"
    >
      <defs>
        <linearGradient id="lg-logo" x1="0" x2="1">
          <stop offset="0%" stopColor="#7C5CFF" />
          <stop offset="100%" stopColor="#33D6A6" />
        </linearGradient>
        <filter id="f-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feOffset result="offOut" in="SourceGraphic" dx="0" dy="2" />
          <feGaussianBlur result="blurOut" in="offOut" stdDeviation="4" />
          <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
        </filter>
      </defs>

      <rect x="2" y="2" width="60" height="60" rx="12" fill="url(#lg-logo)" filter="url(#f-shadow)" />
      <g transform="translate(0,2)">
        <path
          d="M22 18c0-1.7 1.3-3 3-3h10c4.4 0 8 3.6 8 8v0c0 4.4-3.6 8-8 8H30v9"
          fill="none"
          stroke="#fff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="translate(0,0)"
        />
      </g>
    </svg>
  );
}
