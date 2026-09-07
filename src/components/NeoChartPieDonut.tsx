'use client'

import React, { useState, useMemo } from 'react'
import { PieChart as PieIcon, Sparkles, TrendingUp, Info } from 'lucide-react'

export interface PieDonutDataItem {
  label: string
  value: number
  color: string
  hoverColor?: string
  sublabel?: string
  id?: string
}

interface NeoChartPieDonutProps {
  data: PieDonutDataItem[]
  title: string
  subtitle?: string
  type?: 'donut' | 'pie'
  centerLabel?: string
  centerValue?: string | number
  size?: number
  innerRadius?: number
  outerRadius?: number
  showLegend?: boolean
  formatValue?: (val: number) => string
  badge?: string
  accentColor?: string
  insight?: string
  onSelectSlice?: (item: PieDonutDataItem) => void
}

export default function NeoChartPieDonut({
  data,
  title,
  subtitle,
  type = 'pie',
  centerLabel,
  centerValue,
  size = 270,
  innerRadius = 58,
  outerRadius = 92,
  showLegend = true,
  formatValue = (v: number) => `${v} hitos`,
  badge,
  accentColor = 'cyan',
  insight,
  onSelectSlice
}: NeoChartPieDonutProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const total = useMemo(() => {
    return data.reduce((acc, item) => acc + (item.value || 0), 0)
  }, [data])

  const effectiveInnerRadius = type === 'pie' ? 0 : innerRadius

  // Slices Calculation
  const slices = useMemo(() => {
    if (total <= 0) return []
    let currentAngle = 0
    const cx = 100
    const cy = 100

    return data.map((item, idx) => {
      const val = item.value || 0
      const percent = (val / total) * 100
      const angle = (val / total) * 360

      const startAngle = currentAngle
      const endAngle = currentAngle + angle
      currentAngle = endAngle

      if (angle >= 359.99) {
        return {
          ...item,
          idx,
          percent: 100,
          angle: 360,
          isFullCircle: true,
          cx,
          cy,
          R: outerRadius,
          r: effectiveInnerRadius,
          path: '',
          labelX: cx,
          labelY: cy
        }
      }

      const startRad = ((startAngle - 90) * Math.PI) / 180
      const endRad = ((endAngle - 90) * Math.PI) / 180
      const midRad = (((startAngle + endAngle) / 2 - 90) * Math.PI) / 180

      const x1 = cx + outerRadius * Math.cos(startRad)
      const y1 = cy + outerRadius * Math.sin(startRad)
      const x2 = cx + outerRadius * Math.cos(endRad)
      const y2 = cy + outerRadius * Math.sin(endRad)

      let path = ''
      const largeArc = angle > 180 ? 1 : 0

      if (effectiveInnerRadius > 0) {
        // Donut slice
        const x3 = cx + effectiveInnerRadius * Math.cos(endRad)
        const y3 = cy + effectiveInnerRadius * Math.sin(endRad)
        const x4 = cx + effectiveInnerRadius * Math.cos(startRad)
        const y4 = cy + effectiveInnerRadius * Math.sin(startRad)

        path = `M ${x1.toFixed(3)} ${y1.toFixed(3)} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2.toFixed(3)} ${y2.toFixed(3)} L ${x3.toFixed(3)} ${y3.toFixed(3)} A ${effectiveInnerRadius} ${effectiveInnerRadius} 0 ${largeArc} 0 ${x4.toFixed(3)} ${y4.toFixed(3)} Z`
      } else {
        // Solid Pie slice
        path = `M ${cx} ${cy} L ${x1.toFixed(3)} ${y1.toFixed(3)} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2.toFixed(3)} ${y2.toFixed(3)} Z`
      }

      // Smooth translation when hovered
      const hoverShift = 5
      const dx = Math.cos(midRad) * hoverShift
      const dy = Math.sin(midRad) * hoverShift

      // Coordinates for on-slice percentage label
      const labelR = effectiveInnerRadius > 0 ? (outerRadius + effectiveInnerRadius) / 2 : outerRadius * 0.65
      const labelX = cx + labelR * Math.cos(midRad)
      const labelY = cy + labelR * Math.sin(midRad)

      return {
        ...item,
        idx,
        percent,
        angle,
        startAngle,
        endAngle,
        isFullCircle: false,
        path,
        dx,
        dy,
        labelX,
        labelY
      }
    })
  }, [data, total, outerRadius, effectiveInnerRadius])

  const activeItem = hoveredIndex !== null ? slices[hoveredIndex] : null
  const isMultiItem = slices.length > 4

  return (
    <div className="relative rounded-3xl bg-slate-900/90 border border-white/10 p-5 md:p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition-all duration-300">
      {/* 1. Header con Título Amplio y Badge */}
      <div className="flex items-start justify-between border-b border-white/[0.08] pb-3.5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow">
              <PieIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">{title}</h3>
              {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
            </div>
          </div>
        </div>

        {badge && (
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-slate-950 text-cyan-300 border border-cyan-500/30 shadow-inner">
            {badge}
          </span>
        )}
      </div>

      {/* 2. Cuerpo Principal: Gráfica + Panel de Leyenda TODO VISIBLE (SIN SCROLL) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* SVG Graphic */}
        <div className={`${isMultiItem ? 'md:col-span-5' : 'md:col-span-5'} flex items-center justify-center relative select-none py-2`}>
          <div className="relative flex items-center justify-center" style={{ width: size, height: size, maxWidth: '100%' }}>
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full transform transition-transform duration-500 overflow-visible"
            >
              <defs>
                <filter id={`neon-glow-${title.replace(/[^a-zA-Z0-9]/g, '')}`} x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Guide circle */}
              <circle
                cx="100"
                cy="100"
                r={outerRadius}
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth={outerRadius - effectiveInnerRadius}
              />

              {/* Slices */}
              {slices.map((slice, i) => {
                const isHovered = hoveredIndex === i
                if (slice.isFullCircle) {
                  return (
                    <g key={i}>
                      <circle
                        cx="100"
                        cy="100"
                        r={effectiveInnerRadius > 0 ? (outerRadius + effectiveInnerRadius) / 2 : outerRadius}
                        fill={effectiveInnerRadius > 0 ? 'none' : slice.color}
                        stroke={slice.color}
                        strokeWidth={effectiveInnerRadius > 0 ? outerRadius - effectiveInnerRadius : 2}
                        className="transition-all duration-300 cursor-pointer"
                        onMouseEnter={() => setHoveredIndex(i)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        onClick={() => onSelectSlice && onSelectSlice(slice)}
                      />
                      <text
                        x="100"
                        y="105"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="14"
                        fontWeight="900"
                        fontFamily="monospace"
                        className="pointer-events-none drop-shadow-lg"
                      >
                        100%
                      </text>
                    </g>
                  )
                }

                return (
                  <g key={i}>
                    <path
                      d={slice.path}
                      fill={slice.color}
                      stroke="rgba(15, 23, 42, 0.95)"
                      strokeWidth="2"
                      strokeLinejoin="round"
                      style={{
                        transform: isHovered ? `translate(${(slice as any).dx || 0}px, ${(slice as any).dy || 0}px) scale(1.04)` : 'none',
                        transformOrigin: '100px 100px',
                        filter: isHovered ? `url(#neon-glow-${title.replace(/[^a-zA-Z0-9]/g, '')})` : 'none',
                        opacity: hoveredIndex !== null && !isHovered ? 0.45 : 1
                      }}
                      className="transition-all duration-200 cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onClick={() => onSelectSlice && onSelectSlice(slice)}
                    />

                    {/* Direct slice percentage label on Pie Charts */}
                    {type === 'pie' && slice.percent >= 6 && (
                      <g className="pointer-events-none select-none">
                        <text
                          x={(slice as any).labelX + (isHovered ? (slice as any).dx : 0)}
                          y={(slice as any).labelY + (isHovered ? (slice as any).dy : 0) + 4}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize={slice.percent >= 20 ? '11' : '9.5'}
                          fontWeight="900"
                          fontFamily="monospace"
                          className="drop-shadow-[0_2px_4px_rgba(0,0,0,1)]"
                        >
                          {slice.percent.toFixed(1)}%
                        </text>
                      </g>
                    )}
                  </g>
                )
              })}
            </svg>

            {/* Central Indicator for Donut Mode */}
            {type === 'donut' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
                {activeItem ? (
                  <div className="animate-fade-in space-y-0.5">
                    <span className="text-[11px] font-mono uppercase font-bold text-slate-300 block truncate max-w-[110px]">
                      {activeItem.label}
                    </span>
                    <span className="text-xl font-black text-white font-mono block leading-none">
                      {activeItem.percent.toFixed(1)}%
                    </span>
                    <span className="text-xs font-mono font-bold text-cyan-300 block mt-1">
                      {formatValue(activeItem.value)}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-mono uppercase font-bold text-slate-400 block truncate max-w-[110px]">
                      {centerLabel || 'Total'}
                    </span>
                    <span className="text-lg font-black text-white font-mono block leading-none">
                      {centerValue !== undefined ? centerValue : total}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">100% Base</span>
                  </div>
                )}
              </div>
            )}

            {/* Tooltip flotante al pasar sobre el pastel */}
            {type === 'pie' && activeItem && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-950/95 border border-cyan-500/60 px-3.5 py-1.5 rounded-2xl shadow-2xl backdrop-blur-md pointer-events-none whitespace-nowrap z-30 animate-fade-in flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeItem.color }} />
                <span className="text-xs font-bold text-white truncate max-w-[140px]">{activeItem.label}</span>
                <span className="text-xs font-mono font-black text-cyan-300">{activeItem.percent.toFixed(1)}%</span>
                <span className="text-[11px] font-mono text-slate-300">({formatValue(activeItem.value)})</span>
              </div>
            )}
          </div>
        </div>

        {/* 3. Panel de Leyenda Espaciosa TODO VISIBLE (SIN SCROLLBAR) */}
        {showLegend && (
          <div className="md:col-span-7">
            <div className={`gap-2 ${isMultiItem ? 'grid grid-cols-1 sm:grid-cols-2' : 'space-y-2'}`}>
              {slices.map((item, idx) => {
                const isHovered = hoveredIndex === idx

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => onSelectSlice && onSelectSlice(item)}
                    className={`p-2 rounded-2xl transition-all duration-200 cursor-pointer border ${
                      isHovered
                        ? 'bg-white/[0.12] border-cyan-400/60 shadow-lg scale-[1.01]'
                        : 'bg-slate-950/50 hover:bg-slate-950/80 border-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-3 h-3 rounded-lg flex-shrink-0 shadow-sm transition-transform duration-200"
                          style={{
                            backgroundColor: item.color,
                            transform: isHovered ? 'scale(1.25)' : 'scale(1)',
                            boxShadow: isHovered ? `0 0 10px ${item.color}` : 'none'
                          }}
                        />
                        <div className="min-w-0 truncate">
                          <div className="text-xs font-bold text-white leading-tight truncate" title={item.label}>
                            {item.label}
                          </div>
                          {item.sublabel && (
                            <div className="text-[9.5px] text-slate-400 leading-tight truncate" title={item.sublabel}>
                              {item.sublabel}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 font-mono">
                        <div className="text-xs font-black text-white">
                          {item.percent.toFixed(1)}%
                        </div>
                        <div className="text-[9.5px] font-bold text-cyan-300">
                          {formatValue(item.value)}
                        </div>
                      </div>
                    </div>

                    {/* Micro Progress Bar de distribución */}
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percent}%`,
                          backgroundColor: item.color
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. Recuadro de Insight Ejecutivo / Comprensión Rápida */}
      {insight && (
        <div className="bg-slate-950/70 p-3 rounded-2xl border border-indigo-500/20 text-xs text-gray-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed text-[11px]">{insight}</div>
        </div>
      )}

      {/* 5. Footer con Métricas Totales */}
      <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400 font-mono">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> {slices.length} Categorías Analizadas
        </span>
        <span className="text-cyan-300 font-black text-xs">Total: {total} Obligaciones</span>
      </div>
    </div>
  )
}
