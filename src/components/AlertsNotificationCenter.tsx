'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  Bell,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Clock,
  Download,
  RefreshCw,
  Search,
  X,
  Package,
  ShoppingCart,
  CheckCircle2,
  DollarSign,
  Activity,
  Layers,
  Calendar,
  CalendarDays,
  Tag,
  ArrowUpDown
} from 'lucide-react'

export interface AlertaItem {
  sku: string
  producto: string
  marca: string
  stock_actual_kits: number
  stock_actual_pruebas_u: number
  pedidos_en_transito_kits: number
  consumo_diario_kits: number
  dias_cobertura: number
  stock_seguridad_kits: number
  rop_kits: number
  stock_maximo_kits: number
  sugerido_comprar_kits: number
  costo_estimado_usd: number
  nivel_alerta: 'CRITICO' | 'REORDEN' | 'RIESGO_FEFO' | 'NORMAL'
  badge_color: 'rose' | 'amber' | 'indigo' | 'emerald'
  lote_proximo?: {
    lote: string
    vence: string
    dias: number
    kits: number
  } | null
  accion_sugerida: string
  fecha_evaluacion: string
}

export interface AlertasResumen {
  total_evaluados: number
  total_alertas_activas: number
  quiebres_inminentes_criticos: number
  reorden_sugerido: number
  riesgo_fefo_caducidad: number
  inventario_normal: number
  monto_total_sugerido_usd: number
}

interface Props {
  className?: string
  initialAlertas?: AlertaItem[]
  initialResumen?: AlertasResumen
  onSyncComplete?: (data: any) => void
}

export default function AlertsNotificationCenter({
  className = '',
  initialAlertas,
  initialResumen,
  onSyncComplete
}: Props) {
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [alertas, setAlertas] = useState<AlertaItem[]>(initialAlertas || [])
  const [resumen, setResumen] = useState<AlertasResumen>(
    initialResumen || {
      total_evaluados: 236,
      total_alertas_activas: 224,
      quiebres_inminentes_criticos: 114,
      reorden_sugerido: 39,
      riesgo_fefo_caducidad: 71,
      inventario_normal: 12,
      monto_total_sugerido_usd: 288138.95
    }
  )
  const [activeFilter, setActiveFilter] = useState<'TODAS' | 'CRITICO' | 'REORDEN' | 'RIESGO_FEFO'>('TODAS')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('ALL')
  const [sortBy, setSortBy] = useState<'urgencia' | 'fecha_quiebre' | 'fecha_vencimiento' | 'inversion' | 'cobertura'>('urgencia')
  const [lastSyncTime, setLastSyncTime] = useState<string>('Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Formateador de fechas futuras estimadas
  const formatFutureDate = (daysOffset: number) => {
    const d = new Date()
    d.setDate(d.getDate() + Math.max(0, Math.round(daysOffset)))
    return d.toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  // Cargar alertas desde el webhook de n8n / Supabase al iniciar
  const fetchAlertas = async () => {
    setLoading(true)
    try {
      const res = await fetch('https://n8n.cyberedu.my/webhook/sync-sheets-supabase')
      if (res.ok) {
        const data = await res.json()
        if (data.alertas_oferta_demanda) {
          if (data.alertas_oferta_demanda.alertas) {
            setAlertas(data.alertas_oferta_demanda.alertas)
          }
          if (data.alertas_oferta_demanda.resumen) {
            setResumen(data.alertas_oferta_demanda.resumen)
          }
          setLastSyncTime('Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
          if (onSyncComplete) onSyncComplete(data)
        }
      }
    } catch (e) {
      console.warn('Fallback a datos de alertas locales/pre-cargados:', e)
    } finally {
      setLoading(false)
    }
  }

  // Auto cargar alertas en vivo al montar el componente
  useEffect(() => {
    fetchAlertas()
  }, [])

  // Marcas únicas presentes en las alertas
  const brands = useMemo(() => {
    const set = new Set(alertas.map(a => a.marca).filter(Boolean))
    return ['ALL', ...Array.from(set)]
  }, [alertas])

  // Filtrado y Ordenamiento reactivo por Fechas y Métricas
  const filteredAlertas = useMemo(() => {
    const list = alertas.filter(a => {
      const matchesFilter = activeFilter === 'TODAS' || a.nivel_alerta === activeFilter
      const matchesBrand = selectedBrand === 'ALL' || a.marca === selectedBrand
      const matchesSearch =
        !searchQuery ||
        a.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.producto.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.marca.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.lote_proximo?.lote && a.lote_proximo.lote.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesFilter && matchesBrand && matchesSearch
    })

    return list.sort((a, b) => {
      if (sortBy === 'fecha_quiebre') {
        return a.dias_cobertura - b.dias_cobertura
      }
      if (sortBy === 'fecha_vencimiento') {
        const diasA = a.lote_proximo ? a.lote_proximo.dias : 99999
        const diasB = b.lote_proximo ? b.lote_proximo.dias : 99999
        return diasA - diasB
      }
      if (sortBy === 'inversion') {
        return b.costo_estimado_usd - a.costo_estimado_usd
      }
      if (sortBy === 'cobertura') {
        return a.dias_cobertura - b.dias_cobertura
      }
      // Default: Urgencia
      const score: Record<string, number> = { 'CRITICO': 3, 'REORDEN': 2, 'RIESGO_FEFO': 1, 'NORMAL': 0 }
      const diff = (score[b.nivel_alerta] || 0) - (score[a.nivel_alerta] || 0)
      if (diff !== 0) return diff
      return a.dias_cobertura - b.dias_cobertura
    })
  }, [alertas, activeFilter, selectedBrand, searchQuery, sortBy])

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Exportar Orden de Compra en CSV
  const handleExportCSV = () => {
    const itemsToExport = filteredAlertas.filter(a => a.sugerido_comprar_kits > 0)
    if (itemsToExport.length === 0) {
      alert('No hay sugerencias de compra para los filtros seleccionados.')
      return
    }

    const headers = [
      'SKU',
      'Producto',
      'Marca / Proveedor',
      'Stock Actual (Kits)',
      'Pruebas (U)',
      'Consumo Diario (Kits)',
      'Dias Cobertura',
      'Stock Seguridad (Kits)',
      'Punto Reorden (ROP)',
      'Sugerido a Comprar (Kits)',
      'Costo Unitario Est. (USD)',
      'Monto Total Est. (USD)',
      'Nivel Alerta',
      'Protocolo Sugerido'
    ]

    const rows = itemsToExport.map(a => [
      `"${a.sku}"`,
      `"${a.producto.replace(/"/g, '""')}"`,
      `"${a.marca.replace(/"/g, '""')}"`,
      a.stock_actual_kits,
      a.stock_actual_pruebas_u,
      a.consumo_diario_kits,
      a.dias_cobertura,
      a.stock_seguridad_kits,
      a.rop_kits,
      a.sugerido_comprar_kits,
      '42.50',
      a.costo_estimado_usd.toFixed(2),
      `"${a.nivel_alerta}"`,
      `"${a.accion_sugerida.replace(/"/g, '""')}"`
    ])

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Orden_Compra_Sugerida_LABMED_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const criticalCount = resumen.quiebres_inminentes_criticos || 0

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Botón Campana en Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-2xl border transition-all duration-300 flex items-center gap-2 group cursor-pointer ${
          isOpen
            ? 'bg-rose-500/20 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.3)] text-rose-300'
            : criticalCount > 0
            ? 'bg-slate-900/90 border-rose-500/30 text-rose-400 hover:border-rose-500/60 hover:bg-rose-950/30'
            : 'bg-slate-900/90 border-white/10 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300'
        }`}
        title="Centro de Alertas de Oferta vs Demanda"
      >
        <div className="relative">
          <Bell className={`w-4 h-4 ${criticalCount > 0 ? 'animate-bounce' : ''}`} />
          {criticalCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
            </span>
          )}
        </div>

        <div className="flex flex-col text-left leading-none pr-1">
          <span className="text-[10px] font-bold text-slate-400">Alertas</span>
          <span className="text-xs font-black font-mono text-white flex items-center gap-1">
            {criticalCount > 0 ? (
              <span className="text-rose-400">{criticalCount} Críticas</span>
            ) : (
              <span className="text-emerald-400">0 Quiebres</span>
            )}
          </span>
        </div>
      </button>

      {/* MODAL / FLYOUT RENDERIZADO CON PORTAL DIRECTO AL BODY (SIN CORTES) */}
      {isOpen && mounted && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false)
          }}
        >
          <div
            ref={modalRef}
            className="w-full max-w-5xl h-[90vh] max-h-[900px] bg-slate-900 border border-white/20 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col text-slate-100 ring-1 ring-white/10"
          >
            {/* Header del Centro de Alertas */}
            <div className="px-6 py-4 border-b border-white/10 bg-slate-950/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 shadow-inner">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight">
                    Centro de Alertas: Oferta vs. Demanda
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <span>Última evaluación:</span>
                    <span className="font-mono text-cyan-400">{lastSyncTime}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={fetchAlertas}
                  disabled={loading}
                  className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-cyan-600 hover:text-white border border-white/10 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
                  <span>{loading ? 'Evaluando...' : 'Re-evaluar'}</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar Pedido</span>
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-600 hover:text-white border border-white/10 text-slate-400 transition cursor-pointer"
                  title="Cerrar (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* KPI Cards de Resumen */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-5 bg-slate-950/50 border-b border-white/10 flex-shrink-0">
              <div
                onClick={() => setActiveFilter(activeFilter === 'CRITICO' ? 'TODAS' : 'CRITICO')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  activeFilter === 'CRITICO'
                    ? 'bg-rose-500/20 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                    : 'bg-rose-950/20 border-rose-500/20 hover:border-rose-500/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-rose-300">Peligro Quiebre</span>
                  <Flame className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-2xl font-black text-rose-400 font-mono mt-1">
                  {resumen.quiebres_inminentes_criticos}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Stock &le; SS (&lt; 15 días)</div>
              </div>

              <div
                onClick={() => setActiveFilter(activeFilter === 'REORDEN' ? 'TODAS' : 'REORDEN')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  activeFilter === 'REORDEN'
                    ? 'bg-amber-500/20 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    : 'bg-amber-950/20 border-amber-500/20 hover:border-amber-500/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-300">Punto Reorden</span>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-amber-400 font-mono mt-1">
                  {resumen.reorden_sugerido}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Stock + Tránsito &le; ROP</div>
              </div>

              <div
                onClick={() => setActiveFilter(activeFilter === 'RIESGO_FEFO' ? 'TODAS' : 'RIESGO_FEFO')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  activeFilter === 'RIESGO_FEFO'
                    ? 'bg-indigo-500/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                    : 'bg-indigo-950/20 border-indigo-500/20 hover:border-indigo-500/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-300">Riesgo FEFO</span>
                  <Clock className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-black text-indigo-400 font-mono mt-1">
                  {resumen.riesgo_fefo_caducidad}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Vence &le; 90d con exceso</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-300">Inversión Sugerida</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1">
                  ${resumen.monto_total_sugerido_usd ? resumen.monto_total_sugerido_usd.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0'}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Reposición óptima sugerida</div>
              </div>
            </div>

            {/* Controles de Filtros & Búsqueda */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-950/40 flex-shrink-0">
              {/* Tabs de Severidad */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-2xl border border-white/10 overflow-x-auto">
                <button
                  onClick={() => setActiveFilter('TODAS')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    activeFilter === 'TODAS'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Todas ({alertas.length})
                </button>
                <button
                  onClick={() => setActiveFilter('CRITICO')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    activeFilter === 'CRITICO'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-rose-400 hover:bg-rose-950/40'
                  }`}
                >
                  🔴 Quiebre ({resumen.quiebres_inminentes_criticos})
                </button>
                <button
                  onClick={() => setActiveFilter('REORDEN')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    activeFilter === 'REORDEN'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'text-amber-400 hover:bg-amber-950/40'
                  }`}
                >
                  🟡 Reorden ({resumen.reorden_sugerido})
                </button>
                <button
                  onClick={() => setActiveFilter('RIESGO_FEFO')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    activeFilter === 'RIESGO_FEFO'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-indigo-400 hover:bg-indigo-950/40'
                  }`}
                >
                  🟣 FEFO ({resumen.riesgo_fefo_caducidad})
                </button>
              </div>

              {/* Selectores de Marca, Ordenamiento por Fecha y Buscador LIKE */}
              <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                <select
                  value={selectedBrand}
                  onChange={e => setSelectedBrand(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-semibold cursor-pointer"
                >
                  <option value="ALL">Todas las Marcas ({brands.length - 1})</option>
                  {brands.filter(b => b !== 'ALL').map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="px-3 py-2 bg-slate-950 border border-cyan-500/40 text-cyan-300 rounded-xl text-xs focus:outline-none focus:border-cyan-400 font-semibold cursor-pointer"
                >
                  <option value="urgencia">🚨 Orden: Mayor Urgencia</option>
                  <option value="fecha_quiebre">⏳ Orden: Fecha de Quiebre</option>
                  <option value="fecha_vencimiento">📅 Orden: Vencimiento Lote (FEFO)</option>
                  <option value="inversion">💰 Orden: Mayor Inversión ($)</option>
                  <option value="cobertura">📦 Orden: Menor Cobertura (Días)</option>
                </select>

                <div className="relative flex-1 sm:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Buscar SKU, reactivo, lote..."
                    className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* TABLA DETALLADA DE ALERTAS SCROLLABLE */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 min-h-0 bg-slate-900/50">
              {filteredAlertas.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400/40 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-300">No hay alertas en esta categoría</p>
                  <p className="text-xs text-slate-500 mt-1">El inventario cumple con las métricas de oferta y demanda.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {filteredAlertas.map((alerta, idx) => {
                    const isCritico = alerta.nivel_alerta === 'CRITICO'
                    const isReorden = alerta.nivel_alerta === 'REORDEN'
                    const isFefo = alerta.nivel_alerta === 'RIESGO_FEFO'

                    return (
                      <div
                        key={alerta.sku + idx}
                        className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                          isCritico
                            ? 'bg-rose-950/25 border-rose-500/35 hover:border-rose-500/70 shadow-lg shadow-rose-950/20'
                            : isReorden
                            ? 'bg-amber-950/25 border-amber-500/35 hover:border-amber-500/70 shadow-lg shadow-amber-950/20'
                            : isFefo
                            ? 'bg-indigo-950/25 border-indigo-500/35 hover:border-indigo-500/70'
                            : 'bg-slate-900/60 border-white/10'
                        }`}
                      >
                        {/* SKU e Información del Producto */}
                        <div className="space-y-2 min-w-[320px] flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-extrabold text-xs px-2.5 py-0.5 rounded-lg bg-slate-950 text-cyan-300 border border-cyan-500/30">
                              {alerta.sku}
                            </span>
                            <span className="text-xs font-bold text-slate-300 px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                              {alerta.marca}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                isCritico
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                                  : isReorden
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                              }`}
                            >
                              {isCritico ? '🔴 Peligro Quiebre' : isReorden ? '🟡 Punto Reorden' : '🟣 Riesgo FEFO'}
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-white leading-tight">{alerta.producto}</h3>

                          <p className="text-xs text-slate-400 flex items-center gap-1.5">
                            <span className="text-slate-500 font-semibold">Protocolo:</span>
                            <span className={isCritico ? 'text-rose-300 font-semibold' : 'text-slate-300'}>
                              {alerta.accion_sugerida}
                            </span>
                          </p>

                          {/* TIMELINE DE FECHAS CLAVE */}
                          <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px] font-mono">
                            {/* Fecha de Quiebre / Agotamiento */}
                            {alerta.stock_actual_kits === 0 || alerta.dias_cobertura <= 0 ? (
                              <span className="px-2 py-0.5 rounded-md bg-rose-500/25 text-rose-300 border border-rose-500/40 font-bold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-rose-400" />
                                <span>Quiebre: INMEDIATO (Stock 0)</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-slate-950 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-400" />
                                <span>Agotamiento est: <strong>{formatFutureDate(alerta.dias_cobertura)}</strong> ({alerta.dias_cobertura}d)</span>
                              </span>
                            )}

                            {/* Fecha Límite para Orden de Compra */}
                            {alerta.dias_cobertura <= 30 ? (
                              <span className="px-2 py-0.5 rounded-md bg-rose-950/80 text-rose-200 border border-rose-500/40 font-bold flex items-center gap-1">
                                <CalendarDays className="w-3 h-3 text-rose-400" />
                                <span>Emitir Orden: YA (Lead Time 30d vencido)</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-slate-950 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-cyan-400" />
                                <span>Emitir orden antes de: <strong>{formatFutureDate(alerta.dias_cobertura - 30)}</strong></span>
                              </span>
                            )}

                            {/* Lote y Vencimiento FEFO */}
                            {alerta.lote_proximo ? (
                              <span className="px-2 py-0.5 rounded-md bg-purple-950/60 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                                <Tag className="w-3 h-3 text-purple-400" />
                                <span>Lote: <strong className="text-white">{alerta.lote_proximo.lote}</strong> • Vence: <strong>{alerta.lote_proximo.vence}</strong> ({alerta.lote_proximo.dias}d)</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-white/10 flex items-center gap-1">
                                <Package className="w-3 h-3 text-slate-500" />
                                <span>Sin existencias físicas en bodega</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Métricas de Balance: Stock Actual vs ROP vs Días Cobertura */}
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 text-center border-t lg:border-t-0 lg:border-l border-white/10 pt-3 lg:pt-0 lg:pl-4">
                          <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5">
                            <div className="text-[10px] font-semibold text-slate-400 uppercase">Stock Físico</div>
                            <div className="font-mono font-bold text-xs text-white mt-0.5">
                              {alerta.stock_actual_kits} <span className="text-cyan-400 text-[10px]">Kits</span>
                            </div>
                            <div className="text-[9.5px] font-mono text-emerald-300">{alerta.stock_actual_pruebas_u.toLocaleString()} U</div>
                          </div>

                          <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5">
                            <div className="text-[10px] font-semibold text-slate-400 uppercase">Punto ROP</div>
                            <div className="font-mono font-bold text-xs text-amber-300 mt-0.5">
                              {alerta.rop_kits} <span className="text-slate-400 text-[10px]">Kits</span>
                            </div>
                            <div className="text-[9.5px] font-mono text-slate-400">SS: {alerta.stock_seguridad_kits}k</div>
                          </div>

                          <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5">
                            <div className="text-[10px] font-semibold text-slate-400 uppercase">Cobertura</div>
                            <div
                              className={`font-mono font-black text-xs mt-0.5 ${
                                alerta.dias_cobertura <= 15
                                  ? 'text-rose-400'
                                  : alerta.dias_cobertura <= 30
                                  ? 'text-amber-400'
                                  : 'text-emerald-400'
                              }`}
                            >
                              {alerta.dias_cobertura} Días
                            </div>
                            <div className="text-[9.5px] font-mono text-slate-400">{alerta.consumo_diario_kits} k/día</div>
                          </div>

                          <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 col-span-3 sm:col-span-1">
                            <div className="text-[10px] font-bold text-emerald-300 uppercase">Sugerido Compra</div>
                            <div className="font-mono font-black text-sm text-emerald-400 mt-0.5">
                              +{alerta.sugerido_comprar_kits} <span className="text-[10px]">Kits</span>
                            </div>
                            <div className="text-[9.5px] font-mono text-emerald-300/80">
                              ${alerta.costo_estimado_usd.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer con Resumen y Acciones */}
            <div className="px-6 py-4 border-t border-white/10 bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs flex-shrink-0">
              <div className="text-slate-400 flex items-center gap-2 text-center sm:text-left">
                <span>Mostrando <strong className="text-white">{filteredAlertas.length}</strong> de <strong className="text-white">{alertas.length}</strong> alertas activas</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Orden de Compra Sugerida (.CSV)</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
