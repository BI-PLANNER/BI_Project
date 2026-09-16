'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Building2,
  FileText,
  User,
  Layers,
  Filter,
  Search,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  CalendarDays,
  X,
  ListFilter,
  Eye,
  AlertCircle,
  Tag,
  Briefcase,
  HelpCircle,
  TrendingUp,
  MapPin,
  RefreshCw,
  Users,
  ArrowRightLeft,
  Edit3,
  UserCheck,
  UserPlus,
  PieChart as PieIcon
} from 'lucide-react'
import PresionEmailModal from '@/components/PresionEmailModal'
import ReasignarResponsableModal from '@/components/ReasignarResponsableModal'
import ReporteDetalladoLicitaciones from '@/components/ReporteDetalladoLicitaciones'

export interface IncidenciaEvento {
  id: string | number
  item_num?: number
  incidencia_id: number
  fecha_cumplimiento: string // YYYY-MM-DD
  contrato_id?: number
  numero_contrato: string
  nombre_contrato?: string
  cliente: string
  tipo_pendiente: 'CONTRATO' | 'VISITA - LUIS' | string
  situacion: string
  responsable: string
  responsableEmail?: string
  area: 'LOGISTICA' | 'APLICACIONES' | 'PM' | 'GI' | 'SOPORTE' | 'IT' | 'LICITACIONES' | string
  ubicacion?: string
  estatus: string // 'Rojo' | 'Anaranjado' | 'Verde' | 'COMPLETADO'
  comentario?: string
}

// 26 Pendientes Oficiales de Licitaciones (Mapeo Exacto según Matriz de Excel del Usuario)
export const MASTER_LICITACIONES_PENDIENTES: IncidenciaEvento[] = [
  {
    id: 1,
    item_num: 1,
    incidencia_id: 1,
    cliente: 'HOSPITAL BLOOM',
    numero_contrato: 'N° 68/2026',
    tipo_pendiente: 'CONTRATO',
    situacion: 'Sistema informatico SIS',
    area: 'IT',
    responsable: 'RICARDO VILLANUEVA',
    responsableEmail: 'ricardo.villanueva@lm-sv.com',
    ubicacion: 'LABORATORIO',
    fecha_cumplimiento: '2026-08-31',
    comentario: 'MINSAL no comparte la prueeba y no la puden poner a nuestro perfil, comentan que aún tienen reactivo del otro equipo, ya se le pidió a Juan José que pida la plantilla para adelantar, no hay fecha de instalación debido a que no dieron fecha de fin de reactivo',
    estatus: 'Rojo'
  },
  {
    id: 2,
    item_num: 2,
    incidencia_id: 2,
    cliente: 'HOSPITAL MILITAR',
    numero_contrato: '13-BS-2026',
    tipo_pendiente: 'CONTRATO',
    situacion: '(ERITROSEDIMENTACIÓN) MINI-CUBE',
    area: 'APLICACIONES',
    responsable: 'EDGAR FIGUERO',
    responsableEmail: 'edgar.figueroa@lm-sv.com',
    ubicacion: 'LABORATORIO',
    fecha_cumplimiento: '2029-09-16',
    comentario: 'Pendiente Capacitación de los controles de calidad internos a través de las reglas de Westgard, grafica de Levey Jennigs (Proporcionar lista con firma de los participantes) y agregar manual operativo a la computadora',
    estatus: 'Verde'
  },
  {
    id: 3,
    item_num: 3,
    incidencia_id: 3,
    cliente: 'HOSPITAL MILITAR',
    numero_contrato: '13-BS-2026',
    tipo_pendiente: 'CONTRATO',
    situacion: '(GASES ARTERIALES) RAPID POINT  MARCA: SIEMENS',
    area: 'APLICACIONES',
    responsable: 'EDGAR FIGUERO',
    responsableEmail: 'edgar.figueroa@lm-sv.com',
    ubicacion: 'LABORATORIO',
    fecha_cumplimiento: '2029-09-16',
    comentario: 'Al tener la PC instalada, agregar el manual operativo del equipo, Pendiente Capacitación, proporcionar listado con firma de los participantes (Esto se realizara hasta tener el equipo instalado)',
    estatus: 'Verde'
  },
  {
    id: 4,
    item_num: 4,
    incidencia_id: 4,
    cliente: 'HOSPITAL MILITAR',
    numero_contrato: '13-BS-2026',
    tipo_pendiente: 'CONTRATO',
    situacion: '(GASES ARTERIALES) EPOC   MARCA: SIEMENS',
    area: 'APLICACIONES',
    responsable: 'EDGAR FIGUERO',
    responsableEmail: 'edgar.figueroa@lm-sv.com',
    ubicacion: 'LABORATORIO',
    fecha_cumplimiento: '2029-09-16',
    comentario: 'pendiente listado de capacitaciones y entregar manual operativo o agregarse a la PC.',
    estatus: 'Verde'
  },
  {
    id: 5,
    item_num: 5,
    incidencia_id: 5,
    cliente: 'HOSPITAL MILITAR',
    numero_contrato: '13-BS-2026',
    tipo_pendiente: 'CONTRATO',
    situacion: 'INSCRIPCION DE CONTROL DE CALIDAD 3era Opinión marca Biorad',
    area: 'APLICACIONES',
    responsable: 'EDGAR FIGUERO',
    responsableEmail: 'edgar.figueroa@lm-sv.com',
    ubicacion: 'LABORATORIO',
    fecha_cumplimiento: '2026-09-16',
    comentario: 'Pendiente capacitacion del proveedor',
    estatus: 'Verde'
  },
  {
    id: 6,
    item_num: 6,
    incidencia_id: 6,
    cliente: 'HOSPITAL MILITAR',
    numero_contrato: '13-BS-2026',
    tipo_pendiente: 'CONTRATO',
    situacion: 'INSTALACION DE RAPID POINT',
    area: 'PM',
    responsable: 'JUAN JOSE',
    responsableEmail: 'juan.jose@lm-sv.com',
    ubicacion: 'LABORATORIO',
    fecha_cumplimiento: '2026-09-16',
    comentario: 'Pendiente coordinar la fecha para la instalación del equipo con el Administrador.',
    estatus: 'Verde'
  },
  {
    id: 7,
    item_num: 7,
    incidencia_id: 7,
    cliente: 'HOSPITAL MILITAR',
    numero_contrato: '13-BS-2026',
    tipo_pendiente: 'CONTRATO',
    situacion: '(GASES ARTERIALES) RAPID POINT',
    area: 'SOPORTE',
    responsable: 'MOISES HERNANDEZ',
    responsableEmail: 'moises.hernandez@lm-sv.com',
    ubicacion: 'LABORATORIO',
    fecha_cumplimiento: '2026-09-30',
    comentario: 'Se hará la compra de la mesa al tener fecha de instalación',
    estatus: 'Verde'
  },
  {
    id: 8,
    item_num: 8,
    incidencia_id: 8,
    cliente: 'HOSPITAL MILITAR',
    numero_contrato: '13-BS-2026',
    tipo_pendiente: 'CONTRATO',
    situacion: 'Sistema de cómputo con interfaz al sistema hospitalario y transmisión de resultados',
    area: 'IT',
    responsable: 'RICARDO VILLANUEVA',
    responsableEmail: 'ricardo.villanueva@lm-sv.com',
    ubicacion: 'LABORATORIO',
    fecha_cumplimiento: '2026-09-16',
    comentario: '(este punto estaría listo hasta que el equipo este instalado pendiente confirmación del administrador de contrato',
    estatus: 'Verde'
  },
  {
    id: 9,
    item_num: 9,
    incidencia_id: 9,
    cliente: 'HOSPITAL SALDAÑA',
    numero_contrato: 'CT-110/2026',
    tipo_pendiente: 'CONTRATO',
    situacion: 'PENDIENTE SISTEMA E INTERFAS:',
    area: 'PM',
    responsable: 'JUAN JOSE',
    responsableEmail: 'juan.jose@lm-sv.com',
    ubicacion: 'LABORATORIO',
    fecha_cumplimiento: '2026-08-17',
    comentario: 'Pendiente correo del a administradora de contrato, mencionando que no es necesario la interfas para respaldo',
    estatus: 'Rojo'
  },
  {
    id: 10,
    item_num: 10,
    incidencia_id: 10,
    cliente: 'ISBM',
    numero_contrato: 'CT No AD-014/2026-ISBM',
    tipo_pendiente: 'CONTRATO',
    situacion: 'GARANTIA DE FABRICA AUTENTICADO',
    area: 'PM',
    responsable: 'JULIO CESAR',
    responsableEmail: 'julio.cesar@lm-sv.com',
    ubicacion: '',
    fecha_cumplimiento: '2026-08-10',
    comentario: 'Solicitado a fabrica, pendiente de entrega de las garantias',
    estatus: 'Rojo'
  },
  {
    id: 11,
    item_num: 11,
    incidencia_id: 11,
    cliente: 'ISBM',
    numero_contrato: 'CT No AD-014/2026-ISBM',
    tipo_pendiente: 'CONTRATO',
    situacion: 'CONTROLES DE 3ERA OPINION',
    area: 'APLICACIONES',
    responsable: 'EDGAR FIGUERO',
    responsableEmail: 'edgar.figueroa@lm-sv.com',
    ubicacion: '',
    fecha_cumplimiento: '2026-09-16',
    comentario: 'Pendiente capacitacion del proveedor',
    estatus: 'Verde'
  },
  {
    id: 12,
    item_num: 12,
    incidencia_id: 12,
    cliente: 'ISBM',
    numero_contrato: 'CT No AD-014/2026-ISBM',
    tipo_pendiente: 'CONTRATO',
    situacion: 'CARTA DE AUTORIZACION DEL FABRICANTE',
    area: 'PM',
    responsable: 'JULIO CESAR',
    responsableEmail: 'julio.cesar@lm-sv.com',
    ubicacion: '',
    fecha_cumplimiento: '2026-08-20',
    comentario: 'Carta con Nombre de LABYMED, se ha solicitado una nueva carta de distribución al fabricante EXIAS, solicitado con Andrea nueva carta de autorizacion del fabricante, pendiente la traduccion legal',
    estatus: 'Rojo'
  },
  {
    id: 13,
    item_num: 13,
    incidencia_id: 13,
    cliente: 'ISSS',
    numero_contrato: 'SM-022/2024',
    tipo_pendiente: 'CONTRATO',
    situacion: 'SISTEMA INFORMATICO',
    area: 'IT',
    responsable: 'RICARDO VILLANUEVA',
    responsableEmail: 'ricardo.villanueva@lm-sv.com',
    ubicacion: 'LABORATORIO',
    fecha_cumplimiento: '2026-09-10',
    comentario: 'Se instalara los antivirus a partir del Lunes 10 de agosto , pendiente la compra de los antivirus',
    estatus: 'Anaranjado'
  },
  {
    id: 14,
    item_num: 14,
    incidencia_id: 14,
    cliente: 'SAN JUAN DE DIOS DE SANTA ANA',
    numero_contrato: 'CT No 16/2026',
    tipo_pendiente: 'VISITA - LUIS',
    situacion: 'MEJORAR Y CREAR UNA NUEVA ORDEN DE ENTREGA AL CLIENTE',
    area: 'LOGISTICA',
    responsable: 'DIEGO POLANCO',
    responsableEmail: 'diego.polanco@lm-sv.com',
    ubicacion: 'LOGISTICA',
    fecha_cumplimiento: '2026-09-04',
    comentario: 'En la orden de entrega los bloques de productos deben ser identificados fisicamente por factura y asi mejorar el tiempo de revision de entrega al cliente asi como tiempos de entrega de despacho - se entregara 15 de septiembre',
    estatus: 'Rojo'
  },
  {
    id: 15,
    item_num: 15,
    incidencia_id: 15,
    cliente: 'SAN JUAN DE DIOS DE SANTA ANA',
    numero_contrato: 'CT No 16/2026',
    tipo_pendiente: 'VISITA - LUIS',
    situacion: 'BUSCAR METODOLOGIA DE REVISION INTERNA EN DESPACHO',
    area: 'LOGISTICA',
    responsable: 'DIEGO POLANCO',
    responsableEmail: 'diego.polanco@lm-sv.com',
    ubicacion: 'LOGISTICA',
    fecha_cumplimiento: '2026-09-04',
    comentario: 'Garantizar que lo que se enviará corresponda a lo solicitado -se entregara 15 de septiembre',
    estatus: 'Rojo'
  },
  {
    id: 16,
    item_num: 16,
    incidencia_id: 16,
    cliente: 'SAN JUAN DE DIOS DE SANTA ANA',
    numero_contrato: 'CT No 16/2026',
    tipo_pendiente: 'VISITA - LUIS',
    situacion: 'ENTREGA DE PRUEBA FERRITINA',
    area: 'LOGISTICA',
    responsable: 'JUAN JOSE',
    responsableEmail: 'juan.jose@lm-sv.com',
    ubicacion: 'LOGISTICA',
    fecha_cumplimiento: '2026-09-04',
    comentario: 'Coordinacion de la logistica de Ferritina para importar de los países de COL o CR, para una reaccion mas inmediata',
    estatus: 'Rojo'
  },
  {
    id: 17,
    item_num: 17,
    incidencia_id: 17,
    cliente: 'SAN JUAN DE DIOS DE SANTA ANA',
    numero_contrato: 'CT No 16/2026',
    tipo_pendiente: 'CONTRATO',
    situacion: 'CONTROLES DE 3ERA OPINION',
    area: 'APLICACIONES',
    responsable: 'EDGAR FIGUERO',
    responsableEmail: 'edgar.figueroa@lm-sv.com',
    ubicacion: 'QUÍMICA EMERGENCIA',
    fecha_cumplimiento: '2026-09-16',
    comentario: 'Pendiente capacitacion del proveedor',
    estatus: 'Verde'
  },
  {
    id: 18,
    item_num: 18,
    incidencia_id: 18,
    cliente: 'SAN JUAN DE DIOS DE SANTA ANA',
    numero_contrato: 'CT No 16/2026',
    tipo_pendiente: 'CONTRATO',
    situacion: 'CONTROLES DE 3ERA OPINION',
    area: 'APLICACIONES',
    responsable: 'EDGAR FIGUERO',
    responsableEmail: 'edgar.figueroa@lm-sv.com',
    ubicacion: 'QUÍMICA CLÍNICA',
    fecha_cumplimiento: '2026-09-16',
    comentario: 'Pendiente capacitacion del proveedor',
    estatus: 'Verde'
  },
  {
    id: 19,
    item_num: 19,
    incidencia_id: 19,
    cliente: 'SAN JUAN DE DIOS DE SANTA ANA',
    numero_contrato: 'CT No 16/2026',
    tipo_pendiente: 'VISITA - LUIS',
    situacion: 'CREACION DE PLAN DE CONTINGENCIA PARA EL PROCESAMIENOT DE PRUEBAS DE FERRITINA',
    area: 'PM',
    responsable: 'JUAN JOSE',
    responsableEmail: 'juan.jose@lm-sv.com',
    ubicacion: 'QUIMICA',
    fecha_cumplimiento: '2026-09-04',
    comentario: 'Pendiente ingrese a bodega para coordinar entrega',
    estatus: 'Rojo'
  },
  {
    id: 20,
    item_num: 20,
    incidencia_id: 20,
    cliente: 'SAN JUAN DE DIOS DE SANTA ANA',
    numero_contrato: 'CT No 16/2026',
    tipo_pendiente: 'VISITA - LUIS',
    situacion: 'REVISAR REACTIVOS PENDIENTES DE ENTREGA PARA LA 1ER Y 2DA. ENTREGA',
    area: 'PM',
    responsable: 'JUAN JOSE',
    responsableEmail: 'juan.jose@lm-sv.com',
    ubicacion: 'QUIMICA',
    fecha_cumplimiento: '2026-08-31',
    comentario: '',
    estatus: 'Rojo'
  },
  {
    id: 21,
    item_num: 21,
    incidencia_id: 21,
    cliente: 'SAN JUAN DE DIOS DE SANTA ANA',
    numero_contrato: 'CT No 16/2026',
    tipo_pendiente: 'CONTRATO',
    situacion: 'CONTROLES DE 3ERA OPINION',
    area: 'APLICACIONES',
    responsable: 'EDGAR FIGUERO',
    responsableEmail: 'edgar.figueroa@lm-sv.com',
    ubicacion: 'URIANÁLISIS',
    fecha_cumplimiento: '2029-09-16',
    comentario: 'Pendiente capacitacion del proveedor',
    estatus: 'Verde'
  },
  {
    id: 22,
    item_num: 22,
    incidencia_id: 22,
    cliente: 'SAN JUAN DE DIOS DE SANTA ANA',
    numero_contrato: 'CT No 16/2026',
    tipo_pendiente: 'VISITA - LUIS',
    situacion: 'APROBACION DE PRESUPUESTO DE  TRASLADO DE BOMBA POR PARTE DE TERCERO Y CREACION DEL SISTEMA TIPO CISTERNA',
    area: 'GI',
    responsable: 'LUIS ORELLANA',
    responsableEmail: 'luis.orellana@lm-sv.com',
    ubicacion: 'QUIMICA HOSPITALIZACION',
    fecha_cumplimiento: '2026-09-16',
    comentario: 'Se validará al realizar la visita por parte del tercero',
    estatus: 'Verde'
  },
  {
    id: 23,
    item_num: 23,
    incidencia_id: 23,
    cliente: 'SAN JUAN DE DIOS DE SANTA ANA',
    numero_contrato: 'CT No 16/2026',
    tipo_pendiente: 'CONTRATO',
    situacion: 'ROTO MOTOR y ROTOPLAS',
    area: 'SOPORTE',
    responsable: 'MOISES HERNANDEZ',
    responsableEmail: 'moises.hernandez@lm-sv.com',
    ubicacion: 'QUÍMICA CLÍNICA',
    fecha_cumplimiento: '2026-09-15',
    comentario: 'Proveedor cambio la fecha de visita técnica al sabado 29/08',
    estatus: 'Verde'
  },
  {
    id: 24,
    item_num: 24,
    incidencia_id: 24,
    cliente: 'SAN JUAN DE DIOS DE SANTA ANA',
    numero_contrato: 'CT No 16/2026',
    tipo_pendiente: 'VISITA - LUIS',
    situacion: 'ENTREGA DE AMPOS',
    area: 'LICITACIONES',
    responsable: 'ROBERTO BATRES',
    responsableEmail: 'roberto.batres@lm-sv.com',
    ubicacion: 'HOSPITAL',
    fecha_cumplimiento: '2026-09-16',
    comentario: 'Se entregaron los calendarios de mantenimientos, la entrega de los ampos se concluira hasta tener la documentación pendiente de DIRUI por parte de Julio Velasco',
    estatus: 'Verde'
  },
  {
    id: 25,
    item_num: 25,
    incidencia_id: 25,
    cliente: 'SAN JUAN DE DIOS DE SANTA ANA',
    numero_contrato: 'CT No 16/2026',
    tipo_pendiente: 'VISITA - LUIS',
    situacion: 'CREACION Y COMPRA DE STICKERS DE LOS EQUIPOS',
    area: 'LICITACIONES',
    responsable: 'ROBERTO BATRES / KAREN',
    responsableEmail: 'roberto.batres@lm-sv.com',
    ubicacion: 'HOSPITAL',
    fecha_cumplimiento: '2026-09-16',
    comentario: 'Ya se compartio una imagen de esta solicud para crearla con los formatos de L&M, Pendiente cotización',
    estatus: 'Verde'
  },
  {
    id: 26,
    item_num: 26,
    incidencia_id: 26,
    cliente: 'SAN JUAN DE DIOS DE SANTA ANA',
    numero_contrato: 'CT No 16/2026',
    tipo_pendiente: 'VISITA - LUIS',
    situacion: 'CREACIÓN DE GUIA DE USUARIO',
    area: 'APLICACIONES',
    responsable: 'EDGAR FIGUERO',
    responsableEmail: 'edgar.figueroa@lm-sv.com',
    ubicacion: 'HOSPITAL',
    fecha_cumplimiento: '2029-09-16',
    comentario: 'Creación de Guia de usuario para los Equipo FUS Y ATELLICA',
    estatus: 'Verde'
  }
]

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

// Temas y Paletas Visuales por Cliente
const CONTRATO_THEMES: Record<string, { bg: string, border: string, text: string, badge: string, dot: string }> = {
  'ISSS': { bg: 'bg-blue-950/70', border: 'border-blue-500/40', text: 'text-blue-200', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30', dot: 'bg-blue-400' },
  'ISBM': { bg: 'bg-purple-950/70', border: 'border-purple-500/40', text: 'text-purple-200', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30', dot: 'bg-purple-400' },
  'SAN JUAN DE DIOS DE SANTA ANA': { bg: 'bg-amber-950/70', border: 'border-amber-500/40', text: 'text-amber-200', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30', dot: 'bg-amber-400' },
  'HOSPITAL SAN JUAN DE DIOS DE SANTA ANA': { bg: 'bg-amber-950/70', border: 'border-amber-500/40', text: 'text-amber-200', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30', dot: 'bg-amber-400' },
  'HOSPITAL MILITAR': { bg: 'bg-emerald-950/70', border: 'border-emerald-500/40', text: 'text-emerald-200', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-400' },
  'HOSPITAL BLOOM': { bg: 'bg-pink-950/70', border: 'border-pink-500/40', text: 'text-pink-200', badge: 'bg-pink-500/20 text-pink-300 border-pink-500/30', dot: 'bg-pink-400' },
  'HOSPITAL SALDAÑA': { bg: 'bg-cyan-950/70', border: 'border-cyan-500/40', text: 'text-cyan-200', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', dot: 'bg-cyan-400' }
}

const DEFAULT_THEME = { bg: 'bg-slate-900/80', border: 'border-indigo-500/30', text: 'text-indigo-200', badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', dot: 'bg-indigo-400' }

export default function PlannerCalendarPage() {
  const supabase = createClient()

  // Default Calendar set to Septiembre 2026 (donde caen la mayoría de plazos de Licitaciones)
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 8, 1))
  const [incidencias, setIncidencias] = useState<IncidenciaEvento[]>(MASTER_LICITACIONES_PENDIENTES)
  const [loading, setLoading] = useState(false)

  // Filters / Slicers
  const [selectedArea, setSelectedArea] = useState<string>('todos')
  const [selectedContrato, setSelectedContrato] = useState<string>('todos')
  const [selectedTipoPendiente, setSelectedTipoPendiente] = useState<string>('todos')
  const [selectedResponsable, setSelectedResponsable] = useState<string>('todos')
  const [selectedSemaforo, setSelectedSemaforo] = useState<string>('todos')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'CALENDARIO' | 'MATRIZ_PLAZOS' | 'REPORTE'>('CALENDARIO')
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)

  // Modales
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ date: string, events: IncidenciaEvento[] } | null>(null)
  const [selectedDetail, setSelectedDetail] = useState<IncidenciaEvento | null>(null)
  const [editingTask, setEditingTask] = useState<IncidenciaEvento | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [successToast, setSuccessToast] = useState<string | null>(null)

  // Presion Modal
  const [presionModalOpen, setPresionModalOpen] = useState(false)
  const [selectedTaskForPressure, setSelectedTaskForPressure] = useState<{
    id: string
    descripcion: string
    responsableNombre: string
    responsableEmail: string
    responsableRol: string
    proyectoNombre: string
    cliente: string
    fechaCumplimiento: string
    diasRestantes: number
    numeral?: string
  } | null>(null)

  const handleOpenEdit = (task: IncidenciaEvento) => {
    setEditingTask(task)
    setIsEditModalOpen(true)
  }

  const handleSaveReasignacion = (updatedTask: IncidenciaEvento) => {
    setIncidencias(prev =>
      prev.map(item =>
        (item.id === updatedTask.id || item.incidencia_id === updatedTask.incidencia_id)
          ? updatedTask
          : item
      )
    )

    // Si habia un detalle abierto, actualizarlo
    if (selectedDetail && (selectedDetail.id === updatedTask.id || selectedDetail.incidencia_id === updatedTask.incidencia_id)) {
      setSelectedDetail(updatedTask)
    }

    // Si habia un dia abierto, actualizar su lista de eventos
    if (selectedDayEvents) {
      setSelectedDayEvents({
        ...selectedDayEvents,
        events: selectedDayEvents.events.map(ev =>
          (ev.id === updatedTask.id || ev.incidencia_id === updatedTask.incidencia_id)
            ? updatedTask
            : ev
        )
      })
    }

    setSuccessToast(`¡Hito #${updatedTask.item_num || updatedTask.id} reasignado exitosamente a ${updatedTask.responsable}!`)
    setTimeout(() => setSuccessToast(null), 4500)
  }

  // Load from Supabase with fallback to Master Data
  const loadIncidencias = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('incidencias_seguimiento')
        .select(`
          incidencia_id,
          fecha_cumplimiento,
          comentario,
          cliente:clientes(nombre_cliente),
          contrato:contratos(contrato_id, numero_contrato, nombre_contrato),
          situacion:situaciones(nombre_situacion),
          persona:personas(persona_id, nombre_completo, email, area:areas(nombre_area)),
          estatus:estatus(nombre_estatus)
        `)
        .order('fecha_cumplimiento')

      if (!error && data && data.length > 0) {
        const enriched = data.map((d: any, idx: number) => {
          const matchingMaster = MASTER_LICITACIONES_PENDIENTES.find(
            m => m.comentario === d.comentario || m.fecha_cumplimiento === d.fecha_cumplimiento
          )

          return {
            id: d.incidencia_id || idx + 1,
            item_num: matchingMaster?.item_num || idx + 1,
            incidencia_id: d.incidencia_id || idx + 1,
            fecha_cumplimiento: d.fecha_cumplimiento || matchingMaster?.fecha_cumplimiento || '',
            contrato_id: d.contrato?.contrato_id,
            numero_contrato: d.contrato?.numero_contrato || matchingMaster?.numero_contrato || 'Contrato Oficial',
            nombre_contrato: d.contrato?.nombre_contrato || matchingMaster?.nombre_contrato || '',
            cliente: d.cliente?.nombre_cliente || matchingMaster?.cliente || 'Institución',
            tipo_pendiente: matchingMaster?.tipo_pendiente || (d.comentario?.includes('visita') ? 'VISITA - LUIS' : 'CONTRATO'),
            situacion: d.situacion?.nombre_situacion || matchingMaster?.situacion || 'Obligación Contractual',
            responsable: d.persona?.nombre_completo || matchingMaster?.responsable || 'Sin Asignar',
            responsableEmail: d.persona?.email || matchingMaster?.responsableEmail || 'responsable@lm-sv.com',
            area: matchingMaster?.area || d.persona?.area?.nombre_area || 'PM',
            estatus: d.estatus?.nombre_estatus || matchingMaster?.estatus || 'Rojo',
            comentario: d.comentario || matchingMaster?.comentario || ''
          }
        })
        setIncidencias(enriched)
      } else {
        setIncidencias(MASTER_LICITACIONES_PENDIENTES)
      }
    } catch (e) {
      console.warn('Fallback to Master Licitaciones Data:', e)
      setIncidencias(MASTER_LICITACIONES_PENDIENTES)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadIncidencias()
  }, [loadIncidencias])

  // Semáforo Calculation & Classification
  const getSemaforoInfo = (fechaStr: string, estatus: string) => {
    const est = (estatus || '').toLowerCase()
    if (est === 'completado') {
      return {
        color: 'completado',
        label: 'Completado',
        badgeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
        dotClass: 'bg-emerald-400'
      }
    }

    if (est === 'rojo') {
      return {
        color: 'rojo',
        label: 'Crítico / Vencido',
        badgeClass: 'bg-red-500/25 text-red-300 border border-red-500/40 font-bold',
        dotClass: 'bg-red-400 animate-pulse'
      }
    }

    if (est === 'anaranjado' || est === 'naranja') {
      return {
        color: 'naranja',
        label: 'Próximo',
        badgeClass: 'bg-amber-500/25 text-amber-300 border border-amber-500/40 font-bold',
        dotClass: 'bg-amber-400'
      }
    }

    if (est === 'verde') {
      return {
        color: 'verde',
        label: 'En Plazo',
        badgeClass: 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 font-bold',
        dotClass: 'bg-emerald-400'
      }
    }

    if (!fechaStr) {
      return {
        color: 'gris',
        label: 'Sin fecha',
        badgeClass: 'bg-white/5 text-gray-400 border border-white/10',
        dotClass: 'bg-gray-400'
      }
    }

    const target = new Date(fechaStr)
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const diff = Math.ceil((target.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))

    if (diff < 2) {
      return {
        color: 'rojo',
        label: diff < 0 ? `Vencido (${Math.abs(diff)}d)` : diff === 0 ? 'Vence hoy' : '1 día (<2d)',
        badgeClass: 'bg-red-500/25 text-red-300 border border-red-500/40 font-bold',
        dotClass: 'bg-red-400 animate-pulse'
      }
    } else if (diff <= 6) {
      return {
        color: 'naranja',
        label: `${diff} días`,
        badgeClass: 'bg-amber-500/25 text-amber-300 border border-amber-500/40 font-bold',
        dotClass: 'bg-amber-400'
      }
    } else {
      return {
        color: 'verde',
        label: `${diff} días`,
        badgeClass: 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 font-bold',
        dotClass: 'bg-emerald-400'
      }
    }
  }

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return incidencias.filter(item => {
      const matchArea = selectedArea === 'todos' || item.area === selectedArea
      const matchContrato = selectedContrato === 'todos' || item.cliente === selectedContrato || item.numero_contrato === selectedContrato
      const matchTipo = selectedTipoPendiente === 'todos' || item.tipo_pendiente === selectedTipoPendiente
      const matchResp = selectedResponsable === 'todos' || item.responsable === selectedResponsable
      const sem = getSemaforoInfo(item.fecha_cumplimiento, item.estatus)
      const matchSemaforo = selectedSemaforo === 'todos' || sem.color === selectedSemaforo

      const q = searchQuery.toLowerCase()
      const matchSearch = !searchQuery ||
        item.situacion.toLowerCase().includes(q) ||
        item.area.toLowerCase().includes(q) ||
        item.numero_contrato.toLowerCase().includes(q) ||
        item.cliente.toLowerCase().includes(q) ||
        item.responsable.toLowerCase().includes(q) ||
        item.tipo_pendiente.toLowerCase().includes(q) ||
        item.comentario?.toLowerCase().includes(q)

      return matchArea && matchContrato && matchTipo && matchResp && matchSemaforo && matchSearch
    })
  }, [incidencias, selectedArea, selectedContrato, selectedTipoPendiente, selectedResponsable, selectedSemaforo, searchQuery])

  // Unique Lists for Dropdown Slicers
  const uniqueAreas = useMemo(() => ['APLICACIONES', 'PM', 'IT', 'LOGISTICA', 'LICITACIONES', 'SOPORTE', 'GI'], [])
  const uniqueClientes = useMemo(() => Array.from(new Set(incidencias.map(i => i.cliente))).filter(Boolean), [incidencias])
  const uniqueResponsables = useMemo(() => Array.from(new Set(incidencias.map(i => i.responsable))).filter(Boolean), [incidencias])

  // Counts for KPI Semáforo & Áreas
  const countRojo = useMemo(() => incidencias.filter(i => getSemaforoInfo(i.fecha_cumplimiento, i.estatus).color === 'rojo').length, [incidencias])
  const countNaranja = useMemo(() => incidencias.filter(i => getSemaforoInfo(i.fecha_cumplimiento, i.estatus).color === 'naranja').length, [incidencias])
  const countVerde = useMemo(() => incidencias.filter(i => getSemaforoInfo(i.fecha_cumplimiento, i.estatus).color === 'verde').length, [incidencias])
  const countAplicaciones = useMemo(() => incidencias.filter(i => i.area === 'APLICACIONES').length, [incidencias])
  const countPM = useMemo(() => incidencias.filter(i => i.area === 'PM').length, [incidencias])
  const countLogistica = useMemo(() => incidencias.filter(i => i.area === 'LOGISTICA').length, [incidencias])

  // Calendar Grid Calculation
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)

    let startingDayOfWeek = firstDayOfMonth.getDay() - 1
    if (startingDayOfWeek === -1) startingDayOfWeek = 6

    const totalDaysInMonth = lastDayOfMonth.getDate()
    const days: { dateStr: string, dayNumber: number, isCurrentMonth: boolean, events: IncidenciaEvento[] }[] = []

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    const prevYear = month === 0 ? year - 1 : year
    const prevMonthIdx = month === 0 ? 11 : month - 1
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i
      const dateStr = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
      const dayEvents = filteredEvents.filter(e => e.fecha_cumplimiento === dateStr)
      days.push({ dateStr, dayNumber: dayNum, isCurrentMonth: false, events: dayEvents })
    }

    // Current month days
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      const dayEvents = filteredEvents.filter(e => e.fecha_cumplimiento === dateStr)
      days.push({ dateStr, dayNumber: i, isCurrentMonth: true, events: dayEvents })
    }

    // Next month padding
    const remaining = (7 - (days.length % 7)) % 7
    const nextYear = month === 11 ? year + 1 : year
    const nextMonthIdx = month === 11 ? 0 : month + 1
    for (let i = 1; i <= remaining; i++) {
      const dateStr = `${nextYear}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      const dayEvents = filteredEvents.filter(e => e.fecha_cumplimiento === dateStr)
      days.push({ dateStr, dayNumber: i, isCurrentMonth: false, events: dayEvents })
    }

    return days
  }, [year, month, filteredEvents])

  // Handlers
  const handleOpenPresion = (item: IncidenciaEvento) => {
    setSelectedTaskForPressure({
      id: String(item.id),
      descripcion: item.situacion,
      responsableNombre: item.responsable,
      responsableEmail: item.responsableEmail || 'responsable@lm-sv.com',
      responsableRol: item.area,
      proyectoNombre: `${item.numero_contrato} (${item.cliente})`,
      cliente: item.cliente,
      fechaCumplimiento: item.fecha_cumplimiento,
      diasRestantes: 0,
      numeral: item.item_num ? `Item #${item.item_num}` : undefined
    })
    setPresionModalOpen(true)
  }

  return (
    <div className="space-y-6 animate-fade-in p-2 sm:p-4">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-violet-600/20 text-indigo-400 border border-indigo-500/30 shadow-xl shadow-indigo-500/10">
              <CalendarDays className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                Panel del Planner — Control de Licitaciones por Área & Responsable
                <span className="badge bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold">FASE 2</span>
              </h1>
              <p className="text-xs text-gray-400">
                Seguimiento operativo de obligaciones de Licitaciones asignadas a Aplicaciones, PM, Logística, IT, Soporte y GI.
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher and Month Navigation */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Month Jumper (Agosto / Septiembre 2026) */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-white/10 text-xs">
            <button
              onClick={() => setCurrentDate(new Date(2026, 7, 1))}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                month === 7 && year === 2026 ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              📅 Agosto 2026
            </button>
            <button
              onClick={() => setCurrentDate(new Date(2026, 8, 1))}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition border cursor-pointer ${
                month === 8 && year === 2026
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                  : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
              }`}
            >
              📅 Septiembre 2026
            </button>

            {/* Botón de Acceso Directo al Reporte Detallado con Gráficas de Pastel */}
            <button
              onClick={() => setActiveTab('REPORTE')}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black border border-emerald-400/40 text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-600/25 cursor-pointer ml-1 animate-pulse hover:animate-none"
              title="Abrir Informe Ejecutivo con Gráficas de Pastel y Reporte Completo"
            >
              <PieIcon className="w-3.5 h-3.5 text-emerald-200" />
              <span>📊 Gráficas de Pastel & Reporte</span>
            </button>
          </div>

          {/* Month / Year Controller */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-indigo-500/30 shadow-xl">
            <button
              onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-indigo-600 text-gray-300 hover:text-white transition cursor-pointer"
              title="Mes anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <select
              value={month}
              onChange={(e) => setCurrentDate(new Date(year, parseInt(e.target.value, 10), 1))}
              className="bg-slate-950 text-white font-bold text-xs rounded-xl px-2.5 py-1.5 border border-white/10 outline-none cursor-pointer"
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={m} value={idx}>{m}</option>
              ))}
            </select>

            <select
              value={year}
              onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value, 10), month, 1))}
              className="bg-slate-950 text-yellow-300 font-mono font-black text-xs rounded-xl px-2 py-1.5 border border-white/10 outline-none cursor-pointer"
            >
              {[2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <button
              onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-indigo-600 text-gray-300 hover:text-white transition cursor-pointer"
              title="Mes siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* View Tab Selector */}
          <div className="flex rounded-2xl bg-white/5 p-1 border border-white/10 text-xs font-bold">
            <button
              onClick={() => setActiveTab('CALENDARIO')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'CALENDARIO'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              Calendario ({filteredEvents.length})
            </button>
            <button
              onClick={() => setActiveTab('MATRIZ_PLAZOS')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'MATRIZ_PLAZOS'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              Matriz de Licitaciones ({filteredEvents.length})
            </button>
            <button
              onClick={() => setActiveTab('REPORTE')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'REPORTE'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5 text-emerald-400" />
              Reporte & Gráficas
            </button>
          </div>
        </div>
      </div>

      {/* KPI Semáforo & Resumen Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <button
          onClick={() => setSelectedSemaforo(selectedSemaforo === 'rojo' ? 'todos' : 'rojo')}
          className={`glass-card p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedSemaforo === 'rojo'
              ? 'bg-red-500/20 border-red-500 ring-2 ring-red-500/50'
              : 'border-red-500/30 hover:bg-red-500/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
              Críticos
            </span>
            <span className="text-lg font-black text-red-400 font-mono">{countRojo}</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Urgentes / Vencidos</p>
        </button>

        <button
          onClick={() => setSelectedSemaforo(selectedSemaforo === 'naranja' ? 'todos' : 'naranja')}
          className={`glass-card p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedSemaforo === 'naranja'
              ? 'bg-amber-500/20 border-amber-500 ring-2 ring-amber-500/50'
              : 'border-amber-500/30 hover:bg-amber-500/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              Advertencia
            </span>
            <span className="text-lg font-black text-amber-400 font-mono">{countNaranja}</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">En trámite / cotización</p>
        </button>

        <button
          onClick={() => setSelectedSemaforo(selectedSemaforo === 'verde' ? 'todos' : 'verde')}
          className={`glass-card p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedSemaforo === 'verde'
              ? 'bg-emerald-500/20 border-emerald-500 ring-2 ring-emerald-500/50'
              : 'border-emerald-500/30 hover:bg-emerald-500/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              En Plazo
            </span>
            <span className="text-lg font-black text-emerald-400 font-mono">{countVerde}</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">En tiempo programado</p>
        </button>

        <button
          onClick={() => setSelectedArea(selectedArea === 'APLICACIONES' ? 'todos' : 'APLICACIONES')}
          className={`glass-card p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedArea === 'APLICACIONES'
              ? 'bg-cyan-500/20 border-cyan-500 ring-2 ring-cyan-500/50'
              : 'border-cyan-500/30 hover:bg-cyan-500/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              Aplicaciones
            </span>
            <span className="text-lg font-black text-cyan-200 font-mono">{countAplicaciones}</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Edgar Figuero</p>
        </button>

        <button
          onClick={() => setSelectedArea(selectedArea === 'PM' ? 'todos' : 'PM')}
          className={`glass-card p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedArea === 'PM'
              ? 'bg-violet-500/20 border-violet-500 ring-2 ring-violet-500/50'
              : 'border-violet-500/30 hover:bg-violet-500/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-violet-300 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-violet-400" />
              PM
            </span>
            <span className="text-lg font-black text-violet-200 font-mono">{countPM}</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Juan Jose / Julio C.</p>
        </button>

        <button
          onClick={() => setSelectedArea(selectedArea === 'LOGISTICA' ? 'todos' : 'LOGISTICA')}
          className={`glass-card p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedArea === 'LOGISTICA'
              ? 'bg-blue-500/20 border-blue-500 ring-2 ring-blue-500/50'
              : 'border-blue-500/30 hover:bg-blue-500/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-300 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-blue-400" />
              Logística
            </span>
            <span className="text-lg font-black text-blue-200 font-mono">{countLogistica}</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Diego P. / Juan J.</p>
        </button>
      </div>

      {/* Slicers and Filter Controls Bar */}
      <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-3 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-white uppercase tracking-wider text-[11px]">
              Slicers & Filtros por Área y Responsable:
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por área, situación, responsable, cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field !py-1.5 !pl-8 text-xs w-64 sm:w-80 bg-slate-950"
            />
          </div>
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 pt-1">
          {/* Slicer Área */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Área Operativa:</label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full bg-slate-950 text-white text-xs rounded-xl p-2 border border-white/10 focus:border-indigo-500 outline-none cursor-pointer"
            >
              <option value="todos">Todas las Áreas</option>
              {uniqueAreas.map(a => (
                <option key={a} value={a}>📁 {a} ({incidencias.filter(i => i.area === a).length})</option>
              ))}
            </select>
          </div>

          {/* Slicer Responsable */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Responsable Asignado:</label>
            <select
              value={selectedResponsable}
              onChange={(e) => setSelectedResponsable(e.target.value)}
              className="w-full bg-slate-950 text-white text-xs rounded-xl p-2 border border-white/10 focus:border-indigo-500 outline-none cursor-pointer"
            >
              <option value="todos">Todos los Responsables</option>
              {uniqueResponsables.map(r => (
                <option key={r} value={r}>👤 {r} ({incidencias.filter(i => i.responsable === r).length})</option>
              ))}
            </select>
          </div>

          {/* Slicer Cliente */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Institución / Cliente:</label>
            <select
              value={selectedContrato}
              onChange={(e) => setSelectedContrato(e.target.value)}
              className="w-full bg-slate-950 text-white text-xs rounded-xl p-2 border border-white/10 focus:border-indigo-500 outline-none cursor-pointer"
            >
              <option value="todos">Todas las Instituciones</option>
              {uniqueClientes.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Slicer Tipo de Pendiente */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Tipo de Pendiente:</label>
            <select
              value={selectedTipoPendiente}
              onChange={(e) => setSelectedTipoPendiente(e.target.value)}
              className="w-full bg-slate-950 text-white text-xs rounded-xl p-2 border border-white/10 focus:border-indigo-500 outline-none cursor-pointer"
            >
              <option value="todos">Todos los Tipos</option>
              <option value="CONTRATO">📄 CONTRATO</option>
              <option value="VISITA - LUIS">🛠️ VISITA - LUIS</option>
            </select>
          </div>

          {/* Slicer Semáforo */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Estado / Semáforo:</label>
            <select
              value={selectedSemaforo}
              onChange={(e) => setSelectedSemaforo(e.target.value)}
              className="w-full bg-slate-950 text-white text-xs rounded-xl p-2 border border-white/10 focus:border-indigo-500 outline-none cursor-pointer"
            >
              <option value="todos">Todos los Semáforos</option>
              <option value="rojo">🔴 Críticos ({countRojo})</option>
              <option value="naranja">🟠 Advertencia ({countNaranja})</option>
              <option value="verde">🟢 En Plazo ({countVerde})</option>
            </select>
          </div>
        </div>

        {/* Active Filter Badges */}
        {(selectedArea !== 'todos' || selectedContrato !== 'todos' || selectedTipoPendiente !== 'todos' || selectedResponsable !== 'todos' || selectedSemaforo !== 'todos' || searchQuery) && (
          <div className="flex items-center gap-2 pt-2 border-t border-white/5 flex-wrap">
            <span className="text-[10px] text-gray-400 font-bold">Filtros Activos:</span>
            {selectedArea !== 'todos' && (
              <span className="badge bg-cyan-500/20 text-cyan-300 text-[10px] flex items-center gap-1">
                Área: {selectedArea}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedArea('todos')} />
              </span>
            )}
            {selectedResponsable !== 'todos' && (
              <span className="badge bg-violet-500/20 text-violet-300 text-[10px] flex items-center gap-1">
                Responsable: {selectedResponsable}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedResponsable('todos')} />
              </span>
            )}
            {selectedContrato !== 'todos' && (
              <span className="badge bg-indigo-500/20 text-indigo-300 text-[10px] flex items-center gap-1">
                {selectedContrato}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedContrato('todos')} />
              </span>
            )}
            {selectedTipoPendiente !== 'todos' && (
              <span className="badge bg-purple-500/20 text-purple-300 text-[10px] flex items-center gap-1">
                {selectedTipoPendiente}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedTipoPendiente('todos')} />
              </span>
            )}
            {selectedSemaforo !== 'todos' && (
              <span className="badge bg-amber-500/20 text-amber-300 text-[10px] flex items-center gap-1">
                Semáforo: {selectedSemaforo}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedSemaforo('todos')} />
              </span>
            )}
            <button
              onClick={() => {
                setSelectedArea('todos')
                setSelectedContrato('todos')
                setSelectedTipoPendiente('todos')
                setSelectedResponsable('todos')
                setSelectedSemaforo('todos')
                setSearchQuery('')
              }}
              className="text-[10px] text-red-400 hover:underline font-bold ml-auto cursor-pointer"
            >
              Limpiar todos los filtros
            </button>
          </div>
        )}
      </div>

      {/* 1. VISTA CALENDARIO MENSUAL */}
      {activeTab === 'CALENDARIO' && (
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 bg-slate-900/90 border-b border-white/10 text-center py-2.5 text-xs font-bold text-gray-300">
            {DAY_NAMES.map((d) => (
              <div key={d} className="uppercase tracking-wider text-[11px] text-gray-400">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-white/10 bg-slate-950/40">
            {calendarDays.map((day, idx) => {
              const isToday = new Date().toISOString().split('T')[0] === day.dateStr
              const hasEvents = day.events.length > 0

              return (
                <div
                  key={idx}
                  onClick={() => hasEvents && setSelectedDayEvents({ date: day.dateStr, events: day.events })}
                  className={`p-2 min-h-[120px] flex flex-col justify-between transition-all group ${
                    day.isCurrentMonth ? 'bg-transparent' : 'bg-slate-950/90 opacity-40'
                  } ${hasEvents ? 'cursor-pointer hover:bg-white/[0.04]' : ''}`}
                >
                  {/* Day Number and Count Indicator */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-bold font-mono rounded-lg w-6 h-6 flex items-center justify-center ${
                      isToday
                        ? 'bg-indigo-500 text-white shadow-md ring-2 ring-white/20'
                        : day.isCurrentMonth ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {day.dayNumber}
                    </span>

                    {hasEvents && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                        {day.events.length} {day.events.length === 1 ? 'pendiente' : 'pendientes'}
                      </span>
                    )}
                  </div>

                  {/* Events list preview inside day cell */}
                  <div className="space-y-1 flex-1 overflow-hidden">
                    {day.events.slice(0, 3).map((ev) => {
                      const sem = getSemaforoInfo(ev.fecha_cumplimiento, ev.estatus)
                      const theme = CONTRATO_THEMES[ev.cliente] || DEFAULT_THEME

                      return (
                        <div
                          key={ev.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedDetail(ev)
                          }}
                          className={`p-1.5 rounded-lg text-[10px] font-medium truncate flex items-center justify-between gap-1 border transition-all hover:scale-[1.02] shadow-sm ${theme.bg} ${theme.border} ${theme.text}`}
                          title={`${ev.situacion} — [${ev.area}] ${ev.responsable} (${ev.cliente})`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${sem.dotClass}`} />
                            <span className="badge bg-white/10 text-white font-mono text-[8px] px-1 py-0 font-bold">
                              {ev.area}
                            </span>
                            <span className="truncate font-semibold">{ev.situacion}</span>
                          </div>

                          <span className={`text-[8px] font-mono px-1 rounded flex-shrink-0 ${sem.badgeClass}`}>
                            {ev.tipo_pendiente === 'VISITA - LUIS' ? 'VISITA' : 'CONTRATO'}
                          </span>
                        </div>
                      )
                    })}

                    {day.events.length > 3 && (
                      <div className="text-[9px] font-bold text-indigo-400 pl-1 hover:underline">
                        +{day.events.length - 3} pendientes más...
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 2. VISTA MATRIZ DE LICITACIONES (TABLA EXACTA DEL PLANNER CON ÁREA Y RESPONSABLE) */}
      {activeTab === 'MATRIZ_PLAZOS' && (
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-2xl animate-fade-in">
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/90">
            <div>
              <h3 className="text-base font-black text-white">Matriz Oficial de Pendientes de Licitaciones</h3>
              <p className="text-xs text-gray-400">Total mostrados: {filteredEvents.length} de {incidencias.length} registros clasificados por Área y Responsable</p>
            </div>
            <span className="badge bg-indigo-500/20 text-indigo-300 font-mono font-bold text-xs">
              Control Planner 3FN
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
                  <th className="p-3">SITUACIÓN</th>
                  <th className="p-3">ÁREA</th>
                  <th className="p-3">RESPONSABLE</th>
                  <th className="p-3">UBICACIÓN</th>
                  <th className="p-3">FECHA DE CUMPLIMIENTO</th>
                  <th className="p-3">COMENTARIO</th>
                  <th className="p-3 text-center">SEMÁFORO</th>
                  <th className="p-3 text-right w-28">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-slate-900/40">
                {filteredEvents.map((row) => {
                  const sem = getSemaforoInfo(row.fecha_cumplimiento, row.estatus)
                  const isVisita = row.tipo_pendiente === 'VISITA - LUIS'

                  return (
                    <tr key={row.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="p-3 text-center font-mono font-bold text-gray-400">{row.item_num || row.id}</td>
                      <td className="p-3 font-semibold text-gray-200 whitespace-nowrap">{row.cliente}</td>
                      <td className="p-3 font-mono font-semibold text-yellow-300 whitespace-nowrap">{row.numero_contrato}</td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`badge text-[10px] font-bold ${
                          isVisita
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        }`}>
                          {row.tipo_pendiente}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-gray-100 max-w-xs">{row.situacion}</td>
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
                      <td className="p-3 font-bold text-white whitespace-nowrap">{row.responsable}</td>
                      <td className="p-3 font-mono text-gray-300 whitespace-nowrap text-[11px]">{row.ubicacion || '-'}</td>
                      <td className="p-3 font-mono font-bold text-emerald-400 whitespace-nowrap">{row.fecha_cumplimiento}</td>
                      <td className="p-3 text-gray-300 text-[11px] max-w-sm">{row.comentario || '-'}</td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <span className={`badge text-[10px] ${sem.badgeClass}`}>
                          {row.estatus}
                        </span>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(row)}
                            className="p-1 px-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 font-bold border border-indigo-500/40 text-[10px] flex items-center gap-1 transition shadow-sm cursor-pointer"
                            title="Editar detalles y reasignar responsable"
                          >
                            <ArrowRightLeft className="w-3 h-3" />
                            Reasignar
                          </button>
                          <button
                            onClick={() => handleOpenPresion(row)}
                            className="p-1 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold border border-amber-500/40 text-[10px] flex items-center gap-1 transition shadow-sm cursor-pointer"
                            title="Presionar por correo institucional"
                          >
                            <Zap className="w-3 h-3 fill-amber-400" />
                            Presionar
                          </button>
                          <button
                            onClick={() => setSelectedDetail(row)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
                            title="Ver detalle"
                          >
                            <Eye className="w-3.5 h-3.5" />
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
      )}

      {/* 3. VISTA REPORTE DETALLADO EJECUTIVO (FORMATO OFICIAL Y EXPORTABLE) */}
      {activeTab === 'REPORTE' && (
        <div className="animate-fade-in">
          <ReporteDetalladoLicitaciones
            isEmbedded={true}
            incidencias={incidencias}
          />
        </div>
      )}

      {/* Modal: Detalle del Día */}
      {selectedDayEvents && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-2xl p-6 rounded-2xl border border-white/20 animate-scale-in max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">
                  Pendientes para el {selectedDayEvents.date}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDayEvents(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {selectedDayEvents.events.map((ev) => {
                const sem = getSemaforoInfo(ev.fecha_cumplimiento, ev.estatus)
                return (
                  <div key={ev.id} className="p-4 rounded-xl bg-slate-900/90 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{ev.situacion}</span>
                      <span className={`badge text-xs ${sem.badgeClass}`}>{ev.estatus}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                      <div><span className="text-gray-500 font-bold">Área:</span> <span className="text-cyan-300 font-bold">{ev.area}</span></div>
                      <div><span className="text-gray-500 font-bold">Responsable:</span> <span className="text-white font-bold">{ev.responsable}</span></div>
                      <div><span className="text-gray-500 font-bold">Cliente:</span> {ev.cliente}</div>
                      <div><span className="text-gray-500 font-bold">Contrato:</span> {ev.numero_contrato}</div>
                      <div><span className="text-gray-500 font-bold">Tipo:</span> {ev.tipo_pendiente}</div>
                      <div><span className="text-gray-500 font-bold">Ubicación:</span> {ev.ubicacion || '-'}</div>
                    </div>
                    {ev.comentario && (
                      <p className="text-xs text-gray-400 bg-black/40 p-2.5 rounded-lg border border-white/5">
                        {ev.comentario}
                      </p>
                    )}
                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedDayEvents(null)
                          handleOpenEdit(ev)
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 font-bold border border-indigo-500/40 text-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        Reasignar / Editar
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDayEvents(null)
                          handleOpenPresion(ev)
                        }}
                        className="btn-primary !py-1 !px-3 text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        Enviar Alerta de Presión
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Detalle Individual */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-lg p-6 rounded-2xl border border-white/20 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-400" />
                Ficha de Obligación #{selectedDetail.item_num || selectedDetail.id}
              </h3>
              <button
                onClick={() => setSelectedDetail(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-1.5">
                <div className="text-gray-400 uppercase font-bold text-[10px]">Situación:</div>
                <div className="text-sm font-bold text-white">{selectedDetail.situacion}</div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
                  <span className="text-gray-400 block text-[10px] font-bold uppercase">Área:</span>
                  <span className="font-bold text-cyan-300">{selectedDetail.area}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
                  <span className="text-gray-400 block text-[10px] font-bold uppercase">Responsable:</span>
                  <span className="font-bold text-white">{selectedDetail.responsable}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
                  <span className="text-gray-400 block text-[10px] font-bold uppercase">Cliente:</span>
                  <span className="font-bold text-white">{selectedDetail.cliente}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
                  <span className="text-gray-400 block text-[10px] font-bold uppercase">Contrato:</span>
                  <span className="font-mono font-bold text-yellow-300">{selectedDetail.numero_contrato}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
                  <span className="text-gray-400 block text-[10px] font-bold uppercase">Tipo de Pendiente:</span>
                  <span className="font-bold text-purple-300">{selectedDetail.tipo_pendiente}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
                  <span className="text-gray-400 block text-[10px] font-bold uppercase">Ubicación:</span>
                  <span className="font-bold text-pink-300">{selectedDetail.ubicacion || '-'}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                <span className="text-gray-400 block text-[10px] font-bold uppercase">Fecha de Cumplimiento:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">{selectedDetail.fecha_cumplimiento}</span>
              </div>

              {selectedDetail.comentario && (
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-gray-400 block text-[10px] font-bold uppercase">Comentario del Planner:</span>
                  <p className="text-gray-200 text-xs">{selectedDetail.comentario}</p>
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-white/10 flex justify-end gap-2">
              <button
                onClick={() => setSelectedDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-gray-300 text-xs font-bold hover:bg-slate-700 cursor-pointer"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  const detail = selectedDetail
                  setSelectedDetail(null)
                  handleOpenEdit(detail)
                }}
                className="px-4 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-bold border border-indigo-500/40 flex items-center gap-1.5 transition cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                Reasignar / Editar
              </button>
              <button
                onClick={() => {
                  const detail = selectedDetail
                  setSelectedDetail(null)
                  handleOpenPresion(detail)
                }}
                className="btn-primary !py-2 !px-4 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                Presionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reasignar / Editar Responsabilidad */}
      {isEditModalOpen && editingTask && (
        <ReasignarResponsableModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setEditingTask(null)
          }}
          item={editingTask}
          onSave={handleSaveReasignacion}
        />
      )}

      {/* Modal: Envío de Correo de Presión */}
      {presionModalOpen && selectedTaskForPressure && (
        <PresionEmailModal
          isOpen={presionModalOpen}
          onClose={() => {
            setPresionModalOpen(false)
            setSelectedTaskForPressure(null)
          }}
          tarea={selectedTaskForPressure}
        />
      )}

      {/* Toast Notification Flotante */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-white text-xs font-bold shadow-2xl flex items-center gap-3 animate-slide-up backdrop-blur-md">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span>{successToast}</span>
        </div>
      )}
    </div>
  )
}

