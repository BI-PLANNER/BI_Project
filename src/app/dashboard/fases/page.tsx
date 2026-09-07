'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Layers,
  CheckSquare,
  Plus,
  Building2,
  FileText,
  Search,
  Save,
  Trash2,
  Edit3,
  CheckCircle2,
  ChevronDown,
  X,
  Sparkles,
  Calendar,
  Phone,
  User,
  Clock,
  Truck,
  Boxes,
  MapPin,
  AlertOctagon,
  Users
} from 'lucide-react'
import { CONTRATOS_FASES_INICIALES, type ContratoFilaItem } from './contratos_fases_data'

interface ProblematicaResponsableItem {
  id: string
  problematica: string
  responsable: string
}

type FilaContratoFase = ContratoFilaItem

interface HospitalEntregaCol {
  nombre: string
  cantidades: number[]
  total: number
  fechaInstalacion: string
  contacto: string
  persona: string
  horario: string
}

interface MatrizEntregasData {
  licitacion_ref: string
  objeto: string
  codigo_producto: string
  nombre_producto: string
  entregas: {
    num: number
    dias: number
    fechaLimite: string
    fechaApp: string
  }[]
  hospitales: HospitalEntregaCol[]
}

interface ContratoFaseData {
  id: string
  titulo: string
  contrato_num: string
  cliente: string
  filas: FilaContratoFase[]
  matrizEntregas?: MatrizEntregasData
}

interface PendienteFase2Item {
  no: number
  cliente: string
  contrato: string
  situacion: string
  area: string
  responsable: string
  ubicacion: string
  estatus: 'Pendiente' | 'Completado'
  fechaCumplimiento: string
  comentario: string
}

// 28 Registros oficiales de Fase 2 Seguimiento de Pendientes
const PENDIENTES_FASE2_INICIALES: PendienteFase2Item[] = [
  { no: 1, cliente: 'ISSS', contrato: 'SM-022/2024', situacion: 'SISTEMA INFORMATICO', area: 'IT', responsable: 'RICARDO VILLANUEVA', ubicacion: 'LABORATORIO', estatus: 'Pendiente', fechaCumplimiento: '10/8/2026', comentario: 'Se instalara los antivirus a partir del Lunes 10 de agosto' },
  { no: 2, cliente: 'ISBM', contrato: 'CT No AD-014/2026-ISBM', situacion: 'GARANTIA DE FABRICA AUTENTICADO', area: 'COMERCIAL', responsable: 'JULIO CESAR', ubicacion: '', estatus: 'Pendiente', fechaCumplimiento: '10/8/2026', comentario: 'Solicitado a fabrica, pendiente de entrega de las garantías' },
  { no: 3, cliente: 'ISBM', contrato: 'CT No AD-014/2026-ISBM', situacion: 'CONTROLES DE 3ERA OPINION', area: 'COMERCIAL', responsable: 'JULIO CESAR', ubicacion: '', estatus: 'Pendiente', fechaCumplimiento: '24/8/2026', comentario: 'Controles cotizados y comprados, el fabricante lo estaría enviando' },
  { no: 4, cliente: 'ISBM', contrato: 'CT No AD-014/2026-ISBM', situacion: 'CARTA DE AUTORIZACION DEL FABRICANTE', area: 'COMERCIAL', responsable: 'JULIO CESAR', ubicacion: '', estatus: 'Pendiente', fechaCumplimiento: '20/8/2026', comentario: 'Carta con Nombre de LABYMED, se ha solicitado una nueva a fábrica' },
  { no: 5, cliente: 'ISBM', contrato: 'CT No AD-014/2026-ISBM', situacion: 'FUNDAMENTO DE LA PRUEBA CON LOS RANGOS', area: 'APLICACIONES', responsable: 'EDGAR FIGUERO', ubicacion: '', estatus: 'Pendiente', fechaCumplimiento: '10/8/2026', comentario: 'Pendiente elaboración del fundamento de la prueba, fecha tentativa' },
  { no: 6, cliente: 'ISBM', contrato: 'CT No AD-014/2026-ISBM', situacion: 'CAPACITACION AL PERSONAL DE CADA LAB', area: 'APLICACIONES', responsable: 'EDGAR FIGUERO', ubicacion: '', estatus: 'Pendiente', fechaCumplimiento: '17/8/2026', comentario: 'Capacitaciones realizadas se están recopilando firmas de actas' },
  { no: 7, cliente: 'ISBM', contrato: 'CT No AD-014/2026-ISBM', situacion: 'CALENDARIZACION DE MANTENIMIENTOS', area: 'SOPORTE', responsable: 'MOISES HERNANDEZ', ubicacion: '', estatus: 'Pendiente', fechaCumplimiento: '17/8/2026', comentario: 'Actualmente pegados en el área, Se estarían enviando firmados' },
  { no: 8, cliente: 'SAN JUAN DE DIOS DE SANTA ANA', contrato: 'CT No 16/2026', situacion: 'CONTROLES DE 3ERA OPINION', area: 'PM', responsable: 'JUAN JOSE', ubicacion: 'QUÍMICA EMERGENCIA', estatus: 'Pendiente', fechaCumplimiento: '31/8/2026', comentario: 'Controles cotizados y comprados, el fabricante lo estaría enviando' },
  { no: 9, cliente: 'SAN JUAN DE DIOS DE SANTA ANA', contrato: 'CT No 16/2026', situacion: 'CONTROLES DE 3ERA OPINION', area: 'PM', responsable: 'JUAN JOSE', ubicacion: 'QUÍMICA CLÍNICA', estatus: 'Pendiente', fechaCumplimiento: '31/8/2026', comentario: 'Controles cotizados y comprados, el fabricante lo estaría enviando' },
  { no: 10, cliente: 'SAN JUAN DE DIOS DE SANTA ANA', contrato: 'CT No 16/2026', situacion: 'CONTROLES DE 3ERA OPINION', area: 'PM', responsable: 'JULIO CESAR', ubicacion: 'URIANÁLISIS', estatus: 'Pendiente', fechaCumplimiento: '31/8/2026', comentario: 'Controles cotizados y comprados, el fabricante lo estaría enviando' },
  { no: 11, cliente: 'SAN JUAN DE DIOS DE SANTA ANA', contrato: 'CT No 16/2026', situacion: 'REPORTE DE DESECHOS GENERADOS', area: 'PM', responsable: 'JULIO CESAR', ubicacion: 'URIANÁLISIS', estatus: 'Pendiente', fechaCumplimiento: '31/7/2026', comentario: 'Pendiente entrega de fabrica' },
  { no: 12, cliente: 'SAN JUAN DE DIOS DE SANTA ANA', contrato: 'CT No 16/2026', situacion: 'CERTIFICADO DE MANUFACTURA', area: 'PM', responsable: 'JULIO CESAR', ubicacion: 'URIANÁLISIS', estatus: 'Pendiente', fechaCumplimiento: '31/7/2026', comentario: 'Pendiente entrega de fabrica' },
  { no: 13, cliente: 'SAN JUAN DE DIOS DE SANTA ANA', contrato: 'CT No 16/2026', situacion: 'ROTO MOTOR Y ROTOPLAS', area: 'SOPORTE', responsable: 'MOISES HERNANDEZ', ubicacion: 'QUÍMICA EMERGENCIA', estatus: 'Pendiente', fechaCumplimiento: '17/8/2026', comentario: 'Pendiente cotización y compra.' },
  { no: 14, cliente: 'SAN JUAN DE DIOS DE SANTA ANA', contrato: 'CT No 16/2026', situacion: 'ROTO MOTOR Y ROTOPLAS', area: 'SOPORTE', responsable: 'MOISES HERNANDEZ', ubicacion: 'QUÍMICA CLÍNICA', estatus: 'Pendiente', fechaCumplimiento: '17/8/2026', comentario: 'Pendiente cotización y compra.' },
  { no: 15, cliente: 'HOSPITAL NACIONAL BENJAMIN BLOOM', contrato: 'CT 68/2026', situacion: 'MESA PARA EQUIPO CHORUS EVO', area: 'SOPORTE', responsable: 'MOISES HERNANDEZ', ubicacion: 'LABORATORIO', estatus: 'Pendiente', fechaCumplimiento: '17/8/2026', comentario: 'Pendiente cotización y fabricación de mesa para el equipo' },
  { no: 16, cliente: 'HOSPITAL NACIONAL BENJAMIN BLOOM', contrato: 'CT 68/2026', situacion: 'ADECUACION', area: 'SOPORTE', responsable: 'MOISES HERNANDEZ', ubicacion: 'LABORATORIO', estatus: 'Pendiente', fechaCumplimiento: '17/8/2026', comentario: 'Pendiente verificación del lugar para el ingreso del equipo' },
  { no: 17, cliente: 'HOSPITAL SALDAÑA', contrato: 'CT-110/2026', situacion: 'PENDIENTE SISTEMA E INTERFAZ', area: 'PM', responsable: 'JUAN JOSE', ubicacion: 'LABORATORIO', estatus: 'Pendiente', fechaCumplimiento: '17/8/2026', comentario: 'Pendiente correo de la administradora de contrato, mencionando fecha' },
  { no: 18, cliente: 'HOSPITAL MILITAR', contrato: '13-BS-2026', situacion: 'INSCRIPCION DE CONTROL DE CALIDAD 3era Opinión marca Biorad', area: 'PM', responsable: 'JUAN JOSE', ubicacion: 'LABORATORIO', estatus: 'Pendiente', fechaCumplimiento: '31/8/2026', comentario: 'Controles cotizados y comprados, el fabricante lo estaría enviando' },
  { no: 19, cliente: 'HOSPITAL MILITAR', contrato: '13-BS-2026', situacion: 'INSTALACION DE RAPID POINT', area: 'PM', responsable: 'JUAN JOSE', ubicacion: 'LABORATORIO', estatus: 'Pendiente', fechaCumplimiento: '31/8/2026', comentario: 'Pendiente coordinar la fecha para la instalación del equipo' },
  { no: 20, cliente: 'HOSPITAL MILITAR', contrato: '13-BS-2026', situacion: 'PRUEBAS ESPECIALES F200 MARCA: BIOSENSOR', area: 'SOPORTE', responsable: 'MOISES HERNANDEZ', ubicacion: 'LABORATORIO', estatus: 'Pendiente', fechaCumplimiento: '10/8/2026', comentario: 'Pendiente cambio de equipo, por un equipo nuevo, Lic. Feli' },
  { no: 21, cliente: 'HOSPITAL MILITAR', contrato: '13-BS-2026', situacion: '(GASES ARTERIALES) RAPID POINT', area: 'SOPORTE', responsable: 'MOISES HERNANDEZ', ubicacion: 'LABORATORIO', estatus: 'Pendiente', fechaCumplimiento: '17/8/2026', comentario: 'Pendiente compra de mesa para Instalación del equipo' },
  { no: 22, cliente: 'HOSPITAL MILITAR', contrato: '13-BS-2026', situacion: '(GASES ARTERIALES) EPOC MARCA: SIEMENS', area: 'SOPORTE', responsable: 'MOISES HERNANDEZ', ubicacion: 'LABORATORIO', estatus: 'Pendiente', fechaCumplimiento: '17/8/2026', comentario: 'Pendiente Instalación del equipo, además verificar si se requiere mesa' },
  { no: 23, cliente: 'HOSPITAL MILITAR', contrato: '13-BS-2026', situacion: '(ERITROSEDIMENTACIÓN) MINI-CUBE', area: 'APLICACIONES', responsable: 'EDGAR FIGUERO', ubicacion: 'LABORATORIO', estatus: 'Pendiente', fechaCumplimiento: '31/8/2026', comentario: 'Pendiente Capacitación de los controles de calidad internos' },
  { no: 24, cliente: 'HOSPITAL MILITAR', contrato: '13-BS-2026', situacion: 'PRUEBAS ESPECIALES INMMULITE 2000 XPi', area: 'APLICACIONES', responsable: 'EDGAR FIGUERO', ubicacion: 'LABORATORIO', estatus: 'Pendiente', fechaCumplimiento: '31/8/2026', comentario: 'Agregar el manual operativo del equipo a la PC' },
  { no: 25, cliente: 'HOSPITAL MILITAR', contrato: '13-BS-2026', situacion: '(PRUEBAS ESPECIALES) F200 MARCA: SD BIOSENSOR', area: 'APLICACIONES', responsable: 'EDGAR FIGUERO', ubicacion: 'LABORATORIO', estatus: 'Pendiente', fechaCumplimiento: '31/8/2026', comentario: 'Agregar a la PC instalada, agregar el manual operativo del equipo' },
  { no: 26, cliente: 'HOSPITAL MILITAR', contrato: '13-BS-2026', situacion: '(GASES ARTERIALES) RAPID POINT MARCA: SIEMENS', area: 'APLICACIONES', responsable: 'EDGAR FIGUERO', ubicacion: 'LABORATORIO', estatus: 'Pendiente', fechaCumplimiento: '31/8/2026', comentario: 'Al tener la PC instalada, agregar el manual operativo del equipo' },
  { no: 27, cliente: 'HOSPITAL MILITAR', contrato: '13-BS-2026', situacion: '(GASES ARTERIALES) EPOC MARCA: SIEMENS', area: 'APLICACIONES', responsable: 'EDGAR FIGUERO', ubicacion: 'LABORATORIO', estatus: 'Pendiente', fechaCumplimiento: '31/8/2026', comentario: 'Pendiente listado de capacitaciones y entregar manual operativo' },
  { no: 28, cliente: 'HOSPITAL MILITAR', contrato: '13-BS-2026', situacion: 'Sistema de cómputo con interfaz al sistema hospitalario y transmisión de resultados', area: 'IT', responsable: 'RICARDO VILLANUEVA', ubicacion: 'LABORATORIO', estatus: 'Pendiente', fechaCumplimiento: '10/9/2026', comentario: 'Este punto estaría listo hasta que el equipo esté instalado' }
]

// 11 Problemáticas y Responsables exactos de la hoja ACUERDOS
const PROBLEMATICAS_INICIALES: ProblematicaResponsableItem[] = [
  { id: 'p1', problematica: 'COMPRAS LOCALES', responsable: 'GESTORA ADMINISTRATIVA' },
  { id: 'p2', problematica: 'COTIZACION DE INSUMOS TECNICOS', responsable: 'COORDINADORES C.A.S.T' },
  { id: 'p3', problematica: 'COTIZACION DE INSUMOS INFORMATICOS', responsable: 'COORDINADOR DE IT' },
  { id: 'p4', problematica: 'ARMADO DE MESAS Y SILLAS', responsable: 'COORDINADOR DE SOPORTE' },
  { id: 'p5', problematica: 'APOYO PARA ARMADO DE MESAS Y SILLAS', responsable: 'COORDINADOR DE ALMACEN' },
  { id: 'p6', problematica: 'CABLEADO, PUNTOS DE RED, COMPUTADORAS, INTERNET, ANTIVIRUS', responsable: 'COORDINADOR DE IT' },
  { id: 'p7', problematica: 'INFRAESTRUCTURA, ADECUACIONES Y EQUIPO', responsable: 'COORDINADOR DE SOPORTE' },
  { id: 'p8', problematica: 'toda investigacion con el proveedor', responsable: 'PMs' },
  { id: 'p9', problematica: 'coordinacion de instalacion del equipo con los administradores de contrato', responsable: 'PLANER' },
  { id: 'p10', problematica: 'INFORMAR CUANDO SE NECESITE CARTA DE COMPROMISO', responsable: 'DESPACHO' },
  { id: 'p11', problematica: 'REALIZACION DE CARTA DE COMPROMISO', responsable: 'LICITACIONES' }
]

export default function FasesPage() {
  const [problematicas, setProblematicas] = useState<ProblematicaResponsableItem[]>(PROBLEMATICAS_INICIALES)
  const [contratos, setContratos] = useState<ContratoFaseData[]>(CONTRATOS_FASES_INICIALES)
  const [pendientesFase2, setPendientesFase2] = useState<PendienteFase2Item[]>(PENDIENTES_FASE2_INICIALES)
  const [selectedContratoId, setSelectedContratoId] = useState<string>('isss-probnp')
  const [vistaActiva, setVistaActiva] = useState<'PROBLEMATICAS' | 'ENTREGAS_HOSPITAL' | 'NUMERALES_PROCESO' | 'PENDIENTES_FASE2' | 'MATRIZ_RACI'>('MATRIZ_RACI')
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState<'todos' | 'completados' | 'pendientes'>('todos')
  const [filterArea, setFilterArea] = useState('todas')
  const [filterFase2Semaforo, setFilterFase2Semaforo] = useState<'todos' | 'rojo' | 'naranja' | 'verde'>('todos')

  // Modales
  const [modalProblematicaOpen, setModalProblematicaOpen] = useState(false)
  const [editingProblematicaId, setEditingProblematicaId] = useState<string | null>(null)
  const [formProblematica, setFormProblematica] = useState({ problematica: '', responsable: '' })

  const [modalFilaOpen, setModalFilaOpen] = useState(false)
  const [editingFilaId, setEditingFilaId] = useState<string | null>(null)
  const [formFila, setFormFila] = useState({
    seccion: '',
    numeral: '',
    proceso: '',
    ejecucion: '',
    ejecutado: false,
    comentario: '',
    comentarioColor: 'none' as 'yellow' | 'blue' | 'none'
  })

  // Función de cálculo de semáforo por fecha de cumplimiento
  const getFase2Semaforo = (fechaStr: string) => {
    // Formato fechaStr: "10/8/2026", "31/8/2026", "10/9/2026"
    const parts = fechaStr.split('/')
    if (parts.length !== 3) {
      return { color: 'gray', label: 'Sin fecha', badge: 'bg-white/5 text-gray-400' }
    }
    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    const year = parseInt(parts[2], 10)
    const target = new Date(year, month, day)

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    const diffTime = target.getTime() - hoy.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 2) {
      return {
        color: 'rojo',
        dias: diffDays,
        label: diffDays < 0 ? `Vencido (${Math.abs(diffDays)}d)` : diffDays === 0 ? 'Vence hoy' : '1 día (<2d)',
        badge: 'bg-red-500/25 text-red-300 border border-red-500/40 font-bold',
        cellBg: 'bg-red-500/10 text-red-300 font-bold'
      }
    } else if (diffDays <= 6) {
      return {
        color: 'naranja',
        dias: diffDays,
        label: `${diffDays} días (<6d)`,
        badge: 'bg-amber-500/25 text-amber-300 border border-amber-500/40 font-bold',
        cellBg: 'bg-amber-500/15 text-amber-300 font-bold'
      }
    } else {
      return {
        color: 'verde',
        dias: diffDays,
        label: `${diffDays} días (>6d)`,
        badge: 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 font-bold',
        cellBg: 'bg-emerald-500/15 text-emerald-300 font-bold'
      }
    }
  }

  // Contadores de Semáforo
  const f2Rojos = pendientesFase2.filter(p => getFase2Semaforo(p.fechaCumplimiento).color === 'rojo').length
  const f2Naranjas = pendientesFase2.filter(p => getFase2Semaforo(p.fechaCumplimiento).color === 'naranja').length
  const f2Verdes = pendientesFase2.filter(p => getFase2Semaforo(p.fechaCumplimiento).color === 'verde').length

  const filteredPendientesFase2 = pendientesFase2.filter(p => {
    const matchSearch = p.cliente.toLowerCase().includes(search.toLowerCase()) ||
      p.contrato.toLowerCase().includes(search.toLowerCase()) ||
      p.situacion.toLowerCase().includes(search.toLowerCase()) ||
      p.responsable.toLowerCase().includes(search.toLowerCase()) ||
      p.comentario.toLowerCase().includes(search.toLowerCase())

    const matchArea = filterArea === 'todas' || p.area === filterArea
    const sem = getFase2Semaforo(p.fechaCumplimiento)
    const matchSemaforo = filterFase2Semaforo === 'todos' || sem.color === filterFase2Semaforo

    return matchSearch && matchArea && matchSemaforo
  })

  const supabase = createClient()

  // Cargar estado inicial y datos 3FN desde Supabase
  useEffect(() => {
    try {
      const savedProb = localStorage.getItem('control_planner_problematicas')
      if (savedProb) setProblematicas(JSON.parse(savedProb))

      const savedContratos = localStorage.getItem('control_planner_fases_contratos')
      if (savedContratos) setContratos(JSON.parse(savedContratos))
    } catch (e) {
      console.warn('LocalStorage error:', e)
    }

    // Cargar Incidencias de Fase 2 en tiempo real desde Supabase (3FN)
    const loadIncidencias3FN = async () => {
      try {
        const { data: dbIncidencias } = await supabase
          .from('incidencias_seguimiento')
          .select('incidencia_id, fecha_cumplimiento, comentario, cliente:clientes(nombre_cliente), contrato:contratos(numero_contrato), situacion:situaciones(nombre_situacion), persona:personas(nombre_completo, area:areas(nombre_area)), ubicacion:ubicaciones(nombre_ubicacion), estatus:estatus_proceso(nombre_estatus)')
          .order('incidencia_id')

        if (dbIncidencias && dbIncidencias.length > 0) {
          const mapped: PendienteFase2Item[] = dbIncidencias.map((item: any, idx: number) => {
            let fechaFmt = ''
            if (item.fecha_cumplimiento) {
              const [y, m, d] = item.fecha_cumplimiento.split('-')
              fechaFmt = `${parseInt(d, 10)}/${parseInt(m, 10)}/${y}`
            }
            return {
              id: `f2-${item.incidencia_id}`,
              no: idx + 1,
              cliente: item.cliente?.nombre_cliente || 'ISSS',
              contrato: item.contrato?.numero_contrato || 'SM-022/2024',
              situacion: item.situacion?.nombre_situacion || 'SISTEMA INFORMATICO',
              area: item.persona?.area?.nombre_area || 'IT',
              responsable: item.persona?.nombre_completo || 'RICARDO VILLANUEVA',
              ubicacion: item.ubicacion?.nombre_ubicacion || '-',
              estatus: item.estatus?.nombre_estatus === 'COMPLETADO' ? 'Completado' : 'Pendiente',
              fechaCumplimiento: fechaFmt,
              comentario: item.comentario || ''
            }
          })
          setPendientesFase2(mapped)
        }
      } catch (e) {
        console.warn('Error loading 3FN incidencias:', e)
      }
    }
    loadIncidencias3FN()
  }, [supabase])

  const saveProblematicas = (newItems: ProblematicaResponsableItem[]) => {
    setProblematicas(newItems)
    try {
      localStorage.setItem('control_planner_problematicas', JSON.stringify(newItems))
    } catch (e) {
      console.error(e)
    }
  }

  const saveContratos = (newItems: ContratoFaseData[]) => {
    setContratos(newItems)
    try {
      localStorage.setItem('control_planner_fases_contratos', JSON.stringify(newItems))
    } catch (e) {
      console.error(e)
    }
  }

  const currentContrato = contratos.find(c => c.id === selectedContratoId) || contratos[0]

  // Handlers Problemáticas
  const handleOpenAddProblematica = () => {
    setEditingProblematicaId(null)
    setFormProblematica({ problematica: '', responsable: '' })
    setModalProblematicaOpen(true)
  }

  const handleOpenEditProblematica = (item: ProblematicaResponsableItem) => {
    setEditingProblematicaId(item.id)
    setFormProblematica({ problematica: item.problematica, responsable: item.responsable })
    setModalProblematicaOpen(true)
  }

  const handleSaveProblematica = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formProblematica.problematica || !formProblematica.responsable) return

    if (editingProblematicaId) {
      const updated = problematicas.map(p =>
        p.id === editingProblematicaId ? { ...p, problematica: formProblematica.problematica, responsable: formProblematica.responsable } : p
      )
      saveProblematicas(updated)
    } else {
      const nuevo: ProblematicaResponsableItem = {
        id: `p_${Date.now()}`,
        problematica: formProblematica.problematica,
        responsable: formProblematica.responsable
      }
      saveProblematicas([...problematicas, nuevo])
    }
    setModalProblematicaOpen(false)
  }

  const handleDeleteProblematica = (id: string) => {
    if (confirm('¿Deseas eliminar esta problemática de la matriz?')) {
      saveProblematicas(problematicas.filter(p => p.id !== id))
    }
  }

  // Toggle checkbox "Completed"
  const toggleCompleted = (filaId: string) => {
    const updated = contratos.map(c => {
      if (c.id === currentContrato.id) {
        return {
          ...c,
          filas: c.filas.map(f => f.id === filaId ? { ...f, ejecutado: !f.ejecutado } : f)
        }
      }
      return c
    })
    saveContratos(updated)
  }

  const secciones = Array.from(new Set(currentContrato.filas.map(f => f.seccion)))
  const totalFilas = currentContrato.filas.length
  const completadas = currentContrato.filas.filter(f => f.ejecutado).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 animate-fade-in">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Fase 2 Seguimiento de Pendientes
            </h1>
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Matriz de problemáticas y responsables, entregas escalonadas y seguimiento por número de contrato
          </p>
        </div>

        {/* Botón de Acción Principal */}
        {vistaActiva === 'PROBLEMATICAS' && (
          <button
            onClick={handleOpenAddProblematica}
            className="btn-primary text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
          >
            <Plus className="w-3.5 h-3.5" />
            + Agregar Problemática / Responsable
          </button>
        )}
      </div>

      {/* Selector de Modos de Vista */}
      <div className="flex flex-wrap rounded-xl bg-white/5 p-1 border border-white/10 w-fit gap-1">
        <button
          type="button"
          onClick={() => setVistaActiva('MATRIZ_RACI')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
            vistaActiva === 'MATRIZ_RACI'
              ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-amber-300" />
          👥 Matriz RACI & Roles Reales (Lenny, Roberto, Luis, Juan José)
        </button>
        <button
          type="button"
          onClick={() => setVistaActiva('PENDIENTES_FASE2')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
            vistaActiva === 'PENDIENTES_FASE2'
              ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Fase 2: Seguimiento de Pendientes ({pendientesFase2.length})
        </button>
        <button
          type="button"
          onClick={() => setVistaActiva('PROBLEMATICAS')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
            vistaActiva === 'PROBLEMATICAS'
              ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          Problemáticas & Responsables ({problematicas.length})
        </button>
        <button
          type="button"
          onClick={() => setVistaActiva('ENTREGAS_HOSPITAL')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
            vistaActiva === 'ENTREGAS_HOSPITAL'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          Matriz de Entregas por Contrato (LC26DM0050)
        </button>
        <button
          type="button"
          onClick={() => setVistaActiva('NUMERALES_PROCESO')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
            vistaActiva === 'NUMERALES_PROCESO'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          Numerales & Procesos (Completed)
        </button>
      </div>

      {/* 0. VISTA MATRIZ RACI & ROLES REALES (LENNY, ROBERTO, LUIS, JUAN JOSÉ) */}
      {vistaActiva === 'MATRIZ_RACI' && (
        <div className="space-y-6 animate-fade-in">
          {/* Tarjetas de Usuarios Reales y Funciones Exclusivas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Lenny Gómez (Planner) */}
            <div className="glass-card p-5 border-l-4 border-l-amber-400 border-white/10 hover:border-amber-400/50 transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="badge bg-amber-400/20 text-amber-300 font-mono text-[10px] font-bold">⚡ PLANNER</span>
                <span className="text-[10px] text-gray-400">LabAndMed</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Lenny Gómez</h3>
                <p className="text-xs text-amber-300 font-semibold">Planificador Estratégico & Control</p>
              </div>
              <div className="text-xs text-gray-300 space-y-1.5 pt-2 border-t border-white/5">
                <p className="font-bold text-gray-100">🔒 Controles Exclusivos:</p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-gray-300">
                  <li>Planificación Inversa & Fechas Máximas</li>
                  <li>Semaforización de Cumplimiento</li>
                  <li>Disparador de Presión por Correo</li>
                  <li>Supervisión y Validación en Acta</li>
                </ul>
              </div>
            </div>

            {/* Roberto Batres (Planner) */}
            <div className="glass-card p-5 border-l-4 border-l-amber-400 border-white/10 hover:border-amber-400/50 transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="badge bg-amber-400/20 text-amber-300 font-mono text-[10px] font-bold">⚡ PLANNER</span>
                <span className="text-[10px] text-gray-400">LabAndMed</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Roberto Batres</h3>
                <p className="text-xs text-amber-300 font-semibold">Planificación Operativa & Supervisión</p>
              </div>
              <div className="text-xs text-gray-300 space-y-1.5 pt-2 border-t border-white/5">
                <p className="font-bold text-gray-100">🔒 Controles Exclusivos:</p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-gray-300">
                  <li>Generación de Tickets y Plazos</li>
                  <li>Auditoría de Entregas Escalonadas</li>
                  <li>Validación de Avances Completed</li>
                  <li>Seguimiento de Garantías de Fábrica</li>
                </ul>
              </div>
            </div>

            {/* Luis Orellana (Gerente) */}
            <div className="glass-card p-5 border-l-4 border-l-indigo-500 border-white/10 hover:border-indigo-400/50 transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="badge bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-bold">👑 GERENCIA</span>
                <span className="text-[10px] text-gray-400">Dirección</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Luis Orellana</h3>
                <p className="text-xs text-indigo-300 font-semibold">Gerente General</p>
              </div>
              <div className="text-xs text-gray-300 space-y-1.5 pt-2 border-t border-white/5">
                <p className="font-bold text-gray-100">🔒 Controles Exclusivos:</p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-gray-300">
                  <li>Aprobación Final de Presupuestos</li>
                  <li>Desbloqueo de Proyectos en Riesgo</li>
                  <li>Autorización de Excepciones Legales</li>
                  <li>Cierre y Facturación de Contrato</li>
                </ul>
              </div>
            </div>

            {/* Juan José Fuentes Rodríguez (PM) */}
            <div className="glass-card p-5 border-l-4 border-l-emerald-500 border-white/10 hover:border-emerald-400/50 transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="badge bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">🎯 PROJECT MANAGER</span>
                <span className="text-[10px] text-gray-400">Operaciones</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Juan José Fuentes R.</h3>
                <p className="text-xs text-emerald-300 font-semibold">Project Manager (PM)</p>
              </div>
              <div className="text-xs text-gray-300 space-y-1.5 pt-2 border-t border-white/5">
                <p className="font-bold text-gray-100">🔒 Controles Exclusivos:</p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-gray-300">
                  <li>Alta de Numerales (+ Agregar Proceso)</li>
                  <li>Redacción de Descripción Solicitada</li>
                  <li>Asignación de Especialistas de Campo</li>
                  <li>Coordinación de Reactivos y Entregas</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Matriz RACI Oficial de LabAndMed */}
          <div className="glass-card overflow-hidden border border-indigo-500/30 shadow-2xl">
            <div className="p-4 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/80 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  Matriz RACI de Cumplimiento Contractual
                </h2>
                <p className="text-xs text-gray-300">
                  Definición estricta de Roles: <span className="text-red-400 font-bold">R</span> (Responsable Ejecutor), <span className="text-amber-300 font-bold">A</span> (Accountable/Aprobador Único), <span className="text-blue-300 font-bold">C</span> (Consultado Técnico), <span className="text-emerald-300 font-bold">I</span> (Informado).
                </p>
              </div>

              {/* Leyenda RACI */}
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/40">R = Responsible</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">A = Accountable</span>
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/40">C = Consulted</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">I = Informed</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 text-gray-200 uppercase tracking-wider font-extrabold border-b border-white/10">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4 min-w-[240px]">Etapa / Control Contractual</th>
                    <th className="py-3 px-3 text-center bg-indigo-950/60 text-indigo-200 border-l border-white/10">
                      👑 Gerente<br/><span className="text-[10px] font-normal text-indigo-300">Luis Orellana</span>
                    </th>
                    <th className="py-3 px-3 text-center bg-amber-950/60 text-amber-200 border-l border-white/10">
                      ⚡ Planners<br/><span className="text-[10px] font-normal text-amber-300">Lenny / Roberto</span>
                    </th>
                    <th className="py-3 px-3 text-center bg-emerald-950/60 text-emerald-200 border-l border-white/10">
                      🎯 PM<br/><span className="text-[10px] font-normal text-emerald-300">Juan José Fuentes</span>
                    </th>
                    <th className="py-3 px-3 text-center border-l border-white/10">
                      🛠️ Soporte Téc.<br/><span className="text-[10px] font-normal text-gray-400">Moisés H.</span>
                    </th>
                    <th className="py-3 px-3 text-center border-l border-white/10">
                      🧪 Aplicaciones<br/><span className="text-[10px] font-normal text-gray-400">Edgar / Andrea</span>
                    </th>
                    <th className="py-3 px-3 text-center border-l border-white/10">
                      💻 IT / Red LIS<br/><span className="text-[10px] font-normal text-gray-400">Ricardo V.</span>
                    </th>
                    <th className="py-3 px-3 text-center border-l border-white/10">
                      📦 Logística<br/><span className="text-[10px] font-normal text-gray-400">Juan Carlos P.</span>
                    </th>
                    <th className="py-3 px-3 text-center border-l border-white/10">
                      💼 Comercial<br/><span className="text-[10px] font-normal text-gray-400">Dennis / Vanesa</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    { no: 1, etapa: 'Revisión de Bases y Adjudicación de Contrato', luis: 'A', planners: 'C', pm: 'R', soporte: 'C', apps: 'C', it: 'C', log: 'I', com: 'R' },
                    { no: 2, etapa: 'Planificación Inversa y Fijación de Fechas Máximas', luis: 'I', planners: 'A', pm: 'R', soporte: 'C', apps: 'C', it: 'C', log: 'C', com: 'I' },
                    { no: 3, etapa: 'Alta de Numerales y Descripción de lo Solicitado', luis: 'I', planners: 'C', pm: 'A', soporte: 'R', apps: 'R', it: 'R', log: 'R', com: 'C' },
                    { no: 4, etapa: 'Adecuación Eléctrica, Clima, Mesas y Respaldo UPS', luis: 'I', planners: 'I', pm: 'A', soporte: 'R', apps: 'I', it: 'C', log: 'I', com: 'I' },
                    { no: 5, etapa: 'Despacho, Transporte e Instalación de Equipos', luis: 'I', planners: 'I', pm: 'A', soporte: 'R', apps: 'I', it: 'C', log: 'R', com: 'I' },
                    { no: 6, etapa: 'Controles de Calidad, Tercera Opinión e Insertos', luis: 'I', planners: 'I', pm: 'A', soporte: 'I', apps: 'R', it: 'I', log: 'C', com: 'C' },
                    { no: 7, etapa: 'Conexión a Red, Cableado e Interfaz LIS / Computo', luis: 'I', planners: 'I', pm: 'A', soporte: 'C', apps: 'C', it: 'R', log: 'I', com: 'I' },
                    { no: 8, etapa: 'Capacitación al Personal y Recopilación de Firmas', luis: 'I', planners: 'I', pm: 'A', soporte: 'C', apps: 'R', it: 'I', log: 'I', com: 'I' },
                    { no: 9, etapa: 'Supervisión en Acta y Presión por Vencimientos', luis: 'I', planners: 'A', pm: 'R', soporte: 'I', apps: 'I', it: 'I', log: 'I', com: 'I' },
                    { no: 10, etapa: 'Aprobación Final, Cobros y Cierre Gerencial', luis: 'A', planners: 'I', pm: 'C', soporte: 'I', apps: 'I', it: 'I', log: 'I', com: 'R' },
                  ].map((row) => (
                    <tr key={row.no} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-2.5 px-4 text-center font-mono font-bold text-gray-400">{row.no}</td>
                      <td className="py-2.5 px-4 font-semibold text-gray-100">{row.etapa}</td>
                      
                      {/* Luis Orellana */}
                      <td className="py-2.5 px-3 text-center border-l border-white/5 bg-indigo-950/20">
                        <span className={`px-2.5 py-1 rounded-md font-extrabold font-mono text-xs ${
                          row.luis === 'A' ? 'bg-amber-400 text-black shadow-md' :
                          row.luis === 'R' ? 'bg-red-500 text-white shadow-md' :
                          row.luis === 'C' ? 'bg-blue-500/20 text-blue-300' : 'bg-white/5 text-gray-500'
                        }`}>{row.luis}</span>
                      </td>

                      {/* Lenny / Roberto */}
                      <td className="py-2.5 px-3 text-center border-l border-white/5 bg-amber-950/20">
                        <span className={`px-2.5 py-1 rounded-md font-extrabold font-mono text-xs ${
                          row.planners === 'A' ? 'bg-amber-400 text-black shadow-md' :
                          row.planners === 'R' ? 'bg-red-500 text-white shadow-md' :
                          row.planners === 'C' ? 'bg-blue-500/20 text-blue-300' : 'bg-white/5 text-gray-500'
                        }`}>{row.planners}</span>
                      </td>

                      {/* Juan José Fuentes */}
                      <td className="py-2.5 px-3 text-center border-l border-white/5 bg-emerald-950/20">
                        <span className={`px-2.5 py-1 rounded-md font-extrabold font-mono text-xs ${
                          row.pm === 'A' ? 'bg-amber-400 text-black shadow-md' :
                          row.pm === 'R' ? 'bg-red-500 text-white shadow-md' :
                          row.pm === 'C' ? 'bg-blue-500/20 text-blue-300' : 'bg-white/5 text-gray-500'
                        }`}>{row.pm}</span>
                      </td>

                      {/* Soporte */}
                      <td className="py-2.5 px-3 text-center border-l border-white/5">
                        <span className={`px-2.5 py-1 rounded-md font-extrabold font-mono text-xs ${
                          row.soporte === 'A' ? 'bg-amber-400 text-black' :
                          row.soporte === 'R' ? 'bg-red-500 text-white font-bold' :
                          row.soporte === 'C' ? 'bg-blue-500/20 text-blue-300' : 'bg-white/5 text-gray-500'
                        }`}>{row.soporte}</span>
                      </td>

                      {/* Apps */}
                      <td className="py-2.5 px-3 text-center border-l border-white/5">
                        <span className={`px-2.5 py-1 rounded-md font-extrabold font-mono text-xs ${
                          row.apps === 'A' ? 'bg-amber-400 text-black' :
                          row.apps === 'R' ? 'bg-red-500 text-white font-bold' :
                          row.apps === 'C' ? 'bg-blue-500/20 text-blue-300' : 'bg-white/5 text-gray-500'
                        }`}>{row.apps}</span>
                      </td>

                      {/* IT */}
                      <td className="py-2.5 px-3 text-center border-l border-white/5">
                        <span className={`px-2.5 py-1 rounded-md font-extrabold font-mono text-xs ${
                          row.it === 'A' ? 'bg-amber-400 text-black' :
                          row.it === 'R' ? 'bg-red-500 text-white font-bold' :
                          row.it === 'C' ? 'bg-blue-500/20 text-blue-300' : 'bg-white/5 text-gray-500'
                        }`}>{row.it}</span>
                      </td>

                      {/* Logística */}
                      <td className="py-2.5 px-3 text-center border-l border-white/5">
                        <span className={`px-2.5 py-1 rounded-md font-extrabold font-mono text-xs ${
                          row.log === 'A' ? 'bg-amber-400 text-black' :
                          row.log === 'R' ? 'bg-red-500 text-white font-bold' :
                          row.log === 'C' ? 'bg-blue-500/20 text-blue-300' : 'bg-white/5 text-gray-500'
                        }`}>{row.log}</span>
                      </td>

                      {/* Comercial */}
                      <td className="py-2.5 px-3 text-center border-l border-white/5">
                        <span className={`px-2.5 py-1 rounded-md font-extrabold font-mono text-xs ${
                          row.com === 'A' ? 'bg-amber-400 text-black' :
                          row.com === 'R' ? 'bg-red-500 text-white font-bold' :
                          row.com === 'C' ? 'bg-blue-500/20 text-blue-300' : 'bg-white/5 text-gray-500'
                        }`}>{row.com}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 1. VISTA EXACTA DE "PROBLEMATICAS | RESPONSABLE" */}
      {vistaActiva === 'PROBLEMATICAS' && (
        <div className="space-y-4 animate-fade-in">
          <div className="glass-card overflow-hidden border border-yellow-400/30 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-yellow-400 text-black font-extrabold text-sm uppercase tracking-wider">
                    <th className="py-3 px-6 border-r border-black/20 w-3/5">PROBLEMATICAS</th>
                    <th className="py-3 px-6 border-r border-black/20 text-center w-2/5">RESPONSABLE</th>
                    <th className="py-3 px-3 w-16 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-sm">
                  {problematicas.map((item, idx) => (
                    <tr
                      key={item.id}
                      className="hover:bg-white/[0.04] transition-colors"
                    >
                      {/* Problemática */}
                      <td className="py-3.5 px-6 font-semibold text-gray-100 uppercase tracking-wide border-r border-white/5">
                        {item.problematica}
                      </td>

                      {/* Responsable */}
                      <td className="py-3.5 px-6 text-center font-bold text-yellow-300 uppercase tracking-wider border-r border-white/5">
                        <span className="badge bg-yellow-400/15 text-yellow-300 text-xs px-3 py-1 font-mono">
                          {item.responsable}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditProblematica(item)}
                            className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white"
                            title="Editar"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProblematica(item.id)}
                            className="p-1.5 rounded hover:bg-red-500/10 text-gray-400 hover:text-red-400"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. VISTA MATRIZ DE ENTREGAS Y CENTROS DE ATENCIÓN (LC26DM0050) */}
      {vistaActiva === 'ENTREGAS_HOSPITAL' && currentContrato.matrizEntregas && (
        <div className="space-y-6 animate-fade-in">
          {/* Selector de Contratos en Fases */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {contratos.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedContratoId(c.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  c.id === currentContrato.id
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="font-mono font-bold text-amber-300">{c.contrato_num}</span>
                <span>| {c.cliente.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          <div className="glass-card overflow-hidden border border-emerald-500/30 shadow-2xl">
            <div className="bg-emerald-950/80 px-6 py-4 border-b border-emerald-500/40 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">
                  {currentContrato.cliente.toUpperCase()}
                </p>
                <h3 className="text-base font-bold text-white">
                  {currentContrato.matrizEntregas.licitacion_ref}
                </h3>
                <p className="text-xs text-emerald-300/80 italic mt-0.5">
                  {currentContrato.matrizEntregas.objeto}
                </p>
              </div>

              <div className="text-right">
                <span className="badge bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold px-3 py-1">
                  CÓDIGO: {currentContrato.matrizEntregas.codigo_producto}
                </span>
                <p className="text-xs font-bold text-white mt-1">
                  {currentContrato.matrizEntregas.nombre_producto}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-emerald-900/60 text-white font-bold text-center border-b border-emerald-700/50">
                    <th className="py-2.5 px-3 border-r border-emerald-700/50 w-16" rowSpan={2}>ENTREGA</th>
                    <th className="py-2.5 px-3 border-r border-emerald-700/50 w-16" rowSpan={2}>DÍAS</th>
                    <th className="py-2 px-3 border-r border-emerald-700/50" colSpan={currentContrato.matrizEntregas.hospitales.length}>
                      CENTROS DE ATENCIÓN (HOSPITALES Y BANCO DE SANGRE)
                    </th>
                    <th className="py-2.5 px-3 border-r border-emerald-700/50 w-24 bg-emerald-800/80" rowSpan={2}>TOTAL POR ENTREGA</th>
                    <th className="py-2.5 px-3 border-r border-emerald-700/50 w-28 bg-amber-950/60 text-amber-300" rowSpan={2}>FECHA LÍMITE DE ENTREGA</th>
                    <th className="py-2.5 px-3 w-28 bg-orange-950/60 text-orange-300" rowSpan={2}>FECHAS PARA PONER EN LA APP</th>
                  </tr>
                  <tr className="bg-emerald-900/40 text-emerald-200 font-semibold text-center border-b border-emerald-700/50">
                    {currentContrato.matrizEntregas.hospitales.map((h, idx) => (
                      <th key={idx} className="py-2 px-3 border-r border-emerald-700/50 text-[11px] whitespace-nowrap">
                        {h.nombre}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-emerald-900/30 text-gray-200">
                  {currentContrato.matrizEntregas.entregas.map((ent, eIdx) => {
                    const totalFila = currentContrato.matrizEntregas!.hospitales.reduce(
                      (acc, curr) => acc + (curr.cantidades[eIdx] || 0), 0
                    )
                    return (
                      <tr key={eIdx} className="hover:bg-white/[0.02] text-center font-mono">
                        <td className="py-2.5 px-3 font-bold text-white bg-white/[0.02] border-r border-white/5">
                          {ent.num}
                        </td>
                        <td className="py-2.5 px-3 text-emerald-400 font-bold border-r border-white/5">
                          {ent.dias}
                        </td>
                        {currentContrato.matrizEntregas!.hospitales.map((h, hIdx) => (
                          <td key={hIdx} className="py-2.5 px-3 border-r border-white/5 text-gray-100">
                            {h.cantidades[eIdx]}
                          </td>
                        ))}
                        <td className="py-2.5 px-3 font-bold text-emerald-300 bg-emerald-500/10 border-r border-white/5">
                          {totalFila.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-amber-300 font-semibold bg-amber-500/5 border-r border-white/5">
                          {ent.fechaLimite}
                        </td>
                        <td className="py-2.5 px-3 text-orange-300 font-semibold bg-orange-500/5">
                          {ent.fechaApp}
                        </td>
                      </tr>
                    )
                  })}

                  <tr className="bg-emerald-950/80 font-bold text-center border-t-2 border-emerald-500">
                    <td colSpan={2} className="py-3 px-3 text-right uppercase text-emerald-300 tracking-wider border-r border-emerald-700/50">
                      TOTAL GENERAL:
                    </td>
                    {currentContrato.matrizEntregas.hospitales.map((h, idx) => (
                      <td key={idx} className="py-3 px-3 text-white border-r border-emerald-700/50 text-sm">
                        {h.total.toLocaleString()}
                      </td>
                    ))}
                    <td className="py-3 px-3 text-base text-emerald-400 bg-emerald-600/30 border-r border-emerald-700/50 font-black">
                      {currentContrato.matrizEntregas.hospitales.reduce((a, b) => a + b.total, 0).toLocaleString()}
                    </td>
                    <td colSpan={2} className="bg-black/20"></td>
                  </tr>

                  <tr className="bg-emerald-900/20 text-center font-semibold">
                    <td colSpan={2} className="py-2.5 px-3 text-right uppercase text-emerald-400 border-r border-emerald-700/50">
                      📅 INSTALACIÓN:
                    </td>
                    {currentContrato.matrizEntregas.hospitales.map((h, idx) => (
                      <td key={idx} className="py-2.5 px-3 text-emerald-300 bg-emerald-500/20 font-bold border-r border-emerald-700/50">
                        {h.fechaInstalacion}
                      </td>
                    ))}
                    <td colSpan={3} className="bg-black/20"></td>
                  </tr>

                  <tr className="bg-black/20 text-center font-mono">
                    <td colSpan={2} className="py-2.5 px-3 text-right uppercase text-gray-400 border-r border-white/5">
                      📞 CONTACTO:
                    </td>
                    {currentContrato.matrizEntregas.hospitales.map((h, idx) => (
                      <td key={idx} className="py-2.5 px-3 text-cyan-300 border-r border-white/5">
                        {h.contacto}
                      </td>
                    ))}
                    <td colSpan={3} className="bg-black/20"></td>
                  </tr>

                  <tr className="bg-black/10 text-center">
                    <td colSpan={2} className="py-2.5 px-3 text-right uppercase text-gray-400 border-r border-white/5">
                      👤 PERSONA:
                    </td>
                    {currentContrato.matrizEntregas.hospitales.map((h, idx) => (
                      <td key={idx} className="py-2.5 px-3 text-white font-medium border-r border-white/5">
                        {h.persona}
                      </td>
                    ))}
                    <td colSpan={3} className="bg-black/20"></td>
                  </tr>

                  <tr className="bg-white/[0.01] text-center text-[10px]">
                    <td colSpan={2} className="py-2 px-3 text-right uppercase text-gray-400 border-r border-white/5">
                      ⏰ CONDICIÓN:
                    </td>
                    {currentContrato.matrizEntregas.hospitales.map((h, idx) => (
                      <td key={idx} className="py-2 px-3 text-yellow-300 italic border-r border-white/5">
                        {h.horario}
                      </td>
                    ))}
                    <td colSpan={3} className="bg-black/20"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. VISTA NUMERALES & PROCESOS CON CHECKLIST "COMPLETED" */}
      {vistaActiva === 'NUMERALES_PROCESO' && (
        <div className="space-y-6 animate-fade-in">
          {/* Selector de Contratos */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {contratos.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedContratoId(c.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  c.id === currentContrato.id
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="font-mono font-bold text-amber-300">{c.contrato_num}</span>
                <span>| {c.cliente.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {secciones.map((seccionNombre, sIdx) => {
            const filasSeccion = currentContrato.filas.filter(f => f.seccion === seccionNombre)
            if (filasSeccion.length === 0) return null

            return (
              <div key={sIdx} className="glass-card overflow-hidden border border-white/10 shadow-xl">
                <div className="bg-gradient-to-r from-yellow-500/20 via-yellow-500/10 to-transparent px-5 py-3 border-b border-yellow-500/30 flex items-center justify-between">
                  <h3 className="font-bold text-sm text-yellow-300 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                    {seccionNombre}
                  </h3>
                  <span className="text-xs text-yellow-300/80 font-mono">
                    {filasSeccion.filter(f => f.ejecutado).length}/{filasSeccion.length} completados
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-yellow-400 text-black font-extrabold text-xs uppercase tracking-wider">
                        <th className="py-2.5 px-4 border-r border-yellow-500/40 w-24 text-center">Numeral</th>
                        <th className="py-2.5 px-4 border-r border-yellow-500/40">Proceso</th>
                        <th className="py-2.5 px-4 border-r border-yellow-500/40 w-44 text-center">Ejecución</th>
                        <th className="py-2.5 px-4 border-r border-yellow-500/40 w-36 text-center">Ejecutado</th>
                        <th className="py-2.5 px-4">Comentario</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs">
                      {filasSeccion.map((fila) => {
                        let comentarioBg = 'text-gray-300'
                        const comStr = (fila.comentario || '').toLowerCase()
                        if (fila.comentarioColor === 'yellow' || comStr.includes('pendiente')) {
                          comentarioBg = 'bg-yellow-400 text-black font-bold px-2 py-1 rounded inline-block shadow'
                        } else if (fila.comentarioColor === 'blue' || comStr.includes('cobros') || comStr.includes('entregar')) {
                          comentarioBg = 'bg-sky-200 text-sky-950 font-bold px-2 py-1 rounded inline-block shadow'
                        }

                        return (
                          <tr
                            key={fila.id}
                            className={`hover:bg-white/[0.03] transition-colors ${
                              fila.ejecutado ? 'bg-emerald-500/[0.02]' : ''
                            }`}
                          >
                            <td className="py-2.5 px-4 text-center font-mono font-bold text-yellow-400/90 border-r border-white/5">
                              {fila.numeral}
                            </td>
                            <td className="py-2.5 px-4 font-semibold text-gray-100 border-r border-white/5">
                              {fila.proceso}
                            </td>
                            <td className="py-2.5 px-4 text-center border-r border-white/5">
                              <span className="badge bg-indigo-500/15 text-indigo-300 text-[11px] font-semibold">
                                {fila.ejecucion}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-center border-r border-white/5">
                              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={fila.ejecutado}
                                  onChange={() => toggleCompleted(fila.id)}
                                  className="w-4 h-4 rounded border-gray-600 text-indigo-500 focus:ring-indigo-500 cursor-pointer accent-indigo-500"
                                />
                                <span className={`text-xs font-medium ${fila.ejecutado ? 'text-emerald-400 font-semibold' : 'text-gray-500'}`}>
                                  Completed
                                </span>
                              </label>
                            </td>
                            <td className="py-2.5 px-4">
                              {fila.comentario ? (
                                <span className={comentarioBg}>{fila.comentario}</span>
                              ) : (
                                <span className="text-gray-600 italic">-</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* MODAL AGREGAR / EDITAR PROBLEMÁTICA */}
      {modalProblematicaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-md p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {editingProblematicaId ? 'Editar Problemática' : 'Agregar Problemática / Responsable'}
              </h3>
              <button onClick={() => setModalProblematicaOpen(false)} className="p-1 rounded-lg hover:bg-white/5 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProblematica} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">
                  Problemática / Tarea Clave *
                </label>
                <input
                  type="text"
                  placeholder="ej: COMPRAS LOCALES O ADECUACIÓN DE EQUIPO"
                  value={formProblematica.problematica}
                  onChange={(e) => setFormProblematica({ ...formProblematica, problematica: e.target.value })}
                  className="input-field uppercase text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">
                  Responsable *
                </label>
                <input
                  type="text"
                  placeholder="ej: GESTORA ADMINISTRATIVA / COORDINADOR DE IT / PMs"
                  value={formProblematica.responsable}
                  onChange={(e) => setFormProblematica({ ...formProblematica, responsable: e.target.value })}
                  className="input-field uppercase text-xs"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalProblematicaOpen(false)}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingProblematicaId ? 'Guardar Cambios' : 'Agregar a Matriz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
