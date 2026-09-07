'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  ShieldCheck,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Building2,
  FileText,
  DollarSign,
  Calendar,
  X,
  Save,
  Edit3,
  Trash2,
  Sparkles,
  RefreshCw,
  AlertCircle,
  FileCheck2
} from 'lucide-react'
import { dbUpdate } from '@/lib/api_3fn'

export default function GarantiasPage() {
  const supabase = createClient()
  const [contratos, setContratos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState('todos')
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  // Edit Fianza Modal
  const [editingContrato, setEditingContrato] = useState<any | null>(null)
  const [formData, setFormData] = useState({
    fianza_cumplimiento_estado: 'Entregada',
    fianza_cumplimiento_poliza: '',
    fianza_buena_inversion_estado: 'Pendiente',
    fianza_buena_inversion_poliza: '',
    monto_total: ''
  })

  const loadGarantiasFromContratos = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('contratos')
        .select(`
          contrato_id,
          numero_contrato,
          nombre_contrato,
          monto_total,
          fecha_adjudicacion,
          fecha_inicio,
          fecha_fin,
          fianza_cumplimiento_estado,
          fianza_cumplimiento_poliza,
          fianza_buena_inversion_estado,
          fianza_buena_inversion_poliza,
          cliente:clientes(cliente_id, nombre_cliente),
          empresa:empresas(empresa_id, nombre_empresa)
        `)
        .order('contrato_id', { ascending: true })

      if (error) throw error
      setContratos(data || [])
    } catch (err: any) {
      console.error('Error loading garantias/contratos:', err)
      setNotification({ type: 'error', message: 'Error cargando contratos: ' + err.message })
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadGarantiasFromContratos()
  }, [loadGarantiasFromContratos])

  const handleOpenEdit = (c: any) => {
    setEditingContrato(c)
    setFormData({
      fianza_cumplimiento_estado: c.fianza_cumplimiento_estado || 'Entregada',
      fianza_cumplimiento_poliza: c.fianza_cumplimiento_poliza || '',
      fianza_buena_inversion_estado: c.fianza_buena_inversion_estado || 'Pendiente',
      fianza_buena_inversion_poliza: c.fianza_buena_inversion_poliza || '',
      monto_total: c.monto_total ? String(c.monto_total) : ''
    })
  }

  const handleSaveFianzas = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingContrato) return
    setLoading(true)
    try {
      await dbUpdate('contratos', editingContrato.contrato_id, 'contrato_id', {
        fianza_cumplimiento_estado: formData.fianza_cumplimiento_estado || null,
        fianza_cumplimiento_poliza: formData.fianza_cumplimiento_poliza || null,
        fianza_buena_inversion_estado: formData.fianza_buena_inversion_estado || null,
        fianza_buena_inversion_poliza: formData.fianza_buena_inversion_poliza || null,
        monto_total: formData.monto_total ? Number(formData.monto_total) : null
      })

      setNotification({ type: 'success', message: `Fianzas del contrato ${editingContrato.numero_contrato} guardadas en Supabase con éxito.` })
      setEditingContrato(null)
      loadGarantiasFromContratos()
    } catch (err: any) {
      setNotification({ type: 'error', message: 'Error al guardar en Supabase: ' + err.message })
    } finally {
      setLoading(false)
    }
  }

  const filteredContratos = contratos.filter(c => {
    if (search) {
      const q = search.toLowerCase()
      const matchNum = (c.numero_contrato || '').toLowerCase().includes(q)
      const matchName = (c.nombre_contrato || '').toLowerCase().includes(q)
      const matchClient = (c.cliente?.nombre_cliente || '').toLowerCase().includes(q)
      if (!matchNum && !matchName && !matchClient) return false
    }
    if (filterEstado !== 'todos') {
      const est1 = c.fianza_cumplimiento_estado || 'Pendiente'
      const est2 = c.fianza_buena_inversion_estado || 'Pendiente'
      if (filterEstado === 'Entregada' && est1 !== 'Entregada' && est2 !== 'Entregada') return false
      if (filterEstado === 'Pendiente' && est1 !== 'Pendiente' && est2 !== 'Pendiente') return false
    }
    return true
  })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Control de Garantías & Fianzas Bancarias • Tabla `contratos`</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Garantías de Contratos y Pólizas
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitoreo y actualización directa en Supabase de Fianzas de Fiel Cumplimiento y Buena Inversión.
          </p>
        </div>

        <button
          onClick={loadGarantiasFromContratos}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700/60 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`p-3 rounded-xl flex items-center justify-between text-xs font-medium border animate-fade-in ${
          notification.type === 'success'
            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
            : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por contrato, cliente o póliza..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <select
          value={filterEstado}
          onChange={e => setFilterEstado(e.target.value)}
          className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
        >
          <option value="todos">Todos los Estados de Fianza</option>
          <option value="Entregada">Fianzas Entregadas / Aprobadas</option>
          <option value="Pendiente">Fianzas Pendientes</option>
        </select>
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 p-12 text-center text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-400" />
            Cargando pólizas de contratos desde Supabase...
          </div>
        ) : filteredContratos.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-slate-500 bg-slate-900/40 border border-slate-800 rounded-2xl">
            <p className="font-bold text-slate-300">No hay contratos registrados</p>
            <p className="text-xs text-slate-500 mt-1">Registra contratos en el módulo de Contratos o Tablas para gestionar sus fianzas.</p>
          </div>
        ) : (
          filteredContratos.map(c => (
            <div
              key={c.contrato_id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-sm font-black text-white font-mono block">
                      {c.numero_contrato}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      🏢 {c.cliente?.nombre_cliente || 'Institución'}
                    </span>
                  </div>
                  {c.monto_total && (
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      ${Number(c.monto_total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </div>

                {/* Fianza 1: Fiel Cumplimiento */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <FileCheck2 className="w-3.5 h-3.5 text-indigo-400" />
                      Fianza de Fiel Cumplimiento
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                      c.fianza_cumplimiento_estado === 'Entregada'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {c.fianza_cumplimiento_estado || 'Pendiente'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Póliza: <span className="text-slate-200 font-mono">{c.fianza_cumplimiento_poliza || 'No registrada'}</span>
                  </p>
                </div>

                {/* Fianza 2: Buena Inversión */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <FileCheck2 className="w-3.5 h-3.5 text-violet-400" />
                      Fianza de Buena Inversión / Anticipo
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                      c.fianza_buena_inversion_estado === 'Entregada'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {c.fianza_buena_inversion_estado || 'Pendiente'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Póliza: <span className="text-slate-200 font-mono">{c.fianza_buena_inversion_poliza || 'No registrada'}</span>
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end">
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-600/20 text-slate-300 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500/30 text-xs font-bold transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar Fianzas en Supabase</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {editingContrato && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <h3 className="text-sm font-bold text-white">
                Editar Fianzas • {editingContrato.numero_contrato}
              </h3>
              <button onClick={() => setEditingContrato(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveFianzas} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Monto Total Contratado ($)</label>
                <input
                  type="number"
                  step="any"
                  value={formData.monto_total}
                  onChange={e => setFormData({ ...formData, monto_total: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              {/* Fianza Cumplimiento */}
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                <span className="text-xs font-bold text-indigo-300 block">Fianza de Fiel Cumplimiento</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Estado</label>
                    <select
                      value={formData.fianza_cumplimiento_estado}
                      onChange={e => setFormData({ ...formData, fianza_cumplimiento_estado: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    >
                      <option value="Entregada">Entregada / Aprobada</option>
                      <option value="Pendiente">Pendiente de Entrega</option>
                      <option value="En Trámite">En Trámite Bancario</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">No. Póliza</label>
                    <input
                      type="text"
                      value={formData.fianza_cumplimiento_poliza}
                      onChange={e => setFormData({ ...formData, fianza_cumplimiento_poliza: e.target.value })}
                      placeholder="ej: POL-2026-99"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Fianza Buena Inversión */}
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                <span className="text-xs font-bold text-violet-300 block">Fianza de Buena Inversión</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Estado</label>
                    <select
                      value={formData.fianza_buena_inversion_estado}
                      onChange={e => setFormData({ ...formData, fianza_buena_inversion_estado: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Entregada">Entregada</option>
                      <option value="En Trámite">En Trámite Bancario</option>
                      <option value="No Aplica">No Aplica</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">No. Póliza</label>
                    <input
                      type="text"
                      value={formData.fianza_buena_inversion_poliza}
                      onChange={e => setFormData({ ...formData, fianza_buena_inversion_poliza: e.target.value })}
                      placeholder="ej: POL-BI-100"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingContrato(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition"
                >
                  Guardar en Supabase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
