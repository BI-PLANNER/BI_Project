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
  // Dimensions
  let dimension = 40
  if (typeof size === 'number') {
    dimension = size
  } else {
    switch (size) {
      case 'sm':
        dimension = 32
        break
      case 'md':
        dimension = 42
        break
      case 'lg':
        dimension = 56
        break
      case 'xl':
        dimension = 72
        break
    }
  }

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Icon Frame with Neomorphic Glass Backing & Glow */}
      <div
        style={{ width: dimension, height: dimension }}
        className={`relative flex items-center justify-center rounded-2xl overflow-hidden transition-all duration-500 flex-shrink-0 group ${
          glowing
            ? 'bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.25),inset_0_1px_0_0_rgba(255,255,255,0.1)] hover:border-cyan-400/60 hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]'
            : 'bg-slate-900 border border-white/10'
        }`}
      >
        {/* Subtle Ambient Behind Logo */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-teal-500/5 to-transparent pointer-events-none" />

        {/* Vector SVG Emblem */}
        <svg
          viewBox="0 0 500 500"
          className="w-full h-full p-1.5 object-contain transition-transform duration-500 group-hover:scale-105"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logoTeal" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="40%" stopColor="#06b6d4" />
              <stop offset="80%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>

            <linearGradient id="logoNavy" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="50%" stopColor="#0c4a6e" />
              <stop offset="100%" stopColor="#082f49" />
            </linearGradient>

            <linearGradient id="logoLiquid" x1="0%" y1="100%" x2="50%" y2="0%">
              <stop offset="0%" stopColor="#0369a1" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>

            <linearGradient id="logoDna" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* 1. Left Medical Cross */}
          <path
            d="M 125 210 H 90 V 245 H 125 V 280 H 160 V 245 H 195 V 210 H 160 V 175 H 125 Z"
            fill="url(#logoNavy)"
            stroke="url(#logoTeal)"
            strokeWidth="7"
            strokeLinejoin="round"
          />

          {/* 2. Main Beaker Outline */}
          <path
            d="M 215 130 
               L 215 190 
               C 215 200, 185 240, 145 320 
               C 120 370, 150 420, 210 420 
               L 290 420 
               C 350 420, 380 370, 355 320 
               C 315 240, 285 200, 285 190 
               L 285 130 
               Z"
            fill="url(#logoNavy)"
            stroke="url(#logoTeal)"
            strokeWidth="14"
            strokeLinejoin="round"
          />

          {/* Beaker Lip */}
          <rect x="200" y="115" width="100" height="18" rx="9" fill="url(#logoTeal)" />

          {/* 3. Liquid Inside */}
          <path
            d="M 160 330 
               Q 210 290, 250 330 
               T 340 330 
               L 345 365 
               C 335 405, 305 410, 250 410 
               C 195 410, 165 405, 155 365 
               Z"
            fill="url(#logoLiquid)"
          />

          {/* Secondary Wave */}
          <path
            d="M 175 350 
               Q 220 320, 250 350 
               T 325 350 
               L 328 375 
               C 318 400, 290 405, 250 405 
               C 210 405, 182 400, 172 375 
               Z"
            fill="url(#logoTeal)"
            opacity="0.5"
          />

          {/* 4. Bubbles */}
          <circle cx="230" cy="270" r="11" fill="#ffffff" opacity="0.85" />
          <circle cx="270" cy="240" r="8" fill="#38bdf8" opacity="0.9" />
          <circle cx="250" cy="180" r="13" fill="#22d3ee" opacity="0.9" />
          <circle cx="240" cy="145" r="9" fill="#ffffff" opacity="0.85" />
          <circle cx="260" cy="100" r="7" fill="#38bdf8" opacity="0.8" />
          <circle cx="248" cy="65" r="10" fill="#22d3ee" opacity="0.95" />

          {/* 5. DNA Helix Structure */}
          <path
            d="M 310 190 
               C 380 230, 390 280, 340 330 
               C 300 370, 320 420, 380 435 
               C 410 440, 420 410, 400 380
               C 370 335, 410 260, 360 210
               Z"
            fill="url(#logoDna)"
          />

          {/* DNA Rungs */}
          <line x1="330" y1="230" x2="365" y2="245" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" opacity="0.95" />
          <line x1="345" y1="265" x2="380" y2="275" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" opacity="0.95" />
          <line x1="345" y1="300" x2="375" y2="305" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" opacity="0.95" />
          <line x1="330" y1="335" x2="360" y2="335" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" opacity="0.95" />
          <line x1="325" y1="370" x2="360" y2="380" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" opacity="0.95" />
          <line x1="340" y1="405" x2="375" y2="415" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" opacity="0.95" />
        </svg>
      </div>

      {/* Brand Name Typography */}
      {showText && (
        <div className="flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-black tracking-wider bg-gradient-to-r from-white via-cyan-100 to-teal-300 bg-clip-text text-transparent font-sans">
              LAB & MED
            </span>
          </div>
          <span className="text-[9.5px] font-mono font-bold text-cyan-400 tracking-wider uppercase">
            Control Planner Pro
          </span>
        </div>
      )}
    </div>
  )
}
