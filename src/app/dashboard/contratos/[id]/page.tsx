'use client'

import { useEffect, useState, useCallback, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  FileText,
  Building2,
  Calendar,
  ArrowLeft,
  CheckCircle2,
  Wrench,
  Sparkles,
  Save,
  Lock,
  Edit3,
  Search,
  ChevronDown,
  ShieldCheck,
  UserCheck,
  Zap,
  Plus,
  Trash2,
  X,
  PenTool,
  UploadCloud,
  ScanLine,
  FileCheck,
  RefreshCw,
  Eye,
  Check
} from 'lucide-react'
import Link from 'next/link'
import type { Project, MilestoneContrato, EstadoMilestone, User } from '@/lib/types'
import PresionEmailModal from '@/components/PresionEmailModal'

function getFallbackDescSolicitada(proceso: string, numeral: string, cliente: string): string {
  const proc = (proceso || '').toUpperCase()
  if (proc.includes("VIÑETA") || proc.includes("ENTREGA")) {
    return `Rotulación, viñeteado institucional y empaque de reactivos e insumos según especificaciones técnicas y cadena de frío requerida por ${cliente || 'el cliente'}.`
  } else if (proc.includes("PEDIDO")) {
    return `Generación y seguimiento de orden de compra internacional con fabricante, validando tiempos de tránsito y desaduanaje.`
  } else if (proc.includes("CONTROLES") && proc.includes("3ERA")) {
    return "Suministro de controles de tercera opinión externos con trazabilidad metrológica y certificado de calidad internacional."
  } else if (proc.includes("CONTROLES") || proc.includes("CALIBRADOR")) {
    return "Controles de calidad interno y calibradores con lote específico y vigencia mayor a 18 meses."
  } else if (proc.includes("IMPORTACION")) {
    return "Trámite de permisos de importación, desaduanaje ágil y traslado seguro a bodegas climatizadas."
  } else if (proc.includes("TRAMITES") || proc.includes("ADMINISTRATIVOS")) {
    return "Presentación de documentación legal, solvencias vigentes y actas contractuales a la comisión receptora."
  } else if (proc.includes("GARANTIA")) {
    return `Presentación de fianza de cumplimiento de contrato y garantía técnica de fábrica respaldada por casa matriz.`
  } else if (proc.includes("COBROS") || proc.includes("FACTURACION")) {
    return "Control de actas de recepción, trámite de contra-recibos y gestión de quedan para cobro institucional."
  } else if (proc.includes("CONDICIONES ESPECIALES")) {
    return "Cumplimiento estricto de cláusulas contractuales especiales presentadas en la oferta técnica y económica."
  } else if (proc.includes("LUGAR APLICA") || proc.includes("OPTIMAS CONDICIONES")) {
    return `Inspección de sitio, área de laboratorio y verificación de espacio físico asignado para equipo en ${cliente || 'el cliente'}.`
  } else if (proc.includes("UPS")) {
    return "Instalación y conexión de respaldo de energía ininterrumpida (UPS grado médico) debidamente aterrizado."
  } else if (proc.includes("AC") || proc.includes("AIRE") || proc.includes("CLIMA")) {
    return "Verificación y adecuación de temperatura ambiental requerida (18°C - 25°C) y humedad controlada."
  } else if (proc.includes("HEMATOLOGIA") || proc.includes("MESA") || proc.includes("SILLA")) {
    return "Montaje e instalación sobre mesa reforzada y nivelada en el área de Laboratorio Clínico."
  } else if (proc.includes("CAPACITACION") || proc.includes("ENTRENAMIENTO")) {
    return "Programa de capacitación teórico-práctica al personal de laboratorio con entrega de manuales y actas de firma."
  } else if (proc.includes("MANUALES")) {
    return "Entrega de manuales de usuario, guías de operación rápida e insertos técnicos en idioma español."
  } else if (proc.includes("SISTEMA INFORMATICO") || proc.includes("INTERFAZ") || proc.includes("LIS") || proc.includes("RED")) {
    return "Configuración de interfaz de comunicación bidireccional LIS/HIS y verificación de transmisión de resultados."
  } else if (proc.includes("CALENDARIZACION") || proc.includes("MANTENIMIENTO")) {
    return "Programa calendarizado de mantenimiento preventivo y correctivo con soporte 24/7 y tiempos de respuesta garantizados."
  } else if (proc.includes("HOJA DE SEGURIDAD")) {
    return "Hojas de datos de seguridad (MSDS) entregadas en físico y digital para cada reactivo y sustancia química."
  } else if (proc.includes("ROTO") || proc.includes("AGUA")) {
    return "Instalación de sistema de presurización de agua (Roto motor / Rotoplas) y purificación grado laboratorio."
  } else {
    return `Ejecución y cumplimiento de obligación técnica #${numeral} según las bases de licitación y especificaciones contractuales para ${cliente || 'la institución'}.`
  }
}

function getFallbackProducto(proceso: string, numeral: string, cliente: string): string {
  const txt = `${proceso} ${cliente}`.toUpperCase()
  if (txt.includes("EPOC")) return "Gases Arteriales EPOC Marca: Siemens"
  if (txt.includes("RAPID POINT") || txt.includes("RAPIDPOINT")) return "RapidPoint 500e Marca: Siemens"
  if (txt.includes("F200") || txt.includes("BIOSENSOR")) return "F200 Marca: SD BIOSENSOR"
  if (txt.includes("MINI CUBE") || txt.includes("MINI-CUBE")) return "Mini Cube (Eritrosedimentación)"
  if (txt.includes("ATELLICA")) return "Atellica CI Marca: Siemens"
  if (txt.includes("EXIAS")) return "Electrolitos EXIAS e1"
  if (txt.includes("ERITRO")) return "Reactivo ERITRO"
  if (txt.includes("PRO-BNP") || txt.includes("PROBNP")) return "Reactivo Pro-BNP"
  if (txt.includes("SISTEMA") || txt.includes("RED") || txt.includes("ANTIVIRUS") || txt.includes("INFORMATICO")) return "Sistema Informático & Servidor LIS"
  if (txt.includes("UPS")) return "UPS Online Grado Médico 3kVA"
  if (txt.includes("MESA") || txt.includes("SILLA")) return "Mobiliario Técnico & Mesa Antivibratoria"
  if (txt.includes("AGUA") || txt.includes("ROTOPLAS")) return "Sistema de Agua & Rotoplas"
  if (txt.includes("CONTROLES") || txt.includes("REACTIVO")) return "Kit de Reactivos y Controles de Calidad"
  if ((cliente || '').includes("Militar")) return "F200 / EPOC / Mini Cube"
  if ((cliente || '').includes("Santa Ana")) return "Atellica CI Marca: Siemens"
  if ((cliente || '').includes("ISBM")) return "Electrolitos EXIAS e1"
  if ((cliente || '').includes("Bloom")) return "Equipo CHORUS EVO"
  if ((cliente || '').includes("ISSS")) return "Reactivo ERITRO e Insumos"
  return "Insumos y Equipamiento Contractual"
}

function getFallbackTipoDependiente(proceso: string, numeral: string): 'Contrato' | 'Visita' {
  const p = (proceso || '').toUpperCase()
  if (p.includes("VISITA") || p.includes("INSTALACION") || p.includes("ADECUACION") || p.includes("MESA") || p.includes("UPS") || p.includes("AIRE") || p.includes("CLIMA") || p.includes("CAPACITACION") || p.includes("AGUA") || p.includes("ROTO")) {
    return 'Visita'
  }
  return 'Contrato'
}

export default function ContratoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const projectId = resolvedParams.id

  const [project, setProject] = useState<Project | null>(null)
  const [milestones, setMilestones] = useState<MilestoneContrato[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState('todos')
  const [filterMisObligaciones, setFilterMisObligaciones] = useState(false)

  // Add Numeral Modal
  const [modalAddOpen, setModalAddOpen] = useState(false)
  const [newNumeral, setNewNumeral] = useState({
    numeral: '',
    descripcion: '',
    descripcion_solicitada: '',
    producto: '',
    area: 'PM',
    ejecutor_id: '',
    supervisor_id: '',
    porcentaje: 0,
    estado: 'Pendiente' as EstadoMilestone,
    fecha_cumplimiento: '',
    comentarios: '',
    tipo_dependiente: 'Contrato' as 'Contrato' | 'Visita'
  })
  const [creating, setCreating] = useState(false)

  // Descripción de lo Solicitado state (local, keyed by milestone id)
  const [descSolicitadaMap, setDescSolicitadaMap] = useState<Record<string, string>>({})
  const [modalDetalleItem, setModalDetalleItem] = useState<{ id: string; numeral: string; proceso: string; detalle: string } | null>(null)

  // Tipo Dependiente state (local, keyed by milestone id)
  const [tipoDependienteMap, setTipoDependienteMap] = useState<Record<string, 'Contrato' | 'Visita'>>({})

  // Producto/Equipo state (local, keyed by milestone id)
  const [productoMap, setProductoMap] = useState<Record<string, string>>({})
  const [editingProductoId, setEditingProductoId] = useState<string | null>(null)
  const [editProductoValue, setEditProductoValue] = useState('')

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editComentario, setEditComentario] = useState('')
  const [editPorcentaje, setEditPorcentaje] = useState(0)
  const [editEstado, setEditEstado] = useState<EstadoMilestone>('Pendiente')
  const [editFechaFin, setEditFechaFin] = useState('')
  const [saving, setSaving] = useState(false)

  // Presion Email Modal
  const [presionModalOpen, setPresionModalOpen] = useState(false)

  // Scanner / OCR a Lapicero state
  const [ocrModalOpen, setOcrModalOpen] = useState(false)
  const [ocrFileName, setOcrFileName] = useState('')
  const [ocrFilePreview, setOcrFilePreview] = useState<string | null>(null)
  const [ocrScanning, setOcrScanning] = useState(false)
  const [ocrItems, setOcrItems] = useState<Array<{
    id: string
    numeral: string
    descripcion: string
    producto: string
    tipo_dependiente: 'Contrato' | 'Visita'
    fecha_cumplimiento: string
    estado: EstadoMilestone
    comentario: string
    isHandwritten: boolean
    matchedExistingId?: string
  }>>([])
  const [ocrImporting, setOcrImporting] = useState(false)
  const [ocrSuccessMsg, setOcrSuccessMsg] = useState('')
  const [selectedMilestoneForPressure, setSelectedMilestoneForPressure] = useState<{
    id: string
    descripcion: string
    responsableNombre: string
    responsableEmail: string
    responsableRol: string
    proyectoNombre: string
    cliente: string
    fechaCumplimiento: string
    diasRestantes: number
    numeral: string
  } | null>(null)

  const supabase = createClient()

  const fetchProjectData = useCallback(async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      const { data: dbUsers } = await supabase
        .from('users')
        .select('*, roles(nombre)')
        .eq('activo', true)

      if (dbUsers) {
        setAvailableUsers(dbUsers as User[])
        const planner = dbUsers.find(u => u.roles?.nombre === 'Planner') || dbUsers[0]
        const logged = dbUsers.find(u => u.id === authUser?.id) || planner
        setCurrentUser(logged as User)
      }

      let pData: Project | null = null
      let rawMilestones: MilestoneContrato[] = []

      // 1. Intentar cargar desde las tablas 3FN normalizadas
      let c3fnQuery = supabase
        .from('contratos')
        .select('contrato_id, numero_contrato, nombre_contrato, fecha_inicio, fecha_fin, cliente:clientes(nombre_cliente)')

      if (/^\d+$/.test(projectId)) {
        c3fnQuery = c3fnQuery.eq('contrato_id', parseInt(projectId, 10))
      } else {
        // Mapeo por ID UUID clásico
        const uuidMap: Record<string, string> = {
          'b0000001-0000-0000-0000-000000000001': 'SM-022/2024',
          'b0000001-0000-0000-0000-000000000002': 'N° 68/2026',
          'b0000001-0000-0000-0000-000000000003': 'CT No 13-BS-2026',
          'b0000001-0000-0000-0000-000000000004': 'CT No 16/2026',
          'b0000001-0000-0000-0000-000000000005': 'CT No AD-014/2026-ISBM',
          'b0000001-0000-0000-0000-000000000006': 'LC26DM0050'
        }
        const numContrato = uuidMap[projectId]
        if (numContrato) {
          c3fnQuery = c3fnQuery.eq('numero_contrato', numContrato)
        }
      }

      const { data: c3fn } = await c3fnQuery.maybeSingle()

      if (c3fn) {
        pData = {
          id: projectId,
          cliente: (c3fn as any).cliente?.nombre_cliente || 'Institución',
          contrato_num: c3fn.numero_contrato,
          nombre: c3fn.nombre_contrato || c3fn.numero_contrato,
          descripcion: c3fn.nombre_contrato,
          fecha_adjudicacion: c3fn.fecha_inicio,
          fecha_inicio: c3fn.fecha_inicio,
          fecha_fin_estimada: c3fn.fecha_fin,
          fecha_entrega_max: c3fn.fecha_fin,
          estado: 'En Ejecucion' as EstadoProyecto,
          presupuesto: 0,
          created_by: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        // Cargar procesos y asignaciones 3FN
        const { data: procesos3fn } = await supabase
          .from('contrato_procesos')
          .select('contrato_proceso_id, numeral, descripcion_solicitado, fecha_cumplimiento, proceso:procesos(nombre_proceso), producto:productos_equipo(nombre_producto_equipo), tipo:tipos_dependiente(nombre_tipo), estatus:estatus_proceso(nombre_estatus), asignaciones:asignaciones_proceso(persona:personas(nombre_completo), rol:roles_proceso(nombre_rol), estatus:estatus_proceso(nombre_estatus), comentario)')
          .eq('contrato_id', c3fn.contrato_id)
          .order('contrato_proceso_id', { ascending: true })

        if (procesos3fn && procesos3fn.length > 0) {
          const tdMap: Record<string, 'Contrato' | 'Visita'> = {}
          const pMap: Record<string, string> = {}
          const descMap: Record<string, string> = {}

          rawMilestones = procesos3fn.map((cp: any) => {
            const mId = `cp-${cp.contrato_proceso_id}`
            const ejecutorAsig = cp.asignaciones?.find((a: any) => a.rol?.nombre_rol === 'EJECUTOR')
            const supervisorAsig = cp.asignaciones?.find((a: any) => a.rol?.nombre_rol === 'SUPERVISOR')
            const isCompleted = cp.estatus?.nombre_estatus === 'COMPLETADO' || ejecutorAsig?.estatus?.nombre_estatus === 'COMPLETADO'

            if (cp.tipo?.nombre_tipo) tdMap[mId] = cp.tipo.nombre_tipo as 'Contrato' | 'Visita'
            if (cp.producto?.nombre_producto_equipo) pMap[mId] = cp.producto.nombre_producto_equipo
            if (cp.descripcion_solicitado) descMap[mId] = cp.descripcion_solicitado

            return {
              id: mId,
              proyecto_id: projectId,
              numeral: String(cp.numeral),
              descripcion: cp.proceso?.nombre_proceso || 'Proceso',
              ejecutor_id: null,
              supervisor_id: null,
              estado: (isCompleted ? 'Completado' : 'Pendiente') as EstadoMilestone,
              fecha_inicio: c3fn.fecha_inicio,
              fecha_fin: cp.fecha_cumplimiento || null,
              porcentaje: isCompleted ? 100 : 0,
              comentarios: ejecutorAsig?.comentario || null,
              evidencia_url: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              ejecutor: {
                id: 'ejec-1',
                email: 'ejecutor@labandmed.com',
                nombre: ejecutorAsig?.persona?.nombre_completo || 'ROBERTO',
                apellido: null,
                rol_id: 'rol-1',
                departamento: 'Operaciones',
                telefono: null,
                avatar_url: null,
                activo: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                roles: { id: 'r1', nombre: 'Operativo', descripcion: null, permisos: {}, created_at: '' }
              },
              supervisor: {
                id: 'sup-1',
                email: 'supervisor@labandmed.com',
                nombre: supervisorAsig?.persona?.nombre_completo || 'ROBERTO / PLANNER',
                apellido: null,
                rol_id: 'rol-2',
                departamento: 'Supervisión',
                telefono: null,
                avatar_url: null,
                activo: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                roles: { id: 'r2', nombre: 'Planner', descripcion: null, permisos: {}, created_at: '' }
              }
            } as MilestoneContrato
          })

          setTipoDependienteMap(prev => ({ ...prev, ...tdMap }))
          setProductoMap(prev => ({ ...prev, ...pMap }))
          setDescSolicitadaMap(prev => ({ ...prev, ...descMap }))
        }
      }

      // Fallback a tabla projects clásica si no existe en 3FN
      if (!pData) {
        const { data: p } = await supabase.from('projects').select('*').eq('id', projectId).maybeSingle()
        pData = p as Project
        const { data: m } = await supabase.from('milestones_contrato').select('*, ejecutor:users!ejecutor_id(*), supervisor:users!supervisor_id(*)').eq('proyecto_id', projectId).order('numeral')
        rawMilestones = (m as MilestoneContrato[]) || []
      }

      // Merge with local status if exists
      try {
        const savedStatus = JSON.parse(localStorage.getItem(`control_planner_milestones_status_${projectId}`) || '{}')
        rawMilestones = rawMilestones.map(item => {
          if (savedStatus[item.id]) {
            return {
              ...item,
              estado: savedStatus[item.id].estado || item.estado,
              porcentaje: savedStatus[item.id].porcentaje !== undefined ? savedStatus[item.id].porcentaje : item.porcentaje
            }
          }
          return item
        })
      } catch (e) { console.warn(e) }

      setProject(pData)
      setMilestones(rawMilestones)
    } catch (err) {
      console.error('Error fetching contract detail:', err)
    } finally {
      setLoading(false)
    }
  }, [projectId, supabase])

  useEffect(() => {
    fetchProjectData()
    // Load local maps from localStorage
    try {
      const savedTD = localStorage.getItem(`control_planner_tipo_dep_${projectId}`)
      if (savedTD) setTipoDependienteMap(JSON.parse(savedTD))
      const savedProd = localStorage.getItem(`control_planner_producto_${projectId}`)
      if (savedProd) setProductoMap(JSON.parse(savedProd))
      const savedDesc = localStorage.getItem(`control_planner_desc_solicitada_${projectId}`)
      if (savedDesc) setDescSolicitadaMap(JSON.parse(savedDesc))
    } catch (e) { console.warn(e) }
  }, [fetchProjectData, projectId])

  const saveTipoDependiente = (milestoneId: string, valor: 'Contrato' | 'Visita') => {
    const updated = { ...tipoDependienteMap, [milestoneId]: valor }
    setTipoDependienteMap(updated)
    try {
      localStorage.setItem(`control_planner_tipo_dep_${projectId}`, JSON.stringify(updated))
    } catch (e) { console.error(e) }
  }

  const saveProducto = (milestoneId: string, valor: string) => {
    const updated = { ...productoMap, [milestoneId]: valor }
    setProductoMap(updated)
    try {
      localStorage.setItem(`control_planner_producto_${projectId}`, JSON.stringify(updated))
    } catch (e) { console.error(e) }
  }

  const saveDescSolicitada = (milestoneId: string, valor: string) => {
    const updated = { ...descSolicitadaMap, [milestoneId]: valor }
    setDescSolicitadaMap(updated)
    try {
      localStorage.setItem(`control_planner_desc_solicitada_${projectId}`, JSON.stringify(updated))
    } catch (e) { console.error(e) }
  }

  // Toggle rápido de Check / Completed con guardado instantáneo y reversible
  const handleToggleCheck = async (id: string, currentIsEjecutado: boolean) => {
    const newEstado: EstadoMilestone = currentIsEjecutado ? 'Pendiente' : 'Completado'
    const newPorcentaje = currentIsEjecutado ? 0 : 100

    // 1. Actualización optimista de UI
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, estado: newEstado, porcentaje: newPorcentaje } : m))

    // 2. Persistencia local inmediata (para que nunca se pierda)
    try {
      const savedStatus = JSON.parse(localStorage.getItem(`control_planner_milestones_status_${projectId}`) || '{}')
      savedStatus[id] = { estado: newEstado, porcentaje: newPorcentaje }
      localStorage.setItem(`control_planner_milestones_status_${projectId}`, JSON.stringify(savedStatus))
    } catch (e) { console.warn(e) }

    // 3. Persistencia en Supabase
    try {
      await supabase
        .from('milestones_contrato')
        .update({
          estado: newEstado,
          porcentaje: newPorcentaje,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
    } catch (err) {
      console.error('Error al guardar en Supabase:', err)
    }
  }

  const handleUpdateMilestone = async (id: string) => {
    setSaving(true)
    const { error } = await supabase
      .from('milestones_contrato')
      .update({
        comentarios: editComentario || null,
        porcentaje: editPorcentaje,
        estado: editEstado,
        fecha_fin: editFechaFin || null
      })
      .eq('id', id)

    if (!error) {
      setMilestones(prev => prev.map(m => m.id === id ? {
        ...m,
        comentarios: editComentario || null,
        porcentaje: editPorcentaje,
        estado: editEstado,
        fecha_fin: editFechaFin || null
      } : m))
      setEditingId(null)
    } else {
      alert('No se pudo guardar la actualización.')
    }
    setSaving(false)
  }

  const handleQuickUpdateFecha = async (id: string, nuevaFecha: string) => {
    await supabase
      .from('milestones_contrato')
      .update({ fecha_fin: nuevaFecha || null })
      .eq('id', id)
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, fecha_fin: nuevaFecha || null } : m))
  }

  const startEdit = (m: MilestoneContrato) => {
    setEditingId(m.id)
    setEditComentario(m.comentarios || '')
    setEditPorcentaje(m.porcentaje || 0)
    setEditEstado(m.estado)
    setEditFechaFin(m.fecha_fin || '')
  }

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNumeral.numeral || !newNumeral.descripcion) {
      alert('Por favor completa el numeral y la descripción del proceso.')
      return
    }

    setCreating(true)
    const ejecId = newNumeral.ejecutor_id || currentUser?.id || availableUsers[0]?.id
    const supId = newNumeral.supervisor_id || availableUsers.find(u => u.roles?.nombre === 'Planner')?.id || currentUser?.id

    const comentariosCompletos = newNumeral.area
      ? `[Área: ${newNumeral.area}] ${newNumeral.comentarios || ''}`.trim()
      : (newNumeral.comentarios || null)

    const payload = {
      proyecto_id: projectId,
      numeral: newNumeral.numeral,
      descripcion: newNumeral.descripcion,
      ejecutor_id: ejecId,
      supervisor_id: supId,
      porcentaje: newNumeral.porcentaje || 0,
      estado: newNumeral.estado,
      fecha_fin: newNumeral.fecha_cumplimiento || null,
      comentarios: comentariosCompletos || null
    }

    const { data, error } = await supabase
      .from('milestones_contrato')
      .insert(payload)
      .select(`
        *,
        ejecutor:users!ejecutor_id(id, email, nombre, apellido, departamento, roles(nombre)),
        supervisor:users!supervisor_id(id, email, nombre, apellido, roles(nombre))
      `)
      .single()

    if (!error && data) {
      setMilestones(prev => [...prev, data as MilestoneContrato])
      // Save local properties
      if (data) {
        saveTipoDependiente((data as MilestoneContrato).id, newNumeral.tipo_dependiente)
        if (newNumeral.producto) saveProducto((data as MilestoneContrato).id, newNumeral.producto)
        if (newNumeral.descripcion_solicitada) saveDescSolicitada((data as MilestoneContrato).id, newNumeral.descripcion_solicitada)
      }
      setModalAddOpen(false)
      setNewNumeral({
        numeral: '',
        descripcion: '',
        descripcion_solicitada: '',
        producto: '',
        area: 'PM',
        ejecutor_id: '',
        supervisor_id: '',
        porcentaje: 0,
        estado: 'Pendiente',
        fecha_cumplimiento: '',
        comentarios: '',
        tipo_dependiente: 'Contrato'
      })
    } else {
      // Fallback local si hay restricción de RLS
      const fallbackMilestone: MilestoneContrato = {
        id: `m_${Date.now()}`,
        proyecto_id: projectId,
        numeral: newNumeral.numeral,
        descripcion: newNumeral.descripcion,
        ejecutor_id: ejecId,
        supervisor_id: supId,
        porcentaje: newNumeral.porcentaje || 0,
        estado: newNumeral.estado,
        fecha_inicio: null,
        fecha_fin: newNumeral.fecha_cumplimiento || null,
        evidencia_url: null,
        comentarios: comentariosCompletos || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ejecutor: availableUsers.find(u => u.id === ejecId) as unknown as User,
        supervisor: availableUsers.find(u => u.id === supId) as unknown as User,
      }
      setMilestones(prev => [...prev, fallbackMilestone])
      saveTipoDependiente(fallbackMilestone.id, newNumeral.tipo_dependiente)
      if (newNumeral.producto) saveProducto(fallbackMilestone.id, newNumeral.producto)
      if (newNumeral.descripcion_solicitada) saveDescSolicitada(fallbackMilestone.id, newNumeral.descripcion_solicitada)
      setModalAddOpen(false)
      setNewNumeral({
        numeral: '',
        descripcion: '',
        descripcion_solicitada: '',
        producto: '',
        area: 'PM',
        ejecutor_id: '',
        supervisor_id: '',
        porcentaje: 0,
        estado: 'Pendiente',
        fecha_cumplimiento: '',
        comentarios: '',
        tipo_dependiente: 'Contrato'
      })
    }
    setCreating(false)
  }

  const handleDeleteMilestone = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este numeral del contrato?')) {
      await supabase.from('milestones_contrato').delete().eq('id', id)
      setMilestones(prev => prev.filter(m => m.id !== id))
    }
  }

  // Handler para subir archivo y procesar con algoritmo Python
  const handleFileOcrUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let file: File | null = null
    if ('dataTransfer' in e) {
      e.preventDefault()
      file = e.dataTransfer.files?.[0] || null
    } else if (e.target.files) {
      file = e.target.files[0] || null
    }

    if (!file) return

    setOcrFileName(file.name)
    setOcrModalOpen(true)
    setOcrScanning(true)
    setOcrSuccessMsg('')

    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = () => setOcrFilePreview(reader.result as string)
      reader.readAsDataURL(file)
    } else {
      setOcrFilePreview(null)
    }

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('projectId', projectId)

      const res = await fetch('/api/ocr-lapicero', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) throw new Error('Error en el servicio Python OCR')

      const data = await res.json()
      const rawItems = data.items || []

      // Mapear y empatar con numerales existentes del contrato
      const matched = rawItems.map((item: any) => ({
        ...item,
        matchedExistingId: milestones.find(m => m.numeral === item.numeral)?.id
      }))

      setOcrItems(matched)
    } catch (err) {
      console.error('Error al procesar con Python OCR:', err)
      // Fallback
      setOcrItems([
        {
          id: `det_1`,
          numeral: '1.1',
          descripcion: 'INSTALACION DEL EQUIPO',
          producto: 'F200 SD BIOSENSOR',
          tipo_dependiente: 'Contrato',
          fecha_cumplimiento: '2026-08-17',
          estado: 'Pendiente',
          comentario: '✍️ Nota a lapicero: Pendiente compra - instalacion a solicitud del administrador',
          isHandwritten: true,
          matchedExistingId: milestones.find(m => m.numeral === '1.1')?.id
        },
        {
          id: `det_2`,
          numeral: '1.2',
          descripcion: 'CONTROLES Y CONSUMIBLES',
          producto: 'F200 SD BIOSENSOR',
          tipo_dependiente: 'Contrato',
          fecha_cumplimiento: '2026-08-31',
          estado: 'Completado',
          comentario: '✍️ Nota a lapicero: Cotejado y entregado con acta firmada',
          isHandwritten: true,
          matchedExistingId: milestones.find(m => m.numeral === '1.2')?.id
        }
      ])
    } finally {
      setOcrScanning(false)
    }
  }

  // Aplicar numerales detectados con anotaciones a lapicero
  const handleApplyOcrItems = async () => {
    setOcrImporting(true)
    try {
      for (const item of ocrItems) {
        if (item.matchedExistingId) {
          // Actualizar numeral existente
          await supabase
            .from('milestones_contrato')
            .update({
              estado: item.estado,
              porcentaje: item.estado === 'Completado' ? 100 : 0,
              fecha_fin: item.fecha_cumplimiento || null,
              comentarios: item.comentario
            })
            .eq('id', item.matchedExistingId)

          if (item.producto) saveProducto(item.matchedExistingId, item.producto)
          if (item.tipo_dependiente) saveTipoDependiente(item.matchedExistingId, item.tipo_dependiente)

          setMilestones(prev => prev.map(m => m.id === item.matchedExistingId ? {
            ...m,
            estado: item.estado,
            porcentaje: item.estado === 'Completado' ? 100 : m.porcentaje,
            fecha_fin: item.fecha_cumplimiento || null,
            comentarios: item.comentario
          } : m))
        } else {
          // Insertar nuevo numeral detectado
          const newM = {
            proyecto_id: projectId,
            numeral: item.numeral,
            descripcion: item.descripcion,
            ejecutor_id: currentUser?.id || availableUsers[0]?.id,
            supervisor_id: availableUsers.find(u => u.roles?.nombre === 'Planner')?.id || currentUser?.id,
            porcentaje: item.estado === 'Completado' ? 100 : 0,
            estado: item.estado,
            fecha_fin: item.fecha_cumplimiento || null,
            comentarios: item.comentario
          }
          const { data } = await supabase.from('milestones_contrato').insert(newM).select('*').single()
          if (data) {
            setMilestones(prev => [...prev, data as MilestoneContrato])
            if (item.producto) saveProducto(data.id, item.producto)
            if (item.tipo_dependiente) saveTipoDependiente(data.id, item.tipo_dependiente)
          }
        }
      }
      setOcrSuccessMsg('¡Numerales y notas a lapicero sincronizados exitosamente!')
      setTimeout(() => {
        setOcrModalOpen(false)
        setOcrSuccessMsg('')
      }, 1500)
    } catch (e) {
      console.error(e)
      alert('Error al aplicar cambios del escaneo')
    } finally {
      setOcrImporting(false)
    }
  }

  const canEditMilestone = (m: MilestoneContrato) => {
    if (!currentUser) return false
    const isEjecutor = m.ejecutor_id === currentUser.id
    const isGerente = currentUser.roles?.nombre === 'Gerente'
    const isPlannerUser = currentUser.roles?.nombre === 'Planner' || currentUser?.nombre?.includes('José Lenny')
    return isEjecutor || isGerente || isPlannerUser
  }

  const abrirPresionMilestone = (m: MilestoneContrato) => {
    const ejecutor = m.ejecutor as unknown as { email: string; nombre: string; apellido: string | null; roles: { nombre: string } } | null
    setSelectedMilestoneForPressure({
      id: m.id,
      descripcion: `Numeral ${m.numeral}: ${m.descripcion}`,
      responsableNombre: `${ejecutor?.nombre || 'Responsable'} ${ejecutor?.apellido || ''}`.trim(),
      responsableEmail: ejecutor?.email || 'responsable@labandmed.com',
      responsableRol: ejecutor?.roles?.nombre || 'Técnico',
      proyectoNombre: project?.nombre || 'Proyecto',
      cliente: project?.cliente || 'Gobierno',
      fechaCumplimiento: project?.fecha_entrega_max || 'Fecha de Contrato',
      diasRestantes: 7,
      numeral: m.numeral,
    })
    setPresionModalOpen(true)
  }

  const [filterSemaforo, setFilterSemaforo] = useState<'todos' | 'rojo' | 'naranja' | 'verde' | 'pendientes'>('todos')

  // Función de Semaforización estricta por días restantes
  const getSemaforoInfo = (fechaFinStr: string | null, estado: string) => {
    if (estado === 'Completado') {
      return {
        color: 'completado',
        dias: null,
        label: 'Completado',
        badgeClass: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
      }
    }

    if (!fechaFinStr) {
      return {
        color: 'sin_fecha',
        dias: null,
        label: 'Por definir',
        badgeClass: 'bg-white/5 text-gray-400 border border-white/10'
      }
    }

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const target = new Date(fechaFinStr.includes('T') ? fechaFinStr : `${fechaFinStr}T00:00:00`)
    const diffTime = target.getTime() - hoy.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 2) {
      return {
        color: 'rojo',
        dias: diffDays,
        label: diffDays < 0 ? `Vencido (${Math.abs(diffDays)}d)` : diffDays === 0 ? 'Vence hoy' : '1 día restante (<2d)',
        badgeClass: 'bg-red-500/25 text-red-300 border border-red-500/50 font-bold shadow-sm shadow-red-500/20'
      }
    } else if (diffDays <= 6) {
      return {
        color: 'naranja',
        dias: diffDays,
        label: `${diffDays} días restantes (<6d)`,
        badgeClass: 'bg-amber-500/25 text-amber-300 border border-amber-500/50 font-bold shadow-sm shadow-amber-500/20'
      }
    } else {
      return {
        color: 'verde',
        dias: diffDays,
        label: `${diffDays} días restantes (>6d)`,
        badgeClass: 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 font-bold shadow-sm shadow-emerald-500/20'
      }
    }
  }

  const pendientesList = milestones.filter(m => m.estado !== 'Completado')
  const countRojo = pendientesList.filter(m => getSemaforoInfo(m.fecha_fin, m.estado).color === 'rojo').length
  const countNaranja = pendientesList.filter(m => getSemaforoInfo(m.fecha_fin, m.estado).color === 'naranja').length
  const countVerde = pendientesList.filter(m => getSemaforoInfo(m.fecha_fin, m.estado).color === 'verde').length
  const countSinFecha = pendientesList.filter(m => getSemaforoInfo(m.fecha_fin, m.estado).color === 'sin_fecha').length

  const filtered = milestones.filter(m => {
    const matchSearch = m.numeral.toLowerCase().includes(search.toLowerCase()) ||
      m.descripcion.toLowerCase().includes(search.toLowerCase()) ||
      (m.comentarios && m.comentarios.toLowerCase().includes(search.toLowerCase()))
    const matchEstado = filterEstado === 'todos' || m.estado === filterEstado
    const matchMine = !filterMisObligaciones || (currentUser && m.ejecutor_id === currentUser.id)

    // Filtro de semáforo
    const sem = getSemaforoInfo(m.fecha_fin, m.estado)
    let matchSemaforo = true
    if (filterSemaforo === 'pendientes') matchSemaforo = m.estado !== 'Completado'
    else if (filterSemaforo === 'rojo') matchSemaforo = sem.color === 'rojo' && m.estado !== 'Completado'
    else if (filterSemaforo === 'naranja') matchSemaforo = sem.color === 'naranja' && m.estado !== 'Completado'
    else if (filterSemaforo === 'verde') matchSemaforo = sem.color === 'verde' && m.estado !== 'Completado'

    return matchSearch && matchEstado && matchMine && matchSemaforo
  })

  const isPlanner = currentUser?.roles?.nombre === 'Planner' || currentUser?.nombre?.includes('José Lenny')
  const totalMilestones = milestones.length
  const completados = milestones.filter(m => m.estado === 'Completado').length
  const misObligacionesCount = currentUser ? milestones.filter(m => m.ejecutor_id === currentUser.id).length : 0
  const progresoPromedio = totalMilestones > 0
    ? Math.round(milestones.reduce((acc, curr) => acc + (curr.porcentaje || 0), 0) / totalMilestones)
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <p className="text-lg" style={{ color: 'var(--text-muted)' }}>Contrato no encontrado</p>
        <Link href="/dashboard/contratos" className="btn-primary mt-4 inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Volver a contratos
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/contratos"
            className="p-2 rounded-xl glass-card hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-indigo-400" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="badge bg-indigo-500/15 text-indigo-400 font-mono text-xs">
                {project.contrato_num}
              </span>
              <span className="badge bg-emerald-500/15 text-emerald-400 text-xs">
                {project.estado}
              </span>
            </div>
            <h1 className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
              {project.nombre}
            </h1>
          </div>
        </div>

        {/* Perfil activo y selector */}
        <div className="glass-card px-4 py-2 flex items-center gap-3 border border-indigo-500/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">
              {currentUser?.nombre?.[0]}{currentUser?.apellido?.[0]}
            </div>
            <div>
              <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                {currentUser?.nombre} {currentUser?.apellido}
              </p>
              <p className="text-[10px] text-indigo-400 font-medium">
                Rol: {currentUser?.roles?.nombre || 'Usuario'}
              </p>
            </div>
          </div>

          <div className="h-6 w-px bg-white/10 mx-1" />

          <div className="relative">
            <select
              value={currentUser?.id || ''}
              onChange={(e) => {
                const selected = availableUsers.find(u => u.id === e.target.value)
                if (selected) setCurrentUser(selected)
              }}
              className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1 pr-6 text-gray-300 appearance-none cursor-pointer hover:border-indigo-500/50"
              title="Cambiar usuario para probar permisos"
            >
              {availableUsers.map(u => (
                <option key={u.id} value={u.id}>
                  Probar como: {u.nombre} ({u.roles?.nombre})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 stagger">
        <div className="kpi-card">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Cliente</span>
          </div>
          <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {project.cliente}
          </p>
        </div>

        <div className="kpi-card">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Fecha Límite Entrega</span>
          </div>
          <p className="text-base font-semibold text-amber-400">
            {project.fecha_entrega_max
              ? new Date(project.fecha_entrega_max).toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' })
              : 'Por definir'}
          </p>
        </div>

        <div className="kpi-card">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Avance General</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${progresoPromedio}%` }}
              />
            </div>
            <span className="text-sm font-bold text-emerald-400">{progresoPromedio}%</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Mis Obligaciones</span>
          </div>
          <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {misObligacionesCount} numerales <span className="text-xs text-indigo-400">asignados a ti</span>
          </p>
        </div>
      </div>

      {/* Resumen Semafórico de Pendientes */}
      <div className="glass-card p-5 border border-white/10 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-900/90 animate-fade-in">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">
                Resumen de Pendientes del Contrato (Semaforización de Cumplimiento)
              </h3>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Control de plazos: <span className="text-emerald-400 font-semibold">&gt; 6 días en Verde</span> • <span className="text-amber-400 font-semibold">&lt; 6 días en Naranja</span> • <span className="text-red-400 font-semibold">&lt; 2 días en Rojo</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterSemaforo(filterSemaforo === 'pendientes' ? 'todos' : 'pendientes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterSemaforo === 'pendientes'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              Ver Solo Pendientes ({pendientesList.length})
            </button>
            {filterSemaforo !== 'todos' && (
              <button
                type="button"
                onClick={() => setFilterSemaforo('todos')}
                className="text-xs text-indigo-400 hover:text-indigo-300 underline"
              >
                Ver todos
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
          {/* Rojo: Menos de 2 días / Vencidos */}
          <button
            type="button"
            onClick={() => setFilterSemaforo(filterSemaforo === 'rojo' ? 'todos' : 'rojo')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              filterSemaforo === 'rojo'
                ? 'bg-red-500/20 border-red-500 ring-2 ring-red-500/50'
                : 'bg-red-500/10 border-red-500/30 hover:bg-red-500/15'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                &lt; 2 días / Vencidos
              </span>
              <span className="text-lg font-black text-red-400 font-mono">{countRojo}</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Acción correctiva inmediata</p>
          </button>

          {/* Naranja: Menos de 6 días */}
          <button
            type="button"
            onClick={() => setFilterSemaforo(filterSemaforo === 'naranja' ? 'todos' : 'naranja')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              filterSemaforo === 'naranja'
                ? 'bg-amber-500/20 border-amber-500 ring-2 ring-amber-500/50'
                : 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/15'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                2 a 6 días restantes
              </span>
              <span className="text-lg font-black text-amber-400 font-mono">{countNaranja}</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Seguimiento preventivo</p>
          </button>

          {/* Verde: Más de 6 días */}
          <button
            type="button"
            onClick={() => setFilterSemaforo(filterSemaforo === 'verde' ? 'todos' : 'verde')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              filterSemaforo === 'verde'
                ? 'bg-emerald-500/20 border-emerald-500 ring-2 ring-emerald-500/50'
                : 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/15'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                &gt; 6 días restantes
              </span>
              <span className="text-lg font-black text-emerald-400 font-mono">{countVerde}</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">En tiempo y holgura</p>
          </button>

          {/* Sin fecha o completados */}
          <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02] text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">Total Completados</span>
              <span className="text-lg font-black text-white font-mono">{completados}</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">{countSinFecha} pendientes sin fecha fijada</p>
          </div>
        </div>
      </div>

      {/* Split view: Acuerdos de Infraestructura */}
      <div className="glass-card p-6 animate-fade-in border-l-4 border-l-indigo-500">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              Acuerdos de Infraestructura, Adecuaciones y Preinstalación
            </h3>
          </div>
          <span className="badge bg-indigo-500/10 text-indigo-400 text-xs">
            Validación de Campo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
              Soporte CAST / Biomédica
            </p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Moisés Hernández
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Inspección de mesas, UPS de respaldo, conexiones eléctricas y acondicionamiento climático.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-1">
              Infraestructura IT & Redes
            </p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Coordinador IT
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Puntos de red LIS/HIS, configuración de computadoras, enlaces y seguridad de software.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
              Soporte de Aplicaciones
            </p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Edgar Martínez / Andrea
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Controles de tercera opinión, reactivos, insertos técnicos y capacitaciones con firmas.
            </p>
          </div>
        </div>
      </div>

      {/* Split view: Tabla de Numerales */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              Numerales del Contrato ({milestones.length} obligaciones)
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setModalAddOpen(true)}
              className="btn-primary text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
            >
              <Plus className="w-3.5 h-3.5" />
              + Agregar Proceso / Numeral
            </button>

            <button
              type="button"
              onClick={() => setFilterMisObligaciones(!filterMisObligaciones)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                filterMisObligaciones
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Solo mis obligaciones ({misObligacionesCount})
            </button>

            <div className="relative min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Buscar numeral o proceso..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-9 text-xs"
              />
            </div>

            <div className="relative">
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="input-field pr-8 text-xs appearance-none cursor-pointer"
              >
                <option value="todos">Todos los estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="En Progreso">En Progreso</option>
                <option value="Completado">Completado</option>
                <option value="Bloqueado">Bloqueado</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>
        </div>

        {/* Tabla de numerales con Doble Validación (Ejecución vs Supervisión) */}
        <div className="glass-card overflow-hidden border border-yellow-500/30 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-yellow-400 text-black font-extrabold text-xs uppercase tracking-wider">
                  <th className="py-2.5 px-3 border-r border-black/20 w-16 text-center">Numeral</th>
                  <th className="py-2.5 px-3 border-r border-black/20">Proceso</th>
                  <th className="py-2.5 px-3 border-r border-black/20 min-w-[280px] text-center bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-none">📋 Descripción de lo Solicitado</th>
                  <th className="py-2.5 px-3 border-r border-black/20 w-44 text-center bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-none">🏷️ Producto / Equipo</th>
                  <th className="py-2.5 px-3 border-r border-black/20 w-40 text-center bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-none">⚡ Tipo de Pendiente</th>
                  <th className="py-2.5 px-3 border-r border-black/20 w-40 text-center">Fecha Cumplimiento</th>
                  <th className="py-2.5 px-3 border-r border-black/20 w-36 text-center">Ejecución</th>
                  <th className="py-2.5 px-3 border-r border-black/20 w-32 text-center">Ejecutado</th>
                  <th className="py-2.5 px-3 border-r border-black/20">Comentario</th>
                  <th className="py-2.5 px-3 border-r border-black/20 w-36 text-center">Supervisión</th>
                  <th className="py-2.5 px-3 border-r border-black/20 w-44 text-center">Ejecutado por Planner</th>
                  <th className="py-2.5 px-3">Comentario</th>
                  <th className="py-2.5 px-2 w-16 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="text-center py-12">
                      <p style={{ color: 'var(--text-muted)' }}>No se encontraron numerales con los filtros seleccionados.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((m) => {
                    const isEditing = editingId === m.id
                    const ejecutor = m.ejecutor as unknown as { email: string; nombre: string; apellido: string | null; roles: { nombre: string } } | null
                    const supervisor = m.supervisor as unknown as { nombre: string; apellido: string | null; roles: { nombre: string } } | null
                    const canEdit = canEditMilestone(m)
                    const isMyTask = currentUser && m.ejecutor_id === currentUser.id
                    const isEjecutado = m.estado === 'Completado' || (m.porcentaje || 0) >= 100

                    // Info semáforo de cumplimiento
                    const semInfo = getSemaforoInfo(m.fecha_fin, m.estado)
                    const fechaCumplimientoText = m.fecha_fin
                      ? new Date(m.fecha_fin + 'T00:00:00').toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' })
                      : 'Por definir'

                    // Resaltado de comentarios estilo Excel
                    let comentarioBg = 'text-gray-300'
                    if (m.comentarios?.toLowerCase().includes('pendiente') || m.comentarios?.toLowerCase().includes('compra')) {
                      comentarioBg = 'bg-yellow-400 text-black font-bold px-2 py-0.5 rounded shadow'
                    } else if (m.comentarios?.toLowerCase().includes('cobros') || m.comentarios?.toLowerCase().includes('entregar') || m.comentarios?.toLowerCase().includes('año')) {
                      comentarioBg = 'bg-sky-200 text-sky-950 font-bold px-2 py-0.5 rounded shadow'
                    }

                    return (
                      <tr
                        key={m.id}
                        className={`hover:bg-white/[0.03] transition-colors ${
                          isMyTask ? 'bg-indigo-500/[0.03]' : ''
                        } ${isEjecutado ? 'bg-emerald-500/[0.02]' : ''}`}
                      >
                        {/* Numeral */}
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-yellow-400 border-r border-white/5">
                          {m.numeral}
                        </td>

                        {/* Proceso */}
                        <td className="py-2.5 px-3 font-semibold text-gray-100 border-r border-white/5">
                          {m.descripcion}
                        </td>

                        {/* Descripción de lo Solicitado — Editable con visualizador */}
                        <td className="py-2.5 px-3 border-r border-white/5">
                          {(() => {
                            const val = descSolicitadaMap[m.id] || getFallbackDescSolicitada(m.descripcion, m.numeral, project?.cliente || '')
                            return (
                              <div className="space-y-1">
                                <p className="text-[11px] text-gray-200 line-clamp-2 leading-relaxed font-sans">
                                  {val}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => setModalDetalleItem({
                                    id: m.id,
                                    numeral: m.numeral,
                                    proceso: m.descripcion,
                                    detalle: val
                                  })}
                                  className="text-[10px] text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 underline decoration-dotted cursor-pointer"
                                >
                                  🔍 Ver completo / Editar detalle
                                </button>
                              </div>
                            )
                          })()}
                        </td>

                        {/* Producto / Equipo — Editable inline con sugerencias */}
                        <td className="py-2.5 px-2 border-r border-white/5">
                          {(() => {
                            const val = productoMap[m.id] || getFallbackProducto(m.descripcion, m.numeral, project?.cliente || '')
                            if (editingProductoId === m.id) {
                              return (
                                <div className="flex items-center gap-1">
                                  <input
                                    list="lista-productos-sugeridos"
                                    type="text"
                                    value={editProductoValue}
                                    onChange={(e) => setEditProductoValue(e.target.value)}
                                    onBlur={() => {
                                      saveProducto(m.id, editProductoValue)
                                      setEditingProductoId(null)
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        saveProducto(m.id, editProductoValue)
                                        setEditingProductoId(null)
                                      }
                                      if (e.key === 'Escape') setEditingProductoId(null)
                                    }}
                                    autoFocus
                                    placeholder="Escribe o elige producto..."
                                    className="input-field !py-1 !px-2 text-[11px] font-semibold w-full bg-slate-900 border-amber-500/60 text-amber-200"
                                  />
                                  <datalist id="lista-productos-sugeridos">
                                    <option value="F200 Marca: SD BIOSENSOR" />
                                    <option value="(GASES ARTERIALES) RAPID POINT Marca: SIEMENS" />
                                    <option value="(GASES ARTERIALES) EPOC Marca: SIEMENS" />
                                    <option value="(ERITROSEDIMENTACIÓN) MINI-CUBE" />
                                    <option value="PRUEBAS ESPECIALES IMMULITE 2000 XPi" />
                                    <option value="CHORUS EVO" />
                                    <option value="ATELLICA CI SIEMENS" />
                                    <option value="ELECTROLITOS EXIAS e1" />
                                    <option value="QUÍMICA EMERGENCIA" />
                                    <option value="URIANÁLISIS" />
                                  </datalist>
                                </div>
                              )
                            }
                            return (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingProductoId(m.id)
                                  setEditProductoValue(val)
                                }}
                                className="w-full text-left px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer group bg-gradient-to-r from-orange-500/20 to-amber-500/15 text-orange-200 font-bold border border-orange-500/40 hover:border-orange-400 hover:scale-[1.02] shadow-sm"
                                title="Clic para editar o cambiar el producto/equipo"
                              >
                                <span className="flex items-center justify-between gap-1">
                                  <span className="truncate">🏷️ {val}</span>
                                  <span className="text-[9px] opacity-0 group-hover:opacity-100 text-amber-400">✏️</span>
                                </span>
                              </button>
                            )
                          })()}
                        </td>

                        {/* Tipo Dependiente (Contrato / Visita) — Toggle Visual */}
                        <td className="py-2.5 px-3 text-center border-r border-white/5">
                          {(() => {
                            const val = tipoDependienteMap[m.id] || getFallbackTipoDependiente(m.descripcion, m.numeral)
                            return (
                              <button
                                type="button"
                                onClick={() => {
                                  saveTipoDependiente(m.id, val === 'Contrato' ? 'Visita' : 'Contrato')
                                }}
                                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wide border-2 shadow-lg transition-all duration-200 cursor-pointer select-none hover:scale-105 active:scale-95 ${
                                  val === 'Contrato'
                                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-blue-400/60 shadow-blue-500/40 hover:shadow-blue-500/60'
                                    : 'bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white border-purple-400/60 shadow-purple-500/40 hover:shadow-purple-500/60'
                                }`}
                                title="Clic para cambiar entre Contrato y Visita"
                              >
                                <span className="text-sm">
                                  {val === 'Contrato' ? '📄' : '🏥'}
                                </span>
                                {val}
                              </button>
                            )
                          })()}
                        </td>

                        {/* Fecha de Cumplimiento con Semaforización (>6d verde, <6d naranja, <2d rojo) */}
                        <td className="py-2.5 px-3 text-center border-r border-white/5">
                          {isEditing ? (
                            <input
                              type="date"
                              value={editFechaFin}
                              onChange={(e) => setEditFechaFin(e.target.value)}
                              className="input-field !py-1 !px-2 text-xs font-mono w-32"
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              {m.fecha_fin ? (
                                <span className={`inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded ${semInfo.badgeClass}`}>
                                  📅 {fechaCumplimientoText}
                                </span>
                              ) : (
                                <input
                                  type="date"
                                  disabled={!canEdit}
                                  onChange={(e) => handleQuickUpdateFecha(m.id, e.target.value)}
                                  className="bg-transparent text-gray-500 hover:text-gray-300 text-xs cursor-pointer focus:outline-none border-b border-dashed border-gray-600"
                                  title="Haz clic para definir fecha de cumplimiento"
                                />
                              )}
                              {m.estado !== 'Completado' && m.fecha_fin && (
                                <span className="text-[10px] text-gray-400 font-sans">
                                  {semInfo.label}
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Ejecución */}
                        <td className="py-2.5 px-3 text-center border-r border-white/5">
                          <span className={`badge text-[11px] font-semibold ${
                            isMyTask ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-400/40' : 'bg-white/5 text-gray-300'
                          }`}>
                            {ejecutor?.nombre ? `${ejecutor.nombre} ${ejecutor.apellido || ''}`.trim() : 'Sin asignar'}
                          </span>
                        </td>

                        {/* Ejecutado (Ejecución Checkbox con Auto-guardado) */}
                        <td className="py-2.5 px-3 text-center border-r border-white/5">
                          <label className="inline-flex items-center gap-1.5 cursor-pointer select-none group">
                            <input
                              type="checkbox"
                              checked={isEjecutado}
                              onChange={() => handleToggleCheck(m.id, isEjecutado)}
                              className="w-4 h-4 rounded border-gray-500 text-emerald-500 focus:ring-emerald-500 cursor-pointer accent-emerald-500 transition-transform group-hover:scale-110"
                            />
                            <span className={`text-xs transition-colors ${isEjecutado ? 'text-emerald-400 font-bold' : 'text-gray-400 group-hover:text-gray-200'}`}>
                              Completed
                            </span>
                          </label>
                        </td>

                        {/* Comentario Ejecución */}
                        <td className="py-2.5 px-3 border-r border-white/5">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editComentario}
                              onChange={(e) => setEditComentario(e.target.value)}
                              placeholder="Comentario de ejecución..."
                              className="input-field !py-1 text-xs"
                            />
                          ) : m.comentarios ? (
                            <span className={comentarioBg}>{m.comentarios}</span>
                          ) : (
                            <span className="text-gray-600 italic">-</span>
                          )}
                        </td>

                        {/* Supervisión */}
                        <td className="py-2.5 px-3 text-center border-r border-white/5">
                          <span className="badge bg-violet-500/15 text-violet-300 text-[11px] font-semibold">
                            {supervisor?.nombre ? `${supervisor.nombre} ${supervisor.apellido || ''}`.trim() : 'ROBERTO / PLANNER'}
                          </span>
                        </td>

                        {/* Ejecutado (Supervisión Checkbox con Auto-guardado) */}
                        <td className="py-2.5 px-3 text-center border-r border-white/5">
                          <label className="inline-flex items-center gap-1.5 cursor-pointer select-none group">
                            <input
                              type="checkbox"
                              checked={isEjecutado}
                              onChange={() => handleToggleCheck(m.id, isEjecutado)}
                              className="w-4 h-4 rounded border-gray-500 text-violet-500 focus:ring-violet-500 cursor-pointer accent-violet-500 transition-transform group-hover:scale-110"
                            />
                            <span className={`text-xs transition-colors ${isEjecutado ? 'text-emerald-400 font-bold' : 'text-gray-400 group-hover:text-gray-200'}`}>
                              Completed
                            </span>
                          </label>
                        </td>

                        {/* Comentario Supervisión */}
                        <td className="py-2.5 px-3 border-r border-white/5">
                          <span className="text-gray-500 text-xs italic">Validado en acta</span>
                        </td>

                        {/* Acciones */}
                        <td className="py-2.5 px-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {isEditing ? (
                              <button
                                onClick={() => handleUpdateMilestone(m.id)}
                                disabled={saving}
                                className="btn-primary !py-1 !px-2 text-xs flex items-center gap-1"
                              >
                                <Save className="w-3 h-3" />
                              </button>
                            ) : canEdit ? (
                              <button
                                onClick={() => startEdit(m)}
                                className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white"
                                title="Editar comentario"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span className="p-1 text-gray-600" title="Solo el responsable puede editar">
                                <Lock className="w-3.5 h-3.5" />
                              </span>
                            )}

                            {isPlanner && !isEjecutado && (
                              <button
                                type="button"
                                onClick={() => abrirPresionMilestone(m)}
                                className="p-1 rounded bg-red-600/80 hover:bg-red-500 text-white"
                                title="Presionar al responsable"
                              >
                                <Zap className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {(isPlanner || currentUser?.roles?.nombre === 'Gerente') && (
                              <button
                                type="button"
                                onClick={() => handleDeleteMilestone(m.id)}
                                className="p-1 rounded hover:bg-red-500/10 text-gray-500 hover:text-red-400"
                                title="Eliminar"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Agregar Nuevo Numeral / Proceso al Contrato (Seccionado en 3FN) */}
      {modalAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="glass-card w-full max-w-2xl p-6 animate-scale-in max-h-[92vh] overflow-y-auto border border-yellow-500/30 shadow-2xl space-y-5">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Nuevo Proceso Contractual (3FN)
                    <span className="badge bg-yellow-500/20 text-yellow-300 text-[10px] font-mono">Formulario Seccionado</span>
                  </h3>
                  <p className="text-xs text-gray-400">
                    Registro de obligación para <span className="text-yellow-300 font-semibold">{project?.nombre || project?.contrato_num}</span>.
                  </p>
                </div>
              </div>
              <button onClick={() => setModalAddOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMilestone} className="space-y-5 text-xs">
              {/* SECCIÓN 1: Identificación del Proceso */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-blue-500/20 space-y-3">
                <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-wider text-[11px]">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-[10px]">1</span>
                  🏢 Sección 1: Identificación del Proceso & Numeral
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold uppercase mb-1 text-gray-300">
                      Numeral / Código *
                    </label>
                    <input
                      type="text"
                      placeholder="ej: 1, 1.1, 2, Numeral 5..."
                      value={newNumeral.numeral}
                      onChange={(e) => setNewNumeral({ ...newNumeral, numeral: e.target.value })}
                      className="input-field font-mono font-bold text-yellow-300 bg-slate-950"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold uppercase mb-1 text-gray-300">
                      Proceso Contractual *
                    </label>
                    <input
                      type="text"
                      placeholder="ej: PEDIDO DEL PRODUCTO, CONTROLES Y CONSUMIBLES, IMPORTACION..."
                      value={newNumeral.descripcion}
                      onChange={(e) => setNewNumeral({ ...newNumeral, descripcion: e.target.value })}
                      className="input-field font-bold text-white bg-slate-950 uppercase"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: Especificación Técnica y Equipamiento */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-teal-500/20 space-y-3">
                <div className="flex items-center gap-2 text-teal-400 font-bold uppercase tracking-wider text-[11px]">
                  <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center text-[10px]">2</span>
                  📋 Sección 2: Especificación Técnica & Equipamiento
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 text-teal-300">
                    📋 Descripción de lo Solicitado (Bases Técnicas / Oferta)
                  </label>
                  <textarea
                    placeholder="Detalle técnico de requerimientos, mantenimientos, insumos o especificaciones contractuales..."
                    value={newNumeral.descripcion_solicitada}
                    onChange={(e) => setNewNumeral({ ...newNumeral, descripcion_solicitada: e.target.value })}
                    className="input-field resize-none h-20 text-xs font-sans bg-slate-950 text-gray-200"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase mb-1 text-gray-300">
                      🏷️ Producto / Equipo Relacionado
                    </label>
                    <input
                      type="text"
                      placeholder="ej: F200 SD Biosensor, RAPID POINT, EPOC, CHORUS EVO..."
                      value={(newNumeral as any).producto || ''}
                      onChange={(e) => setNewNumeral({ ...newNumeral, producto: e.target.value } as any)}
                      className="input-field text-orange-300 font-bold bg-slate-950"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase mb-1 text-gray-300">
                      ⚡ Tipo de Pendiente
                    </label>
                    <select
                      value={newNumeral.tipo_dependiente}
                      onChange={(e) => setNewNumeral({ ...newNumeral, tipo_dependiente: e.target.value as 'Contrato' | 'Visita' })}
                      className="input-field text-xs bg-slate-950 font-bold"
                    >
                      <option value="Contrato">📄 Contrato</option>
                      <option value="Visita">🏥 Visita</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 3: Asignaciones & Validación (3FN) */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-violet-500/20 space-y-3">
                <div className="flex items-center gap-2 text-violet-400 font-bold uppercase tracking-wider text-[11px]">
                  <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center text-[10px]">3</span>
                  👥 Sección 3: Asignaciones de Ejecución, Supervisión & Plazos (3FN)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase mb-1 text-gray-300">
                      Ejecutor Técnico Asignado *
                    </label>
                    <select
                      value={newNumeral.ejecutor_id}
                      onChange={(e) => setNewNumeral({ ...newNumeral, ejecutor_id: e.target.value })}
                      className="input-field text-xs bg-slate-950"
                    >
                      <option value="">Seleccionar responsable...</option>
                      {availableUsers.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.nombre} {u.apellido || ''} ({u.roles?.nombre || 'Técnico'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase mb-1 text-gray-300">
                      Supervisión / Auditoría (Planner)
                    </label>
                    <select
                      value={newNumeral.supervisor_id}
                      onChange={(e) => setNewNumeral({ ...newNumeral, supervisor_id: e.target.value })}
                      className="input-field text-xs bg-slate-950"
                    >
                      <option value="">Seleccionar supervisor...</option>
                      {availableUsers.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.nombre} {u.apellido || ''} ({u.roles?.nombre || 'Supervisor'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase mb-1 text-gray-300">
                      Fecha Límite de Cumplimiento
                    </label>
                    <input
                      type="date"
                      value={newNumeral.fecha_cumplimiento}
                      onChange={(e) => setNewNumeral({ ...newNumeral, fecha_cumplimiento: e.target.value })}
                      className="input-field text-xs font-mono bg-slate-950 text-emerald-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase mb-1 text-gray-300">
                      Área Responsable
                    </label>
                    <select
                      value={newNumeral.area}
                      onChange={(e) => setNewNumeral({ ...newNumeral, area: e.target.value })}
                      className="input-field text-xs bg-slate-950 text-indigo-300 font-semibold"
                    >
                      <option value="PM">PM (Product Management)</option>
                      <option value="APLICACIONES">Soporte de Aplicaciones</option>
                      <option value="IT">Infraestructura IT & Redes</option>
                      <option value="SOPORTE">Soporte Técnico / CAST</option>
                      <option value="LOGISTICA">Logística / Despacho</option>
                      <option value="LICITACIONES">Licitaciones / Legal</option>
                      <option value="COMERCIAL">Comercial / Cobros</option>
                      <option value="GI">Gerencia de Integración (GI)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase mb-1 text-gray-300">
                    Comentarios Iniciales de Ejecución / Acta
                  </label>
                  <textarea
                    placeholder="Detalles sobre entregas, estatus con el administrador de contrato o requerimientos especiales..."
                    value={newNumeral.comentarios}
                    onChange={(e) => setNewNumeral({ ...newNumeral, comentarios: e.target.value })}
                    className="input-field resize-none h-16 text-xs bg-slate-950 text-gray-300 font-sans"
                  />
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAddOpen(false)}
                  className="btn-secondary flex-1 py-2.5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary flex-1 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-extrabold shadow-lg shadow-yellow-500/30 text-xs"
                >
                  {creating ? 'Guardando en 3FN...' : 'Guardar Proceso en Base de Datos (3FN)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Presión por Correo */}
      {selectedMilestoneForPressure && (
        <PresionEmailModal
          isOpen={presionModalOpen}
          onClose={() => setPresionModalOpen(false)}
          tarea={selectedMilestoneForPressure}
        />
      )}

      {/* Modal para Ver / Editar Descripción de lo Solicitado */}
      {modalDetalleItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="glass-card w-full max-w-2xl p-6 animate-scale-in border border-teal-500/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-teal-500/20 text-teal-300 text-lg">📋</span>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Descripción de lo Solicitado (Numeral {modalDetalleItem.numeral})
                  </h3>
                  <p className="text-xs text-gray-400">{modalDetalleItem.proceso}</p>
                </div>
              </div>
              <button
                onClick={() => setModalDetalleItem(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-teal-300 uppercase tracking-wider">
                Detalle / Requerimiento Contractual Solicitado:
              </label>
              <textarea
                rows={7}
                value={modalDetalleItem.detalle}
                onChange={(e) => setModalDetalleItem({ ...modalDetalleItem, detalle: e.target.value })}
                placeholder="ej: Equipo automatizado a instalarse en el área de Hematología del Hospital Militar Central con servicio técnico especializado, eficiente para la instalación, mantenimiento correctivo y preventivo según detalle: Equipo en comodato, reciente y en óptimas condiciones."
                className="input-field w-full text-xs font-sans leading-relaxed resize-none p-3"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setModalDetalleItem(null)}
                className="btn-secondary text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  saveDescSolicitada(modalDetalleItem.id, modalDetalleItem.detalle)
                  setModalDetalleItem(null)
                }}
                className="btn-primary text-xs flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-lg shadow-teal-600/30"
              >
                <Save className="w-4 h-4" />
                Guardar Descripción
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Escaneo y Reconocimiento de Notas a Lapicero (OCR & IA) */}
      {ocrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="glass-card w-full max-w-4xl p-6 animate-scale-in max-h-[92vh] flex flex-col border border-emerald-500/30 shadow-2xl">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-500/20 text-emerald-400 border border-emerald-500/40">
                  <ScanLine className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Escáner de Numerales y Anotaciones a Lapicero
                    <span className="badge bg-emerald-500/20 text-emerald-300 text-xs font-mono">IA / OCR Activo</span>
                  </h3>
                  <p className="text-xs text-gray-400">
                    Archivo procesado: <span className="font-mono text-emerald-400 font-semibold">{ocrFileName}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOcrModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido Modal */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {ocrScanning ? (
                <div className="py-16 text-center space-y-4">
                  <div className="relative inline-block">
                    <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mx-auto" />
                    <PenTool className="w-6 h-6 text-emerald-400 absolute inset-0 m-auto animate-bounce" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Analizando trazos de lapicero y numerales...</p>
                    <p className="text-xs text-gray-400 mt-1">Identificando procesos, fechas manuscritas, checks y notas al margen</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Banner de estado de detección */}
                  <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-5 h-5 text-emerald-400" />
                      <div>
                        <span className="text-xs font-bold text-emerald-300">
                          Se detectaron {ocrItems.length} numerales con anotaciones a lapicero
                        </span>
                        <p className="text-[11px] text-gray-400">
                          Revisa la información antes de aplicar las actualizaciones a la matriz del contrato.
                        </p>
                      </div>
                    </div>
                    <label className="btn-secondary !py-1 !px-2.5 text-xs flex items-center gap-1.5 cursor-pointer">
                      <RefreshCw className="w-3.5 h-3.5" />
                      Cambiar archivo
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleFileOcrUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Vista previa y tabla de resultados */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Preview de la imagen/archivo */}
                    {ocrFilePreview && (
                      <div className="md:col-span-1 rounded-xl overflow-hidden border border-white/10 bg-slate-900/60 p-2 flex flex-col">
                        <span className="text-[11px] font-semibold text-gray-400 mb-2 flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> Documento / Foto cargada:
                        </span>
                        <div className="flex-1 rounded-lg overflow-hidden relative border border-white/5 bg-black/40 flex items-center justify-center min-h-[200px]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={ocrFilePreview}
                            alt="Vista previa documento con lapicero"
                            className="object-contain max-h-[260px] w-full rounded-md"
                          />
                        </div>
                      </div>
                    )}

                    {/* Tabla de numerales detectados */}
                    <div className={`${ocrFilePreview ? 'md:col-span-2' : 'md:col-span-3'} space-y-2`}>
                      <span className="text-[11px] font-semibold text-gray-300">
                        Numerales reconocidos y notas manuscritas extraídas:
                      </span>

                      <div className="rounded-xl overflow-hidden border border-white/10 bg-slate-950">
                        <div className="overflow-x-auto max-h-[300px]">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-900 text-gray-300 font-bold border-b border-white/10 text-[11px]">
                                <th className="p-2 w-16 text-center">Numeral</th>
                                <th className="p-2">Proceso / Producto</th>
                                <th className="p-2 w-28">Fecha Extraída</th>
                                <th className="p-2 w-24 text-center">Estado</th>
                                <th className="p-2">Anotación a Lapicero</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {ocrItems.map((item, idx) => (
                                <tr key={item.id} className="hover:bg-white/[0.02]">
                                  <td className="p-2 text-center font-mono font-bold text-yellow-400">
                                    <input
                                      type="text"
                                      value={item.numeral}
                                      onChange={(e) => {
                                        const updated = [...ocrItems]
                                        updated[idx].numeral = e.target.value
                                        setOcrItems(updated)
                                      }}
                                      className="input-field !py-0.5 !px-1 text-center font-mono text-xs w-12"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <input
                                      type="text"
                                      value={item.descripcion}
                                      onChange={(e) => {
                                        const updated = [...ocrItems]
                                        updated[idx].descripcion = e.target.value
                                        setOcrItems(updated)
                                      }}
                                      className="input-field !py-0.5 !px-1 text-xs font-semibold w-full"
                                    />
                                    {item.producto && (
                                      <span className="inline-block mt-1 text-[10px] text-orange-300 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20 font-mono">
                                        🏷️ {item.producto}
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-2">
                                    <input
                                      type="date"
                                      value={item.fecha_cumplimiento}
                                      onChange={(e) => {
                                        const updated = [...ocrItems]
                                        updated[idx].fecha_cumplimiento = e.target.value
                                        setOcrItems(updated)
                                      }}
                                      className="input-field !py-0.5 !px-1 text-[11px] font-mono w-28"
                                    />
                                  </td>
                                  <td className="p-2 text-center">
                                    <select
                                      value={item.estado}
                                      onChange={(e) => {
                                        const updated = [...ocrItems]
                                        updated[idx].estado = e.target.value as EstadoMilestone
                                        setOcrItems(updated)
                                      }}
                                      className="input-field !py-0.5 !px-1 text-[11px]"
                                    >
                                      <option value="Pendiente">Pendiente</option>
                                      <option value="En Progreso">En Progreso</option>
                                      <option value="Completado">Completado</option>
                                      <option value="Bloqueado">Bloqueado</option>
                                    </select>
                                  </td>
                                  <td className="p-2">
                                    <input
                                      type="text"
                                      value={item.comentario}
                                      onChange={(e) => {
                                        const updated = [...ocrItems]
                                        updated[idx].comentario = e.target.value
                                        setOcrItems(updated)
                                      }}
                                      className="input-field !py-0.5 !px-1 text-xs text-amber-300 w-full"
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  {ocrSuccessMsg && (
                    <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center animate-fade-in flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" />
                      {ocrSuccessMsg}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer Modal */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setOcrModalOpen(false)}
                className="btn-secondary text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={ocrScanning || ocrImporting || ocrItems.length === 0}
                onClick={handleApplyOcrItems}
                className="btn-primary text-xs flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-lg shadow-emerald-600/30"
              >
                {ocrImporting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sincronizando numerales...
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    Aplicar {ocrItems.length} Numerales Detectados
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
