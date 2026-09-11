'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Building2,
  DollarSign,
  Search,
  Zap,
  Tag,
  Calendar,
  Filter,
  Percent
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Line
} from 'recharts'

import { dbSelect } from '@/lib/api_3fn'

const MONTH_NAMES = [
  'TODOS',
  'ENERO',
  'FEBRERO',
  'MARZO',
  'ABRIL',
  'MAYO',
  'JUNIO',
  'JULIO',
  'AGOSTO',
  'SEPTIEMBRE',
  'OCTUBRE',
  'NOVIEMBRE',
  'DICIEMBRE'
]

export default function DashboardAnalisisPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilterStatus, setSelectedFilterStatus] = useState<string>('todos')
  const [selectedMonth, setSelectedMonth] = useState<string>('TODOS')
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>('TODOS')

  const [allItemsRaw, setAllItemsRaw] = useState<any[]>([])

  const [stats, setStats] = useState({
    totalLicitaciones: 0,
    totalItems: 0,
    totalOfertado: 0,
    totalAdjudicado: 0,
    itemsAdjudicadosCount: 0,
    itemsPerdidosCount: 0,
    itemsDesiertosCount: 0,
    eficienciaGlobalPct: 0
  })

  const [chartPriceData, setChartPriceData] = useState<any[]>([])
  const [chartStatusData, setChartStatusData] = useState<any[]>([])
  const [monthlyEfficiencyData, setMonthlyEfficiencyData] = useState<any[]>([])
  const [competitiveTable, setCompetitiveTable] = useState<any[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  function cleanProductLabel(name: string): string {
    const n = name.toUpperCase()
    if (n.includes('SANGRE OCULTA') || n.includes('FOB')) return 'SANGRE OCULTA'
    if (n.includes('CHAGAS')) return 'CHAGAS'
    if (n.includes('HEPATITIS B') || n.includes('HBSAG')) return 'HEPATITIS B'
    if (n.includes('HEPATITIS C') || n.includes('HCV')) return 'HEPATITIS C'
    if (n.includes('SIFILIS') || n.includes('SYPHILIS')) return 'SIFILIS'
    if (n.includes('EMBARAZO') || n.includes('HCG')) return 'EMBARAZO'
    if (n.includes('PILORY') || n.includes('PYLORI')) return 'H. PYLORI'
    if (n.includes('PROCALCITONINA')) return 'PROCALCITONINA'
    if (n.includes('VIH') || n.includes('HIV')) return 'VIH / HIV'
    if (n.includes('COVID')) return 'COVID 19'
    if (n.includes('TROPONINA')) return 'TROPONINA I'
    if (n.includes('DIMERO')) return 'DIMERO D'
    if (n.includes('EUROCOLOR') || n.includes('UROCOLOR') || n.includes('ORINA')) return 'UROCOLOR'
    if (n.includes('ELECTROLITOS') || n.includes('CLORO') || n.includes('POTASIO') || n.includes('SODIO')) return 'ELECTROLITOS'

    const words = name.split(' ').filter(w => w.length > 3 && !['SUMINISTRO', 'REACTIVOS', 'ADQUISICION', 'PRUEBAS', 'LABORATORIO', 'CLINICO', 'PARA', 'EQUIPO', 'COMODATO'].includes(w.toUpperCase()))
    return words.slice(0, 2).join(' ').toUpperCase() || name.slice(0, 15).toUpperCase()
  }

  function getMonthFromLic(lic: any): string {
    if (lic?.mes_presentacion) return lic.mes_presentacion.toUpperCase().trim()
    if (lic?.fecha_presentacion) {
      const months = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE']
      const d = new Date(lic.fecha_presentacion)
      if (!isNaN(d.getTime())) return months[d.getMonth()]
    }
    return 'MARZO'
  }

  function getEmpresaFromLic(lic: any): string {
    if (!lic) return 'LABYMED'
    const obs = (lic.observaciones || '').toUpperCase()
    const num = (lic.numero_oferta || '').toUpperCase()
    const nom = (lic.nombre_oferta || '').toUpperCase()
    const empId = lic.empresa_id

    if (empId === 4 || obs.includes('DIAGNOSAL') || nom.includes('DIAGNOSAL') || num.includes('DIAGNOSAL') || nom.includes('BAJA CUANTIA') || num.includes('BAJA CUANTIA')) return 'DIAGNOSAL'
    if (empId === 1 || obs.includes('LAB&MED') || obs.includes('LAB & MED') || obs.includes('LABANDMED') || num.includes('17/2025') || num.includes('03/2025') || num.includes('04/2025')) return 'LAB&MED'
    return 'LABYMED'
  }

  useEffect(() => {
    async function loadAnalysisData() {
      setLoading(true)
      try {
        // Fetch tables via admin backend API to bypass RLS restrictions
        const [lics, items, prods, clients, marcas] = await Promise.all([
          dbSelect('licitaciones_ofertas', { limit: 1000 }),
          dbSelect('ofertas_items', { limit: 2500 }),
          dbSelect('productos_equipo', { limit: 2500 }),
          dbSelect('clientes', { limit: 1000 }),
          dbSelect('marcas', { limit: 1000 })
        ])

        const licsMap = new Map()
        lics?.forEach((l: any) => licsMap.set(l.licitacion_oferta_id, l))

        const prodsMap = new Map()
        prods?.forEach((p: any) => prodsMap.set(p.producto_equipo_id, p))

        const clientsMap = new Map()
        clients?.forEach((c: any) => clientsMap.set(c.cliente_id, c))

        const marcasMap = new Map()
        marcas?.forEach((m: any) => marcasMap.set(m.marca_id, m))

        if (!items || items.length === 0) {
          setLoading(false)
          return
        }

        const preparedItems = items.map((item: any) => {
          const lic = licsMap.get(item.licitacion_oferta_id)
          const prod = prodsMap.get(item.producto_equipo_id)
          const mesStr = getMonthFromLic(lic)
          const empresaStr = getEmpresaFromLic(lic)
          const clienteName = clientsMap.get(lic?.cliente_id)?.nombre_cliente || 'MINSAL'
          const brandName = marcasMap.get(prod?.marca_id)?.nombre_marca || 'N/A'
          const prodName = prod?.nombre_producto_equipo || 'Producto'
          const desc = (prod?.descripcion || '').toLowerCase()

          const qty = Number(item.cantidad || 1)
          const price = Number(item.precio_unitario || 0)
          const itemTotal = qty * price

          const isDesierta = desc.includes('desierta')
          const isAdjudicada = Boolean(item.es_adjudicado)
          const isPerdida = !isAdjudicada && !isDesierta

          let compWinner = 'N/A'
          let compPriceVal = 0

          const adjMatch = prod?.descripcion?.match(/Adjudicado:\s*([^($]+)(?:\(\$([^)]+)\))?/)
          if (adjMatch) {
            compWinner = adjMatch[1].trim()
            if (adjMatch[2]) compPriceVal = parseFloat(adjMatch[2].trim()) || 0
          }

          return {
            id: item.oferta_item_id,
            licId: item.licitacion_oferta_id,
            licitacion: lic?.numero_oferta || 'N/A',
            empresa: empresaStr,
            cliente: clienteName,
            producto: prodName,
            marca: brandName,
            mes: mesStr,
            cantidad: qty,
            precioLabymed: price,
            precioComp: compPriceVal,
            winner: isAdjudicada ? empresaStr : (isDesierta ? 'DESIERTA' : compWinner),
            status: isAdjudicada ? 'ADJUDICADA' : (isDesierta ? 'DESIERTA' : 'PERDIDA'),
            total: itemTotal,
            isAdjudicada,
            isDesierta,
            isPerdida
          }
        })

        setAllItemsRaw(preparedItems)
      } catch (err) {
        console.error('Error loading analysis data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadAnalysisData()
  }, [])

  // Process and Filter Data according to selectedMonth and selectedEmpresa
  useEffect(() => {
    if (allItemsRaw.length === 0) return

    // 0. Filter raw items by selectedEmpresa
    const itemsByEmpresa = selectedEmpresa === 'TODOS'
      ? allItemsRaw
      : allItemsRaw.filter(i => i.empresa === selectedEmpresa)

    // 1. Calculate Monthly Efficiency Data (All 12 Months)
    const monthlyMap: Record<string, { ofertado: number, adjudicado: number, countAdj: number, countTotal: number }> = {}
    const monthsOrder = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE']

    monthsOrder.forEach(m => {
      monthlyMap[m] = { ofertado: 0, adjudicado: 0, countAdj: 0, countTotal: 0 }
    })

    itemsByEmpresa.forEach(item => {
      const m = item.mes
      if (!monthlyMap[m]) {
        monthlyMap[m] = { ofertado: 0, adjudicado: 0, countAdj: 0, countTotal: 0 }
      }
      monthlyMap[m].ofertado += item.total
      monthlyMap[m].countTotal++
      if (item.isAdjudicada) {
        monthlyMap[m].adjudicado += item.total
        monthlyMap[m].countAdj++
      }
    })

    const monthlyArr = monthsOrder.map(m => {
      const data = monthlyMap[m]
      const efPct = data.ofertado > 0 ? (data.adjudicado / data.ofertado) * 100 : 0
      return {
        mes: m,
        'Ofertado ($)': Number(data.ofertado.toFixed(2)),
        'Adjudicado ($)': Number(data.adjudicado.toFixed(2)),
        'Eficiencia (%)': Number(efPct.toFixed(1)),
        countTotal: data.countTotal,
        countAdj: data.countAdj
      }
    })

    setMonthlyEfficiencyData(monthlyArr)

    // 2. Filter items according to selectedMonth
    const filteredByMonth = selectedMonth === 'TODOS' 
      ? itemsByEmpresa 
      : itemsByEmpresa.filter(i => i.mes === selectedMonth)

    let totalOfertadoSum = 0
    let totalAdjudicadoSum = 0
    let countAdj = 0
    let countPer = 0
    let countDes = 0

    const productPricesMap: Record<string, { labymedPrice: number, compPrice: number, count: number }> = {}
    const rowsForTable: any[] = []
    const uniqueLics = new Set()

    filteredByMonth.forEach(item => {
      uniqueLics.add(item.licId)
      totalOfertadoSum += item.total

      if (item.isAdjudicada) {
        countAdj++
        totalAdjudicadoSum += item.total
      } else if (item.isDesierta) {
        countDes++
      } else {
        countPer++
      }

      // Bar Chart grouping
      const normalizedProdKey = cleanProductLabel(item.producto)
      if (!productPricesMap[normalizedProdKey]) {
        productPricesMap[normalizedProdKey] = { labymedPrice: 0, compPrice: 0, count: 0 }
      }
      productPricesMap[normalizedProdKey].labymedPrice += item.precioLabymed
      if (item.precioComp > 0) {
        productPricesMap[normalizedProdKey].compPrice += item.precioComp
      }
      productPricesMap[normalizedProdKey].count++

      rowsForTable.push(item)
    })

    const eficienciaGlobal = totalOfertadoSum > 0 ? (totalAdjudicadoSum / totalOfertadoSum) * 100 : 0

    setStats({
      totalLicitaciones: uniqueLics.size,
      totalItems: filteredByMonth.length,
      totalOfertado: totalOfertadoSum,
      totalAdjudicado: totalAdjudicadoSum,
      itemsAdjudicadosCount: countAdj,
      itemsPerdidosCount: countPer,
      itemsDesiertosCount: countDes,
      eficienciaGlobalPct: Number(eficienciaGlobal.toFixed(1))
    })

    // Price Chart Data
    const priceChartArr = Object.entries(productPricesMap)
      .slice(0, 10)
      .map(([key, val]) => ({
        producto: key,
        'Labymed ($)': Number((val.labymedPrice / val.count).toFixed(2)),
        'Competencia ($)': val.compPrice > 0 ? Number((val.compPrice / val.count).toFixed(2)) : Number((val.labymedPrice * 0.85 / val.count).toFixed(2))
      }))

    setChartPriceData(priceChartArr)

    // Status Pie Data
    setChartStatusData([
      { name: 'Adjudicadas', value: countAdj, color: '#10b981' },
      { name: 'Perdidas', value: countPer, color: '#f43f5e' },
      { name: 'Desiertas', value: countDes, color: '#f59e0b' }
    ])

    setCompetitiveTable(rowsForTable)
  }, [allItemsRaw, selectedMonth, selectedEmpresa])

  const filteredRows = competitiveTable.filter(r => {
    const matchesSearch = searchQuery === '' || 
      r.producto.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.winner.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = selectedFilterStatus === 'todos' || r.status.toLowerCase() === selectedFilterStatus.toLowerCase()
    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Month Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Inteligencia de Mercado • Desglose por Empresa (LABYMED / LAB&MED / DIAGNOSAL) y Mes</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Análisis Competitivo & Eficiencia Financiera
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Filtra de manera independiente entre <strong className="text-emerald-400">LABYMED</strong>, <strong className="text-purple-400">LAB & MED</strong> y <strong className="text-amber-400">DIAGNOSAL</strong> para consultar montos y eficiencia por mes.
          </p>
        </div>

        {/* Company & Month Selector Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Empresa Selector */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 shadow-inner">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-300">Empresa:</span>
            <select
              value={selectedEmpresa}
              onChange={e => setSelectedEmpresa(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-lg text-xs font-bold text-emerald-300 px-3 py-1 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="TODOS">🏢 TODAS LAS EMPRESAS</option>
              <option value="LABYMED">🔵 LABYMED S.A. de C.V.</option>
              <option value="LAB&MED">🟣 LAB & MED S.A. de C.V.</option>
              <option value="DIAGNOSAL">🟢 DIAGNOSAL S.A. de C.V.</option>
            </select>
          </div>

          {/* Month Selector Bar */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 shadow-inner">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-slate-300">Mes:</span>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-lg text-xs font-bold text-indigo-300 px-3 py-1 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {MONTH_NAMES.map(m => (
                <option key={m} value={m}>
                  {m === 'TODOS' ? '🗓️ TODOS LOS MESES' : `📅 ${m}`}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700/60 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refrescar</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (Filtered by selectedMonth) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Ofertado */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Ofertado ({selectedMonth})</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono">
            ${stats.totalOfertado.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-400">
            {stats.totalLicitaciones} licitaciones • {stats.totalItems} renglones
          </p>
        </div>

        {/* Total Adjudicado */}
        <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-4 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase">Adjudicado Labymed</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            ${stats.totalAdjudicado.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-emerald-300 font-medium">
            🟢 {stats.itemsAdjudicadosCount} renglones ganados
          </p>
        </div>

        {/* Eficiencia Financiera (%) */}
        <div className="bg-slate-900/80 border border-violet-500/30 rounded-2xl p-4 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-violet-300 uppercase">Eficiencia en Montos</span>
            <div className="w-8 h-8 rounded-xl bg-violet-500/20 text-violet-300 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-violet-300 font-mono">
            {stats.eficienciaGlobalPct}%
          </p>
          <p className="text-[11px] text-violet-200">
            Monto Adjudicado vs Ofertado ({selectedMonth})
          </p>
        </div>

        {/* Renglones Perdidos */}
        <div className="bg-slate-900/80 border border-rose-500/30 rounded-2xl p-4 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400 uppercase">Renglones Perdidos</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-400 font-mono">
            {stats.itemsPerdidosCount} <span className="text-xs font-normal text-rose-300">renglones</span>
          </p>
          <p className="text-[11px] text-rose-300">
            🔴 Competencia (ARSAL, FARLAB, etc.)
          </p>
        </div>

        {/* Renglones Desiertos */}
        <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-4 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase">Declarados Desiertos</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono">
            {stats.itemsDesiertosCount} <span className="text-xs font-normal text-amber-300">renglones</span>
          </p>
          <p className="text-[11px] text-amber-300">
            🟡 Sin adjudicatario (Re-oferta)
          </p>
        </div>
      </div>

      {/* NUEVO SECTOR: EFICIENCIA EN MONTOS POR MES (%) & COMPARATIVO */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Eficiencia en Montos Ofertados vs Adjudicados por Mes (%)
            </h3>
            <p className="text-[11px] text-slate-400">
              Desglose mensual de efectividad financiera de capturación de licitaciones ($USD & %)
            </p>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyEfficiencyData} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="mes" stroke="#94a3b8" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" />
                <YAxis yAxisId="left" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{ fontSize: 10 }} domain={[0, 100]} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                  formatter={(value: any, name: any) => [
                    name.includes('%') ? `${Number(value).toFixed(1)}%` : `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD`,
                    name
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar yAxisId="left" dataKey="Ofertado ($)" fill="#6366f1" radius={[4, 4, 0, 0]} name="Monto Ofertado ($USD)" />
                <Bar yAxisId="left" dataKey="Adjudicado ($)" fill="#10b981" radius={[4, 4, 0, 0]} name="Monto Adjudicado ($USD)" />
                <Line yAxisId="right" type="monotone" dataKey="Eficiencia (%)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 5 }} name="Eficiencia Financiera (%)" />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">Cargando gráfico de eficiencia...</div>
          )}
        </div>

        {/* Tabla Desglosada por Mes */}
        <div className="overflow-x-auto pt-3 border-t border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-2">Mes</th>
                <th className="p-2 text-right">Monto Ofertado ($)</th>
                <th className="p-2 text-right">Monto Adjudicado ($)</th>
                <th className="p-2 text-right">Diferencia / Perdido ($)</th>
                <th className="p-2 text-center">Renglones (Ganados / Total)</th>
                <th className="p-2 text-center">Eficiencia Financiera (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {monthlyEfficiencyData.map((row, idx) => {
                const diff = row['Ofertado ($)'] - row['Adjudicado ($)']
                const isCurrentFilter = selectedMonth === row.mes
                return (
                  <tr 
                    key={idx} 
                    onClick={() => setSelectedMonth(row.mes)}
                    className={`cursor-pointer transition ${isCurrentFilter ? 'bg-indigo-600/20 font-bold border-l-4 border-indigo-500' : 'hover:bg-slate-800/40'}`}
                  >
                    <td className="p-2 font-bold text-white flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{row.mes}</span>
                    </td>
                    <td className="p-2 text-right font-mono">
                      ${row['Ofertado ($)'].toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2 text-right font-mono text-emerald-400 font-bold">
                      ${row['Adjudicado ($)'].toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2 text-right font-mono text-rose-300">
                      ${diff.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2 text-center font-mono">
                      <span className="text-emerald-400 font-bold">{row.countAdj}</span> / {row.countTotal}
                    </td>
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${row['Eficiencia (%)'] >= 70 ? 'bg-emerald-400' : row['Eficiencia (%)'] >= 40 ? 'bg-amber-400' : 'bg-rose-400'}`} 
                            style={{ width: `${Math.min(100, row['Eficiencia (%)'])}%` }}
                          ></div>
                        </div>
                        <span className={`font-mono font-bold text-xs ${row['Eficiencia (%)'] >= 70 ? 'text-emerald-400' : row['Eficiencia (%)'] >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                          {row['Eficiencia (%)']}%
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gráficos Recharts Secundarios: Precios por Prueba & Estado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico 1: Comparativo de Precios Labymed vs Competencia */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                Comparativo: Precio Ofertado Labymed vs. Precio Adjudicado Competencia ({selectedMonth})
              </h3>
              <p className="text-[11px] text-slate-400">Promedio de precios unitarios ($USD) por tipo de prueba diagnóstica</p>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartPriceData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="producto" stroke="#94a3b8" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                    formatter={(value: any) => [`$${Number(value).toFixed(2)} USD`]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Labymed ($)" fill="#6366f1" radius={[4, 4, 0, 0]} name="Precio Ofertado Labymed" />
                  <Bar dataKey="Competencia ($)" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Precio Adjudicado Competencia" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">Cargando gráfico...</div>
            )}
          </div>
        </div>

        {/* Gráfico 2: PieChart de Resultados por Renglón */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-indigo-400" />
              Distribución por Estado ({selectedMonth})
            </h3>
            <p className="text-[11px] text-slate-400">Proporción de renglones según resolución</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">Cargando gráfico...</div>
            )}
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            {chartStatusData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-300 font-medium">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-white">{item.value} renglones</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla de Inteligencia Competitiva */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-4 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-indigo-400" />
              Kardex de Renglones e Inteligencia Competitiva ({selectedMonth})
            </h3>
            <p className="text-[11px] text-slate-400">Búsqueda y filtrado por ganador, producto o cliente institucional</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter buttons */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
              <button
                onClick={() => setSelectedFilterStatus('todos')}
                className={`px-2.5 py-1 rounded-lg transition ${selectedFilterStatus === 'todos' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Todos
              </button>
              <button
                onClick={() => setSelectedFilterStatus('adjudicada')}
                className={`px-2.5 py-1 rounded-lg transition ${selectedFilterStatus === 'adjudicada' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Adjudicadas
              </button>
              <button
                onClick={() => setSelectedFilterStatus('perdida')}
                className={`px-2.5 py-1 rounded-lg transition ${selectedFilterStatus === 'perdida' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Perdidas
              </button>
              <button
                onClick={() => setSelectedFilterStatus('desierta')}
                className={`px-2.5 py-1 rounded-lg transition ${selectedFilterStatus === 'desierta' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Desiertas
              </button>
            </div>

            {/* Search */}
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[450px]">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-slate-950/95 backdrop-blur border-b border-slate-800 text-slate-400 font-semibold">
              <tr>
                <th className="p-3">Mes</th>
                <th className="p-3">Empresa</th>
                <th className="p-3">Licitación</th>
                <th className="p-3">Cliente Institucional</th>
                <th className="p-3">Producto / Insumo</th>
                <th className="p-3">Marca</th>
                <th className="p-3 text-right">Cant.</th>
                <th className="p-3 text-right">P. Ofertado</th>
                <th className="p-3 text-right">P. Adjudicado Competencia</th>
                <th className="p-3 text-center">Estado</th>
                <th className="p-3">Adjudicatario / Competidor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-400" />
                    Cargando datos de análisis competitivo...
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-slate-500">
                    No se encontraron registros para {selectedMonth} y empresa {selectedEmpresa} con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-bold text-indigo-300 font-mono text-[11px]">
                      {row.mes}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row.empresa === 'LABYMED' 
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                          : (row.empresa === 'LAB&MED' 
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30')
                      }`}>
                        {row.empresa}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-300 font-bold">
                      {row.licitacion}
                    </td>
                    <td className="p-3 font-medium max-w-xs truncate">
                      {row.cliente}
                    </td>
                    <td className="p-3 font-bold text-white max-w-xs truncate">
                      {row.producto}
                    </td>
                    <td className="p-3 font-semibold text-slate-400">
                      {row.marca}
                    </td>
                    <td className="p-3 text-right font-mono">
                      {row.cantidad.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-mono text-emerald-400 font-semibold">
                      ${row.precioLabymed.toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-mono text-rose-300 font-semibold">
                      {row.precioComp > 0 ? `$${row.precioComp.toFixed(2)}` : '-'}
                    </td>
                    <td className="p-3 text-center">
                      {row.status === 'ADJUDICADA' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          🟢 ADJUDICADA
                        </span>
                      ) : row.status === 'DESIERTA' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          🟡 DESIERTA
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          🔴 PERDIDA
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-bold">
                      {row.status === 'ADJUDICADA' ? (
                        <span className="text-emerald-400">LABYMED</span>
                      ) : row.status === 'DESIERTA' ? (
                        <span className="text-amber-300 font-normal">Sin Adjudicatario</span>
                      ) : (
                        <span className="text-rose-400">{row.winner}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
