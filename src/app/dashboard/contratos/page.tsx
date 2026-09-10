'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
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
  AlertCircle,
  AlertTriangle,
  FileText,
  Filter,
  Check,
  RefreshCw,
  Tag,
  ShieldAlert
} from 'lucide-react'
import { dbSelect, dbInsert, dbUpdate, dbDelete } from '@/lib/api_3fn'
import { MASTER_LICITACIONES_PENDIENTES } from '@/app/dashboard/planner/page'

// 6 Contratos Institucionales Oficiales de la Matriz del Usuario
export const MASTER_CONTRATOS = [
  {
    contrato_id: '430884ea-80db-4e96-9f6b-66e4390e3332',
    numero_contrato: 'N° 68/2026',
    nombre_contrato: 'Contrato Hospital Nacional de Niños Benjamín Bloom',
    cliente_id: 18,
    cliente_nombre: 'HOSPITAL BLOOM',
    empresa_id: 1,
    empresa_nombre: 'LABANDMED S.A. DE C.V.',
    monto_total: 0,
    fecha_inicio: '2026-01-01',
    fecha_fin: '2026-12-31',
    fianza_cumplimiento_estado: 'Entregada',
    fianza_buena_inversion_estado: 'Pendiente'
  },
  {
    contrato_id: 'c5aab7f8-e369-468f-b55b-d6f0e0af0e94',
    numero_contrato: 'CT No 13-BS-2026',
    nombre_contrato: 'Contrato Hospital Militar Central',
    cliente_id: 17,
    cliente_nombre: 'HOSPITAL MILITAR',
    empresa_id: 1,
    empresa_nombre: 'LABANDMED S.A. DE C.V.',
    monto_total: 0,
    fecha_inicio: '2026-01-01',
    fecha_fin: '2026-12-31',
    fianza_cumplimiento_estado: 'Entregada',
    fianza_buena_inversion_estado: 'Pendiente'
  },
  {
    contrato_id: '9301a73d-64cc-4334-b32b-0c64895d7f15',
    numero_contrato: 'CT No 16/2026',
    nombre_contrato: 'Contrato San Juan de Dios de Santa Ana',
    cliente_id: 15,
    cliente_nombre: 'SAN JUAN DE DIOS DE SANTA ANA',
    empresa_id: 1,
    empresa_nombre: 'LABANDMED S.A. DE C.V.',
    monto_total: 0,
    fecha_inicio: '2026-01-01',
    fecha_fin: '2026-12-31',
    fianza_cumplimiento_estado: 'Entregada',
    fianza_buena_inversion_estado: 'Pendiente'
  },
  {
    contrato_id: '40fb3832-7ee1-4e0b-a2b4-3d245d59b912',
    numero_contrato: 'CT No AD-014/2026-ISBM',
    nombre_contrato: 'Contrato ISBM Electrolitos & Gases',
    cliente_id: 14,
    cliente_nombre: 'ISBM',
    empresa_id: 1,
    empresa_nombre: 'LABANDMED S.A. DE C.V.',
    monto_total: 0,
    fecha_inicio: '2026-01-01',
    fecha_fin: '2026-12-31',
    fianza_cumplimiento_estado: 'Entregada',
    fianza_buena_inversion_estado: 'Pendiente'
  },
  {
    contrato_id: 'ec14a9c3-bfcf-4da4-8483-b9734dd2b47c',
    numero_contrato: 'SM-022/2024',
    nombre_contrato: 'Contrato ISSS ERITRO & Insumos',
    cliente_id: 13,
    cliente_nombre: 'ISSS',
    empresa_id: 1,
    empresa_nombre: 'LABANDMED S.A. DE C.V.',
    monto_total: 0,
    fecha_inicio: '2026-01-01',
    fecha_fin: '2026-12-31',
    fianza_cumplimiento_estado: 'Entregada',
    fianza_buena_inversion_estado: 'Pendiente'
  },
  {
    contrato_id: '26a2c588-0b89-4da3-acee-dc4d03f57a22',
    numero_contrato: 'CT-SALDAÑA-2026',
    nombre_contrato: 'Contrato Hospital Saldaña',
    cliente_id: 16,
    cliente_nombre: 'HOSPITAL SALDAÑA',
    empresa_id: 1,
    empresa_nombre: 'LABANDMED S.A. DE C.V.',
    monto_total: 0,
    fecha_inicio: '2026-01-01',
    fecha_fin: '2026-12-31',
    fianza_cumplimiento_estado: 'Entregada',
    fianza_buena_inversion_estado: 'Pendiente'
  }
]

// Visual themes per client institution
const CLIENT_THEMES: Record<string, { bg: string, border: string, text: string, badge: string, dot: string }> = {
  'ISSS': { bg: 'bg-blue-950/40', border: 'border-blue-500/30', text: 'text-blue-300', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30', dot: 'bg-blue-400' },
  'ISBM': { bg: 'bg-purple-950/40', border: 'border-purple-500/30', text: 'text-purple-300', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30', dot: 'bg-purple-400' },
  'SAN JUAN DE DIOS DE SANTA ANA': { bg: 'bg-amber-950/40', border: 'border-amber-500/30', text: 'text-amber-300', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30', dot: 'bg-amber-400' },
  'HOSPITAL SAN JUAN DE DIOS DE SANTA ANA': { bg: 'bg-amber-950/40', border: 'border-amber-500/30', text: 'text-amber-300', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30', dot: 'bg-amber-400' },
  'HOSPITAL MILITAR': { bg: 'bg-emerald-950/40', border: 'border-emerald-500/30', text: 'text-emerald-300', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-400' },
  'HOSPITAL BLOOM': { bg: 'bg-pink-950/40', border: 'border-pink-500/30', text: 'text-pink-300', badge: 'bg-pink-500/20 text-pink-300 border-pink-500/30', dot: 'bg-pink-400' },
  'HOSPITAL SALDAÑA': { bg: 'bg-cyan-950/40', border: 'border-cyan-500/30', text: 'text-cyan-300', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', dot: 'bg-cyan-400' }
}

const DEFAULT_THEME = { bg: 'bg-slate-900/60', border: 'border-slate-800', text: 'text-indigo-300', badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', dot: 'bg-indigo-400' }

const AREA_BADGES: Record<string, string> = {
  'IT': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'APLICACIONES': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'PM': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  'LOGISTICA': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'LICITACIONES': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'SOPORTE': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  'GI': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
}

export const DEFAULT_PERSONAS = [
  { persona_id: 1, nombre_completo: 'JULIO CESAR', email: 'julio.cesar@lm-sv.com', area: 'PM' },
  { persona_id: 2, nombre_completo: 'EDGAR FIGUEROA', email: 'edgar.figueroa@lm-sv.com', area: 'APLICACIONES' },
  { persona_id: 3, nombre_completo: 'LUIS ORELLANA', email: 'luis.orellana@lm-sv.com', area: 'GI' },
  { persona_id: 4, nombre_completo: 'JOSE LENNY GOMEZ', email: 'jose.gomez@labandmed.com', area: 'PM' },
  { persona_id: 5, nombre_completo: 'ANTONIO ALTUNA', email: 'antonio.altuna@labandmed.com', area: 'GI' },
  { persona_id: 6, nombre_completo: 'RICARDO SANCHEZ', email: 'ricardo.sanchez@lm-sv.com', area: 'IT' },
  { persona_id: 7, nombre_completo: 'DIEGO MEJIA', email: 'diego.mejia@lm-sv.com', area: 'LOGISTICA' },
  { persona_id: 8, nombre_completo: 'MOISES RIVERA', email: 'moises.rivera@lm-sv.com', area: 'SOPORTE' },
  { persona_id: 9, nombre_completo: 'ROBERTO BATRES', email: 'roberto.batres@lm-sv.com', area: 'LICITACIONES' },
  { persona_id: 10, nombre_completo: 'CARLOS MENDOZA', email: 'carlos.mendoza@lm-sv.com', area: 'LOGISTICA' },
  { persona_id: 11, nombre_completo: 'MARIO RAMOS', email: 'mario.ramos@lm-sv.com', area: 'SOPORTE' },
  { persona_id: 12, nombre_completo: 'JUAN JOSE PEREZ', email: 'juan.perez@lm-sv.com', area: 'LOGISTICA' }
]

export const DEFAULT_AREAS = [
  { area_id: 1, nombre_area: 'PM', label: 'PM (Project Management)' },
  { area_id: 2, nombre_area: 'APLICACIONES', label: 'APLICACIONES (Especialistas Clínicos)' },
  { area_id: 3, nombre_area: 'IT', label: 'IT (Sistemas e Informática)' },
  { area_id: 4, nombre_area: 'LOGISTICA', label: 'LOGISTICA (Bodega & Despacho)' },
  { area_id: 5, nombre_area: 'SOPORTE', label: 'SOPORTE (Ingeniería Biomédica)' },
  { area_id: 6, nombre_area: 'LICITACIONES', label: 'LICITACIONES (Ofertas & Contratos)' },
  { area_id: 7, nombre_area: 'GI', label: 'GI (Gerencia de Integración)' }
]

export const DEFAULT_CLIENTES = [
  { cliente_id: 13, nombre_cliente: 'ISSS' },
  { cliente_id: 14, nombre_cliente: 'ISBM' },
  { cliente_id: 15, nombre_cliente: 'SAN JUAN DE DIOS DE SANTA ANA' },
  { cliente_id: 16, nombre_cliente: 'HOSPITAL SALDAÑA' },
  { cliente_id: 17, nombre_cliente: 'HOSPITAL MILITAR' },
  { cliente_id: 18, nombre_cliente: 'HOSPITAL BLOOM' },
  { cliente_id: 19, nombre_cliente: 'HOSPITAL NACIONAL ROSALES' },
  { cliente_id: 20, nombre_cliente: 'MINSAL' }
]

export const DEFAULT_EMPRESAS = [
  { empresa_id: 1, nombre_empresa: 'LABANDMED S.A. DE C.V.' },
  { empresa_id: 2, nombre_empresa: 'MEDITECH EL SALVADOR' }
]

export default function ContratosPage() {
  const [contratos, setContratos] = useState<any[]>(MASTER_CONTRATOS)
  const [clientes, setClientes] = useState<any[]>(DEFAULT_CLIENTES)
  const [empresas, setEmpresas] = useState<any[]>(DEFAULT_EMPRESAS)
  const [incidencias, setIncidencias] = useState<any[]>(MASTER_LICITACIONES_PENDIENTES)
  const [contratoProcesos, setContratoProcesos] = useState<any[]>([])
  const [personas, setPersonas] = useState<any[]>(DEFAULT_PERSONAS)
  const [areas, setAreas] = useState<any[]>(DEFAULT_AREAS)
  const [situaciones, setSituaciones] = useState<any[]>([])
  const [estatusList, setEstatusList] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])

  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedClienteFilter, setSelectedClienteFilter] = useState('todos')
  const [selectedSemaforoFilter, setSelectedSemaforoFilter] = useState('todos')
  const [expandedContratos, setExpandedContratos] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    MASTER_CONTRATOS.forEach(c => { init[c.contrato_id] = true })
    return init
  })

  // Modal Contrato
  const [showContractModal, setShowContractModal] = useState(false)
  const [editingContract, setEditingContract] = useState<any | null>(null)
  const [contractForm, setContractForm] = useState({
    numero_contrato: '',
    nombre_contrato: '',
    cliente_id: '13',
    nuevo_cliente_nombre: '',
    empresa_id: '1',
    monto_total: '',
    fecha_adjudicacion: '',
    fecha_inicio: '',
    fecha_fin: '',
    fianza_cumplimiento_estado: 'Entregada',
    fianza_cumplimiento_poliza: '',
    fianza_buena_inversion_estado: 'Pendiente',
    fianza_buena_inversion_poliza: ''
  })

  // Modal Numeral / Incidencia
  const [showNumeralModal, setShowNumeralModal] = useState(false)
  const [editingNumeral, setEditingNumeral] = useState<any | null>(null)
  const [selectedContratoForNumeral, setSelectedContratoForNumeral] = useState<string | null>(null)
  const [numeralForm, setNumeralForm] = useState({
    situacion: '',
    situacion_id: '',
    persona_id: '1',
    responsable_nombre: 'JULIO CESAR',
    responsable_email: 'julio.cesar@lm-sv.com',
    area_nombre: 'PM',
    fecha_cumplimiento: new Date().toISOString().split('T')[0],
    estatus_id: '10', // 10 = Verde
    comentario: ''
  })

  const [successToast, setSuccessToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setSuccessToast(msg)
    setTimeout(() => setSuccessToast(null), 4000)
  }

  // Load All Data via Backend API (Bypasses RLS)
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [
        conData,
        cliData,
        empData,
        incData,
        cpData,
        perData,
        arData,
        sitData,
        estData,
        roData
      ] = await Promise.all([
        dbSelect('contratos'),
        dbSelect('clientes'),
        dbSelect('empresas'),
        dbSelect('incidencias_seguimiento'),
        dbSelect('contrato_procesos'),
        dbSelect('personas'),
        dbSelect('areas'),
        dbSelect('situaciones'),
        dbSelect('estatus'),
        dbSelect('roles')
      ])

      if (conData && conData.length > 0) {
        setContratos(conData)
      }
      if (cliData && cliData.length > 0) setClientes(cliData)
      if (empData && empData.length > 0) setEmpresas(empData)
      if (incData && incData.length > 0) setIncidencias(incData)
      if (cpData) setContratoProcesos(cpData)
      if (perData && perData.length > 0) setPersonas(perData)
      if (arData && arData.length > 0) setAreas(arData)
      if (sitData && sitData.length > 0) setSituaciones(sitData)
      if (estData && estData.length > 0) setEstatusList(estData)
      if (roData && roData.length > 0) setRoles(roData)
    } catch (err) {
      console.error('Error cargando contratos y obligaciones:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Semáforo classification helper
  const getSemaforoInfo = (fechaStr?: string | null, estatusNombre?: string | null) => {
    const est = (estatusNombre || '').toLowerCase()
    if (est === 'completado') {
      return { color: 'completado', label: 'Completado', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', dot: 'bg-emerald-400' }
    }
    if (est === 'rojo' || est === 'crítico' || est === 'urgente') {
      return { color: 'rojo', label: 'Crítico / Vencido', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold', dot: 'bg-rose-400 animate-pulse' }
    }
    if (est === 'anaranjado' || est === 'naranja' || est === 'próximo') {
      return { color: 'naranja', label: 'Próximo', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold', dot: 'bg-amber-400' }
    }
    if (est === 'verde' || est === 'en plazo') {
      return { color: 'verde', label: 'En Plazo', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold', dot: 'bg-emerald-400' }
    }

    if (!fechaStr) {
      return { color: 'gris', label: 'Sin fecha', badge: 'bg-slate-800 text-slate-400 border-slate-700', dot: 'bg-slate-400' }
    }

    const target = new Date(fechaStr)
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const diff = Math.ceil((target.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))

    if (diff <= 2) {
      return { color: 'rojo', label: diff < 0 ? `Vencido (${Math.abs(diff)}d)` : diff === 0 ? 'Vence hoy' : 'Urgente (1d)', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold', dot: 'bg-rose-400 animate-pulse' }
    } else if (diff <= 7) {
      return { color: 'naranja', label: `Próximo (${diff}d)`, badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold', dot: 'bg-amber-400' }
    }
    return { color: 'verde', label: `En Plazo (${diff}d)`, badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold', dot: 'bg-emerald-400' }
  }

  // Aggregate contracts with their linked client, company, and obligations
  const contractsWithObligations = useMemo(() => {
    return contratos.map(c => {
      const cliente = clientes.find(cl => cl.cliente_id === c.cliente_id) || { nombre_cliente: c.cliente_nombre || 'Institución' }
      const empresa = empresas.find(em => em.empresa_id === c.empresa_id) || { nombre_empresa: c.empresa_nombre || 'LABANDMED S.A. DE C.V.' }

      // Get obligations matching this contract
      const contractIncidencias = incidencias.filter(i => {
        if (i.contrato_id && i.contrato_id === c.contrato_id) return true
        if (i.cliente_id && i.cliente_id === c.cliente_id) return true
        if (i.cliente && cliente.nombre_cliente && (
          i.cliente.toLowerCase().includes(cliente.nombre_cliente.toLowerCase()) ||
          cliente.nombre_cliente.toLowerCase().includes(i.cliente.toLowerCase())
        )) return true
        if (i.numero_contrato && c.numero_contrato && (
          i.numero_contrato.toLowerCase().includes(c.numero_contrato.toLowerCase()) ||
          c.numero_contrato.toLowerCase().includes(i.numero_contrato.toLowerCase())
        )) return true
        return false
      }).map((inc, idx) => {
        const sit = situaciones.find(s => s.situacion_id === inc.situacion_id)
        const per = personas.find(p => p.persona_id === inc.persona_id)
        const est = estatusList.find(e => e.estatus_id === inc.estatus_id)
        const area = per?.area || areas.find(a => a.area_id === per?.area_id)

        const responsableNombre = inc.responsable || per?.nombre_completo || 'Sin Asignar'
        const areaNombre = inc.area || area?.nombre_area || (
          responsableNombre.includes('RICARDO') ? 'IT' :
          responsableNombre.includes('EDGAR') ? 'APLICACIONES' :
          responsableNombre.includes('JUAN') ? 'PM' :
          responsableNombre.includes('DIEGO') ? 'LOGISTICA' :
          responsableNombre.includes('ROBERTO') ? 'LICITACIONES' :
          responsableNombre.includes('MOISES') ? 'SOPORTE' : 'OPERACIONES'
        )

        const estatusNombre = inc.estatus || est?.nombre_estatus || 'Verde'
        const semaforo = getSemaforoInfo(inc.fecha_cumplimiento, estatusNombre)

        return {
          id: inc.incidencia_id || inc.id || `inc-${idx}`,
          tipo_origen: 'incidencia',
          situacion: inc.situacion || sit?.nombre_situacion || 'Obligación Técnica General',
          situacion_id: inc.situacion_id,
          responsable_nombre: responsableNombre,
          responsable_email: inc.responsableEmail || per?.email || 'operaciones@lm-sv.com',
          persona_id: inc.persona_id,
          area_nombre: areaNombre,
          fecha_cumplimiento: inc.fecha_cumplimiento,
          estatus_id: inc.estatus_id,
          estatus_nombre: estatusNombre,
          comentario: inc.comentario || '',
          semaforo
        }
      })

      // Get contrato_procesos (numerales relacionales 3FN)
      const cpItems = contratoProcesos.filter(cp => cp.contrato_id === c.contrato_id).map((cp, idx) => {
        const proc = cp.proceso || {}
        const est = estatusList.find(e => e.estatus_id === cp.estatus_id)
        const semaforo = getSemaforoInfo(cp.fecha_programada, est?.nombre_estatus)

        return {
          id: cp.contrato_proceso_id || `cp-${idx}`,
          tipo_origen: 'contrato_proceso',
          situacion: proc.nombre_proceso || cp.descripcion_personalizada || 'Numeral Contractual',
          responsable_nombre: 'Asignado RACI',
          responsable_email: 'operaciones@lm-sv.com',
          persona_id: null,
          area_nombre: 'PM',
          fecha_cumplimiento: cp.fecha_programada,
          estatus_id: cp.estatus_id,
          estatus_nombre: est?.nombre_estatus || 'Verde',
          comentario: cp.observaciones || '',
          semaforo
        }
      })

      const allObligations = [...contractIncidencias, ...cpItems]

      // Calculate contract-level stats
      const stats = {
        total: allObligations.length,
        rojo: allObligations.filter(o => o.semaforo.color === 'rojo').length,
        naranja: allObligations.filter(o => o.semaforo.color === 'naranja').length,
        verde: allObligations.filter(o => o.semaforo.color === 'verde' || o.semaforo.color === 'completado').length
      }

      return {
        ...c,
        cliente,
        empresa,
        obligaciones: allObligations,
        stats
      }
    })
  }, [contratos, clientes, empresas, incidencias, contratoProcesos, personas, areas, situaciones, estatusList])

  // Filtered contracts list based on search and slicers
  const filteredContratos = useMemo(() => {
    return contractsWithObligations.filter(c => {
      // Cliente filter
      if (selectedClienteFilter !== 'todos') {
        const cName = c.cliente?.nombre_cliente || c.cliente_nombre || ''
        if (cName !== selectedClienteFilter) return false
      }

      // Semáforo filter
      if (selectedSemaforoFilter !== 'todos') {
        if (selectedSemaforoFilter === 'rojo' && c.stats.rojo === 0) return false
        if (selectedSemaforoFilter === 'naranja' && c.stats.naranja === 0) return false
        if (selectedSemaforoFilter === 'verde' && c.stats.verde === 0) return false
      }

      // Search term
      if (search.trim()) {
        const q = search.toLowerCase()
        const matchContract =
          c.numero_contrato?.toLowerCase().includes(q) ||
          c.nombre_contrato?.toLowerCase().includes(q) ||
          c.cliente?.nombre_cliente?.toLowerCase().includes(q) ||
          c.cliente_nombre?.toLowerCase().includes(q) ||
          c.empresa?.nombre_empresa?.toLowerCase().includes(q)

        const matchObligation = c.obligaciones.some((ob: any) =>
          ob.situacion?.toLowerCase().includes(q) ||
          ob.responsable_nombre?.toLowerCase().includes(q) ||
          ob.area_nombre?.toLowerCase().includes(q) ||
          ob.comentario?.toLowerCase().includes(q)
        )

        return matchContract || matchObligation
      }

      return true
    })
  }, [contractsWithObligations, selectedClienteFilter, selectedSemaforoFilter, search])

  // Total KPIs across all loaded contracts
  const totalContratosCount = contractsWithObligations.length
  const totalObligacionesCount = contractsWithObligations.reduce((acc, c) => acc + c.stats.total, 0)
  const totalRojosCount = contractsWithObligations.reduce((acc, c) => acc + c.stats.rojo, 0)
  const totalNaranjasCount = contractsWithObligations.reduce((acc, c) => acc + c.stats.naranja, 0)
  const totalVerdesCount = contractsWithObligations.reduce((acc, c) => acc + c.stats.verde, 0)

  // Handlers for UI state
  const toggleExpand = (id: string) => {
    setExpandedContratos(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleExpandAll = (expanded: boolean) => {
    const updated: Record<string, boolean> = {}
    contratos.forEach(c => {
      updated[c.contrato_id] = expanded
    })
    setExpandedContratos(updated)
  }

  const handleOpenCreateContract = () => {
    setEditingContract(null)
    const clList = clientes.length > 0 ? clientes : DEFAULT_CLIENTES
    const emList = empresas.length > 0 ? empresas : DEFAULT_EMPRESAS
    const now = new Date()
    const nextYear = new Date()
    nextYear.setFullYear(now.getFullYear() + 1)
    setContractForm({
      numero_contrato: '',
      nombre_contrato: '',
      cliente_id: String(clList[0]?.cliente_id || '13'),
      nuevo_cliente_nombre: '',
      empresa_id: String(emList[0]?.empresa_id || '1'),
      monto_total: '',
      fecha_adjudicacion: '',
      fecha_inicio: now.toISOString().split('T')[0],
      fecha_fin: nextYear.toISOString().split('T')[0],
      fianza_cumplimiento_estado: 'Entregada',
      fianza_cumplimiento_poliza: '',
      fianza_buena_inversion_estado: 'Pendiente',
      fianza_buena_inversion_poliza: ''
    })
    setShowContractModal(true)
  }

  const handleOpenEditContract = (c: any) => {
    setEditingContract(c)
    setContractForm({
      numero_contrato: c.numero_contrato || '',
      nombre_contrato: c.nombre_contrato || '',
      cliente_id: c.cliente_id ? String(c.cliente_id) : '',
      nuevo_cliente_nombre: '',
      empresa_id: c.empresa_id ? String(c.empresa_id) : '1',
      monto_total: c.monto_total ? String(c.monto_total) : '',
      fecha_adjudicacion: c.fecha_adjudicacion || '',
      fecha_inicio: c.fecha_inicio || '',
      fecha_fin: c.fecha_fin || '',
      fianza_cumplimiento_estado: c.fianza_cumplimiento_estado || 'Entregada',
      fianza_cumplimiento_poliza: c.fianza_cumplimiento_poliza || '',
      fianza_buena_inversion_estado: c.fianza_buena_inversion_estado || 'Pendiente',
      fianza_buena_inversion_poliza: c.fianza_buena_inversion_poliza || ''
    })
    setShowContractModal(true)
  }

  const handleSaveContract = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contractForm.numero_contrato.trim()) {
      alert('Por favor ingresa el número de contrato.')
      return
    }
    setLoading(true)
    try {
      let finalClienteId = Number(contractForm.cliente_id)
      let clienteNombreFinal = ''

      // Si seleccionó agregar nueva institución
      if (contractForm.cliente_id === 'nuevo' && contractForm.nuevo_cliente_nombre.trim()) {
        const nom = contractForm.nuevo_cliente_nombre.trim().toUpperCase()
        const existing = clientes.find(c => c.nombre_cliente?.toUpperCase() === nom)
        if (existing) {
          finalClienteId = existing.cliente_id
          clienteNombreFinal = existing.nombre_cliente
        } else {
          const resCli = await dbInsert('clientes', { nombre_cliente: nom, activo: true })
          finalClienteId = Array.isArray(resCli) ? resCli[0]?.cliente_id : resCli?.cliente_id
          clienteNombreFinal = nom
          setClientes(prev => [...prev, { cliente_id: finalClienteId, nombre_cliente: nom }])
        }
      } else {
        const found = clientes.find(c => String(c.cliente_id) === String(contractForm.cliente_id))
        clienteNombreFinal = found?.nombre_cliente || 'INSTITUCIONAL'
      }

      const payload: any = {
        numero_contrato: contractForm.numero_contrato.trim(),
        nombre_contrato: contractForm.nombre_contrato?.trim() || null,
        cliente_id: finalClienteId,
        empresa_id: Number(contractForm.empresa_id || 1),
        monto_total: contractForm.monto_total ? Number(contractForm.monto_total) : 0,
        fecha_adjudicacion: contractForm.fecha_adjudicacion || null,
        fecha_inicio: contractForm.fecha_inicio || null,
        fecha_fin: contractForm.fecha_fin || null,
        fianza_cumplimiento_estado: contractForm.fianza_cumplimiento_estado || 'NO_APLICA',
        fianza_cumplimiento_poliza: contractForm.fianza_cumplimiento_poliza?.trim() || null,
        fianza_buena_inversion_estado: contractForm.fianza_buena_inversion_estado || 'NO_APLICA',
        fianza_buena_inversion_poliza: contractForm.fianza_buena_inversion_poliza?.trim() || null
      }

      if (editingContract) {
        await dbUpdate('contratos', editingContract.contrato_id, 'contrato_id', payload)
        setContratos(prev => prev.map(c => c.contrato_id === editingContract.contrato_id ? { ...c, ...payload } : c))
        showToast(`¡Contrato ${contractForm.numero_contrato} actualizado correctamente!`)
      } else {
        const res = await dbInsert('contratos', payload)
        const newRecord = Array.isArray(res) ? res[0] : res
        const newId = newRecord?.contrato_id || `temp-${Date.now()}`
        const fullNewContract = {
          ...payload,
          contrato_id: newId,
          cliente_nombre: clienteNombreFinal,
          empresa_nombre: empresas.find(e => e.empresa_id === payload.empresa_id)?.nombre_empresa || 'LABANDMED S.A. DE C.V.'
        }
        setContratos(prev => [fullNewContract, ...prev])
        setExpandedContratos(prev => ({ ...prev, [newId]: true }))
        showToast(`¡Contrato ${contractForm.numero_contrato} registrado exitosamente!`)
      }

      setShowContractModal(false)
      loadData()
    } catch (err: any) {
      console.error(err)
      alert('Error guardando contrato: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteContract = async (id: string, numero: string) => {
    if (!confirm(`¿Eliminar el contrato "${numero}" y desvincular sus registros?`)) return
    setLoading(true)
    try {
      await dbDelete('contratos', id, 'contrato_id')
      showToast(`Contrato ${numero} eliminado correctamente.`)
      loadData()
    } catch (err: any) {
      alert('Error al eliminar: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Handlers for Numeral / Incidencia
  const handleOpenAddNumeral = (contratoId: string) => {
    setSelectedContratoForNumeral(contratoId)
    setEditingNumeral(null)
    const pList = personas.length > 0 ? personas : DEFAULT_PERSONAS
    const firstP = pList[0] || DEFAULT_PERSONAS[0]
    setNumeralForm({
      situacion: '',
      situacion_id: '',
      persona_id: String(firstP.persona_id),
      responsable_nombre: firstP.nombre_completo,
      responsable_email: firstP.email,
      area_nombre: firstP.area || 'PM',
      fecha_cumplimiento: new Date().toISOString().split('T')[0],
      estatus_id: '10', // 10 = Verde (En Plazo)
      comentario: ''
    })
    setShowNumeralModal(true)
  }

  const handleOpenEditNumeral = (ob: any, contratoId: string) => {
    setSelectedContratoForNumeral(contratoId)
    setEditingNumeral(ob)
    const pList = personas.length > 0 ? personas : DEFAULT_PERSONAS
    const matched = pList.find(p => String(p.persona_id) === String(ob.persona_id) || p.nombre_completo?.toLowerCase() === ob.responsable_nombre?.toLowerCase()) || pList[0]

    let estId = '10'
    if (ob.estatus_id) estId = String(ob.estatus_id)
    else if (ob.estatus_nombre === 'Rojo' || ob.estatus === 'Rojo') estId = '12'
    else if (ob.estatus_nombre === 'Anaranjado' || ob.estatus === 'Anaranjado') estId = '11'
    else if (ob.estatus_nombre === 'COMPLETADO' || ob.estatus === 'COMPLETADO') estId = '8'

    setNumeralForm({
      situacion: ob.situacion || '',
      situacion_id: ob.situacion_id ? String(ob.situacion_id) : '',
      persona_id: String(ob.persona_id || matched?.persona_id || '1'),
      responsable_nombre: ob.responsable_nombre || matched?.nombre_completo || '',
      responsable_email: ob.responsable_email || matched?.email || '',
      area_nombre: ob.area_nombre || matched?.area || 'PM',
      fecha_cumplimiento: ob.fecha_cumplimiento || '',
      estatus_id: estId,
      comentario: ob.comentario || ''
    })
    setShowNumeralModal(true)
  }

  const handleSaveNumeral = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedContratoForNumeral) return
    setLoading(true)
    try {
      const contract = contractsWithObligations.find(c => c.contrato_id === selectedContratoForNumeral) || contratos.find(c => c.contrato_id === selectedContratoForNumeral)
      const clienteId = contract?.cliente_id || 13

      // Match selected person
      const pList = personas.length > 0 ? personas : DEFAULT_PERSONAS
      const selectedPerson = pList.find(p => String(p.persona_id) === String(numeralForm.persona_id)) || {
        nombre_completo: numeralForm.responsable_nombre || 'JULIO CESAR',
        email: numeralForm.responsable_email || 'julio.cesar@lm-sv.com'
      }

      // Estatus mapping
      const estatusMap: Record<string, string> = {
        '12': 'Rojo',
        '11': 'Anaranjado',
        '10': 'Verde',
        '8': 'COMPLETADO'
      }
      const estatusNombre = estatusMap[numeralForm.estatus_id] || 'Verde'

      // Find or create situation if typed
      let sitId = numeralForm.situacion_id ? Number(numeralForm.situacion_id) : null
      if (!sitId && numeralForm.situacion) {
        const existingSit = situaciones.find(s => s.nombre_situacion?.toLowerCase() === numeralForm.situacion.toLowerCase())
        if (existingSit) {
          sitId = existingSit.situacion_id
        }
      }

      const payload: any = {
        contrato_id: selectedContratoForNumeral,
        numero_contrato: contract?.numero_contrato || null,
        cliente: contract?.cliente_nombre || contract?.cliente?.nombre_cliente || 'INSTITUCIONAL',
        cliente_id: clienteId,
        situacion: numeralForm.situacion,
        situacion_id: sitId || 20,
        persona_id: Number(numeralForm.persona_id) || 1,
        responsable: selectedPerson.nombre_completo,
        responsableEmail: selectedPerson.email,
        area: numeralForm.area_nombre || 'PM',
        fecha_cumplimiento: numeralForm.fecha_cumplimiento || null,
        estatus_id: Number(numeralForm.estatus_id || 10),
        estatus: estatusNombre,
        comentario: numeralForm.comentario || null
      }

      if (editingNumeral && editingNumeral.tipo_origen === 'incidencia') {
        await dbUpdate('incidencias_seguimiento', editingNumeral.id, 'incidencia_id', payload)
        setIncidencias(prev => prev.map(inc => (inc.incidencia_id === editingNumeral.id || inc.id === editingNumeral.id) ? { ...inc, ...payload } : inc))
        showToast('¡Obligación / Numeral actualizado correctamente!')
      } else {
        const res = await dbInsert('incidencias_seguimiento', payload)
        const newId = Array.isArray(res) ? res[0]?.incidencia_id : res?.incidencia_id || Date.now()
        setIncidencias(prev => [{ ...payload, incidencia_id: newId, id: newId }, ...prev])
        showToast('¡Nuevo numeral agregado al contrato exitosamente!')
      }

      // Auto-expand this contract to show the new item immediately
      setExpandedContratos(prev => ({ ...prev, [selectedContratoForNumeral]: true }))
      setShowNumeralModal(false)
      loadData()
    } catch (err: any) {
      console.error(err)
      alert('Error guardando numeral: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteNumeral = async (ob: any) => {
    if (!confirm(`¿Eliminar la obligación "${ob.situacion}"?`)) return
    setLoading(true)
    try {
      if (ob.tipo_origen === 'incidencia') {
        await dbDelete('incidencias_seguimiento', ob.id, 'incidencia_id')
      } else {
        await dbDelete('contrato_procesos', ob.id, 'contrato_proceso_id')
      }
      showToast('Obligación eliminada con éxito.')
      loadData()
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-emerald-950/95 border border-emerald-500/50 rounded-2xl text-emerald-200 text-xs font-semibold shadow-2xl backdrop-blur-md animate-slide-up">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header & Main Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">
            <FolderKanban className="w-4 h-4 text-indigo-400" />
            <span>Gestión Contractual • Modelo Relacional 3FN</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Contratos, Numerales & RACI
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Control de contratos institucionales, fianzas bancarias, desglose de numerales técnicos y asignaciones de personal vinculadas en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            title="Refrescar datos"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
          <button
            onClick={handleOpenCreateContract}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Contrato</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Contratos</span>
            <FileText className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{totalContratosCount}</span>
            <span className="text-[10px] text-slate-400 font-medium">Activos</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Obligaciones</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-cyan-300 font-mono">{totalObligacionesCount}</span>
            <span className="text-[10px] text-slate-400 font-medium">Numerales</span>
          </div>
        </div>

        <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider">Críticos / Vencidos</span>
            <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-400 font-mono">{totalRojosCount}</span>
            <span className="text-[10px] text-rose-300/80 font-medium">Urgentes</span>
          </div>
        </div>

        <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Próximos</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-300 font-mono">{totalNaranjasCount}</span>
            <span className="text-[10px] text-amber-300/80 font-medium">En Alerta</span>
          </div>
        </div>

        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">En Plazo</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400 font-mono">{totalVerdesCount}</span>
            <span className="text-[10px] text-emerald-300/80 font-medium">A Tiempo</span>
          </div>
        </div>
      </div>

      {/* Search Toolbar & Slicers */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por número de contrato, nombre, institución, obligación técnica o responsable..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Filter Cliente */}
            <select
              value={selectedClienteFilter}
              onChange={e => setSelectedClienteFilter(e.target.value)}
              className="px-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="todos">🏢 Todas las Instituciones</option>
              {clientes.map(cl => (
                <option key={cl.cliente_id} value={cl.nombre_cliente}>
                  {cl.nombre_cliente}
                </option>
              ))}
            </select>

            {/* Filter Semáforo */}
            <select
              value={selectedSemaforoFilter}
              onChange={e => setSelectedSemaforoFilter(e.target.value)}
              className="px-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="todos">🚦 Todos los Semáforos</option>
              <option value="rojo">🔴 Críticos / Vencidos</option>
              <option value="naranja">🟠 Próximos a Vencer</option>
              <option value="verde">🟢 En Plazo Programado</option>
            </select>

            {/* Expand / Collapse All */}
            <button
              onClick={() => {
                const allExpanded = filteredContratos.every(c => expandedContratos[c.contrato_id])
                toggleExpandAll(!allExpanded)
              }}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold whitespace-nowrap transition"
            >
              {filteredContratos.every(c => expandedContratos[c.contrato_id]) ? 'Colapsar Todos' : 'Expandir Todos'}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
          <span>Mostrando {filteredContratos.length} de {contractsWithObligations.length} contratos</span>
          <span>{filteredContratos.reduce((a, c) => a + c.stats.total, 0)} obligaciones totales</span>
        </div>
      </div>

      {/* Contracts List */}
      <div className="space-y-4">
        {filteredContratos.length === 0 ? (
          <div className="p-16 text-center text-slate-500 bg-slate-900/40 border border-slate-800 rounded-2xl">
            <FolderKanban className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-300">No se encontraron contratos con los filtros aplicados</p>
            <p className="text-xs text-slate-500 mt-1">Prueba limpiando los términos de búsqueda o haz clic en &quot;Nuevo Contrato&quot;.</p>
          </div>
        ) : (
          filteredContratos.map(c => {
            const isExpanded = !!expandedContratos[c.contrato_id]
            const clientName = c.cliente?.nombre_cliente || c.cliente_nombre || 'Institución'
            const clientTheme = CLIENT_THEMES[clientName] || DEFAULT_THEME

            return (
              <div
                key={c.contrato_id}
                className={`bg-slate-900/90 border ${isExpanded ? 'border-indigo-500/40' : 'border-slate-800'} rounded-2xl overflow-hidden shadow-xl transition duration-200`}
              >
                {/* Contract Summary Bar */}
                <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-900/90">
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base md:text-lg font-black text-amber-300 font-mono tracking-tight bg-amber-400/10 px-2.5 py-0.5 rounded-lg border border-amber-400/20">
                        {c.numero_contrato}
                      </span>

                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${clientTheme.badge}`}>
                        🏢 {clientName}
                      </span>

                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-bold border border-slate-700">
                        {c.empresa?.nombre_empresa || c.empresa_nombre || 'LABANDMED S.A. DE C.V.'}
                      </span>

                      {c.monto_total > 0 && (
                        <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          ${Number(c.monto_total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>

                    <p className="text-xs md:text-sm text-slate-200 font-medium leading-relaxed">
                      {c.nombre_contrato || 'Contrato de suministro y servicio técnico'}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 font-mono">
                      <span>
                        📅 <strong className="text-slate-300">Vigencia:</strong> {c.fecha_inicio || '2026-01-01'} al {c.fecha_fin || '2026-12-31'}
                      </span>
                      <span>
                        🛡️ <strong className="text-slate-300">Fianza Cumplimiento:</strong> {c.fianza_cumplimiento_estado || 'Entregada'}
                      </span>
                      <span>
                        💼 <strong className="text-slate-300">Fianza Buena Inv.:</strong> {c.fianza_buena_inversion_estado || 'Pendiente'}
                      </span>
                    </div>
                  </div>

                  {/* Right Side: Stats Badges & Buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Obligation Counter Badges */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono">
                      <span className="text-white font-bold">{c.stats.total} Numerales:</span>
                      {c.stats.rojo > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[10px]">
                          {c.stats.rojo} Rojo
                        </span>
                      )}
                      {c.stats.naranja > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                          {c.stats.naranja} Naranja
                        </span>
                      )}
                      {c.stats.verde > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                          {c.stats.verde} Verde
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleOpenAddNumeral(c.contrato_id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold transition active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar Numeral</span>
                    </button>

                    <button
                      onClick={() => handleOpenEditContract(c)}
                      title="Editar Contrato"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => toggleExpand(c.contrato_id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                    >
                      <span>{isExpanded ? 'Ocultar' : 'Ver'} Numerales ({c.stats.total})</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleDeleteContract(c.contrato_id, c.numero_contrato)}
                      title="Eliminar Contrato"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded Numerals Table (Desglose de Obligaciones & RACI) */}
                {isExpanded && (
                  <div className="border-t border-slate-800/90 bg-slate-950/70 p-4 space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
                        Desglose Oficial de Obligaciones & RACI ({c.obligaciones.length} Registros)
                      </span>
                    </div>

                    {c.obligaciones.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                        Este contrato aún no tiene numerales registrados. Haz clic en &quot;Agregar Numeral&quot; para crear el primero.
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-slate-800/80">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-semibold">
                              <th className="py-2.5 px-3 w-16">#</th>
                              <th className="py-2.5 px-3">Obligación / Situación Técnica</th>
                              <th className="py-2.5 px-3">Área</th>
                              <th className="py-2.5 px-3">Responsable RACI (Ejecutor)</th>
                              <th className="py-2.5 px-3">Fecha Límite</th>
                              <th className="py-2.5 px-3">Semáforo</th>
                              <th className="py-2.5 px-3 text-right">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 text-slate-300">
                            {c.obligaciones.map((ob: any, idx: number) => {
                              const sem = getSemaforoInfo(ob.fecha_cumplimiento, ob.estatus_nombre)
                              const areaBadge = AREA_BADGES[ob.area_nombre] || 'bg-slate-800 text-slate-300 border-slate-700'

                              return (
                                <tr key={ob.id || idx} className="hover:bg-slate-900/60 transition group">
                                  {/* Item Num */}
                                  <td className="py-3 px-3 font-mono font-bold text-indigo-300">
                                    {idx + 1}
                                  </td>

                                  {/* Situacion & Comentario */}
                                  <td className="py-3 px-3 max-w-md">
                                    <div className="font-bold text-white leading-snug">
                                      {ob.situacion}
                                    </div>
                                    {ob.comentario && (
                                      <p className="text-[11px] text-slate-400 mt-1 font-normal leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">
                                        {ob.comentario}
                                      </p>
                                    )}
                                  </td>

                                  {/* Area Operativa */}
                                  <td className="py-3 px-3">
                                    <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold border ${areaBadge}`}>
                                      {ob.area_nombre}
                                    </span>
                                  </td>

                                  {/* Responsable RACI */}
                                  <td className="py-3 px-3">
                                    <div className="flex items-center gap-1.5 font-bold text-slate-200">
                                      <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                                      <span>{ob.responsable_nombre}</span>
                                    </div>
                                    {ob.responsable_email && (
                                      <span className="text-[10px] font-mono text-slate-500 block">
                                        {ob.responsable_email}
                                      </span>
                                    )}
                                  </td>

                                  {/* Fecha Limite */}
                                  <td className="py-3 px-3 font-mono text-[11px] text-slate-300 whitespace-nowrap">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3 text-slate-500" />
                                      <span>{ob.fecha_cumplimiento || 'Sin fecha'}</span>
                                    </div>
                                  </td>

                                  {/* Semáforo */}
                                  <td className="py-3 px-3 whitespace-nowrap">
                                    <span className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full border ${sem.badge}`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${sem.dot}`} />
                                      <span>{sem.label}</span>
                                    </span>
                                  </td>

                                  {/* Acciones */}
                                  <td className="py-3 px-3 text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end gap-1">
                                      <button
                                        onClick={() => handleOpenEditNumeral(ob, c.contrato_id)}
                                        title="Editar Numeral"
                                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-950 hover:text-indigo-300 text-slate-400 transition"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteNumeral(ob)}
                                        title="Eliminar Numeral"
                                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 transition"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
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

      {/* Modal: Crear / Editar Contrato */}
      {showContractModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowContractModal(false) }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fade-in"
        >
          <div className="bg-slate-900 border border-slate-700/90 rounded-3xl w-full max-w-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[92vh] my-auto relative z-10">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {editingContract ? 'Editar Contrato Institucional' : 'Nuevo Contrato Institucional'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Definición de contrato, entidad adjudicadora, vigencias y fianzas de garantía.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowContractModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveContract} className="p-5 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">No. Contrato *</label>
                  <input
                    type="text"
                    value={contractForm.numero_contrato}
                    onChange={e => setContractForm({ ...contractForm, numero_contrato: e.target.value })}
                    required
                    placeholder="ej: SM-022/2024, CT No 16/2026"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono shadow-inner"
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
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre / Objeto del Contrato</label>
                <input
                  type="text"
                  value={contractForm.nombre_contrato}
                  onChange={e => setContractForm({ ...contractForm, nombre_contrato: e.target.value })}
                  placeholder="ej: Suministro de reactivos, comodato de equipo y soporte técnico"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cliente / Institución *</label>
                  <select
                    value={contractForm.cliente_id}
                    onChange={e => setContractForm({ ...contractForm, cliente_id: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {(clientes.length > 0 ? clientes : DEFAULT_CLIENTES).map(cl => (
                      <option key={cl.cliente_id} value={cl.cliente_id}>{cl.nombre_cliente}</option>
                    ))}
                    <option value="nuevo">+ 🏢 Otra Institución (Nueva)...</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Empresa Titular *</label>
                  <select
                    value={contractForm.empresa_id}
                    onChange={e => setContractForm({ ...contractForm, empresa_id: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {(empresas.length > 0 ? empresas : DEFAULT_EMPRESAS).map(em => (
                      <option key={em.empresa_id} value={em.empresa_id}>{em.nombre_empresa}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Si seleccionó nueva institución */}
              {contractForm.cliente_id === 'nuevo' && (
                <div className="p-3 bg-indigo-950/30 border border-indigo-500/30 rounded-xl space-y-1.5 animate-fade-in">
                  <label className="block text-xs font-bold text-indigo-300">
                    🏢 Nombre de la Nueva Institución / Hospital
                  </label>
                  <input
                    type="text"
                    value={contractForm.nuevo_cliente_nombre}
                    onChange={e => setContractForm({ ...contractForm, nuevo_cliente_nombre: e.target.value })}
                    placeholder="ej: HOSPITAL NACIONAL SAN RAFAEL, MINSAL..."
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-indigo-500/50 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 font-bold uppercase"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha Inicio Vigencia</label>
                  <input
                    type="date"
                    value={contractForm.fecha_inicio}
                    onChange={e => setContractForm({ ...contractForm, fecha_inicio: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha Fin Vigencia</label>
                  <input
                    type="date"
                    value={contractForm.fecha_fin}
                    onChange={e => setContractForm({ ...contractForm, fecha_fin: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono shadow-inner"
                  />
                </div>
              </div>

              {/* Fianzas Bancarias */}
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3 shadow-inner">
                <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">
                  Control de Garantías & Fianzas Bancarias
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold text-slate-300">Fianza de Cumplimiento</label>
                    <select
                      value={contractForm.fianza_cumplimiento_estado}
                      onChange={e => setContractForm({ ...contractForm, fianza_cumplimiento_estado: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    >
                      <option value="Entregada">Entregada</option>
                      <option value="En Trámite">En Trámite</option>
                      <option value="Pendiente">Pendiente</option>
                      <option value="NO_APLICA">No Aplica</option>
                    </select>
                    <input
                      type="text"
                      value={contractForm.fianza_cumplimiento_poliza}
                      onChange={e => setContractForm({ ...contractForm, fianza_cumplimiento_poliza: e.target.value })}
                      placeholder="No. Póliza (opcional)"
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded-md text-[11px] text-slate-300 placeholder-slate-600 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold text-slate-300">Fianza Buena Inversión</label>
                    <select
                      value={contractForm.fianza_buena_inversion_estado}
                      onChange={e => setContractForm({ ...contractForm, fianza_buena_inversion_estado: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Entregada">Entregada</option>
                      <option value="En Trámite">En Trámite</option>
                      <option value="NO_APLICA">No Aplica</option>
                    </select>
                    <input
                      type="text"
                      value={contractForm.fianza_buena_inversion_poliza}
                      onChange={e => setContractForm({ ...contractForm, fianza_buena_inversion_poliza: e.target.value })}
                      placeholder="No. Póliza (opcional)"
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded-md text-[11px] text-slate-300 placeholder-slate-600 font-mono"
                    />
                  </div>
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
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition active:scale-95"
                >
                  {editingContract ? 'Actualizar Contrato' : 'Guardar Contrato'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Agregar / Editar Numeral */}
      {showNumeralModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowNumeralModal(false) }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fade-in"
        >
          <div className="bg-slate-900 border border-slate-700/90 rounded-3xl w-full max-w-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[92vh] my-auto relative z-10">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {editingNumeral ? 'Editar Numeral / Obligación Contractual' : 'Agregar Numeral Contractual & RACI'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Control de obligaciones institucionales, responsables RACI y semáforo de vencimiento.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNumeralModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            {/* Contract Context Banner */}
            {selectedContratoForNumeral && (() => {
              const contract = contractsWithObligations.find(c => c.contrato_id === selectedContratoForNumeral) || contratos.find(c => c.contrato_id === selectedContratoForNumeral)
              if (!contract) return null
              return (
                <div className="px-5 py-2.5 bg-indigo-950/40 border-b border-indigo-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                      {contract.numero_contrato}
                    </span>
                    <span className="font-bold text-white line-clamp-1">{contract.nombre_contrato}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-cyan-300 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                    {contract.cliente_nombre || contract.cliente?.nombre_cliente || 'INSTITUCIONAL'}
                  </span>
                </div>
              )
            })()}

            {/* Form Fields */}
            <form onSubmit={handleSaveNumeral} className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* Requerimiento / Situación Técnica */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-200">
                  Obligación / Situación Técnica <span className="text-rose-400">*</span>
                </label>
                
                {/* Sugerencias Rápidas */}
                <div className="flex flex-wrap gap-1.5 pb-1">
                  {[
                    'GARANTIA DE FABRICA AUTENTICADO',
                    'CONTROLES DE 3ERA OPINION',
                    'CARTA DE AUTORIZACION DEL FABRICANTE',
                    'SISTEMA INFORMATICO SIS/LIS',
                    'REACTIVOS DE PRUEBA INICIALES',
                    'MANTENIMIENTO PREVENTIVO'
                  ].map(sug => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setNumeralForm({ ...numeralForm, situacion: sug })}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-950 hover:bg-indigo-600/30 text-slate-400 hover:text-indigo-300 border border-white/[0.06] hover:border-indigo-500/40 transition"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={numeralForm.situacion}
                  onChange={e => setNumeralForm({ ...numeralForm, situacion: e.target.value })}
                  placeholder="ej: GARANTIA DE FABRICA AUTENTICADO..."
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner"
                />
              </div>

              {/* Área Operativa */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-200">
                  🏷️ Área Operativa Responsable
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {['PM', 'APLICACIONES', 'IT', 'LOGISTICA', 'SOPORTE', 'LICITACIONES', 'GI'].map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setNumeralForm({ ...numeralForm, area_nombre: a })}
                      className={`py-1.5 px-1 rounded-xl text-[11px] font-bold border transition text-center ${
                        numeralForm.area_nombre === a
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30'
                          : 'bg-slate-950 text-slate-400 border-white/[0.06] hover:text-white hover:bg-slate-850'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Responsable RACI & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    👤 Responsable RACI (Ejecutor) <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={numeralForm.persona_id}
                    onChange={e => {
                      const pId = e.target.value
                      const pList = personas.length > 0 ? personas : DEFAULT_PERSONAS
                      const pObj = pList.find(p => String(p.persona_id) === pId)
                      setNumeralForm({
                        ...numeralForm,
                        persona_id: pId,
                        responsable_nombre: pObj?.nombre_completo || numeralForm.responsable_nombre,
                        responsable_email: pObj?.email || numeralForm.responsable_email,
                        area_nombre: pObj?.area || numeralForm.area_nombre
                      })
                    }}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {(personas.length > 0 ? personas : DEFAULT_PERSONAS).map(p => (
                      <option key={p.persona_id} value={p.persona_id}>
                        {p.nombre_completo} {p.area ? `(${p.area})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    ✉️ Correo Electrónico RACI
                  </label>
                  <input
                    type="email"
                    value={numeralForm.responsable_email}
                    onChange={e => setNumeralForm({ ...numeralForm, responsable_email: e.target.value })}
                    placeholder="correo@lm-sv.com"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Fecha Límite & Semáforo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    📅 Fecha Límite de Cumplimiento <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={numeralForm.fecha_cumplimiento}
                    onChange={e => setNumeralForm({ ...numeralForm, fecha_cumplimiento: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    🚦 Semáforo / Estado de Alerta
                  </label>
                  <select
                    value={numeralForm.estatus_id}
                    onChange={e => setNumeralForm({ ...numeralForm, estatus_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                  >
                    <option value="12">🔴 Rojo (Crítico / Vencido)</option>
                    <option value="11">🟠 Anaranjado (Próximo a Vencer)</option>
                    <option value="10">🟢 Verde (En Plazo)</option>
                    <option value="8">✅ Completado / Entregado</option>
                  </select>
                </div>
              </div>

              {/* Descripción / Comentario */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  📝 Descripción / Observación Técnica
                </label>
                <textarea
                  value={numeralForm.comentario}
                  onChange={e => setNumeralForm({ ...numeralForm, comentario: e.target.value })}
                  rows={3}
                  placeholder="Ej: Solicitado a fábrica, pendiente de entrega de las garantías autenticadas..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowNumeralModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/40 transition active:scale-95 flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{editingNumeral ? 'Actualizar Numeral' : 'Guardar Numeral en Contrato'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
