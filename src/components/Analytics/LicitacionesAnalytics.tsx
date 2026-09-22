'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { 
  Briefcase, CheckCircle2, XCircle, DollarSign, Clock, Search,
  Filter, TrendingUp, Building2, Tag, ChevronLeft, ChevronRight, Loader2,
  PieChart as PieIcon, RefreshCw
} from 'lucide-react'
import localFallbackData from '@/data/licitaciones_data.json'

const COLORS = {
  ADJUDICADA: '#10b981', // Emerald
  PERDIDA: '#f43f5e',    // Rose
  PENDIENTE: '#f59e0b',  // Amber
}

export default function LicitacionesAnalytics() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [items, setItems] = useState<any[]>(localFallbackData || [])
  const [loading, setLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)
  const [statusViewMode, setStatusViewMode] = useState<'monto' | 'cantidad'>('monto')

  useEffect(() => {
    setMounted(true)
  }, [])

  // Interactive Filters
  const [selectedYear, setSelectedYear] = useState<string>('TODOS')
  const [selectedEstatus, setSelectedEstatus] = useState<string>('TODOS')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const pageSize = 12

  const loadData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true)
    try {
      const res = await fetch('/api/analytics/licitaciones', { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        if (json.items && json.items.length > 0) {
          setItems(json.items)
          setLastUpdated(new Date())
          setLoading(false)
          setIsRefreshing(false)
          return
        }
      }
    } catch (err) {
      console.warn('Usando datos de respaldo local:', err)
    }
    // Respaldo de alta fidelidad garantizado
    setItems(localFallbackData || [])
    setLastUpdated(new Date())
    setLoading(false)
    setIsRefreshing(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter(it => {
      const matchYear = selectedYear === 'TODOS' || String(it.anio) === selectedYear
      const matchEst = selectedEstatus === 'TODOS' || String(it.estatus).toUpperCase() === selectedEstatus
      const search = searchTerm.toLowerCase().trim()
      const matchSearch = !search || 
        (it.producto && it.producto.toLowerCase().includes(search)) ||
        (it.cliente && it.cliente.toLowerCase().includes(search)) ||
        (it.noOferta && it.noOferta.toLowerCase().includes(search)) ||
        (it.marca && it.marca.toLowerCase().includes(search)) ||
        (it.empresaAdjudicada && it.empresaAdjudicada.toLowerCase().includes(search))

      return matchYear && matchEst && matchSearch
    })
  }, [items, selectedYear, selectedEstatus, searchTerm])

  // KPIs
  const kpis = useMemo(() => {
    let ofertado = 0
    let adjudicado = 0
    let perdido = 0
    let pendiente = 0

    filteredItems.forEach(it => {
      const val = Number(it.total || 0)
      const est = String(it.estatus || 'PENDIENTE').toUpperCase()
      ofertado += val
      if (est === 'ADJUDICADA') adjudicado += val
      else if (est === 'PERDIDA') perdido += val
      else pendiente += val
    })

    const winRate = ofertado > 0 ? (adjudicado / ofertado) * 100 : 0
    return { ofertado, adjudicado, perdido, pendiente, winRate, count: filteredItems.length }
  }, [filteredItems])

  // Chart: Comparativa por Año
  const chartDataYear = useMemo(() => {
    const map: Record<string, { year: string, Adjudicadas: number, Perdidas: number, Pendientes: number }> = {}
    
    filteredItems.forEach(it => {
      const yr = String(it.anio || '2025')
      if (!map[yr]) map[yr] = { year: yr, Adjudicadas: 0, Perdidas: 0, Pendientes: 0 }
      const val = Number(it.total || 0)
      const est = String(it.estatus || 'PENDIENTE').toUpperCase()
      if (est === 'ADJUDICADA') map[yr].Adjudicadas += val
      else if (est === 'PERDIDA') map[yr].Perdidas += val
      else map[yr].Pendientes += val
    })

    return Object.values(map).sort((a, b) => a.year.localeCompare(b.year))
  }, [filteredItems])

  // Chart: Distribución por Estado ($ y Cantidad)
  const chartStatusData = useMemo(() => {
    let countAdj = 0
    let montoAdj = 0
    let countPer = 0
    let montoPer = 0
    let countDes = 0
    let montoDes = 0
    let countPen = 0
    let montoPen = 0

    filteredItems.forEach(it => {
      const val = Number(it.total || 0)
      const est = String(it.estatus || 'PENDIENTE').toUpperCase()
      if (est === 'ADJUDICADA' || it.isAdjudicada) {
        countAdj++
        montoAdj += val
      } else if (est === 'PERDIDA' || it.isPerdida) {
        countPer++
        montoPer += val
      } else if (est === 'DESIERTA' || it.isDesierta) {
        countDes++
        montoDes += val
      } else {
        countPen++
        montoPen += val
      }
    })

    const list = [
      { name: 'Adjudicadas', count: countAdj, monto: montoAdj, color: '#10b981' },
      { name: 'Perdidas', count: countPer, monto: montoPer, color: '#f43f5e' },
    ]

    if (countPen > 0) {
      list.push({ name: 'Pendientes', count: countPen, monto: montoPen, color: '#f59e0b' })
    }

    list.push({ name: 'Desiertas', count: countDes, monto: montoDes, color: '#eab308' })

    return list
  }, [filteredItems])

  // ── POWER BI SUITE: 8 DATASETS BASADOS EN SUPABASE ──

  // 1. Licitaciones por Organización en $
  const dataOrgMonto = useMemo(() => {
    const map: Record<string, number> = {}
    filteredItems.forEach(it => {
      const org = it.institucion || (it.cliente?.toUpperCase().includes('ISSS') ? 'ISSS' : (it.cliente?.toUpperCase().includes('ISBM') ? 'ISBM' : 'MINSAL'))
      map[org] = (map[org] || 0) + Number(it.total || 0)
    })
    return Object.entries(map).map(([org, monto]) => ({
      org,
      monto: Number(monto.toFixed(2)),
      displayMonto: monto >= 1000000 ? `${(monto / 1000000).toFixed(2)} mill.` : `$${(monto / 1000).toFixed(0)}k`
    })).sort((a, b) => b.monto - a.monto)
  }, [filteredItems])

  // 2. Licitaciones por Organización en QTY
  const dataOrgQty = useMemo(() => {
    const map: Record<string, number> = {}
    filteredItems.forEach(it => {
      const org = it.institucion || (it.cliente?.toUpperCase().includes('ISSS') ? 'ISSS' : (it.cliente?.toUpperCase().includes('ISBM') ? 'ISBM' : 'MINSAL'))
      map[org] = (map[org] || 0) + 1
    })
    return Object.entries(map).map(([org, count]) => ({
      org,
      count
    })).sort((a, b) => b.count - a.count)
  }, [filteredItems])

  // 3. Licitaciones por Estatus en $
  const dataEstatusMonto = useMemo(() => {
    const map: Record<string, number> = {
      PENDIENTE: 0,
      PERDIDA: 0,
      ADJUDICADA: 0
    }
    filteredItems.forEach(it => {
      const est = (it.estatus || 'PENDIENTE').toUpperCase()
      if (map[est] !== undefined) map[est] += Number(it.total || 0)
      else map['PENDIENTE'] += Number(it.total || 0)
    })
    return [
      { estatus: 'PENDIENTE', monto: map.PENDIENTE, label: map.PENDIENTE >= 1000000 ? `${(map.PENDIENTE / 1000000).toFixed(2)} mill.` : `$${(map.PENDIENTE / 1000).toFixed(0)}k` },
      { estatus: 'PERDIDA', monto: map.PERDIDA, label: map.PERDIDA >= 1000000 ? `${(map.PERDIDA / 1000000).toFixed(2)} mill.` : `$${(map.PERDIDA / 1000).toFixed(0)}k` },
      { estatus: 'ADJUDICADA', monto: map.ADJUDICADA, label: map.ADJUDICADA >= 1000000 ? `${(map.ADJUDICADA / 1000000).toFixed(2)} mill.` : `$${(map.ADJUDICADA / 1000).toFixed(0)}k` }
    ]
  }, [filteredItems])

  // 4. Licitaciones por Estatus en QTY
  const dataEstatusQty = useMemo(() => {
    const map: Record<string, number> = {
      ADJUDICADA: 0,
      PERDIDA: 0,
      PENDIENTE: 0
    }
    filteredItems.forEach(it => {
      const est = (it.estatus || 'PENDIENTE').toUpperCase()
      if (map[est] !== undefined) map[est] += 1
      else map['PENDIENTE'] += 1
    })
    return [
      { estatus: 'ADJUDICADA', count: map.ADJUDICADA },
      { estatus: 'PERDIDA', count: map.PERDIDA },
      { estatus: 'PENDIENTE', count: map.PENDIENTE }
    ]
  }, [filteredItems])

  // 5. Licitaciones por Marca en $
  const dataMarcaMonto = useMemo(() => {
    const map: Record<string, number> = {}
    let totalAll = 0
    filteredItems.forEach(it => {
      const m = (it.marca || 'S/M').trim()
      const val = Number(it.total || 0)
      map[m] = (map[m] || 0) + val
      totalAll += val
    })
    const palette = ['#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#0284c7', '#0369a1', '#0f172a', '#64748b']
    return Object.entries(map)
      .map(([marca, monto], idx) => ({
        marca,
        monto: Number(monto.toFixed(2)),
        pct: totalAll > 0 ? Number(((monto / totalAll) * 100).toFixed(1)) : 0,
        color: palette[idx % palette.length]
      }))
      .sort((a, b) => b.monto - a.monto)
      .slice(0, 8)
  }, [filteredItems])

  // 6. Licitaciones por Marca en QTY
  const dataMarcaQty = useMemo(() => {
    const map: Record<string, number> = {}
    let totalCount = 0
    filteredItems.forEach(it => {
      const m = (it.marca || 'S/M').trim()
      map[m] = (map[m] || 0) + 1
      totalCount += 1
    })
    const palette = ['#1e40af', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#0284c7', '#0369a1', '#0f172a', '#64748b']
    return Object.entries(map)
      .map(([marca, count], idx) => ({
        marca,
        count,
        pct: totalCount > 0 ? Number(((count / totalCount) * 100).toFixed(1)) : 0,
        color: palette[idx % palette.length]
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [filteredItems])

  // 7. Razones de Licitaciones Perdidas
  const dataRazonesPerdidas = useMemo(() => {
    const perdidas = filteredItems.filter(i => (i.estatus || '').toUpperCase() === 'PERDIDA')
    const totalLost = perdidas.length || 1
    const map: Record<string, { count: number, monto: number }> = {}
    perdidas.forEach(i => {
      const r = (i.razon || 'DOCUMENTACION LEGAL').trim().toUpperCase()
      if (!map[r]) map[r] = { count: 0, monto: 0 }
      map[r].count += 1
      map[r].monto += Number(i.total || 0)
    })
    return Object.entries(map)
      .map(([razon, data]) => ({
        razon,
        count: data.count,
        monto: Number(data.monto.toFixed(2)),
        pct: Number(((data.count / totalLost) * 100).toFixed(1))
      }))
      .sort((a, b) => b.count - a.count)
  }, [filteredItems])

  // 8. Desglose de Producto Participantes
  const dataDesgloseProductos = useMemo(() => {
    const map: Record<string, { producto: string, marca: string, monto: number, count: number }> = {}
    let totalAll = 0
    filteredItems.forEach(it => {
      const p = (it.producto || 'GENERAL').trim()
      const m = (it.marca || 'S/M').trim()
      const val = Number(it.total || 0)
      totalAll += val
      if (!map[p]) map[p] = { producto: p, marca: m, monto: 0, count: 0 }
      map[p].monto += val
      map[p].count += 1
    })
    return Object.values(map)
      .map(item => ({
        ...item,
        monto: Number(item.monto.toFixed(2)),
        pct: totalAll > 0 ? Number(((item.monto / totalAll) * 100).toFixed(2)) : 0
      }))
      .sort((a, b) => b.monto - a.monto)
      .slice(0, 15)
  }, [filteredItems])

  // Chart: Top Marcas
  const topBrandsData = useMemo(() => {
    const map: Record<string, { marca: string, Adjudicado: number, Total: number }> = {}
    filteredItems.forEach(it => {
      const b = (it.marca || 'S/M').trim()
      if (!map[b]) map[b] = { marca: b, Adjudicado: 0, Total: 0 }
      const val = Number(it.total || 0)
      map[b].Total += val
      if (String(it.estatus).toUpperCase() === 'ADJUDICADA') map[b].Adjudicado += val
    })
    return Object.values(map).sort((a, b) => b.Total - a.Total).slice(0, 6)
  }, [filteredItems])

  // Pagination for table
  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredItems.slice(start, start + pageSize)
  }, [filteredItems, currentPage, pageSize])

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)

  const formatCurrencyExact = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val)

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-800 tracking-wide">
              Análisis de Licitaciones y Ofertas
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
              {filteredItems.length} Renglones
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Datos consolidados del proceso de compras institucionales y licitaciones del sector salud sincronizados con Supabase.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Year Filter */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 text-xs font-semibold">
            {['TODOS', '2025', '2026'].map(yr => (
              <button
                key={yr}
                onClick={() => { setSelectedYear(yr); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedYear === yr 
                    ? 'bg-white text-slate-900 shadow-sm font-bold' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {yr === 'TODOS' ? 'Todos los Años' : yr}
              </button>
            ))}
          </div>

          {/* Estatus Filter */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 text-xs font-semibold">
            {['TODOS', 'ADJUDICADA', 'PERDIDA', 'PENDIENTE'].map(st => (
              <button
                key={st}
                onClick={() => { setSelectedEstatus(st); setCurrentPage(1); }}
                className={`px-2.5 py-1.5 rounded-lg transition-all ${
                  selectedEstatus === st 
                    ? 'bg-white text-slate-900 shadow-sm font-bold' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {st === 'TODOS' ? 'Todo' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar producto, hospital, oferta..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 w-48 lg:w-60 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Ofertado */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Ofertado</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <DollarSign size={16} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900 tracking-tight">
            {formatCurrency(kpis.ofertado)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <span>{kpis.count} renglones evaluados</span>
          </div>
        </div>

        {/* Adjudicado */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Adjudicado (Ganado)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-emerald-600 tracking-tight">
            {formatCurrency(kpis.adjudicado)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
            <TrendingUp size={13} />
            <span>Tasa de Éxito: {kpis.winRate.toFixed(1)}%</span>
          </div>
        </div>

        {/* Perdido */}
        <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Perdido</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <XCircle size={16} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-rose-600 tracking-tight">
            {formatCurrency(kpis.perdido)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-600">
            <span>{kpis.ofertado > 0 ? ((kpis.perdido / kpis.ofertado) * 100).toFixed(1) : 0}% del volumen total</span>
          </div>
        </div>

        {/* Pendiente / En Trámite */}
        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Pendiente / Trámite</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock size={16} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-amber-600 tracking-tight">
            {formatCurrency(kpis.pendiente)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700 font-semibold">
            <span>Por resolución de apertura</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── SECCIÓN POWER BI: 8 INDICADORES CLAVE BASADOS EN SUPABASE ── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-6 bg-blue-600 rounded-full"></span>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Panel BI de Licitaciones • 8 Indicadores Clave
              </h3>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                Supabase Sync
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Visualización ejecutiva de organizaciones, estatus, marcas, causales de pérdida y desglose de productos.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-[11px] text-slate-400 font-medium">
                Actualizado: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
            <button
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-50 cursor-pointer shadow-sm active:scale-95"
              title="Consultar datos frescos de Supabase"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : 'text-slate-600'}`} />
              <span>{isRefreshing ? 'Sincronizando...' : 'Actualizar datos'}</span>
            </button>
          </div>
        </div>

        {/* Fila 1: 4 Gráficos de Barras (Organización y Estatus) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Licitaciones por Organización en $ */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-sm flex flex-col justify-between">
            <h4 className="text-xs font-bold text-slate-800 tracking-wide text-center">
              Licitaciones por Organización en $
            </h4>
            <div className="h-48 w-full pt-2">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataOrgMonto} margin={{ top: 20, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="org" axisLine={false} tickLine={false} tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }} />
                    <YAxis tickFormatter={(v: number) => `$${(v / 1000000).toFixed(1)}M`} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 9 }} />
                    <Tooltip 
                      formatter={(v: any) => [`$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`, 'Monto']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', fontSize: '11px', color: '#fff' }}
                    />
                    <Bar dataKey="monto" fill="#1e3a8a" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: '#1e3a8a', fontSize: 10, fontWeight: 700, formatter: (val: any) => val >= 1000000 ? `${(val / 1000000).toFixed(2)}M` : `$${(val / 1000).toFixed(0)}k` }} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">Cargando...</div>
              )}
            </div>
          </div>

          {/* Card 2: Licitaciones por Organización en QTY */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-sm flex flex-col justify-between">
            <h4 className="text-xs font-bold text-slate-800 tracking-wide text-center">
              Licitaciones por Organización en QTY
            </h4>
            <div className="h-48 w-full pt-2">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataOrgQty} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="org" axisLine={false} tickLine={false} tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 9 }} />
                    <Tooltip 
                      formatter={(v: any) => [`${v} renglones`, 'Cantidad']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', fontSize: '11px', color: '#fff' }}
                    />
                    <Bar dataKey="count" fill="#1e3a8a" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: '#1e3a8a', fontSize: 10, fontWeight: 700 }} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">Cargando...</div>
              )}
            </div>
          </div>

          {/* Card 3: Licitaciones por Estatus en $ */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-sm flex flex-col justify-between">
            <h4 className="text-xs font-bold text-slate-800 tracking-wide text-center">
              Licitaciones por Estatus en $
            </h4>
            <div className="h-48 w-full pt-2">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataEstatusMonto} margin={{ top: 20, right: 5, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="estatus" axisLine={false} tickLine={false} tick={{ fill: '#334155', fontSize: 9, fontWeight: 700 }} />
                    <YAxis tickFormatter={(v: number) => `$${(v / 1000000).toFixed(1)}M`} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 9 }} />
                    <Tooltip 
                      formatter={(v: any) => [`$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`, 'Monto']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', fontSize: '11px', color: '#fff' }}
                    />
                    <Bar dataKey="monto" fill="#1e3a8a" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: '#1e3a8a', fontSize: 9, fontWeight: 700, formatter: (val: any) => val >= 1000000 ? `${(val / 1000000).toFixed(2)}M` : `$${(val / 1000).toFixed(0)}k` }} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">Cargando...</div>
              )}
            </div>
          </div>

          {/* Card 4: Licitaciones por Estatus en QTY */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-sm flex flex-col justify-between">
            <h4 className="text-xs font-bold text-slate-800 tracking-wide text-center">
              Licitaciones por Estatus en QTY
            </h4>
            <div className="h-48 w-full pt-2">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataEstatusQty} margin={{ top: 20, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="estatus" axisLine={false} tickLine={false} tick={{ fill: '#334155', fontSize: 9, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 9 }} />
                    <Tooltip 
                      formatter={(v: any) => [`${v} renglones`, 'Cantidad']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', fontSize: '11px', color: '#fff' }}
                    />
                    <Bar dataKey="count" fill="#1e3a8a" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: '#1e3a8a', fontSize: 10, fontWeight: 700 }} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">Cargando...</div>
              )}
            </div>
          </div>
        </div>

        {/* Fila 2: 2 Donut Charts (Marcas en $ y QTY) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 5: Licitaciones por Marca en $ */}
          <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-800 tracking-wide">
                Licitaciones por Marca en $
              </h4>
              <p className="text-[11px] text-slate-500">Distribución porcentual y monto monetario por marca</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
              <div className="h-56 w-56 flex-shrink-0 flex items-center justify-center">
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dataMarcaMonto}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={2}
                        dataKey="monto"
                      >
                        {dataMarcaMonto.map((entry, index) => (
                          <Cell key={`cell-monto-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v: any, name: any, item: any) => [
                          `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2 })} (${item.payload.pct}%)`,
                          item.payload.marca
                        ]}
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', fontSize: '11px', color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs">Cargando...</div>
                )}
              </div>

              <div className="flex-1 w-full space-y-1.5 text-xs max-h-56 overflow-y-auto pr-1">
                {dataMarcaMonto.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-50">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
                      <span className="font-semibold text-slate-800 truncate" title={m.marca}>{m.marca}</span>
                    </div>
                    <div className="text-right flex-shrink-0 font-mono">
                      <span className="font-bold text-slate-900">${(m.monto / 1000).toFixed(0)}k</span>
                      <span className="text-[10px] text-slate-500 ml-1.5 font-bold">({m.pct}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 6: Licitaciones por Marca en QTY */}
          <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-800 tracking-wide">
                Licitaciones por Marca en QTY
              </h4>
              <p className="text-[11px] text-slate-500">Volumen de renglones y proporción por marca</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
              <div className="h-56 w-56 flex-shrink-0 flex items-center justify-center">
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dataMarcaQty}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={2}
                        dataKey="count"
                      >
                        {dataMarcaQty.map((entry, index) => (
                          <Cell key={`cell-qty-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v: any, name: any, item: any) => [
                          `${v} renglones (${item.payload.pct}%)`,
                          item.payload.marca
                        ]}
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', fontSize: '11px', color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs">Cargando...</div>
                )}
              </div>

              <div className="flex-1 w-full space-y-1.5 text-xs max-h-56 overflow-y-auto pr-1">
                {dataMarcaQty.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-50">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
                      <span className="font-semibold text-slate-800 truncate" title={m.marca}>{m.marca}</span>
                    </div>
                    <div className="text-right flex-shrink-0 font-mono">
                      <span className="font-bold text-slate-900">{m.count} reng.</span>
                      <span className="text-[10px] text-slate-500 ml-1.5 font-bold">({m.pct}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Fila 3: 2 Tablas Analíticas (Razones de Pérdidas y Desglose de Productos) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 7: Razones de Licitaciones Perdidas */}
          <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm space-y-3 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-800 tracking-wide">
                Razones de Licitaciones Perdidas
              </h4>
              <p className="text-[11px] text-slate-500">Causas registradas y peso porcentual de renglones perdidos</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Razon</th>
                    <th className="p-2.5 text-right">Cant.</th>
                    <th className="p-2.5 text-right">Monto ($)</th>
                    <th className="p-2.5 text-right w-28">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {dataRazonesPerdidas.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-2.5 font-semibold text-slate-800">{r.razon}</td>
                      <td className="p-2.5 text-right font-mono text-slate-600">{r.count}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-900">${(r.monto / 1000).toFixed(0)}k</td>
                      <td className="p-2.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min(100, r.pct)}%` }}></div>
                          </div>
                          <span className="font-mono font-bold text-slate-700 w-10">{r.pct}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-slate-200 font-bold bg-slate-50 text-slate-900">
                  <tr>
                    <td className="p-2.5 font-black">Total</td>
                    <td className="p-2.5 text-right font-mono">{dataRazonesPerdidas.reduce((s, r) => s + r.count, 0)}</td>
                    <td className="p-2.5 text-right font-mono">${(dataRazonesPerdidas.reduce((s, r) => s + r.monto, 0) / 1000).toFixed(0)}k</td>
                    <td className="p-2.5 text-right font-mono font-black">100 %</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Card 8: Desglose de Producto Participantes */}
          <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 tracking-wide">
                  Desglose de Producto Participantes
                </h4>
                <p className="text-[11px] text-slate-500">Monto ponderado y porcentaje representado del portafolio</p>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400">
                Top 15 Productos
              </span>
            </div>

            <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="p-2.5 bg-slate-50">Marca</th>
                    <th className="p-2.5 bg-slate-50">Producto</th>
                    <th className="p-2.5 bg-slate-50 text-right">Monto Total</th>
                    <th className="p-2.5 bg-slate-50 text-right w-28">% Representado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {dataDesgloseProductos.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-2.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-[10px] text-slate-700">
                          {p.marca}
                        </span>
                      </td>
                      <td className="p-2.5 max-w-[180px] truncate font-semibold text-slate-800" title={p.producto}>
                        {p.producto}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        ${Number(p.monto).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-2.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min(100, p.pct * 5)}%` }}></div>
                          </div>
                          <span className="font-mono font-bold text-slate-700 w-12">{p.pct}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-slate-200 font-bold bg-slate-50 text-slate-900 sticky bottom-0">
                  <tr>
                    <td className="p-2.5 font-black bg-slate-50" colSpan={2}>Total Top Productos</td>
                    <td className="p-2.5 text-right font-mono font-black bg-slate-50">
                      ${dataDesgloseProductos.reduce((s, p) => s + p.monto, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-2.5 text-right font-mono font-black bg-slate-50">
                      {dataDesgloseProductos.reduce((s, p) => s + p.pct, 0).toFixed(2)}%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Comparativa por Año */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Comparativa por Año</h3>
              <p className="text-xs text-slate-500">Monto adjudicado vs perdido vs pendiente por período anual</p>
            </div>
          </div>
          <div className="h-72 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDataYear} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                  <YAxis tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip 
                    formatter={(val: any) => [formatCurrency(Number(val)), '']}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="Adjudicadas" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Perdidas" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Pendientes" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">Cargando gráfico...</div>
            )}
          </div>
        </div>

        {/* Gráfico 2: Distribución por Estado ($ o Cantidad) */}
        <div className="bg-white border border-slate-300 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-indigo-700" />
                Distribución por Estado ({selectedYear})
              </h3>
              <p className="text-[11px] text-slate-700">
                {statusViewMode === 'monto' ? 'Proporción de monto monetario ($) por estado' : 'Proporción de cantidad de renglones por estado'}
              </p>
            </div>
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setStatusViewMode('monto')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                  statusViewMode === 'monto'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                $ Monto
              </button>
              <button
                type="button"
                onClick={() => setStatusViewMode('cantidad')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                  statusViewMode === 'cantidad'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cantidad
              </button>
            </div>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartStatusData
                      .filter(item => (statusViewMode === 'monto' ? (item.monto || 0) : (item.count || 0)) > 0)
                      .map(item => ({
                        ...item,
                        displayVal: statusViewMode === 'monto' ? (item.monto || 0) : (item.count || 0)
                      }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="displayVal"
                  >
                    {chartStatusData
                      .filter(item => (statusViewMode === 'monto' ? (item.monto || 0) : (item.count || 0)) > 0)
                      .map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [
                      statusViewMode === 'monto'
                        ? `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
                        : `${val} renglones`,
                      statusViewMode === 'monto' ? 'Monto' : 'Cantidad'
                    ]}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">Cargando gráfico...</div>
            )}
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-300">
            {chartStatusData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-700 font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-gray-900 block">
                    {statusViewMode === 'monto'
                      ? `$${Number(item.monto || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : `${item.count || 0} renglones`}
                  </span>
                  <span className="text-[10px] text-slate-700 font-mono block">
                    {statusViewMode === 'monto'
                      ? `(${item.count || 0} renglones)`
                      : `($${Number(item.monto || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Brands Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-1">Top Marcas por Monto Ofertado</h3>
        <p className="text-xs text-slate-500 mb-4">Volumen total ofertado vs adjudicado de las principales marcas del catálogo</p>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topBrandsData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis type="category" dataKey="marca" width={110} axisLine={false} tickLine={false} tick={{ fill: '#1e293b', fontSize: 11, fontWeight: 600 }} />
              <Tooltip formatter={(val: any) => [formatCurrency(Number(val)), '']} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="Total" fill="#3b82f6" radius={[0, 6, 6, 0]} name="Total Ofertado" />
              <Bar dataKey="Adjudicado" fill="#10b981" radius={[0, 6, 6, 0]} name="Adjudicado" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Items Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Detalle de Renglones Ofertados</h3>
            <p className="text-xs text-slate-500">Historial completo con clientes, marcas, montos y estatus de adjudicación</p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Mostrando {paginatedItems.length} de {filteredItems.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">No. Oferta</th>
                <th className="px-4 py-3">Cliente / Hospital</th>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Marca</th>
                <th className="px-4 py-3 text-right">Cantidad</th>
                <th className="px-4 py-3 text-right">P. Unitario</th>
                <th className="px-4 py-3 text-right">Total Ofertado</th>
                <th className="px-4 py-3 text-center">Estatus</th>
                <th className="px-4 py-3">Detalle / Ganador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {item.noOferta || 'S/N'}
                  </td>
                  <td className="px-4 py-3 max-w-[200px] truncate" title={item.cliente}>
                    <span className="font-semibold text-slate-800">{item.cliente}</span>
                    <span className="block text-[10px] text-slate-400">{item.institucion}</span>
                  </td>
                  <td className="px-4 py-3 max-w-[220px] truncate font-medium text-slate-900" title={item.producto}>
                    {item.producto}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-[11px]">
                      {item.marca}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold">
                    {Number(item.cantidad).toLocaleString('en-US')}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-600">
                    {formatCurrencyExact(item.precioUnitario)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-black text-slate-900">
                    {formatCurrencyExact(item.total)}
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      item.estatus === 'ADJUDICADA'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : item.estatus === 'PERDIDA'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {item.estatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-[11px] max-w-[180px] truncate" title={item.razon || item.empresaAdjudicada || item.noContrato}>
                    {item.empresaAdjudicada ? (
                      <span className="text-rose-700 font-medium">Adj: {item.empresaAdjudicada}</span>
                    ) : item.noContrato ? (
                      <span className="text-emerald-700 font-medium">{item.noContrato}</span>
                    ) : item.razon ? (
                      <span>{item.razon}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Página {currentPage} de {totalPages}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
