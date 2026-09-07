'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  FolderKanban,
  Plus,
  Search,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  UserCheck,
  DollarSign,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react'
import { dbInsert, dbUpdate, dbDelete } from '@/lib/api_3fn'

export default function ContratosPage() {
  const supabase = createClient()
  const [contratos, setContratos] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [empresas, setEmpresas] = useState<any[]>([])
  const [procesos, setProcesos] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [tiposDep, setTiposDep] = useState<any[]>([])
  const [personas, setPersonas] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [estatusList, setEstatusList] = useState<any[]>([])

  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedContrato, setExpandedContrato] = useState<number | null>(null)

  // Contract Modal
  const [showContractModal, setShowContractModal] = useState(false)
  const [editingContractId, setEditingContractId] = useState<number | null>(null)
  const [contractForm, setContractForm] = useState({
    numero_contrato: '',
    nombre_contrato: '',
    cliente_id: '',
    empresa_id: '',
    monto_total: '',
    fecha_adjudicacion: '',
    fecha_inicio: '',
    fecha_fin: '',
    fianza_cumplimiento_estado: 'Entregada',
    fianza_cumplimiento_poliza: '',
    fianza_buena_inversion_estado: 'Pendiente',
    fianza_buena_inversion_poliza: ''
  })

  // Numeral Modal
  const [showNumeralModal, setShowNumeralModal] = useState(false)
  const [selectedContratoForNumeral, setSelectedContratoForNumeral] = useState<number | null>(null)
  const [numeralForm, setNumeralForm] = useState({
    numeral: '',
    proceso_id: '',
    descripcion_solicitado: '',
    producto_equipo_id: '',
    tipo_dependiente_id: '',
    fecha_cumplimiento: '',
    estatus_id: '1',
    ejecutor_id: '',
    supervisor_id: ''
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // 1. Fetch Contratos with sub-tables
      const { data: conData } = await supabase
        .from('contratos')
        .select(`
          *,
          cliente:clientes(*),
          empresa:empresas(*),
          procesos:contrato_procesos(
            *,
            proceso:procesos(*),
            producto_equipo:productos_equipo(*),
            tipo_dependiente:tipos_dependiente(*),
            estatus:estatus(*),
            asignaciones:asignaciones_proceso(*, persona:personas(*), rol:roles(*))
          )
        `)
        .order('contrato_id', { ascending: true })

      // 2. Fetch Catalogs
      const { data: cl } = await supabase.from('clientes').select('*').order('nombre_cliente')
      const { data: em } = await supabase.from('empresas').select('*').order('nombre_empresa')
      const { data: pr } = await supabase.from('procesos').select('*').order('nombre_proceso')
      const { data: prod } = await supabase.from('productos_equipo').select('*').order('nombre_producto_equipo')
      const { data: td } = await supabase.from('tipos_dependiente').select('*').order('nombre_tipo')
      const { data: pe } = await supabase.from('personas').select('*, area:areas(*)').order('nombre_completo')
      const { data: ro } = await supabase.from('roles').select('*').order('nombre_rol')
      const { data: es } = await supabase.from('estatus').select('*').order('nombre_estatus')

      setContratos(conData || [])
      setClientes(cl || [])
      setEmpresas(em || [])
      setProcesos(pr || [])
      setProductos(prod || [])
      setTiposDep(td || [])
      setPersonas(pe || [])
      setRoles(ro || [])
      setEstatusList(es || [])
    } catch (err) {
      console.error('Error loading contracts:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Open Contract Form
  const handleOpenCreateContract = () => {
    setEditingContractId(null)
    setContractForm({
      numero_contrato: '',
      nombre_contrato: '',
      cliente_id: clientes[0]?.cliente_id ? String(clientes[0].cliente_id) : '',
      empresa_id: empresas[0]?.empresa_id ? String(empresas[0].empresa_id) : '',
      monto_total: '',
      fecha_adjudicacion: '',
      fecha_inicio: '',
      fecha_fin: '',
      fianza_cumplimiento_estado: 'Entregada',
      fianza_cumplimiento_poliza: '',
      fianza_buena_inversion_estado: 'Pendiente',
      fianza_buena_inversion_poliza: ''
    })
    setShowContractModal(true)
  }

  // Save Contract
  const handleSaveContract = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload: any = {
        numero_contrato: contractForm.numero_contrato,
        nombre_contrato: contractForm.nombre_contrato || null,
        cliente_id: Number(contractForm.cliente_id),
        empresa_id: Number(contractForm.empresa_id),
        monto_total: contractForm.monto_total ? Number(contractForm.monto_total) : null,
        fecha_adjudicacion: contractForm.fecha_adjudicacion || null,
        fecha_inicio: contractForm.fecha_inicio || null,
        fecha_fin: contractForm.fecha_fin || null,
        fianza_cumplimiento_estado: contractForm.fianza_cumplimiento_estado || null,
        fianza_cumplimiento_poliza: contractForm.fianza_cumplimiento_poliza || null,
        fianza_buena_inversion_estado: contractForm.fianza_buena_inversion_estado || null,
        fianza_buena_inversion_poliza: contractForm.fianza_buena_inversion_poliza || null
      }

      if (editingContractId) {
        await dbUpdate('contratos', editingContractId, 'contrato_id', payload)
      } else {
        await dbInsert('contratos', payload)
      }

      setShowContractModal(false)
      loadData()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Open Numeral Modal
  const handleOpenAddNumeral = (contratoId: number) => {
    setSelectedContratoForNumeral(contratoId)
    setNumeralForm({
      numeral: '',
      proceso_id: procesos[0]?.proceso_id ? String(procesos[0].proceso_id) : '',
      descripcion_solicitado: '',
      producto_equipo_id: '',
      tipo_dependiente_id: tiposDep[0]?.tipo_dependiente_id ? String(tiposDep[0].tipo_dependiente_id) : '',
      fecha_cumplimiento: '',
      estatus_id: estatusList[0]?.estatus_id ? String(estatusList[0].estatus_id) : '1',
      ejecutor_id: '',
      supervisor_id: ''
    })
    setShowNumeralModal(true)
  }

  // Save Numeral with RACI assignments
  const handleSaveNumeral = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedContratoForNumeral) return
    setLoading(true)
    try {
      // 1. Insert contrato_procesos via admin backend API
      const payloadProc: any = {
        contrato_id: selectedContratoForNumeral,
        proceso_id: Number(numeralForm.proceso_id),
        numeral: numeralForm.numeral,
        descripcion_solicitado: numeralForm.descripcion_solicitado || null,
        producto_equipo_id: numeralForm.producto_equipo_id ? Number(numeralForm.producto_equipo_id) : null,
        tipo_dependiente_id: numeralForm.tipo_dependiente_id ? Number(numeralForm.tipo_dependiente_id) : null,
        fecha_cumplimiento: numeralForm.fecha_cumplimiento || null,
        estatus_id: Number(numeralForm.estatus_id || 1)
      }

      const inserted = await dbInsert('contrato_procesos', payloadProc)
      const newProcId = Array.isArray(inserted) ? inserted[0]?.contrato_proceso_id : inserted?.contrato_proceso_id

      // 2. Insert RACI Assignments if selected
      const rolEjecutor = roles.find(r => r.nombre_rol.toUpperCase().includes('EJECUTOR'))
      const rolSupervisor = roles.find(r => r.nombre_rol.toUpperCase().includes('SUPERVISOR'))

      if (numeralForm.ejecutor_id && rolEjecutor && newProcId) {
        await dbInsert('asignaciones_proceso', {
          contrato_proceso_id: newProcId,
          persona_id: Number(numeralForm.ejecutor_id),
          rol_id: rolEjecutor.rol_id,
          estatus_id: Number(numeralForm.estatus_id || 1),
          comentario: 'Asignación principal'
        })
      }

      if (numeralForm.supervisor_id && rolSupervisor && newProcId) {
        await dbInsert('asignaciones_proceso', {
          contrato_proceso_id: newProcId,
          persona_id: Number(numeralForm.supervisor_id),
          rol_id: rolSupervisor.rol_id,
          estatus_id: Number(numeralForm.estatus_id || 1),
          comentario: 'Supervisión de cumplimiento'
        })
      }

      setShowNumeralModal(false)
      loadData()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteContract = async (id: number) => {
    if (!confirm('¿Eliminar este contrato y todos sus numerales asociados?')) return
    await dbDelete('contratos', id, 'contrato_id')
    loadData()
  }

  const filteredContratos = contratos.filter(c => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (c.numero_contrato || '').toLowerCase().includes(q) ||
      (c.nombre_contrato || '').toLowerCase().includes(q) ||
      (c.cliente?.nombre_cliente || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <FolderKanban className="w-4 h-4" />
            <span>Gestión Contractual • Modelo 3FN</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Contratos, Numerales & RACI
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Control de contratos institucionales, fianzas bancarias, desglose de numerales y asignaciones de personal.
          </p>
        </div>

        <button
          onClick={handleOpenCreateContract}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Contrato</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por número de contrato, nombre o institución..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
        <span className="text-xs font-mono text-slate-400 font-semibold">
          {filteredContratos.length} Contratos
        </span>
      </div>

      {/* Contracts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-500 bg-slate-900/40 border border-slate-800 rounded-2xl">
            <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Cargando contratos y numerales...
          </div>
        ) : filteredContratos.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-slate-900/40 border border-slate-800 rounded-2xl">
            <p className="font-bold text-slate-300">No se encontraron contratos</p>
            <p className="text-xs text-slate-500 mt-1">Haz clic en &quot;Nuevo Contrato&quot; para registrar el primero.</p>
          </div>
        ) : (
          filteredContratos.map(c => {
            const isExpanded = expandedContrato === c.contrato_id
            const numProcesos = c.procesos?.length || 0

            return (
              <div
                key={c.contrato_id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg transition"
              >
                {/* Contract Summary Bar */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-white font-mono">
                        {c.numero_contrato}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold font-mono">
                        {c.empresa?.nombre_empresa || 'Empresa'}
                      </span>
                      {c.monto_total && (
                        <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          ${Number(c.monto_total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 font-medium">
                      {c.nombre_contrato || 'Contrato de suministro y servicio técnico'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      🏢 <span className="text-slate-200 font-semibold">{c.cliente?.nombre_cliente}</span> • 📅 Vigencia: {c.fecha_inicio || 'N/A'} al {c.fecha_fin || 'N/A'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenAddNumeral(c.contrato_id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar Numeral</span>
                    </button>

                    <button
                      onClick={() => setExpandedContrato(isExpanded ? null : c.contrato_id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                    >
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{numProcesos} Numerales</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleDeleteContract(c.contrato_id)}
                      title="Eliminar Contrato"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded Numerals Table */}
                {isExpanded && (
                  <div className="border-t border-slate-800/80 bg-slate-950/60 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
                        Desglose de Obligaciones Contractuales (Numerales & RACI)
                      </span>
                    </div>

                    {numProcesos === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">
                        Este contrato aún no tiene numerales registrados. Haz clic en &quot;Agregar Numeral&quot;.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                              <th className="pb-2 w-16">Numeral</th>
                              <th className="pb-2">Proceso / Requerimiento</th>
                              <th className="pb-2">Producto / Equipo</th>
                              <th className="pb-2">Fecha Límite</th>
                              <th className="pb-2">Ejecutor RACI</th>
                              <th className="pb-2">Supervisor RACI</th>
                              <th className="pb-2">Estatus</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/50 text-slate-300">
                            {c.procesos.map((proc: any) => {
                              const ejecutor = proc.asignaciones?.find((a: any) => (a.rol?.nombre_rol || '').toUpperCase().includes('EJECUTOR'))
                              const supervisor = proc.asignaciones?.find((a: any) => (a.rol?.nombre_rol || '').toUpperCase().includes('SUPERVISOR'))

                              return (
                                <tr key={proc.contrato_proceso_id} className="hover:bg-slate-900/40">
                                  <td className="py-2.5 font-mono font-bold text-indigo-300">
                                    {proc.numeral}
                                  </td>
                                  <td className="py-2.5 font-medium text-white">
                                    {proc.proceso?.nombre_proceso || 'Proceso Técnico'}
                                    {proc.descripcion_solicitado && (
                                      <span className="block text-[11px] text-slate-400 font-normal">
                                        {proc.descripcion_solicitado}
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2.5 text-slate-300">
                                    {proc.producto_equipo?.nombre_producto_equipo || '-'}
                                  </td>
                                  <td className="py-2.5 font-mono text-[11px] text-slate-300">
                                    {proc.fecha_cumplimiento || '-'}
                                  </td>
                                  <td className="py-2.5">
                                    {ejecutor ? (
                                      <span className="inline-flex items-center gap-1 font-semibold text-slate-200">
                                        👤 {ejecutor.persona?.nombre_completo}
                                      </span>
                                    ) : (
                                      <span className="text-slate-500 text-[11px]">Sin asignar</span>
                                    )}
                                  </td>
                                  <td className="py-2.5">
                                    {supervisor ? (
                                      <span className="inline-flex items-center gap-1 font-semibold text-slate-200">
                                        👁️ {supervisor.persona?.nombre_completo}
                                      </span>
                                    ) : (
                                      <span className="text-slate-500 text-[11px]">Sin asignar</span>
                                    )}
                                  </td>
                                  <td className="py-2.5">
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold font-mono">
                                      {proc.estatus?.nombre_estatus || 'PENDIENTE'}
                                    </span>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Create / Edit Contract Modal */}
      {showContractModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <h3 className="text-sm font-bold text-white">Nuevo Contrato Institucional</h3>
              <button onClick={() => setShowContractModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveContract} className="p-5 overflow-y-auto space-y-3.5 flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">No. Contrato *</label>
                  <input
                    type="text"
                    value={contractForm.numero_contrato}
                    onChange={e => setContractForm({ ...contractForm, numero_contrato: e.target.value })}
                    required
                    placeholder="ej: SM-022/2024"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Monto Total ($)</label>
                  <input
                    type="number"
                    step="any"
                    value={contractForm.monto_total}
                    onChange={e => setContractForm({ ...contractForm, monto_total: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre / Objeto del Contrato</label>
                <input
                  type="text"
                  value={contractForm.nombre_contrato}
                  onChange={e => setContractForm({ ...contractForm, nombre_contrato: e.target.value })}
                  placeholder="ej: Suministro de reactivos y comodato de analizador"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cliente *</label>
                  <select
                    value={contractForm.cliente_id}
                    onChange={e => setContractForm({ ...contractForm, cliente_id: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value="">-- Seleccionar --</option>
                    {clientes.map(cl => (
                      <option key={cl.cliente_id} value={cl.cliente_id}>{cl.nombre_cliente}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Empresa Titular *</label>
                  <select
                    value={contractForm.empresa_id}
                    onChange={e => setContractForm({ ...contractForm, empresa_id: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value="">-- Seleccionar --</option>
                    {empresas.map(em => (
                      <option key={em.empresa_id} value={em.empresa_id}>{em.nombre_empresa}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha Inicio</label>
                  <input
                    type="date"
                    value={contractForm.fecha_inicio}
                    onChange={e => setContractForm({ ...contractForm, fecha_inicio: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha Fin</label>
                  <input
                    type="date"
                    value={contractForm.fecha_fin}
                    onChange={e => setContractForm({ ...contractForm, fecha_fin: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowContractModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition"
                >
                  Guardar Contrato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Numeral Modal */}
      {showNumeralModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <h3 className="text-sm font-bold text-white">Agregar Numeral Contractual & RACI</h3>
              <button onClick={() => setShowNumeralModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveNumeral} className="p-5 overflow-y-auto space-y-3.5 flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Numeral *</label>
                  <input
                    type="text"
                    value={numeralForm.numeral}
                    onChange={e => setNumeralForm({ ...numeralForm, numeral: e.target.value })}
                    required
                    placeholder="ej: 1.1, 2.3..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha Límite</label>
                  <input
                    type="date"
                    value={numeralForm.fecha_cumplimiento}
                    onChange={e => setNumeralForm({ ...numeralForm, fecha_cumplimiento: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Proceso / Obligación Técnica *</label>
                <select
                  value={numeralForm.proceso_id}
                  onChange={e => setNumeralForm({ ...numeralForm, proceso_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                >
                  <option value="">-- Seleccionar Proceso --</option>
                  {procesos.map(pr => (
                    <option key={pr.proceso_id} value={pr.proceso_id}>{pr.nombre_proceso}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Producto o Equipo Vinculado</label>
                <select
                  value={numeralForm.producto_equipo_id}
                  onChange={e => setNumeralForm({ ...numeralForm, producto_equipo_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                >
                  <option value="">-- Seleccionar Producto/Equipo --</option>
                  {productos.map(p => (
                    <option key={p.producto_equipo_id} value={p.producto_equipo_id}>{p.nombre_producto_equipo}</option>
                  ))}
                </select>
              </div>

              {/* RACI ASSIGNMENTS */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">
                  Asignación de Responsabilidades RACI
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">👤 Ejecutor (R)</label>
                    <select
                      value={numeralForm.ejecutor_id}
                      onChange={e => setNumeralForm({ ...numeralForm, ejecutor_id: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    >
                      <option value="">-- Seleccionar Ejecutor --</option>
                      {personas.map(p => (
                        <option key={p.persona_id} value={p.persona_id}>{p.nombre_completo}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">👁️ Supervisor (A)</label>
                    <select
                      value={numeralForm.supervisor_id}
                      onChange={e => setNumeralForm({ ...numeralForm, supervisor_id: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                    >
                      <option value="">-- Seleccionar Supervisor --</option>
                      {personas.map(p => (
                        <option key={p.persona_id} value={p.persona_id}>{p.nombre_completo}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descripción / Términos Solicitados</label>
                <textarea
                  value={numeralForm.descripcion_solicitado}
                  onChange={e => setNumeralForm({ ...numeralForm, descripcion_solicitado: e.target.value })}
                  rows={2}
                  placeholder="Detalles de cumplimiento según especificación de oferta..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNumeralModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition"
                >
                  Guardar Numeral
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
