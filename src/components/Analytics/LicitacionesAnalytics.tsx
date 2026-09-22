'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { Briefcase, CheckCircle2, XCircle, DollarSign, Loader2 } from 'lucide-react'

const COLORS = ['#10b981', '#f43f5e'] // Emerald (Adjudicadas), Rose (Perdidas)

export default function LicitacionesAnalytics() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadLicitacionesData() {
      try {
        // Query Licitaciones joined with Items
        const { data: rawData, error } = await supabase
          .from('ofertas_items')
          .select(`
            precio_total,
            es_adjudicado,
            licitaciones_ofertas (
              fecha_presentacion,
              numero_oferta,
              nombre_oferta
            )
          `)
        
        if (error) {
          console.error("Error fetching licitaciones analysis data", error)
          setLoading(false)
          return
        }
        
        setData(rawData || [])
      } catch (err) {
        console.error("Exception in loadLicitacionesData", err)
      } finally {
        setLoading(false)
      }
    }
    loadLicitacionesData()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
      </div>
    )
  }

  // Process data for KPIs and Charts
  let totalOfertado = 0
  let totalAdjudicado = 0
  let totalPerdido = 0
  const aggsByYear: Record<string, { year: string, Adjudicadas: number, Perdidas: number }> = {}

  data.forEach((item) => {
    const val = Number(item.precio_total || 0)
    const adjudicado = item.es_adjudicado === true
    totalOfertado += val
    
    if (adjudicado) totalAdjudicado += val
    else totalPerdido += val

    // Extract year from licitaciones_ofertas.fecha_presentacion
    const master = Array.isArray(item.licitaciones_ofertas) ? item.licitaciones_ofertas[0] : item.licitaciones_ofertas
    const dateStr = master?.fecha_presentacion || ''
    const year = dateStr ? dateStr.split('-')[0] : 'Sin Fecha'

    if (!aggsByYear[year]) {
      aggsByYear[year] = { year, Adjudicadas: 0, Perdidas: 0 }
    }
    if (adjudicado) aggsByYear[year].Adjudicadas += val
    else aggsByYear[year].Perdidas += val
  })

  const winRate = totalOfertado > 0 ? (totalAdjudicado / totalOfertado) * 100 : 0
  const chartData = Object.values(aggsByYear).sort((a, b) => a.year.localeCompare(b.year))

  const pieData = [
    { name: 'Adjudicadas', value: totalAdjudicado },
    { name: 'Perdidas', value: totalPerdido }
  ]

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Ofertas y Licitaciones</h2>
          <p className="text-sm text-slate-500">
            Análisis financiero de licitaciones adjudicadas vs perdidas. Basado en {data.length} ítems ofertados.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-500 text-sm font-medium">Total Ofertado</h3>
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
              <DollarSign size={16} className="text-slate-600" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-bold text-slate-800">{formatCurrency(totalOfertado)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-emerald-600 text-sm font-medium">Adjudicado (Ganado)</h3>
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 size={16} className="text-emerald-600" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-bold text-slate-800">{formatCurrency(totalAdjudicado)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-rose-600 text-sm font-medium">Perdido / Pendiente</h3>
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
              <XCircle size={16} className="text-rose-600" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-bold text-slate-800">{formatCurrency(totalPerdido)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-cyan-600 text-sm font-medium">Tasa de Éxito (Win Rate)</h3>
            <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center">
              <Briefcase size={16} className="text-cyan-600" />
            </div>
          </div>
          <p className="mt-4 text-2xl font-bold text-slate-800">{winRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart by Year */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h3 className="text-base font-bold text-slate-800 mb-6">Comparativa por Año</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis 
                  tickFormatter={(v) => \`$\${v / 1000}k\`} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12}} 
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="Adjudicadas" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} maxBarSize={60} />
                <Bar dataKey="Perdidas" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart Global */}
        <div className="col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h3 className="text-base font-bold text-slate-800 mb-6">Distribución Global</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={\`cell-\${index}\`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
