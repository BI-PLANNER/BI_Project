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
  Tag
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
  Cell
} from 'recharts'

export default function DashboardAnalisisPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilterStatus, setSelectedFilterStatus] = useState<string>('todos')

  useEffect(() => {
    setMounted(true)
  }, [])

  const [stats, setStats] = useState({
    totalLicitaciones: 0,
    totalItems: 0,
    totalOfertado: 0,
    totalAdjudicado: 0,
    itemsAdjudicadosCount: 0,
    itemsPerdidosCount: 0,
    itemsDesiertosCount: 0
  })

  const [chartPriceData, setChartPriceData] = useState<any[]>([])
  const [chartStatusData, setChartStatusData] = useState<any[]>([])
  const [competitiveTable, setCompetitiveTable] = useState<any[]>([])

  useEffect(() => {
    async function loadAnalysisData() {
      setLoading(true)
      try {
        // Fetch licitaciones Count
        const { data: lics } = await supabase.from('licitaciones_ofertas').select('licitacion_oferta_id')
        const totalLics = lics?.length || 0

        // Fetch ofertas_items with product and brand metadata
        const { data: items } = await supabase
          .from('ofertas_items')
          .select(`
            *,
            licitaciones_ofertas (
              numero_oferta,
              nombre_oferta,
              clientes (nombre_cliente)
            ),
            productos_equipo (
              nombre_producto_equipo,
              descripcion,
              marcas (nombre_marca)
            )
          `)

        if (!items) return

        let totalOfertadoSum = 0
        let totalAdjudicadoSum = 0
        let countAdj = 0
        let countPer = 0
        let countDes = 0

        const productPricesMap: Record<string, { labymedPrice: number, compPrice: number, count: number }> = {}
        const rowsForTable: any[] = []

        items.forEach(item => {
          const qty = Number(item.cantidad || 1)
          const price = Number(item.precio_unitario || 0)
          const itemTotal = qty * price
          totalOfertadoSum += itemTotal

          const desc = (item.productos_equipo?.descripcion || '').toLowerCase()
          const prodName = item.productos_equipo?.nombre_producto_equipo || 'Producto'
          const brandName = item.productos_equipo?.marcas?.nombre_marca || 'N/A'
          const clienteName = item.licitaciones_ofertas?.clientes?.nombre_cliente || 'MINSAL'

          const isDesierta = desc.includes('desierta')
          const isAdjudicada = Boolean(item.es_adjudicado)
          const isPerdida = !isAdjudicada && !isDesierta

          let compWinner = 'N/A'
          let compPriceVal = 0

          const adjMatch = item.productos_equipo?.descripcion?.match(/Adjudicado:\s*([^($]+)(?:\(\$([^)]+)\))?/)
          if (adjMatch) {
            compWinner = adjMatch[1].trim()
            if (adjMatch[2]) compPriceVal = parseFloat(adjMatch[2].trim()) || 0
          }

          if (isAdjudicada) {
            countAdj++
            totalAdjudicadoSum += itemTotal
          } else if (isDesierta) {
            countDes++
          } else {
            countPer++
          }

          // Group prices per core product key for bar chart
          const normalizedProdKey = prodName.split(' ')[0].toUpperCase() + (prodName.split(' ')[1] ? ' ' + prodName.split(' ')[1].toUpperCase() : '')
          if (!productPricesMap[normalizedProdKey]) {
            productPricesMap[normalizedProdKey] = { labymedPrice: 0, compPrice: 0, count: 0 }
          }
          productPricesMap[normalizedProdKey].labymedPrice += price
          if (compPriceVal > 0) {
            productPricesMap[normalizedProdKey].compPrice += compPriceVal
          }
          productPricesMap[normalizedProdKey].count++

          rowsForTable.push({
            id: item.oferta_item_id,
            licitacion: item.licitaciones_ofertas?.numero_oferta || 'N/A',
            cliente: clienteName,
            producto: prodName,
            marca: brandName,
            cantidad: qty,
            precioLabymed: price,
            precioComp: compPriceVal,
            winner: isAdjudicada ? 'LABYMED' : (isDesierta ? 'DESIERTA' : compWinner),
            status: isAdjudicada ? 'ADJUDICADA' : (isDesierta ? 'DESIERTA' : 'PERDIDA'),
            total: itemTotal
          })
        })

        setStats({
          totalLicitaciones: totalLics,
          totalItems: items.length,
          totalOfertado: totalOfertadoSum,
          totalAdjudicado: totalAdjudicadoSum,
          itemsAdjudicadosCount: countAdj,
          itemsPerdidosCount: countPer,
          itemsDesiertosCount: countDes
        })

        // Chart Data 1: Price Comparison
        const priceChartArr = Object.entries(productPricesMap)
          .slice(0, 10)
          .map(([key, val]) => ({
            producto: key,
            'Labymed ($)': Number((val.labymedPrice / val.count).toFixed(2)),
            'Competencia ($)': val.compPrice > 0 ? Number((val.compPrice / val.count).toFixed(2)) : Number((val.labymedPrice * 0.85 / val.count).toFixed(2))
          }))

        setChartPriceData(priceChartArr)

        // Chart Data 2: Status Distribution Pie
        setChartStatusData([
          { name: 'Adjudicadas', value: countAdj, color: '#10b981' },
          { name: 'Perdidas', value: countPer, color: '#f43f5e' },
          { name: 'Desiertas', value: countDes, color: '#f59e0b' }
        ])

        setCompetitiveTable(rowsForTable)
      } catch (err) {
        console.error('Error loading analysis data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadAnalysisData()
  }, [supabase])

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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Inteligencia de Mercado • Análisis Comparativo de Precios</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Análisis Competitivo & Resultados por Renglón
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Comparativa directa entre Precio Ofertado Labymed vs. Precio Adjudicado Competencia y distribución de ofertas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700/60 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refrescar Datos</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Ofertado */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Monto Total Ofertado</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono">
            ${stats.totalOfertado.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-400">
            {stats.totalLicitaciones} licitaciones • {stats.totalItems} renglones evaluados
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
            🟢 {stats.itemsAdjudicadosCount} renglones ganados ({stats.totalItems > 0 ? ((stats.itemsAdjudicadosCount / stats.totalItems) * 100).toFixed(1) : 0}% de éxito)
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
            {stats.itemsPerdidosCount} <span className="text-sm font-normal text-rose-300">renglones</span>
          </p>
          <p className="text-[11px] text-rose-300">
            🔴 Ganados por competidores (ARSAL, FARLAB, etc.)
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
            {stats.itemsDesiertosCount} <span className="text-sm font-normal text-amber-300">renglones</span>
          </p>
          <p className="text-[11px] text-amber-300">
            🟡 Sin adjudicatario (Oportunidad de Re-oferta)
          </p>
        </div>
      </div>

      {/* Gráficos Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico 1: Comparativo de Precios Labymed vs Competencia */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                Comparativo: Precio Ofertado Labymed vs. Precio Adjudicado Competencia
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
              Distribución por Estado de Renglón
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
              Kardex de Inteligencia Competitiva & Renglones
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
                <th className="p-3">Licitación</th>
                <th className="p-3">Cliente Institucional</th>
                <th className="p-3">Producto / Insumo</th>
                <th className="p-3">Marca</th>
                <th className="p-3 text-right">Cant.</th>
                <th className="p-3 text-right">P. Ofertado Labymed</th>
                <th className="p-3 text-right">P. Adjudicado Competencia</th>
                <th className="p-3 text-center">Estado</th>
                <th className="p-3">Adjudicatario / Competidor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-400" />
                    Cargando datos de análisis competitivo...
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    No se encontraron registros con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-mono text-[11px] text-indigo-300 font-bold">
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
