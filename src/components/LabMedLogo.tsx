'use client'

import React from 'react'
import Image from 'next/image'

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

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Icon frame — background matches logo light blue */}
      <div
        style={{
          width: dimension,
          height: dimension,
          backgroundColor: '#daeef5',
          borderRadius: '10px',
          overflow: 'hidden',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: glowing
            ? '0 0 12px rgba(61,191,191,0.20), 0 2px 8px rgba(13,43,69,0.15)'
            : 'none',
          transition: 'box-shadow 0.3s ease'
        }}
      >
        <Image
          src="/labmed-logo.png"
          alt="LAB&MED Logo"
          width={dimension}
          height={dimension}
          style={{ objectFit: 'contain', width: '100%', height: '100%' }}
          priority
        />
      </div>

      {/* Brand text */}
      {showText && (
        <div className="flex flex-col justify-center min-w-0">
          <span
            className="text-base font-black tracking-widest leading-none"
            style={{ color: '#3dbfbf', letterSpacing: '0.08em' }}
          >
            LAB<span style={{ color: '#5ecfcf' }}>&amp;</span>MED
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
