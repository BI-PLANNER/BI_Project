'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  ShieldAlert,
  Search,
  Filter,
  Plus,
  Calendar,
  User,
  Building2,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Mail,
  RefreshCw,
  Zap,
  Trash2,
  Edit2
} from 'lucide-react'
import PresionEmailModal from '@/components/PresionEmailModal'
import { calcularSemaforoFecha, dbInsert, dbUpdate, dbDelete } from '@/lib/api_3fn'

export default function KardexIncidenciasPage() {
  const supabase = createClient()
  const [incidencias, setIncidencias] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [contratos, setContratos] = useState<any[]>([])
  const [situaciones, setSituaciones] = useState<any[]>([])
  const [personas, setPersonas] = useState<any[]>([])
  const [ubicaciones, setUbicaciones] = useState<any[]>([])
  const [estatusList, setEstatusList] = useState<any[]>([])

  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCliente, setFilterCliente] = useState('todos')
  const [filterSemaforo, setFilterSemaforo] = useState('todos')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    cliente_id: '',
    contrato_id: '',
    situacion_id: '',
    persona_id: '',
    ubicacion_id: '',
    estatus_id: '',
    fecha_registro: new Date().toISOString().split('T')[0],
    fecha_cumplimiento: '',
    comentario: ''
  })

  // Presión Email Modal
  const [presionModalOpen, setPresionModalOpen] = useState(false)
  const [selectedTaskForPressure, setSelectedTaskForPressure] = useState<any>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // 1. Fetch Incidencias
      const { data: incData } = await supabase
        .from('incidencias_seguimiento')
        .select(`
          *,
          cliente:clientes(*),
          contrato:contratos(*),
          situacion:situaciones(*),
          persona:personas(*, area:areas(*)),
          ubicacion:ubicaciones(*),
          estatus:estatus(*)
        `)
        .order('fecha_cumplimiento', { ascending: true })

      // 2. Fetch Catalogs for Form
      const { data: cl } = await supabase.from('clientes').select('*').order('nombre_cliente')
      const { data: co } = await supabase.from('contratos').select('*').order('numero_contrato')
      const { data: si } = await supabase.from('situaciones').select('*').order('nombre_situacion')
      const { data: pe } = await supabase.from('personas').select('*, area:areas(*)').order('nombre_completo')
      const { data: ub } = await supabase.from('ubicaciones').select('*').order('nombre_ubicacion')
      const { data: es } = await supabase.from('estatus').select('*').order('nombre_estatus')

      setIncidencias(incData || [])
      setClientes(cl || [])
      setContratos(co || [])
      setSituaciones(si || [])
      setPersonas(pe || [])
      setUbicaciones(ub || [])
      setEstatusList(es || [])
    } catch (err) {
      console.error('Error loading incidencias:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleOpenCreate = () => {
    setEditingId(null)
    setFormData({
      cliente_id: clientes[0]?.cliente_id ? String(clientes[0].cliente_id) : '',
      contrato_id: '',
      situacion_id: situaciones[0]?.situacion_id ? String(situaciones[0].situacion_id) : '',
      persona_id: '',
      ubicacion_id: '',
      estatus_id: estatusList[0]?.estatus_id ? String(estatusList[0].estatus_id) : '',
      fecha_registro: new Date().toISOString().split('T')[0],
      fecha_cumplimiento: '',
      comentario: ''
    })
    setShowModal(true)
  }

  const handleOpenEdit = (item: any) => {
    setEditingId(item.incidencia_id)
    setFormData({
      cliente_id: String(item.cliente_id || ''),
      contrato_id: String(item.contrato_id || ''),
      situacion_id: String(item.situacion_id || ''),
      persona_id: String(item.persona_id || ''),
      ubicacion_id: String(item.ubicacion_id || ''),
      estatus_id: String(item.estatus_id || ''),
      fecha_registro: item.fecha_registro || new Date().toISOString().split('T')[0],
      fecha_cumplimiento: item.fecha_cumplimiento || '',
      comentario: item.comentario || ''
    })
    setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload: any = {
        cliente_id: Number(formData.cliente_id),
        contrato_id: formData.contrato_id ? Number(formData.contrato_id) : null,
        situacion_id: formData.situacion_id ? Number(formData.situacion_id) : null,
        persona_id: formData.persona_id ? Number(formData.persona_id) : null,
        ubicacion_id: formData.ubicacion_id ? Number(formData.ubicacion_id) : null,
        estatus_id: Number(formData.estatus_id || 1),
        fecha_registro: formData.fecha_registro,
        fecha_cumplimiento: formData.fecha_cumplimiento || null,
        comentario: formData.comentario || null
      }

      if (editingId) {
        await dbUpdate('incidencias_seguimiento', editingId, 'incidencia_id', payload)
      } else {
        await dbInsert('incidencias_seguimiento', payload)
      }

      setShowModal(false)
      loadData()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta incidencia?')) return
    await dbDelete('incidencias_seguimiento', id, 'incidencia_id')
    loadData()
  }

  const handlePressure = (inc: any) => {
    setSelectedTaskForPressure({
      id: String(inc.incidencia_id),
      descripcion: inc.situacion?.nombre_situacion || inc.comentario || 'Incidencia operativa',
      responsableNombre: inc.persona?.nombre_completo || 'Responsable',
      responsableEmail: inc.persona?.email || 'responsable@labandmed.com',
      responsableRol: inc.persona?.area?.nombre_area || 'Área Operativa',
      proyectoNombre: inc.contrato?.numero_contrato || 'Contrato',
      cliente: inc.cliente?.nombre_cliente || 'Institución',
      fechaCumplimiento: inc.fecha_cumplimiento || '',
      diasRestantes: 2
    })
    setPresionModalOpen(true)
  }

  // Filters
  const filteredIncidencias = incidencias.filter(inc => {
    const sem = calcularSemaforoFecha(inc.fecha_cumplimiento)
    if (filterSemaforo !== 'todos' && sem.color !== filterSemaforo) return false
    if (filterCliente !== 'todos' && String(inc.cliente_id) !== filterCliente) return false
    if (search) {
      const q = search.toLowerCase()
      const matchComment = (inc.comentario || '').toLowerCase().includes(q)
      const matchClient = (inc.cliente?.nombre_cliente || '').toLowerCase().includes(q)
      const matchPerson = (inc.persona?.nombre_completo || '').toLowerCase().includes(q)
      const matchSit = (inc.situacion?.nombre_situacion || '').toLowerCase().includes(q)
      if (!matchComment && !matchClient && !matchPerson && !matchSit) return false
    }
    return true
  })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Mesa de Ayuda • Seguimiento de Contingencias</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Kardex de Incidencias Operativas
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Registro, asignación de responsables, semáforo de urgencia y envío de alertas de presión.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700/60 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Incidencia</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por cliente, responsable o situación..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Cliente filter */}
          <select
            value={filterCliente}
            onChange={e => setFilterCliente(e.target.value)}
            className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-rose-500"
          >
            <option value="todos">Todos los Clientes</option>
            {clientes.map(c => (
              <option key={c.cliente_id} value={String(c.cliente_id)}>{c.nombre_cliente}</option>
            ))}
          </select>

          {/* Semáforo filter */}
          <select
            value={filterSemaforo}
            onChange={e => setFilterSemaforo(e.target.value)}
            className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-rose-500"
          >
            <option value="todos">Todos los Semáforos</option>
            <option value="Rojo">🔴 Rojo (Urgente / ≤7d)</option>
            <option value="Anaranjado">🟠 Anaranjado (Próximo / ≤14d)</option>
            <option value="Verde">🟢 Verde (A tiempo / &gt;14d)</option>
          </select>
        </div>
      </div>

      {/* Incidencias List / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 p-12 text-center text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-rose-400" />
            Cargando incidencias operativas...
          </div>
        ) : filteredIncidencias.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-slate-500 bg-slate-900/40 border border-slate-800 rounded-2xl">
            <p className="font-bold text-slate-300">No hay incidencias para mostrar</p>
            <p className="text-xs text-slate-500 mt-1">Usa el botón &quot;Nueva Incidencia&quot; para registrar un ticket operativo.</p>
          </div>
        ) : (
          filteredIncidencias.map((inc) => {
            const sem = calcularSemaforoFecha(inc.fecha_cumplimiento)
            return (
              <div
                key={inc.incidencia_id}
                className="bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-4 shadow-lg space-y-3 transition flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-400 font-mono">
                      #{inc.incidencia_id} • {inc.fecha_registro}
                    </span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold font-mono ${
                      sem.color === 'Rojo'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : sem.color === 'Anaranjado'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {sem.label}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white">
                    {inc.situacion?.nombre_situacion || 'Situación no clasificada'}
                  </h3>

                  <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/50">
                    {inc.comentario || 'Sin descripción detallada.'}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                    <div>
                      <span className="text-slate-500 block">Cliente:</span>
                      <span className="font-semibold text-slate-200 truncate block">🏢 {inc.cliente?.nombre_cliente}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Contrato:</span>
                      <span className="font-mono text-indigo-300 font-semibold block">{inc.contrato?.numero_contrato || 'General'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Responsable:</span>
                      <span className="font-semibold text-slate-200 block">👤 {inc.persona?.nombre_completo || 'Sin asignar'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Ubicación:</span>
                      <span className="text-slate-300 block">📍 {inc.ubicacion?.nombre_ubicacion || 'Central'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(inc)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(inc.incidencia_id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-400 text-xs transition"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => handlePressure(inc)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition active:scale-95"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Presionar</span>
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <h3 className="text-sm font-bold text-white">
                {editingId ? `Editar Incidencia #${editingId}` : 'Nueva Incidencia Operativa'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-3.5 flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cliente *</label>
                <select
                  value={formData.cliente_id}
                  onChange={e => setFormData({ ...formData, cliente_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                >
                  <option value="">-- Seleccionar Cliente --</option>
                  {clientes.map(c => (
                    <option key={c.cliente_id} value={c.cliente_id}>{c.nombre_cliente}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Contrato (Opcional)</label>
                <select
                  value={formData.contrato_id}
                  onChange={e => setFormData({ ...formData, contrato_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                >
                  <option value="">-- Vinculación a Contrato --</option>
                  {contratos.map(co => (
                    <option key={co.contrato_id} value={co.contrato_id}>{co.numero_contrato}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Situación / Tipo de Falla *</label>
                <select
                  value={formData.situacion_id}
                  onChange={e => setFormData({ ...formData, situacion_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                >
                  <option value="">-- Seleccionar Situación --</option>
                  {situaciones.map(s => (
                    <option key={s.situacion_id} value={s.situacion_id}>{s.nombre_situacion}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Responsable</label>
                  <select
                    value={formData.persona_id}
                    onChange={e => setFormData({ ...formData, persona_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value="">-- Técnico Asignado --</option>
                    {personas.map(p => (
                      <option key={p.persona_id} value={p.persona_id}>{p.nombre_completo} ({p.area?.nombre_area || 'Área'})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Ubicación</label>
                  <select
                    value={formData.ubicacion_id}
                    onChange={e => setFormData({ ...formData, ubicacion_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value="">-- Laboratorio/Sala --</option>
                    {ubicaciones.map(u => (
                      <option key={u.ubicacion_id} value={u.ubicacion_id}>{u.nombre_ubicacion}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha de Registro</label>
                  <input
                    type="date"
                    value={formData.fecha_registro}
                    onChange={e => setFormData({ ...formData, fecha_registro: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha Límite</label>
                  <input
                    type="date"
                    value={formData.fecha_cumplimiento}
                    onChange={e => setFormData({ ...formData, fecha_cumplimiento: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Estatus</label>
                <select
                  value={formData.estatus_id}
                  onChange={e => setFormData({ ...formData, estatus_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                >
                  {estatusList.map(es => (
                    <option key={es.estatus_id} value={es.estatus_id}>{es.nombre_estatus}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Detalle / Comentario</label>
                <textarea
                  value={formData.comentario}
                  onChange={e => setFormData({ ...formData, comentario: e.target.value })}
                  rows={3}
                  placeholder="Detalles de la falla, observaciones técnicas o acuerdos..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition"
                >
                  {editingId ? 'Guardar Cambios' : 'Registrar Incidencia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pressure Modal */}
      {selectedTaskForPressure && (
        <PresionEmailModal
          isOpen={presionModalOpen}
          onClose={() => setPresionModalOpen(false)}
          task={selectedTaskForPressure}
        />
      )}
    </div>
  )
}
