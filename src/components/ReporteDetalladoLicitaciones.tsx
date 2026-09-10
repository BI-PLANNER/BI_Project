'use client'

import { useState, useMemo } from 'react'
import {
  FileText,
  Download,
  Printer,
  Copy,
  Check,
  Building2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Users,
  Layers,
  ArrowRight,
  TrendingUp,
  Tag,
  Briefcase,
  Search,
  Filter,
  X,
  Share2,
  FileSpreadsheet,
  PieChart as PieIcon,
  Sparkles
} from 'lucide-react'
import { IncidenciaEvento } from '@/app/dashboard/planner/page'
import NeoChartPieDonut, { PieDonutDataItem } from '@/components/NeoChartPieDonut'

interface ReporteProps {
  isOpen?: boolean
  onClose?: () => void
  isEmbedded?: boolean
  incidencias: IncidenciaEvento[]
}

export default function ReporteDetalladoLicitaciones({
  isOpen = true,
  onClose,
  isEmbedded = false,
  incidencias
}: ReporteProps) {
  const [copied, setCopied] = useState(false)
  const [filterArea, setFilterArea] = useState('todos')
  const [filterCliente, setFilterCliente] = useState('todos')
  const [filterSemaforo, setFilterSemaforo] = useState('todos')
  const [search, setSearch] = useState('')
  const [chartType, setChartType] = useState<'donut' | 'pie'>('pie')

  if (!isEmbedded && !isOpen) return null

  // Filtrado de eventos en el reporte
  const filtered = useMemo(() => {
    return incidencias.filter(item => {
      if (filterArea !== 'todos' && item.area !== filterArea) return false
      if (filterCliente !== 'todos' && item.cliente !== filterCliente) return false
      if (filterSemaforo !== 'todos') {
        const s = (item.estatus || '').toLowerCase()
        if (filterSemaforo === 'rojo' && !s.includes('rojo')) return false
        if (filterSemaforo === 'naranja' && !s.includes('naran') && !s.includes('amar')) return false
        if (filterSemaforo === 'verde' && !s.includes('verde') && !s.includes('comp')) return false
      }
      if (search.trim()) {
        const q = search.toLowerCase()
        return (
          item.cliente.toLowerCase().includes(q) ||
          item.situacion.toLowerCase().includes(q) ||
          item.responsable.toLowerCase().includes(q) ||
          item.area.toLowerCase().includes(q) ||
          (item.ubicacion || '').toLowerCase().includes(q) ||
          (item.numero_contrato || '').toLowerCase().includes(q) ||
          (item.comentario || '').toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [incidencias, filterArea, filterCliente, filterSemaforo, search])

  // Métricas
  const total = incidencias.length
  const totalRojo = incidencias.filter(i => (i.estatus || '').toLowerCase().includes('rojo')).length
  const totalNaranja = incidencias.filter(i => (i.estatus || '').toLowerCase().includes('naran') || (i.estatus || '').toLowerCase().includes('amar')).length
  const totalVerde = incidencias.filter(i => (i.estatus || '').toLowerCase().includes('verde') || (i.estatus || '').toLowerCase().includes('comp')).length
  const pctVerde = total > 0 ? Math.round((totalVerde / total) * 100) : 0

  // Áreas únicas
  const areas = useMemo(() => Array.from(new Set(incidencias.map(i => i.area))), [incidencias])
  const clientes = useMemo(() => Array.from(new Set(incidencias.map(i => i.cliente))), [incidencias])

  // --- 1. DATOS DE PASTEL: SEMÁFORO DE CUMPLIMIENTO ---
  const pieDataSemaforo: PieDonutDataItem[] = useMemo(() => [
    { label: '🟢 En Plazo (Verde)', value: totalVerde, color: '#10B981', hoverColor: '#34D399', sublabel: `${Math.round((totalVerde / (total || 1)) * 100)}% Cumplido` },
    { label: '🔴 Críticos (Rojo)', value: totalRojo, color: '#EF4444', hoverColor: '#F87171', sublabel: `${Math.round((totalRojo / (total || 1)) * 100)}% Urgente` },
    { label: '🟠 Advertencia (Naranja)', value: totalNaranja, color: '#F59E0B', hoverColor: '#FBBF24', sublabel: `${Math.round((totalNaranja / (total || 1)) * 100)}% En trámite` }
  ].filter(d => d.value > 0), [totalVerde, totalRojo, totalNaranja, total])

  // --- 2. DATOS DE PASTEL: CARGA POR ÁREA OPERATIVA ---
  const AREA_COLORS: Record<string, string> = {
    'APLICACIONES': '#06B6D4', // Cyan
    'PM': '#8B5CF6',           // Violet
    'LOGISTICA': '#3B82F6',     // Blue
    'IT': '#10B981',            // Emerald
    'LICITACIONES': '#EC4899',  // Pink
    'SOPORTE': '#F59E0B',       // Amber
    'GI': '#A855F7'             // Purple
  }

  const pieDataArea: PieDonutDataItem[] = useMemo(() => {
    return areas.map(a => {
      const count = incidencias.filter(i => i.area === a).length
      return {
        label: `📁 ${a}`,
        value: count,
        color: AREA_COLORS[a] || '#6366F1',
        sublabel: `${count} hito${count > 1 ? 's' : ''} (${Math.round((count / (total || 1)) * 100)}%)`
      }
    }).sort((a, b) => b.value - a.value)
  }, [areas, incidencias, total])

  // --- 3. DATOS DE PASTEL: POR CLIENTE / INSTITUCIÓN ---
  const CLIENTE_COLORS: Record<string, string> = {
    'SAN JUAN DE DIOS DE SANTA ANA': '#F59E0B',
    'HOSPITAL MILITAR': '#10B981',
    'ISBM': '#8B5CF6',
    'ISSS': '#3B82F6',
    'HOSPITAL BLOOM': '#EC4899',
    'HOSPITAL SALDAÑA': '#06B6D4'
  }

  const pieDataCliente: PieDonutDataItem[] = useMemo(() => {
    return clientes.map(c => {
      const count = incidencias.filter(i => i.cliente === c).length
      return {
        label: c.replace('HOSPITAL ', 'HOSP. '),
        value: count,
        color: CLIENTE_COLORS[c] || '#6366F1',
        sublabel: `${count} hito${count > 1 ? 's' : ''}`
      }
    }).sort((a, b) => b.value - a.value)
  }, [clientes, incidencias])

  // --- 4. DATOS DE PASTEL: TIPO DE COMPROMISO ---
  const countContrato = incidencias.filter(i => i.tipo_pendiente === 'CONTRATO').length
  const countVisita = incidencias.filter(i => i.tipo_pendiente === 'VISITA - LUIS').length

  const pieDataTipo: PieDonutDataItem[] = useMemo(() => [
    { label: '📄 Contrato Oficial', value: countContrato, color: '#3B82F6', sublabel: `${Math.round((countContrato / (total || 1)) * 100)}% de los hitos` },
    { label: '🛠️ Visita / Adecuación', value: countVisita, color: '#A855F7', sublabel: `${Math.round((countVisita / (total || 1)) * 100)}% en terreno` }
  ], [countContrato, countVisita, total])

  // Exportar a CSV / Excel
  const handleExportCSV = () => {
    const headers = [
      'N°',
      'CLIENTE',
      'CONTRATO',
      'PENDIENTE',
      'SITUACION',
      'AREA',
      'RESPONSABLE',
      'EMAIL',
      'UBICACION',
      'FECHA_CUMPLIMIENTO',
      'SEMAFORO',
      'COMENTARIO'
    ]

    const rows = filtered.map((item, idx) => [
      item.item_num || idx + 1,
      `"${(item.cliente || '').replace(/"/g, '""')}"`,
      `"${(item.numero_contrato || '').replace(/"/g, '""')}"`,
      `"${(item.tipo_pendiente || '').replace(/"/g, '""')}"`,
      `"${(item.situacion || '').replace(/"/g, '""')}"`,
      `"${(item.area || '').replace(/"/g, '""')}"`,
      `"${(item.responsable || '').replace(/"/g, '""')}"`,
      `"${(item.responsableEmail || '').replace(/"/g, '""')}"`,
      `"${(item.ubicacion || '').replace(/"/g, '""')}"`,
      item.fecha_cumplimiento || '',
      `"${(item.estatus || '').replace(/"/g, '""')}"`,
      `"${(item.comentario || '').replace(/"/g, '""')}"`
    ])

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Reporte_Detallado_Licitaciones_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Copiar resumen ejecutivo para correo / chat
  const handleCopyText = () => {
    let text = `📊 *INFORME EJECUTIVO DE LICITACIONES Y OBLIGACIONES — COMPRASAL / LAB&MED*\n`
    text += `📅 Fecha de emisión: ${new Date().toLocaleDateString('es-SV', { dateStyle: 'full' })}\n`
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
    text += `📈 RESUMEN DE HITOS:\n`
    text += `• Total Obligaciones: ${total}\n`
    text += `• 🟢 En Plazo: ${totalVerde} (${pctVerde}%)\n`
    text += `• 🔴 Críticos / Urgentes: ${totalRojo}\n`
    text += `• 🟠 En Advertencia: ${totalNaranja}\n`
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
    text += `📋 DETALLE POR OBLIGACIÓN:\n\n`

    filtered.forEach((item, idx) => {
      text += `${item.item_num || idx + 1}. [${item.estatus.toUpperCase()}] ${item.cliente} | ${item.numero_contrato}\n`
      text += `   • Tarea: ${item.situacion}\n`
      text += `   • Responsable: ${item.responsable} (${item.area})\n`
      text += `   • Fecha Límite: ${item.fecha_cumplimiento} | Ubicación: ${item.ubicacion || 'General'}\n`
      if (item.comentario) text += `   • Nota: ${item.comentario}\n`
      text += `\n`
    })

    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
    text += `Generado automáticamente desde Control Planner — Planificación Estratégica & Licitaciones.`

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  // Imprimir reporte con estilos limpios
  const handlePrint = () => {
    window.print()
  }

  const content = (
    <div className="space-y-6 text-white">
      {/* 1. Header Ejecutivo del Reporte */}
      <div className="glass-card p-6 rounded-3xl border border-white/10 shadow-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge bg-indigo-500/20 text-indigo-300 font-mono font-bold text-xs">
                DOCUMENTO EJECUTIVO DE CONTROL
              </span>
              <span className="badge bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs">
                FASE 2 — PROYECTOS & CONTRATOS
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <FileText className="w-7 h-7 text-indigo-400" />
              Reporte Detallado de Obligaciones de Licitaciones
            </h1>
            <p className="text-xs text-gray-400 mt-1 max-w-3xl">
              Auditoría y trazabilidad integral de los 26 hitos y compromisos contractuales asignados por Área y Responsable Operativo (Aplicaciones, PM, Logística, IT, Soporte, Licitaciones y GI).
            </p>
          </div>

          {/* Botones de Exportación / Acción */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Switch Donut vs Pie */}
            <div className="flex rounded-xl bg-white/5 p-1 border border-white/10 text-xs font-bold mr-1">
              <button
                onClick={() => setChartType('donut')}
                className={`px-2.5 py-1 rounded-lg transition-all text-xs cursor-pointer ${
                  chartType === 'donut'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Vista Gráfica Tipo Anillo / Donut"
              >
                Anillo
              </button>
              <button
                onClick={() => setChartType('pie')}
                className={`px-2.5 py-1 rounded-lg transition-all text-xs cursor-pointer ${
                  chartType === 'pie'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Vista Gráfica Tipo Pastel / Pie"
              >
                Pastel
              </button>
            </div>

            <button
              onClick={handleCopyText}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-200 flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              title="Copiar texto formateado para correo o WhatsApp"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-indigo-400" />
                  <span>Copiar Resumen</span>
                </>
              )}
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-bold text-emerald-300 flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              title="Descargar archivo Excel / CSV"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar Excel</span>
            </button>

            <button
              onClick={handlePrint}
              className="btn-primary !py-2 !px-4 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-500/20"
              title="Imprimir reporte en PDF o papel"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>

            {!isEmbedded && onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Scorecards Rápidos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5">
            <span className="text-[10px] text-gray-400 uppercase font-bold block">Total Obligaciones:</span>
            <span className="text-2xl font-black text-white font-mono">{total}</span>
            <span className="text-[10px] text-indigo-300 block mt-0.5">100% Asignadas</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-emerald-500/20">
            <span className="text-[10px] text-emerald-400 uppercase font-bold block">🟢 En Plazo / Verde:</span>
            <span className="text-2xl font-black text-emerald-300 font-mono">{totalVerde}</span>
            <span className="text-[10px] text-emerald-400/80 block mt-0.5">{pctVerde}% de efectividad</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-red-500/20">
            <span className="text-[10px] text-red-400 uppercase font-bold block">🔴 Críticos / Urgentes:</span>
            <span className="text-2xl font-black text-red-400 font-mono">{totalRojo}</span>
            <span className="text-[10px] text-red-400/80 block mt-0.5">Requieren seguimiento</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-amber-500/20">
            <span className="text-[10px] text-amber-400 uppercase font-bold block">🟠 Advertencia:</span>
            <span className="text-2xl font-black text-amber-400 font-mono">{totalNaranja}</span>
            <span className="text-[10px] text-amber-400/80 block mt-0.5">En trámite / cotización</span>
          </div>
        </div>
      </div>

      {/* 2. SECCIÓN DESTACADA: 4 GRÁFICAS DE PASTEL / DONUT INTERACTIVAS */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <PieIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">
                Análisis Visual con Gráficas de Pastel
              </h2>
              <p className="text-xs text-gray-400">
                Haga clic en cualquier porción o elemento de leyenda para filtrar automáticamente la tabla de abajo.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 shrink-0">
            {chartType === 'pie' ? '🥧 Modo Pastel Amplio con %' : '🍩 Modo Anillo Amplio'} • 26 Obligaciones
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfica 1: Semáforo de Cumplimiento */}
          <NeoChartPieDonut
            data={pieDataSemaforo}
            title="Semáforo & Estado de Cumplimiento"
            subtitle="Monitoreo de criticidad y urgencia de las 26 obligaciones"
            type={chartType}
            size={280}
            outerRadius={92}
            centerLabel="Hitos"
            centerValue={total}
            accentColor="emerald"
            badge="100% Auditado"
            formatValue={v => `${v} Obligaciones`}
            insight="📌 DIAGNÓSTICO: El 61.5% (16 hitos) marchan en plazo verde. Existen 9 compromisos urgentes en rojo (Hospital Bloom SIS, ISBM y reactivos de Santa Ana) y 1 en advertencia que requieren seguimiento directo."
            onSelectSlice={(slice) => {
              const s = slice.label.toLowerCase()
              if (s.includes('verde')) setFilterSemaforo('verde')
              else if (s.includes('rojo')) setFilterSemaforo('rojo')
              else if (s.includes('naran') || s.includes('amar')) setFilterSemaforo('naranja')
              else setFilterSemaforo('todos')
            }}
          />

          {/* Gráfica 2: Distribución por Área Operativa */}
          <NeoChartPieDonut
            data={pieDataArea}
            title="Carga de Trabajo por Área"
            subtitle="Distribución operativa entre los 7 departamentos de la empresa"
            type={chartType}
            size={280}
            outerRadius={92}
            centerLabel="Áreas"
            centerValue={areas.length}
            accentColor="cyan"
            badge="7 Áreas"
            formatValue={v => `${v} Obligaciones`}
            insight="📌 RECURSOS: Aplicaciones concentra el 34.6% (9 hitos) bajo Edgar Figuero, seguido por Project Management (PM) con 6 hitos (23.1%) e IT / Logística con 3 hitos cada uno."
            onSelectSlice={(slice) => {
              const rawArea = slice.label.replace('📁 ', '').trim()
              setFilterArea(filterArea === rawArea ? 'todos' : rawArea)
            }}
          />

          {/* Gráfica 3: Distribución por Hospital / Cliente */}
          <NeoChartPieDonut
            data={pieDataCliente}
            title="Distribución por Hospital / Cliente"
            subtitle="Concentración de obligaciones por institución de salud pública"
            type={chartType}
            size={280}
            outerRadius={92}
            centerLabel="Hospitales"
            centerValue={clientes.length}
            accentColor="amber"
            badge="6 Hospitales"
            formatValue={v => `${v} Obligaciones`}
            insight="📌 DEMANDA: San Juan de Dios de Santa Ana (13 hitos) y Hospital Militar (7 hitos) representan el 76.9% del volumen total de obligaciones contractuales activas."
            onSelectSlice={(slice) => {
              const targetCliente = clientes.find(c => c.includes(slice.label.replace('HOSP. ', '')) || slice.label.includes(c))
              if (targetCliente) {
                setFilterCliente(filterCliente === targetCliente ? 'todos' : targetCliente)
              }
            }}
          />

          {/* Gráfica 4: Tipo de Compromiso (Contrato vs Visita) */}
          <NeoChartPieDonut
            data={pieDataTipo}
            title="Tipo de Obligación (Legal vs Terreno)"
            subtitle="Clasificación según marco contractual COMPRASAL o visitas de adecuación"
            type={chartType}
            size={280}
            outerRadius={92}
            centerLabel="Total"
            centerValue={total}
            accentColor="purple"
            badge="Clasificación"
            formatValue={v => `${v} Obligaciones`}
            insight="📌 MARCO LEGAL: 17 obligaciones (65.4%) son compromisos de Contratos Oficiales de Suministro, y 9 (34.6%) son adecuaciones físicas en terreno (visitas técnicas de Luis Orellana y PM)."
          />
        </div>
      </div>

      {/* 3. Filtros y Búsqueda en el Reporte */}
      <div className="glass-card p-4 rounded-2xl border border-white/10 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-900/80">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 font-bold text-gray-300 text-xs">
            <Filter className="w-4 h-4 text-indigo-400" />
            <span>Filtrar Matriz:</span>
          </div>

          <select
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
            className="bg-slate-950 text-white font-semibold text-xs rounded-xl p-2 border border-white/10 outline-none cursor-pointer"
          >
            <option value="todos">Todas las Áreas ({total})</option>
            {areas.map(a => (
              <option key={a} value={a}>📁 {a} ({incidencias.filter(i => i.area === a).length})</option>
            ))}
          </select>

          <select
            value={filterCliente}
            onChange={(e) => setFilterCliente(e.target.value)}
            className="bg-slate-950 text-white font-semibold text-xs rounded-xl p-2 border border-white/10 outline-none cursor-pointer"
          >
            <option value="todos">Todos los Clientes</option>
            {clientes.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={filterSemaforo}
            onChange={(e) => setFilterSemaforo(e.target.value)}
            className="bg-slate-950 text-white font-semibold text-xs rounded-xl p-2 border border-white/10 outline-none cursor-pointer"
          >
            <option value="todos">Todos los Estados</option>
            <option value="rojo">🔴 Críticos ({totalRojo})</option>
            <option value="naranja">🟠 Advertencia ({totalNaranja})</option>
            <option value="verde">🟢 En Plazo ({totalVerde})</option>
          </select>

          {(filterArea !== 'todos' || filterCliente !== 'todos' || filterSemaforo !== 'todos' || search) && (
            <button
              onClick={() => {
                setFilterArea('todos')
                setFilterCliente('todos')
                setFilterSemaforo('todos')
                setSearch('')
              }}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 text-xs font-bold transition cursor-pointer"
            >
              Limpiar Filtros
            </button>
          )}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente, tarea, persona..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field !py-1.5 !pl-8 text-xs w-64 bg-slate-950"
          />
        </div>
      </div>

      {/* 4. Desglose Diagnóstico por Área Operativa */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {areas.map(areaName => {
          const areaItems = incidencias.filter(i => i.area === areaName)
          const areaRojo = areaItems.filter(i => (i.estatus || '').toLowerCase().includes('rojo')).length
          const areaVerde = areaItems.filter(i => (i.estatus || '').toLowerCase().includes('verde')).length
          const responsables = Array.from(new Set(areaItems.map(i => i.responsable))).join(', ')

          return (
            <div
              key={areaName}
              onClick={() => setFilterArea(filterArea === areaName ? 'todos' : areaName)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                filterArea === areaName
                  ? 'bg-indigo-600/25 border-indigo-500 ring-2 ring-indigo-500/50'
                  : 'glass-card border-white/10 hover:border-white/20 bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-white truncate">
                  {areaName}
                </span>
                <span className="badge bg-indigo-500/20 text-indigo-300 font-mono font-bold text-[10px]">
                  {areaItems.length}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 truncate mb-1.5">
                {responsables}
              </p>
              <div className="flex items-center gap-1.5 text-[9px] font-bold pt-1.5 border-t border-white/5">
                <span className="text-emerald-400">🟢 {areaVerde}</span>
                <span>•</span>
                <span className={areaRojo > 0 ? 'text-red-400 font-black' : 'text-gray-500'}>🔴 {areaRojo}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* 5. Tabla Maestra Consolidada Detallada */}
      <div className="glass-card rounded-3xl border border-white/10 overflow-hidden shadow-2xl bg-slate-900/90">
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-950/80">
          <div>
            <h3 className="text-sm font-black text-white">Matriz Detallada de Obligaciones ({filtered.length} registros)</h3>
            <p className="text-[11px] text-gray-400">Formato oficial con todas las dimensiones operativas, plazos y bitácora</p>
          </div>
          <span className="badge bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">
            COMPRASAL 3FN CONSOLIDADO
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-white/10 text-gray-400 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3 w-10 text-center">N°</th>
                <th className="p-3">CLIENTE</th>
                <th className="p-3">CONTRATO</th>
                <th className="p-3">PENDIENTE</th>
                <th className="p-3">SITUACIÓN / OBLIGACIÓN</th>
                <th className="p-3">ÁREA</th>
                <th className="p-3">RESPONSABLE</th>
                <th className="p-3">UBICACIÓN</th>
                <th className="p-3">FECHA LÍMITE</th>
                <th className="p-3 text-center">SEMÁFORO</th>
                <th className="p-3">COMENTARIO / BITÁCORA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-slate-900/40">
              {filtered.map((row, idx) => {
                const isRojo = (row.estatus || '').toLowerCase().includes('rojo')
                const isVerde = (row.estatus || '').toLowerCase().includes('verde')
                const isNaranja = (row.estatus || '').toLowerCase().includes('naran')

                return (
                  <tr key={row.id} className="hover:bg-white/[0.04] transition-colors">
                    <td className="p-3 text-center font-mono font-bold text-gray-400">{row.item_num || idx + 1}</td>
                    <td className="p-3 font-bold text-gray-100 whitespace-nowrap">{row.cliente}</td>
                    <td className="p-3 font-mono font-semibold text-yellow-300 whitespace-nowrap">{row.numero_contrato}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`badge text-[9px] font-bold ${
                        row.tipo_pendiente === 'VISITA - LUIS'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {row.tipo_pendiente}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-gray-200 max-w-xs">{row.situacion}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`badge text-[10px] font-bold ${
                        row.area === 'APLICACIONES' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' :
                        row.area === 'PM' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40' :
                        row.area === 'LOGISTICA' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' :
                        row.area === 'IT' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                        row.area === 'LICITACIONES' ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40' :
                        row.area === 'SOPORTE' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                        'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      }`}>
                        {row.area}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-white whitespace-nowrap">
                      <div>{row.responsable}</div>
                      {row.responsableEmail && (
                        <div className="text-[10px] text-gray-400 font-mono font-normal">{row.responsableEmail}</div>
                      )}
                    </td>
                    <td className="p-3 font-mono text-gray-300 whitespace-nowrap text-[11px]">{row.ubicacion || '-'}</td>
                    <td className="p-3 font-mono font-bold text-emerald-400 whitespace-nowrap">{row.fecha_cumplimiento}</td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <span className={`badge text-[10px] font-bold ${
                        isRojo ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                        isNaranja ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {row.estatus}
                      </span>
                    </td>
                    <td className="p-3 text-gray-300 text-[11px] max-w-sm">{row.comentario || '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Pie de Informe */}
      <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo-400" />
          <span>Control Planner — Sistema Oficial de Licitaciones y Dirección Estratégica</span>
        </div>
        <span className="font-mono text-[11px]">
          Generado el {new Date().toLocaleString('es-SV')}
        </span>
      </div>
    </div>
  )

  if (isEmbedded) {
    return content
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto animate-fade-in">
      <div className="w-full max-w-7xl max-h-[92vh] overflow-y-auto my-6">
        {content}
      </div>
    </div>
  )
}

