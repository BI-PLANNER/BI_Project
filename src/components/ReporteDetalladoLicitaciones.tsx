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
  Sparkles,
  Plus,
  Edit3,
  UserPlus
} from 'lucide-react'
import { IncidenciaEvento } from '@/app/dashboard/planner/page'
import NeoChartPieDonut, { PieDonutDataItem } from '@/components/NeoChartPieDonut'
import ReasignarResponsableModal from '@/components/ReasignarResponsableModal'
import NuevaObligacionModal from '@/components/NuevaObligacionModal'

interface ReporteProps {
  isOpen?: boolean
  onClose?: () => void
  isEmbedded?: boolean
  incidencias: IncidenciaEvento[]
  onSaveRecord?: (record: IncidenciaEvento) => void
}

export default function ReporteDetalladoLicitaciones({
  isOpen = true,
  onClose,
  isEmbedded = false,
  incidencias: propIncidencias,
  onSaveRecord
}: ReporteProps) {
  const [copied, setCopied] = useState(false)
  const [filterArea, setFilterArea] = useState('todos')
  const [filterCliente, setFilterCliente] = useState('todos')
  const [filterSemaforo, setFilterSemaforo] = useState('todos')
  const [search, setSearch] = useState('')
  const [chartType, setChartType] = useState<'donut' | 'pie'>('pie')

  // Modals state
  const [modalNuevaOpen, setModalNuevaOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<IncidenciaEvento | null>(null)
  
  const [modalReasignarOpen, setModalReasignarOpen] = useState(false)
  const [reasignarRow, setReasignarRow] = useState<IncidenciaEvento | null>(null)

  // Local state for instant updates
  const [localIncidencias, setLocalIncidencias] = useState<IncidenciaEvento[]>(propIncidencias)

  const activeIncidencias = localIncidencias.length > 0 ? localIncidencias : propIncidencias

  if (!isEmbedded && !isOpen) return null

  // Filtrado de eventos en el reporte
  const filtered = activeIncidencias.filter(item => {
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

  // Métricas
  const total = activeIncidencias.length
  const totalRojo = activeIncidencias.filter(i => (i.estatus || '').toLowerCase().includes('rojo')).length
  const totalNaranja = activeIncidencias.filter(i => (i.estatus || '').toLowerCase().includes('naran') || (i.estatus || '').toLowerCase().includes('amar')).length
  const totalVerde = activeIncidencias.filter(i => (i.estatus || '').toLowerCase().includes('verde') || (i.estatus || '').toLowerCase().includes('comp')).length
  const pctVerde = total > 0 ? Math.round((totalVerde / total) * 100) : 0

  // Áreas únicas
  const areas = Array.from(new Set(activeIncidencias.map(i => i.area)))
  const clientes = Array.from(new Set(activeIncidencias.map(i => i.cliente)))

  // --- DATOS DE PASTEL ---
  const pieDataSemaforo: PieDonutDataItem[] = [
    { label: '🟢 En Plazo (Verde)', value: totalVerde, color: '#10B981', hoverColor: '#34D399', sublabel: `${Math.round((totalVerde / (total || 1)) * 100)}% Cumplido` },
    { label: '🔴 Críticos (Rojo)', value: totalRojo, color: '#EF4444', hoverColor: '#F87171', sublabel: `${Math.round((totalRojo / (total || 1)) * 100)}% Urgente` },
    { label: '🟠 Advertencia (Naranja)', value: totalNaranja, color: '#F59E0B', hoverColor: '#FBBF24', sublabel: `${Math.round((totalNaranja / (total || 1)) * 100)}% En trámite` }
  ].filter(d => d.value > 0)

  const handleCreateOrUpdate = (record: Partial<IncidenciaEvento>) => {
    if (editingRow) {
      // Update
      const updated = localIncidencias.map(item => 
        item.id === editingRow.id ? ({ ...item, ...record } as IncidenciaEvento) : item
      )
      setLocalIncidencias(updated)
      if (onSaveRecord) onSaveRecord({ ...editingRow, ...record } as IncidenciaEvento)
    } else {
      // Create new
      const newId = Date.now()
      const newRecord: IncidenciaEvento = {
        id: newId,
        item_num: localIncidencias.length + 1,
        incidencia_id: newId,
        cliente: record.cliente || 'HOSPITAL BLOOM',
        numero_contrato: record.numero_contrato || 'N° 99/2026',
        tipo_pendiente: record.tipo_pendiente || 'CONTRATO',
        situacion: record.situacion || 'Nueva Obligación',
        area: record.area || 'IT',
        responsable: record.responsable || 'NO ASIGNADO',
        responsableEmail: record.responsableEmail || '',
        ubicacion: record.ubicacion || 'LABORATORIO',
        fecha_cumplimiento: record.fecha_cumplimiento || new Date().toISOString().split('T')[0],
        estatus: record.estatus || 'Rojo',
        comentario: record.comentario || ''
      }
      const updated = [newRecord, ...localIncidencias]
      setLocalIncidencias(updated)
      if (onSaveRecord) onSaveRecord(newRecord)
    }
  }

  // Exportar a CSV / Excel
  const handleExportCSV = () => {
    const headers = ['N°', 'CLIENTE', 'CONTRATO', 'PENDIENTE', 'SITUACIÓN', 'AREA', 'RESPONSABLE', 'UBICACIÓN', 'FECHA LÍMITE', 'SEMÁFORO', 'COMENTARIO']
    const rows = filtered.map((item, idx) => [
      item.item_num || idx + 1,
      `"${item.cliente}"`,
      `"${item.numero_contrato}"`,
      `"${item.tipo_pendiente}"`,
      `"${item.situacion.replace(/"/g, '""')}"`,
      `"${item.area}"`,
      `"${item.responsable}"`,
      `"${item.ubicacion || ''}"`,
      `"${item.fecha_cumplimiento}"`,
      `"${item.estatus}"`,
      `"${(item.comentario || '').replace(/"/g, '""')}"`
    ])
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Matriz_Detallada_Obligaciones_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const content = (
    <div className="space-y-6 text-gray-900 font-sans">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-slate-300 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-indigo-200">
            <FileText size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              Matriz Detallada de Obligaciones
              <span className="badge bg-emerald-500/20 text-emerald-700 font-mono text-xs font-bold">100% Sincronizado</span>
            </h2>
            <p className="text-xs text-gray-500">
              Control Planner — Gestión operacional de contratos, hitos y responsables
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Botón AGREGAR REGISTRO */}
          <button
            onClick={() => {
              setEditingRow(null)
              setModalNuevaOpen(true)
            }}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition cursor-pointer"
          >
            <Plus size={16} />
            + Agregar Registro
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
          >
            <FileSpreadsheet size={15} />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* 2. Resumen KPI Top */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-300">
          <span className="text-[11px] font-bold text-gray-500 uppercase block">Total Hitos</span>
          <span className="text-2xl font-black text-gray-900">{total}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-300">
          <span className="text-[11px] font-bold text-emerald-700 uppercase block">🟢 En Plazo</span>
          <span className="text-2xl font-black text-emerald-700">{totalVerde} <span className="text-xs text-gray-500">({pctVerde}%)</span></span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-300">
          <span className="text-[11px] font-bold text-red-700 uppercase block">🔴 Urgentes</span>
          <span className="text-2xl font-black text-red-700">{totalRojo}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-300">
          <span className="text-[11px] font-bold text-amber-700 uppercase block">🟠 Advertencia</span>
          <span className="text-2xl font-black text-amber-700">{totalNaranja}</span>
        </div>
      </div>

      {/* 3. Filtros Interactivos */}
      <div className="p-4 rounded-2xl bg-white border border-slate-300 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={15} className="text-indigo-600" />
          <span className="text-xs font-bold text-gray-700">Filtros:</span>

          <select
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
            className="text-xs font-bold bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="todos">Todas las Áreas ({total})</option>
            {areas.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          <select
            value={filterCliente}
            onChange={(e) => setFilterCliente(e.target.value)}
            className="text-xs font-bold bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="todos">Todos los Clientes</option>
            {clientes.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={filterSemaforo}
            onChange={(e) => setFilterSemaforo(e.target.value)}
            className="text-xs font-bold bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-gray-600 text-xs font-bold transition cursor-pointer"
            >
              Limpiar Filtros
            </button>
          )}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente, tarea, persona..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs bg-slate-100 border border-slate-200 rounded-xl pl-8 pr-4 py-1.5 w-64 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* 4. Tabla Maestra Consolidada Detallada */}
      <div className="rounded-3xl border border-slate-300 overflow-hidden shadow-sm bg-white">
        <div className="p-4 border-b border-slate-300 flex items-center justify-between bg-white">
          <div>
            <h3 className="text-sm font-black text-gray-900">Matriz Detallada de Obligaciones ({filtered.length} de {total} registros)</h3>
            <p className="text-[11px] text-gray-500">Haga clic en «Editar» o «Reasignar» en cualquier fila para modificar los datos.</p>
          </div>
          
          <button
            onClick={() => {
              setEditingRow(null)
              setModalNuevaOpen(true)
            }}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={14} /> + Nuevo Registro
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 border-b border-slate-300 text-gray-600 uppercase text-[10px] font-black">
              <tr>
                <th className="p-3 w-10 text-center">N°</th>
                <th className="p-3">CLIENTE / INSTITUCIÓN</th>
                <th className="p-3">CONTRATO / TIPO</th>
                <th className="p-3">SITUACIÓN / OBLIGACIÓN</th>
                <th className="p-3">ÁREA</th>
                <th className="p-3">RESPONSABLE</th>
                <th className="p-3">UBICACIÓN</th>
                <th className="p-3">PLAZO</th>
                <th className="p-3 text-center">SEMÁFORO</th>
                <th className="p-3 text-center">ACCIÓN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filtered.map((row, idx) => {
                const isRojo = (row.estatus || '').toLowerCase().includes('rojo')
                const isVerde = (row.estatus || '').toLowerCase().includes('verde')
                const isNaranja = (row.estatus || '').toLowerCase().includes('naran')

                return (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 text-center font-mono font-bold text-gray-500">{row.item_num || idx + 1}</td>
                    
                    <td className="p-3 font-bold text-gray-900 whitespace-nowrap">{row.cliente}</td>
                    
                    <td className="p-3 font-mono font-semibold text-indigo-700 whitespace-nowrap">
                      <div>{row.numero_contrato}</div>
                      <span className="text-[9px] font-bold text-slate-400 block">{row.tipo_pendiente}</span>
                    </td>
                    
                    <td className="p-3 font-semibold text-gray-800 max-w-xs">
                      <div>{row.situacion}</div>
                      {row.comentario && (
                        <p className="text-[11px] text-gray-500 font-normal italic mt-1 line-clamp-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                          💬 {row.comentario}
                        </p>
                      )}
                    </td>
                    
                    <td className="p-3 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {row.area}
                      </span>
                    </td>
                    
                    <td className="p-3 font-bold text-gray-900 whitespace-nowrap">
                      <div>{row.responsable}</div>
                      {row.responsableEmail && (
                        <div className="text-[10px] text-gray-500 font-mono font-normal">{row.responsableEmail}</div>
                      )}
                    </td>
                    
                    <td className="p-3 font-mono text-gray-600 whitespace-nowrap text-[11px]">{row.ubicacion || 'LABORATORIO'}</td>
                    
                    <td className="p-3 font-mono font-bold text-gray-900 whitespace-nowrap">{row.fecha_cumplimiento}</td>
                    
                    <td className="p-3 text-center whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                        isRojo ? 'bg-rose-100 text-rose-700 border border-rose-300' :
                        isNaranja ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                        'bg-emerald-100 text-emerald-700 border border-emerald-300'
                      }`}>
                        ● {row.estatus}
                      </span>
                    </td>

                    {/* Botones de Acción */}
                    <td className="p-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingRow(row)
                            setModalNuevaOpen(true)
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1 transition shadow-sm border border-indigo-200"
                          title="Editar Registro"
                        >
                          <Edit3 size={13} /> Editar
                        </button>

                        <button
                          onClick={() => {
                            setReasignarRow(row)
                            setModalReasignarOpen(true)
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition shadow-sm border border-slate-200"
                          title="Reasignar Responsable"
                        >
                          <UserPlus size={13} /> Reasignar
                        </button>
                      </div>
                    </td>

                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modales Formulario Crear/Editar */}
      <NuevaObligacionModal
        isOpen={modalNuevaOpen}
        onClose={() => {
          setModalNuevaOpen(false)
          setEditingRow(null)
        }}
        onSave={handleCreateOrUpdate}
        initialData={editingRow}
      />

      {/* Modal Reasignar Responsable */}
      {modalReasignarOpen && reasignarRow && (
        <ReasignarResponsableModal
          isOpen={modalReasignarOpen}
          onClose={() => setModalReasignarOpen(false)}
          item={reasignarRow}
          onSave={(updatedItem) => {
            const updated = localIncidencias.map(item =>
              item.id === updatedItem.id ? updatedItem : item
            )
            setLocalIncidencias(updated)
            setModalReasignarOpen(false)
          }}
        />
      )}

    </div>
  )

  if (isEmbedded) {
    return content
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 overflow-y-auto animate-fade-in">
      <div className="w-full max-w-7xl max-h-[92vh] overflow-y-auto my-6">
        {content}
      </div>
    </div>
  )
}
