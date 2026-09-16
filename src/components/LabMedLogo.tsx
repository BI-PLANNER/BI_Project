'use client'

import React from 'react'

interface LabMedLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | number
  showText?: boolean
  className?: string
  glowing?: boolean
}

export default function LabMedLogo({
  size = 'md',
  showText = true,
  className = '',
  glowing = true
}: LabMedLogoProps) {
  let dimension = 40
  if (typeof size === 'number') {
    dimension = size
  } else {
    switch (size) {
      case 'sm': dimension = 32; break
      case 'md': dimension = 42; break
      case 'lg': dimension = 56; break
      case 'xl': dimension = 72; break
    }
  }

  // Brand colors from logo
  const NAVY  = '#0d2b45'
  const TEAL  = '#3dbfbf'
  const TEAL2 = '#5ecfcf'

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Icon frame — flat, minimal */}
      <div
        style={{ width: dimension, height: dimension, backgroundColor: NAVY }}
        className={`relative flex items-center justify-center rounded-xl overflow-hidden flex-shrink-0 transition-all duration-300 ${
          glowing
            ? 'shadow-[0_0_14px_rgba(61,191,191,0.25)] hover:shadow-[0_0_22px_rgba(61,191,191,0.45)]'
            : ''
        }`}
      >
        {/* Molecule SVG — matches real logo */}
        <svg
          viewBox="0 0 100 100"
          className="w-[72%] h-[72%]"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Left circle */}
          <circle cx="22" cy="50" r="16" fill={TEAL} />
          {/* Center circle (slightly lighter) */}
          <circle cx="50" cy="50" r="14" fill={TEAL2} opacity="0.85" />
          {/* Right circle */}
          <circle cx="78" cy="50" r="12" fill={TEAL} opacity="0.7" />
          {/* Connecting bonds */}
          <line x1="37" y1="50" x2="36" y2="50" stroke={NAVY} strokeWidth="5" strokeLinecap="round" />
          <line x1="37" y1="50" x2="36" y2="50" stroke="transparent" strokeWidth="0" />
          {/* Bond left-center */}
          <rect x="35" y="46" width="17" height="8" rx="4" fill={NAVY} opacity="0.5" />
          {/* Bond center-right */}
          <rect x="62" y="46" width="17" height="8" rx="4" fill={NAVY} opacity="0.5" />
        </svg>
      </div>

      {/* Brand text */}
      {showText && (
        <div className="flex flex-col justify-center min-w-0">
          <span
            className="text-base font-black tracking-widest leading-none"
            style={{ color: TEAL, letterSpacing: '0.08em' }}
          >
            LAB<span style={{ color: TEAL2 }}>&amp;</span>MED
          </span>
          <span
            className="text-[9px] font-semibold tracking-widest uppercase mt-0.5"
            style={{ color: '#4a7a8a' }}
          >
            Control Planner Pro
          </span>
        </div>
      )}
    </div>
  )
}
