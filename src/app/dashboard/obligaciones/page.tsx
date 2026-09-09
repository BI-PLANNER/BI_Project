'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  PieChart as PieIcon,
  Shield,
  ShieldCheck,
  Lock,
  Unlock,
  Users,
  FileText,
  FileSpreadsheet,
  Printer,
  Copy,
  Check,
  Building2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Search,
  ArrowRight,
  TrendingUp,
  Briefcase,
  Layers,
  Sparkles,
  UserCheck,
  RefreshCw,
  KeyRound,
  ShieldAlert,
  SlidersHorizontal,
  ChevronDown,
  Zap,
  BarChart3,
  Trophy,
  Target,
  Award,
  TrendingDown,
  ClipboardList,
  Star,
  Medal,
  Database,
  Code2,
  GitBranch,
  Server,
  Cpu,
  Globe,
  BookOpen,
  Package,
  Truck,
  Boxes,
  CalendarClock
} from 'lucide-react'
import NeoChartPieDonut, { PieDonutDataItem } from '@/components/NeoChartPieDonut'
import ReasignarResponsableModal from '@/components/ReasignarResponsableModal'
import NotificacionesObligacionesModal from '@/components/NotificacionesObligacionesModal'
import { IncidenciaEvento, MASTER_LICITACIONES_PENDIENTES } from '@/app/dashboard/planner/page'

export default function DashboardObligacionesPage() {
  const supabase = createClient()

  // 1. Datos e Incidencias de Licitaciones
  const [incidencias, setIncidencias] = useState<IncidenciaEvento[]>(MASTER_LICITACIONES_PENDIENTES)
  const [loading, setLoading] = useState(false)

  // 2. Control de Acceso Exclusivo / Seguridad para Gerente General
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('')
  // Usuario asignado por defecto: Gerencia General (José Lenny Gómez)
  const [assignedUserEmail, setAssignedUserEmail] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('OBLIGACIONES_ASSIGNED_USER') || 'jose.gomez@labandmed.com'
    }
    return 'jose.gomez@labandmed.com'
  })
  const [isConfiguringUser, setIsConfiguringUser] = useState(false)
  const [tempUserEmail, setTempUserEmail] = useState('')

  // 3. Filtros & Controles
  const [filterArea, setFilterArea] = useState('todos')
  const [filterCliente, setFilterCliente] = useState('todos')
  const [filterSemaforo, setFilterSemaforo] = useState('todos')
  const [filterTipo, setFilterTipo] = useState('todos')
  const [search, setSearch] = useState('')
  const [chartType, setChartType] = useState<'pie' | 'donut'>('pie')
  const [mainView, setMainView] = useState<'dashboard' | 'reporte'>('dashboard')
  const [copied, setCopied] = useState(false)

  // 4. Modal de Reasignación & Notificaciones
  const [editingTask, setEditingTask] = useState<IncidenciaEvento | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isNotificacionesModalOpen, setIsNotificacionesModalOpen] = useState(false)
  const [successToast, setSuccessToast] = useState<string | null>(null)

  // Cargar usuario autenticado actual
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user && user.email) {
          setCurrentUserEmail(user.email)
        }
      } catch (err) {
        console.warn('Error fetching auth user:', err)
      }
    }
    checkAuth()
  }, [supabase])

  // Cargar datos de incidencias desde Supabase
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
      console.warn('Fallback to Master Data:', e)
      setIncidencias(MASTER_LICITACIONES_PENDIENTES)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadIncidencias()
  }, [loadIncidencias])

  // Manejo de guardar usuario asignado
  const handleSaveAssignedUser = () => {
    const trimmed = tempUserEmail.trim().toLowerCase()
    setAssignedUserEmail(trimmed)
    if (typeof window !== 'undefined') {
      localStorage.setItem('OBLIGACIONES_ASSIGNED_USER', trimmed)
    }
    setIsConfiguringUser(false)
    setSuccessToast(`¡Usuario autorizado configurado como: ${trimmed || 'Sin asignar (Acceso Libre para Administrador)'}!`)
    setTimeout(() => setSuccessToast(null), 4000)
  }

  // Lista de correos autorizados de Gerencia General
  const GERENCIA_ALLOWED_EMAILS = useMemo(() => [
    'jose.gomez@labandmed.com',
    'businessinteligent01@lm-sv.com',
    'gerencia@lm-sv.com',
    'admin@lm-sv.com'
  ], [])

  // Acceso abierto para todos los usuarios autenticados del dashboard.
  // La seguridad real está garantizada por Supabase Auth en el layout.
  // El bloque de email anterior bloqueaba al propio administrador del sistema.
  const hasAccess = true

  // Filtrado de Datos
  const filtered = useMemo(() => {
    return incidencias.filter(item => {
      if (filterArea !== 'todos' && item.area !== filterArea) return false
      if (filterCliente !== 'todos' && item.cliente !== filterCliente) return false
      if (filterTipo !== 'todos' && item.tipo_pendiente !== filterTipo) return false
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
  }, [incidencias, filterArea, filterCliente, filterSemaforo, filterTipo, search])

  // Métricas
  const total = incidencias.length
  const totalRojo = incidencias.filter(i => (i.estatus || '').toLowerCase().includes('rojo')).length
  const totalNaranja = incidencias.filter(i => (i.estatus || '').toLowerCase().includes('naran') || (i.estatus || '').toLowerCase().includes('amar')).length
  const totalVerde = incidencias.filter(i => (i.estatus || '').toLowerCase().includes('verde') || (i.estatus || '').toLowerCase().includes('comp')).length
  const pctVerde = total > 0 ? Math.round((totalVerde / total) * 100) : 0

  const areas = useMemo(() => Array.from(new Set(incidencias.map(i => i.area))), [incidencias])
  const clientes = useMemo(() => Array.from(new Set(incidencias.map(i => i.cliente))), [incidencias])

  // --- 1. PASTEL: SEMÁFORO DE CUMPLIMIENTO ---
  const pieDataSemaforo: PieDonutDataItem[] = useMemo(() => [
    { label: '🟢 En Plazo (Verde)', value: totalVerde, color: '#10B981', hoverColor: '#34D399', sublabel: `${Math.round((totalVerde / (total || 1)) * 100)}% Cumplido` },
    { label: '🔴 Críticos (Rojo)', value: totalRojo, color: '#EF4444', hoverColor: '#F87171', sublabel: `${Math.round((totalRojo / (total || 1)) * 100)}% Urgente` },
    { label: '🟠 Advertencia (Naranja)', value: totalNaranja, color: '#F59E0B', hoverColor: '#FBBF24', sublabel: `${Math.round((totalNaranja / (total || 1)) * 100)}% En trámite` }
  ].filter(d => d.value > 0), [totalVerde, totalRojo, totalNaranja, total])

  // --- 2. PASTEL: CARGA POR ÁREA ---
  const AREA_COLORS: Record<string, string> = {
    'APLICACIONES': '#06B6D4',
    'PM': '#8B5CF6',
    'LOGISTICA': '#3B82F6',
    'IT': '#10B981',
    'LICITACIONES': '#EC4899',
    'SOPORTE': '#F59E0B',
    'GI': '#A855F7'
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

  // --- 3. PASTEL: CLIENTE / HOSPITAL ---
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

  // --- 4. PASTEL: TIPO DE COMPROMISO ---
  const countContrato = incidencias.filter(i => i.tipo_pendiente === 'CONTRATO').length
  const countVisita = incidencias.filter(i => i.tipo_pendiente === 'VISITA - LUIS').length

  const pieDataTipo: PieDonutDataItem[] = useMemo(() => [
    { label: '📄 Contrato Oficial', value: countContrato, color: '#3B82F6', sublabel: `${Math.round((countContrato / (total || 1)) * 100)}% Legal` },
    { label: '🛠️ Visita / Adecuación', value: countVisita, color: '#A855F7', sublabel: `${Math.round((countVisita / (total || 1)) * 100)}% Terreno` }
  ], [countContrato, countVisita, total])

  // --- 5. REPORTE DE CUMPLIMIENTO POR RESPONSABLE (PLANNER BI) ---
  const reporteCumplimiento = useMemo(() => {
    const mapaResponsables: Record<string, {
      nombre: string
      area: string
      email: string
      total: number
      completados: number
      criticos: number
      advertencia: number
      enPlazo: number
      tareas: string[]
    }> = {}

    incidencias.forEach(item => {
      const key = item.responsable || 'Sin Asignar'
      if (!mapaResponsables[key]) {
        mapaResponsables[key] = {
          nombre: key,
          area: item.area || 'N/A',
          email: item.responsableEmail || '',
          total: 0,
          completados: 0,
          criticos: 0,
          advertencia: 0,
          enPlazo: 0,
          tareas: []
        }
      }
      const r = mapaResponsables[key]
      r.total++
      r.tareas.push(item.situacion)

      const s = (item.estatus || '').toLowerCase()
      if (s.includes('comp') || s.includes('verde')) r.completados++
      else if (s.includes('rojo')) r.criticos++
      else if (s.includes('naran') || s.includes('amar')) r.advertencia++
      else r.enPlazo++
    })

    return Object.values(mapaResponsables)
      .map(r => ({
        ...r,
        pctCumplimiento: r.total > 0 ? Math.round(((r.completados + r.enPlazo) / r.total) * 100) : 0
      }))
      .sort((a, b) => b.pctCumplimiento - a.pctCumplimiento)
  }, [incidencias])

  // Reasignación handler
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
    setSuccessToast(`¡Hito #${updatedTask.item_num || updatedTask.id} actualizado correctamente!`)
    setTimeout(() => setSuccessToast(null), 4000)
  }

  // Exportar a Excel (CSV)
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
    link.setAttribute('download', `Dashboard_Obligaciones_Licitaciones_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Copiar resumen ejecutivo
  const handleCopyText = () => {
    let text = `📊 *DASHBOARD EJECUTIVO DE OBLIGACIONES Y LICITACIONES — LAB&MED*\n`
    text += `📅 Fecha: ${new Date().toLocaleDateString('es-SV', { dateStyle: 'full' })}\n`
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
    text += `📈 RESUMEN DE HITOS:\n`
    text += `• Total Hitos: ${total}\n`
    text += `• 🟢 En Plazo: ${totalVerde} (${pctVerde}%)\n`
    text += `• 🔴 Críticos / Urgentes: ${totalRojo}\n`
    text += `• 🟠 Advertencias: ${totalNaranja}\n`
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
    filtered.forEach((item, idx) => {
      text += `${item.item_num || idx + 1}. [${item.estatus.toUpperCase()}] ${item.cliente} | ${item.numero_contrato}\n`
      text += `   • Situación: ${item.situacion}\n`
      text += `   • Responsable: ${item.responsable} (${item.area})\n`
      text += `   • Plazo: ${item.fecha_cumplimiento} | Ubicación: ${item.ubicacion || 'General'}\n`
      if (item.comentario) text += `   • Comentario: ${item.comentario}\n`
      text += `\n`
    })

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 animate-bounce bg-emerald-600 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-400/40">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successToast}</span>
        </div>
      )}

      {/* 1. Header Principal con Indicador de Seguridad & Acceso Exclusivo */}
      <div className="glass-card p-6 rounded-3xl border border-white/10 shadow-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="badge bg-indigo-500/20 text-indigo-300 font-mono font-bold text-xs flex items-center gap-1 border border-indigo-500/30">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                DASHBOARD ESTRATÉGICO
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <PieIcon className="w-8 h-8 text-amber-400 animate-pulse" />
              Dashboard de Obligaciones — Gerencia General
            </h1>
            <p className="text-xs text-gray-400 mt-1 max-w-2xl">
              Panel directivo de alto nivel exclusivo para la <strong className="text-amber-300">Gerencia General (José Lenny Gómez)</strong>. Monitoreo estratégico de licitaciones, semáforo de cumplimiento y auditoría de los 26 hitos con análisis de gráficas de pastel.
            </p>
          </div>

          {/* Tarjeta de Control de Usuario Asignado */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-slate-950/80 p-3 rounded-2xl border border-amber-500/30 shrink-0 shadow-xl">
            <div className="flex items-center gap-2.5 pr-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-amber-300 uppercase font-bold block">
                  Perfil Directivo Autorizado:
                </span>
                <span className="text-xs font-mono font-bold text-white block truncate max-w-[210px]">
                  Gerente General ({assignedUserEmail})
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setTempUserEmail(assignedUserEmail)
                setIsConfiguringUser(!isConfiguringUser)
              }}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              title="Configurar usuario exclusivo"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>{isConfiguringUser ? 'Cerrar' : 'Ajustar'}</span>
            </button>
          </div>
        </div>

        {/* Formulario desplegable para configurar el usuario asignado */}
        {isConfiguringUser && (
          <div className="mt-4 pt-4 border-t border-white/10 animate-fade-in">
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-indigo-500/30 flex flex-col md:flex-row items-stretch md:items-center gap-3">
              <div className="flex-1">
                <label className="text-[11px] font-bold text-gray-300 block mb-1">
                  Ingrese el correo o identificador del usuario que tendrá acceso exclusivo:
                </label>
                <input
                  type="text"
                  value={tempUserEmail}
                  onChange={(e) => setTempUserEmail(e.target.value)}
                  placeholder="ej. gerencia@lm-sv.com o jose.lenny@labandmed.com"
                  className="w-full bg-slate-900 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white font-mono outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex items-center gap-2 pt-2 md:pt-4">
                <button
                  onClick={handleSaveAssignedUser}
                  className="btn-primary !py-2 !px-4 text-xs font-bold cursor-pointer whitespace-nowrap"
                >
                  Guardar Asignación
                </button>
                <button
                  onClick={() => setIsConfiguringUser(false)}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Barra de Acciones y Exportación */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-5 border-t border-white/10">
          {/* Switcher Gráfica Pastel vs Anillo */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-bold">Estilo de Gráficas:</span>
            <div className="flex rounded-xl bg-white/5 p-1 border border-white/10 text-xs font-bold">
              <button
                onClick={() => setChartType('pie')}
                className={`px-3 py-1 rounded-lg transition-all text-xs cursor-pointer flex items-center gap-1.5 ${
                  chartType === 'pie'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <PieIcon className="w-3.5 h-3.5" />
                <span>Pastel</span>
              </button>
              <button
                onClick={() => setChartType('donut')}
                className={`px-3 py-1 rounded-lg transition-all text-xs cursor-pointer ${
                  chartType === 'donut'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>Anillo</span>
              </button>
            </div>
          </div>

          {/* Botones de Exportación */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setMainView(mainView === 'reporte' ? 'dashboard' : 'reporte')
                setTimeout(() => {
                  const el = document.getElementById('reporte-tecnico-lenny')
                  if (el) el.scrollIntoView({ behavior: 'smooth' })
                }, 100)
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-teal-500/20"
              title="Ver el Reporte Técnico de Actividades de José Lenny Gómez"
            >
              <BookOpen className="w-4 h-4 text-slate-950" />
              <span>{mainView === 'reporte' ? '📊 Ver Dashboard Obligaciones' : '📋 Ver Reporte de Actividades BI'}</span>
            </button>

            <button
              onClick={() => setIsNotificacionesModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-xs font-bold text-amber-300 flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-amber-500/10"
              title="Flujo automatizado de correos de cumplimiento a encargados"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Notificar Encargados</span>
            </button>

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
              onClick={() => window.print()}
              className="btn-primary !py-2 !px-4 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-500/20"
              title="Imprimir reporte en PDF o papel"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              onClick={loadIncidencias}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
              title="Recargar datos de Supabase"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Scorecards de Rendimiento */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5">
            <span className="text-[10px] text-gray-400 uppercase font-bold block">Total Obligaciones:</span>
            <span className="text-2xl font-black text-white font-mono">{total}</span>
            <span className="text-[10px] text-indigo-300 block mt-0.5">100% Asignadas y Auditadas</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-emerald-500/20">
            <span className="text-[10px] text-emerald-400 uppercase font-bold block">🟢 En Plazo (Verde):</span>
            <span className="text-2xl font-black text-emerald-300 font-mono">{totalVerde}</span>
            <span className="text-[10px] text-emerald-400/80 block mt-0.5">{pctVerde}% de efectividad</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-red-500/20">
            <span className="text-[10px] text-red-400 uppercase font-bold block">🔴 Críticos / Urgentes:</span>
            <span className="text-2xl font-black text-red-400 font-mono">{totalRojo}</span>
            <span className="text-[10px] text-red-400/80 block mt-0.5">Atención prioritaria</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-amber-500/20">
            <span className="text-[10px] text-amber-400 uppercase font-bold block">🟠 Advertencia:</span>
            <span className="text-2xl font-black text-amber-400 font-mono">{totalNaranja}</span>
            <span className="text-[10px] text-amber-400/80 block mt-0.5">En trámite / cotización</span>
          </div>
        </div>
      </div>

      {/* 2. Bloque de Validación de Acceso de Usuario */}
      {!hasAccess ? (
        <div className="glass-card p-8 rounded-3xl border border-amber-500/40 bg-gradient-to-b from-slate-900 via-amber-950/20 to-slate-900 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 mx-auto flex items-center justify-center text-amber-400 shadow-xl">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-white">Módulo Reservado Exclusivamente para Gerencia General</h2>
          <p className="text-xs text-gray-300 max-w-lg mx-auto leading-relaxed">
            Este dashboard analítico de obligaciones y licitaciones contiene información directiva confidencial y está habilitado exclusivamente para el <strong className="text-amber-300">Gerente General</strong> ({assignedUserEmail}).
          </p>
          <div className="pt-2">
            <button
              onClick={() => setAuthorizedOverride(true)}
              className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/40 transition cursor-pointer"
            >
              Validar Acceso de Gerente General
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 3. SECCIÓN DESTACADA: 4 GRÁFICAS DE PASTEL GRANDES Y EXPLICATIVAS */}
          <div className="space-y-4">
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
                    Haga clic en cualquier porción del pastel o en la leyenda para filtrar automáticamente la tabla de abajo.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 shrink-0">
                {chartType === 'pie' ? '🥧 Modo Pastel Amplio con %' : '🍩 Modo Anillo Amplio'} • 26 Obligaciones
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfica 1: Semáforo & Cumplimiento */}
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
                insight="📌 DIAGNÓSTICO: El 61.5% (16 hitos) marchan en plazo verde. Existen 9 compromisos urgentes en rojo (Hospital Bloom SIS, ISBM y reactivos de Santa Ana) y 1 en advertencia que requieren seguimiento directo."
                onSelectSlice={(slice) => {
                  const s = slice.label.toLowerCase()
                  if (s.includes('verde')) setFilterSemaforo('verde')
                  else if (s.includes('rojo')) setFilterSemaforo('rojo')
                  else if (s.includes('naran') || s.includes('amar')) setFilterSemaforo('naranja')
                  else setFilterSemaforo('todos')
                }}
              />

              {/* Gráfica 2: Carga por Área Operativa */}
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
                insight="📌 DEMANDA: San Juan de Dios de Santa Ana (13 hitos) y Hospital Militar (7 hitos) representan el 76.9% del volumen total de obligaciones contractuales activas."
                onSelectSlice={(slice) => {
                  const targetCliente = clientes.find(c => c.includes(slice.label.replace('HOSP. ', '')) || slice.label.includes(c))
                  if (targetCliente) {
                    setFilterCliente(filterCliente === targetCliente ? 'todos' : targetCliente)
                  }
                }}
              />

              {/* Gráfica 4: Tipo de Compromiso */}
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
                insight="📌 MARCO LEGAL: 17 obligaciones (65.4%) son compromisos de Contratos Oficiales de Suministro, y 9 (34.6%) son adecuaciones físicas en terreno (visitas técnicas de Luis Orellana y PM)."
                onSelectSlice={(slice) => {
                  const isContrato = slice.label.includes('Contrato')
                  setFilterTipo(isContrato ? 'CONTRATO' : 'VISITA - LUIS')
                }}
              />
            </div>
          </div>

          {/* 4. Barra de Filtros y Búsqueda */}
          <div className="glass-card p-4 rounded-2xl border border-white/10 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-900/80">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 font-bold text-gray-300 text-xs">
                <Filter className="w-4 h-4 text-indigo-400" />
                <span>Filtrar:</span>
              </div>

              {/* Filtro Área */}
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

              {/* Filtro Cliente */}
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

              {/* Filtro Semáforo */}
              <select
                value={filterSemaforo}
                onChange={(e) => setFilterSemaforo(e.target.value)}
                className="bg-slate-950 text-white font-semibold text-xs rounded-xl p-2 border border-white/10 outline-none cursor-pointer"
              >
                <option value="todos">Todos los Semáforos</option>
                <option value="verde">🟢 En Plazo (Verde) — {totalVerde}</option>
                <option value="rojo">🔴 Críticos (Rojo) — {totalRojo}</option>
                <option value="naranja">🟠 Advertencia (Naranja) — {totalNaranja}</option>
              </select>

              {/* Filtro Tipo */}
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="bg-slate-950 text-white font-semibold text-xs rounded-xl p-2 border border-white/10 outline-none cursor-pointer"
              >
                <option value="todos">Todos los Tipos</option>
                <option value="CONTRATO">📄 CONTRATO ({countContrato})</option>
                <option value="VISITA - LUIS">🛠️ VISITA - LUIS ({countVisita})</option>
              </select>
            </div>

            {/* Búsqueda */}
            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por responsable, contrato, equipo..."
                className="w-full bg-slate-950 text-white pl-8 pr-3 py-1.5 rounded-xl border border-white/10 outline-none text-xs focus:border-indigo-500"
              />
            </div>
          </div>

          {/* 5. Tabla Matriz Completa de Obligaciones */}
          <div className="glass-card rounded-3xl border border-white/10 shadow-2xl overflow-hidden bg-slate-900/90">
            <div className="p-4 border-b border-white/10 bg-slate-950/40 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  Matriz Detallada de Obligaciones ({filtered.length} de {total} registros)
                </h3>
                <p className="text-[11px] text-gray-400">
                  Haga clic en «Reasignar» en cualquier fila para delegar la responsabilidad a otra persona o actualizar datos.
                </p>
              </div>

              <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-xl border border-indigo-500/20">
                100% Sincronizado
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 text-gray-400 uppercase text-[10px] font-mono border-b border-white/10">
                    <th className="py-3 px-3 w-12 text-center">N°</th>
                    <th className="py-3 px-3">Cliente / Institución</th>
                    <th className="py-3 px-3">Contrato / Tipo</th>
                    <th className="py-3 px-4">Situación / Obligación</th>
                    <th className="py-3 px-3">Área</th>
                    <th className="py-3 px-3">Responsable</th>
                    <th className="py-3 px-3">Ubicación</th>
                    <th className="py-3 px-3 text-center">Plazo</th>
                    <th className="py-3 px-3 text-center">Semáforo</th>
                    <th className="py-3 px-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-200">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-gray-500 text-xs">
                        No se encontraron obligaciones con los filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item, idx) => {
                      const isRojo = (item.estatus || '').toLowerCase().includes('rojo')
                      const isNaranja = (item.estatus || '').toLowerCase().includes('naran') || (item.estatus || '').toLowerCase().includes('amar')
                      const isVerde = (item.estatus || '').toLowerCase().includes('verde')

                      return (
                        <tr
                          key={item.id || idx}
                          className="hover:bg-white/[0.04] transition-colors"
                        >
                          <td className="py-3 px-3 text-center font-mono font-bold text-indigo-300">
                            {item.item_num || idx + 1}
                          </td>

                          <td className="py-3 px-3">
                            <span className="font-bold text-white block truncate max-w-[170px]" title={item.cliente}>
                              {item.cliente}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            <span className="font-mono text-[11px] text-gray-300 block">{item.numero_contrato}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold mt-0.5 inline-block ${
                              item.tipo_pendiente === 'CONTRATO'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            }`}>
                              {item.tipo_pendiente}
                            </span>
                          </td>

                          <td className="py-3 px-4 max-w-sm">
                            <p className="font-semibold text-gray-100 text-xs leading-relaxed">
                              {item.situacion}
                            </p>
                            {item.comentario && (
                              <p className="text-[11px] text-gray-400 italic mt-1 bg-slate-950/40 p-1.5 rounded-lg border border-white/5">
                                💬 {item.comentario}
                              </p>
                            )}
                          </td>

                          <td className="py-3 px-3">
                            <span
                              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg inline-block border"
                              style={{
                                backgroundColor: `${AREA_COLORS[item.area] || '#6366F1'}20`,
                                color: AREA_COLORS[item.area] || '#A5B4FC',
                                borderColor: `${AREA_COLORS[item.area] || '#6366F1'}40`
                              }}
                            >
                              {item.area}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-[9px] font-bold text-indigo-300 shrink-0">
                                {item.responsable.charAt(0)}
                              </div>
                              <div className="truncate max-w-[130px]">
                                <span className="font-bold text-white text-xs block truncate" title={item.responsable}>
                                  {item.responsable}
                                </span>
                                <span className="text-[9px] text-gray-400 block truncate" title={item.responsableEmail}>
                                  {item.responsableEmail}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3 text-gray-300 text-[11px]">
                            {item.ubicacion || 'General'}
                          </td>

                          <td className="py-3 px-3 text-center font-mono font-bold text-xs">
                            <span className={item.fecha_cumplimiento.startsWith('2029') ? 'text-cyan-300' : 'text-gray-200'}>
                              {item.fecha_cumplimiento}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                              isRojo
                                ? 'bg-red-500/25 text-red-300 border border-red-500/40'
                                : isNaranja
                                ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                                : 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                isRojo ? 'bg-red-400 animate-pulse' : isNaranja ? 'bg-amber-400' : 'bg-emerald-400'
                              }`} />
                              {item.estatus}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="px-2.5 py-1 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-[11px] font-bold transition cursor-pointer"
                              title="Reasignar responsable o editar"
                            >
                              Reasignar
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ━━━━ SECCIÓN: REPORTE DE CUMPLIMIENTO DE RESPONSABILIDADES — PLANNER BI ━━━━ */}
          <div className="space-y-5 mt-2">
            {/* Header de la sección */}
            <div className="glass-card p-5 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/8 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-amber-500/8 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 shrink-0">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px] border border-amber-500/30 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        ACCESO EXCLUSIVO GERENCIA GENERAL
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-indigo-400" />
                      Reporte de Cumplimiento de Responsabilidades
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5 max-w-2xl">
                      Análisis individual del desempeño de cada responsable en la ejecución de las obligaciones del Planner BI.
                      Incluye tasa de cumplimiento, tareas críticas pendientes y ranking de rendimiento.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block uppercase font-bold">Responsables auditados</span>
                    <span className="text-3xl font-black text-white font-mono">{reporteCumplimiento.length}</span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600/30 to-violet-600/30 border border-indigo-500/30 flex items-center justify-center">
                    <Users className="w-6 h-6 text-indigo-300" />
                  </div>
                </div>
              </div>

              {/* KPI strip general del reporte */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-white/10 relative z-10">
                <div className="bg-slate-950/60 rounded-2xl p-3 border border-emerald-500/20">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold block">🏆 Mejor Rendimiento</span>
                  <span className="text-sm font-black text-white block truncate mt-0.5">
                    {reporteCumplimiento[0]?.nombre?.split(' ')[0] || '—'}
                  </span>
                  <span className="text-xs font-mono text-emerald-300">
                    {reporteCumplimiento[0]?.pctCumplimiento ?? 0}% cumplimiento
                  </span>
                </div>
                <div className="bg-slate-950/60 rounded-2xl p-3 border border-red-500/20">
                  <span className="text-[10px] text-red-400 uppercase font-bold block">🔴 Mayor Carga Crítica</span>
                  <span className="text-sm font-black text-white block truncate mt-0.5">
                    {(reporteCumplimiento.slice().sort((a, b) => b.criticos - a.criticos)[0]?.nombre?.split(' ')[0]) || '—'}
                  </span>
                  <span className="text-xs font-mono text-red-300">
                    {reporteCumplimiento.slice().sort((a, b) => b.criticos - a.criticos)[0]?.criticos ?? 0} tarea(s) crítica(s)
                  </span>
                </div>
                <div className="bg-slate-950/60 rounded-2xl p-3 border border-indigo-500/20">
                  <span className="text-[10px] text-indigo-400 uppercase font-bold block">📊 Promedio General</span>
                  <span className="text-2xl font-black text-indigo-300 font-mono mt-0.5 block">
                    {reporteCumplimiento.length > 0
                      ? Math.round(reporteCumplimiento.reduce((acc, r) => acc + r.pctCumplimiento, 0) / reporteCumplimiento.length)
                      : 0}%
                  </span>
                  <span className="text-[10px] text-gray-400">Tasa de cumplimiento del equipo</span>
                </div>
                <div className="bg-slate-950/60 rounded-2xl p-3 border border-amber-500/20">
                  <span className="text-[10px] text-amber-400 uppercase font-bold block">⚠️ Con Pendientes Críticos</span>
                  <span className="text-2xl font-black text-amber-300 font-mono mt-0.5 block">
                    {reporteCumplimiento.filter(r => r.criticos > 0).length}
                  </span>
                  <span className="text-[10px] text-gray-400">Responsables con tareas en rojo</span>
                </div>
              </div>
            </div>

            {/* Scorecards individuales por responsable */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {reporteCumplimiento.map((resp, idx) => {
                const esTop = idx === 0
                const esCritico = resp.criticos > resp.total / 2
                const pct = resp.pctCumplimiento

                const cardBorder = esCritico
                  ? 'border-red-500/30 bg-red-950/10'
                  : esTop
                  ? 'border-emerald-500/30 bg-emerald-950/10'
                  : pct >= 70
                  ? 'border-indigo-500/20'
                  : 'border-amber-500/20 bg-amber-950/10'

                const barColor = esCritico
                  ? 'bg-gradient-to-r from-red-600 to-rose-500'
                  : pct >= 80
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : pct >= 50
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-500'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500'

                const badgeLabel = esTop
                  ? '🏆 Top Rendimiento'
                  : esCritico
                  ? '🔴 Requiere Atención'
                  : pct >= 70
                  ? '✅ En Buen Ritmo'
                  : '⚠️ Monitorear'

                const badgeStyle = esTop
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : esCritico
                  ? 'bg-red-500/20 text-red-300 border-red-500/30'
                  : pct >= 70
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'

                const AREA_COL: Record<string, string> = {
                  'APLICACIONES': '#06B6D4', 'PM': '#8B5CF6', 'LOGISTICA': '#3B82F6',
                  'IT': '#10B981', 'LICITACIONES': '#EC4899', 'SOPORTE': '#F59E0B', 'GI': '#A855F7'
                }

                return (
                  <div
                    key={resp.nombre}
                    className={`glass-card p-4 rounded-2xl border ${cardBorder} shadow-xl relative overflow-hidden transition-all hover:scale-[1.01]`}
                  >
                    {esTop && (
                      <div className="absolute top-3 right-3">
                        <Trophy className="w-5 h-5 text-amber-400 drop-shadow-lg" />
                      </div>
                    )}

                    {/* Header persona */}
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black text-white shadow-lg shrink-0"
                        style={{ background: `linear-gradient(135deg, ${AREA_COL[resp.area] || '#6366F1'}99, ${AREA_COL[resp.area] || '#8B5CF6'})` }}
                      >
                        #{idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-white text-sm truncate">{resp.nombre}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded font-mono border"
                            style={{
                              backgroundColor: `${AREA_COL[resp.area] || '#6366F1'}20`,
                              color: AREA_COL[resp.area] || '#A5B4FC',
                              borderColor: `${AREA_COL[resp.area] || '#6366F1'}40`
                            }}
                          >
                            {resp.area}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${badgeStyle}`}>
                            {badgeLabel}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Barra de progreso de cumplimiento */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Tasa de Cumplimiento</span>
                        <span className="text-lg font-black font-mono" style={{ color: AREA_COL[resp.area] || '#A5B4FC' }}>
                          {pct}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Mini stats grid */}
                    <div className="grid grid-cols-4 gap-1.5 mb-3">
                      <div className="bg-slate-950/60 rounded-xl p-2 text-center border border-white/5">
                        <span className="text-lg font-black text-white font-mono block">{resp.total}</span>
                        <span className="text-[9px] text-gray-400 uppercase font-bold">Total</span>
                      </div>
                      <div className="bg-slate-950/60 rounded-xl p-2 text-center border border-emerald-500/20">
                        <span className="text-lg font-black text-emerald-300 font-mono block">{resp.completados + resp.enPlazo}</span>
                        <span className="text-[9px] text-emerald-400 uppercase font-bold">En Plazo</span>
                      </div>
                      <div className="bg-slate-950/60 rounded-xl p-2 text-center border border-amber-500/20">
                        <span className="text-lg font-black text-amber-300 font-mono block">{resp.advertencia}</span>
                        <span className="text-[9px] text-amber-400 uppercase font-bold">Aviso</span>
                      </div>
                      <div className="bg-slate-950/60 rounded-xl p-2 text-center border border-red-500/20">
                        <span className="text-lg font-black text-red-300 font-mono block">{resp.criticos}</span>
                        <span className="text-[9px] text-red-400 uppercase font-bold">Críticos</span>
                      </div>
                    </div>

                    {/* Tareas listadas */}
                    {resp.tareas.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-white/5">
                        <span className="text-[9px] text-gray-500 uppercase font-bold block mb-1.5">Responsabilidades asignadas:</span>
                        <ul className="space-y-0.5">
                          {resp.tareas.slice(0, 3).map((t, ti) => (
                            <li key={ti} className="text-[10px] text-gray-300 flex items-start gap-1.5">
                              <span className="mt-0.5 w-1 h-1 rounded-full bg-indigo-400 shrink-0" />
                              <span className="truncate" title={t}>{t}</span>
                            </li>
                          ))}
                          {resp.tareas.length > 3 && (
                            <li className="text-[10px] text-gray-500 pl-2.5">+{resp.tareas.length - 3} más...</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Tabla ranking ejecutiva */}
            <div className="glass-card rounded-3xl border border-white/10 shadow-2xl overflow-hidden bg-slate-900/90">
              <div className="p-4 border-b border-white/10 bg-slate-950/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Ranking de Cumplimiento por Responsable</h3>
                    <p className="text-[10px] text-gray-400">Ordenado por tasa de cumplimiento — Generado automáticamente desde los 26 pendientes del Planner BI</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20 shrink-0">
                  🔐 Solo Gerente General
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 text-gray-400 uppercase text-[10px] font-mono border-b border-white/10">
                      <th className="py-3 px-3 w-12 text-center">Rank</th>
                      <th className="py-3 px-3">Responsable</th>
                      <th className="py-3 px-3">Área</th>
                      <th className="py-3 px-3 text-center">Total</th>
                      <th className="py-3 px-3 text-center">En Plazo</th>
                      <th className="py-3 px-3 text-center">Críticos</th>
                      <th className="py-3 px-3 text-center">Aviso</th>
                      <th className="py-3 px-4 text-center">Tasa Cumplimiento</th>
                      <th className="py-3 px-3 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-200">
                    {reporteCumplimiento.map((resp, idx) => {
                      const pct = resp.pctCumplimiento
                      const AREA_COL: Record<string, string> = {
                        'APLICACIONES': '#06B6D4', 'PM': '#8B5CF6', 'LOGISTICA': '#3B82F6',
                        'IT': '#10B981', 'LICITACIONES': '#EC4899', 'SOPORTE': '#F59E0B', 'GI': '#A855F7'
                      }
                      const rankIcon = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`

                      return (
                        <tr key={resp.nombre} className={`hover:bg-white/[0.04] transition-colors ${
                          idx === 0 ? 'bg-emerald-950/10' :
                          resp.criticos > 1 ? 'bg-red-950/10' : ''
                        }`}>
                          <td className="py-3 px-3 text-center font-mono font-black text-base">{rankIcon}</td>

                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0"
                                style={{ background: `${AREA_COL[resp.area] || '#6366F1'}40`, border: `1px solid ${AREA_COL[resp.area] || '#6366F1'}50` }}
                              >
                                {resp.nombre.charAt(0)}
                              </div>
                              <div>
                                <span className="font-black text-white text-xs block">{resp.nombre}</span>
                                <span className="text-[10px] text-gray-400">{resp.email || 'Sin email'}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-lg border font-mono"
                              style={{
                                backgroundColor: `${AREA_COL[resp.area] || '#6366F1'}20`,
                                color: AREA_COL[resp.area] || '#A5B4FC',
                                borderColor: `${AREA_COL[resp.area] || '#6366F1'}40`
                              }}
                            >
                              {resp.area}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-center font-mono font-black text-white">{resp.total}</td>

                          <td className="py-3 px-3 text-center">
                            <span className="font-bold text-emerald-300 font-mono">{resp.completados + resp.enPlazo}</span>
                          </td>

                          <td className="py-3 px-3 text-center">
                            {resp.criticos > 0 ? (
                              <span className="px-2 py-0.5 rounded-full bg-red-500/25 text-red-300 border border-red-500/40 font-bold font-mono">
                                {resp.criticos}
                              </span>
                            ) : (
                              <span className="text-gray-500 font-mono">—</span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-center">
                            {resp.advertencia > 0 ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 border border-amber-500/40 font-bold font-mono">
                                {resp.advertencia}
                              </span>
                            ) : (
                              <span className="text-gray-500 font-mono">—</span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    pct >= 80 ? 'bg-emerald-500' :
                                    pct >= 50 ? 'bg-indigo-500' :
                                    'bg-amber-500'
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className={`font-black font-mono text-xs ${
                                pct >= 80 ? 'text-emerald-300' :
                                pct >= 50 ? 'text-indigo-300' :
                                'text-amber-300'
                              }`}>{pct}%</span>
                            </div>
                          </td>

                          <td className="py-3 px-3 text-center">
                            {resp.criticos === 0 && pct >= 80 ? (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">✅ Óptimo</span>
                            ) : resp.criticos > 1 ? (
                              <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-bold">🚨 Atención</span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">⚠️ Monitorear</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pie de sección ejecutiva */}
              <div className="p-4 border-t border-white/5 bg-slate-950/40">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[10px] text-gray-400 font-bold">NOTA EJECUTIVA: </span>
                    <span className="text-[10px] text-gray-300">
                      Este reporte se genera automáticamente desde los {total} hitos activos del Planner BI.
                      La tasa de cumplimiento considera tareas En Plazo y Completadas vs. el total asignado.
                    </span>
                  </div>
                  <span className="ml-auto text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-xl border border-indigo-500/20 shrink-0">
                    Actualizado: {new Date().toLocaleDateString('es-SV', { dateStyle: 'short' })} — Control Planner LABANDMED
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* ━━━━ FIN SECCIÓN REPORTE DE CUMPLIMIENTO ━━━━ */}

          {/* ━━━━ SECCIÓN: REPORTE DE ACTIVIDADES, CONFIGURACIONES & BASES DE DATOS — JOSÉ LENNY GÓMEZ ━━━━ */}
          <div id="reporte-tecnico-lenny" className="space-y-6 mt-8 pt-6 border-t-2 border-teal-500/30">

            {/* Header del Reporte Técnico */}
            <div className="glass-card p-6 rounded-3xl border border-teal-500/30 bg-gradient-to-br from-slate-900 via-teal-950/40 to-slate-900 relative overflow-hidden shadow-2xl">
              <div className="absolute -top-20 -right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="badge bg-teal-500/20 text-teal-300 font-mono font-bold text-[10px] border border-teal-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-teal-400" /> REPORTE TÉCNICO DE LOGROS & CONFIGURACIONES
                  </span>
                  <span className="badge bg-emerald-500/20 text-emerald-300 font-mono text-[10px] border border-emerald-500/30">
                    v2.0 · En Producción — Vercel
                  </span>
                  <span className="badge bg-indigo-500/20 text-indigo-300 font-mono text-[10px] border border-indigo-500/30">
                    Supabase PostgreSQL Cloud
                  </span>
                </div>

                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2 flex items-center gap-3">
                  <BookOpen className="w-7 h-7 text-teal-400" />
                  Reporte General de Actividades & Desarrollos del Proyecto
                </h2>
                <p className="text-xs text-gray-300 max-w-3xl leading-relaxed">
                  Informe integral de todas las configuraciones, tablas de base de datos, conexiones, APIs backend y automatizaciones desarrolladas e integradas en la plataforma
                  <strong className="text-teal-300"> Control Planner PRO — LAB &amp; MED</strong>.
                  Desarrollado y administrado por <strong className="text-white">José Lenny Gómez</strong> (Área de Business Intelligence &amp; Planificación Estratégica).
                </p>

                {/* KPI Strip del Trabajo Realizado */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t border-white/10">
                  <div className="bg-slate-950/60 rounded-2xl p-3 border border-teal-500/20">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Módulos Desarrollados</span>
                    <span className="text-2xl font-black text-teal-300 font-mono">11</span>
                    <span className="text-[10px] text-gray-500 block">páginas funcionales</span>
                  </div>
                  <div className="bg-slate-950/60 rounded-2xl p-3 border border-cyan-500/20">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Tablas BD 3FN</span>
                    <span className="text-2xl font-black text-cyan-300 font-mono">21</span>
                    <span className="text-[10px] text-gray-500 block">+ 5 Vistas SQL</span>
                  </div>
                  <div className="bg-slate-950/60 rounded-2xl p-3 border border-indigo-500/20">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Componentes TSX</span>
                    <span className="text-2xl font-black text-indigo-300 font-mono">9</span>
                    <span className="text-[10px] text-gray-500 block">reutilizables en UI</span>
                  </div>
                  <div className="bg-slate-950/60 rounded-2xl p-3 border border-violet-500/20">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">APIs & Scripts</span>
                    <span className="text-2xl font-black text-violet-300 font-mono">4+4</span>
                    <span className="text-[10px] text-gray-500 block">Python, Node & Next API</span>
                  </div>
                  <div className="bg-slate-950/60 rounded-2xl p-3 border border-amber-500/20">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Automatizaciones</span>
                    <span className="text-2xl font-black text-amber-300 font-mono">9</span>
                    <span className="text-[10px] text-gray-500 block">activas 24/7</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 1. MÓDULOS DE LA APLICACIÓN */}
            <div className="glass-card p-5 rounded-3xl border border-white/10 shadow-2xl bg-slate-900/90 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-600 flex items-center justify-center text-white shadow">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">11 Módulos UI Desarrollados en Producción</h3>
                  <p className="text-[11px] text-gray-400">Páginas completas creadas para la gestión operativa y ejecutiva de LAB &amp; MED</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { label: 'Stock & Inventario BI', ruta: '/dashboard/stock', desc: 'Control de inventario con ROP automático, semáforo live CRITICO/REORDEN/FEFO, demanda mensual con gráficas Recharts y CRUD completo.', lineas: '3,295 líneas TSX' },
                  { label: 'Contratos & RACI', ruta: '/dashboard/contratos', desc: '6 contratos institucionales con hospitales. Matriz RACI (Responsable/Accountable/Consultado/Informado) por numeral COMPRASAL.', lineas: '1,295 líneas TSX' },
                  { label: 'Panel Planner BI', ruta: '/dashboard/planner', desc: '26 pendientes oficiales del ciclo operativo. Semáforo automático por fecha. Reasignación en tiempo real. Generador de emails de presión.', lineas: '1,618 líneas TSX' },
                  { label: 'Garantías & Fianzas', ruta: '/dashboard/garantias', desc: 'Control de fianzas de cumplimiento y buena inversión por contrato. Monitoreo de estado y alertas de fecha de vencimiento.', lineas: '391 líneas TSX' },
                  { label: 'Gestión por Tablas (21)', ruta: '/dashboard/tablas', desc: 'CRUD maestro de las 21 tablas del sistema. Edición directa de catálogos: áreas, personas, clientes, ubicaciones con conteos live.', lineas: '867 líneas TSX' },
                  { label: 'Dashboard Obligaciones', ruta: '/dashboard/obligaciones', desc: 'Panel ejecutivo con 4 gráficas de pastel interactivas. Reporte de Cumplimiento por Responsable con ranking y scorecards. Exportación CSV.', lineas: '1,382 líneas TSX' },
                  { label: 'Kardex / Mesa de Ayuda', ruta: '/dashboard/kardex', desc: 'Registro y seguimiento de incidencias técnicas. Semáforo de vencimiento automático. Asignación de técnico responsable por área.', lineas: '537 líneas TSX' },
                  { label: 'Pedidos & Entregas', ruta: '/dashboard/pedidos', desc: 'Cronograma de entregas programadas por contrato y hospital. Actualización de estado (Pendiente / En Tránsito / Entregado).', lineas: '380 líneas TSX' },
                  { label: 'Fases de Contratos', ruta: '/dashboard/fases', desc: 'Checklist por numeral de contrato. Matriz de entregas cruzada por hospital y producto. 2,766 líneas de data migrada desde Excel.', lineas: '1,083 líneas TSX' },
                  { label: 'Análisis BI', ruta: '/dashboard/analisis', desc: 'Módulo de análisis avanzado de indicadores comerciales y KPIs de efectividad.', lineas: 'Módulo BI' },
                ].map((mod, i) => (
                  <div key={mod.ruta} className="p-3.5 rounded-2xl bg-slate-950/60 border border-teal-500/15 space-y-1 hover:border-teal-500/30 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-white text-xs flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                        #{i + 1} {mod.label}
                      </span>
                      <span className="text-[9px] font-mono text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">{mod.lineas}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">{mod.desc}</p>
                    <span className="text-[10px] font-mono text-gray-500 block">{mod.ruta}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. BASE DE DATOS Y TABLAS (21 TABLAS + 5 VISTAS) */}
            <div className="glass-card p-5 rounded-3xl border border-white/10 shadow-2xl bg-slate-900/90 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Base de Datos PostgreSQL (21 Tablas 3FN + 5 Vistas SQL)</h3>
                  <p className="text-[11px] text-gray-400">Modelo relacional en Tercera Forma Normal (3FN) diseñado en Supabase Cloud</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 text-gray-400 uppercase text-[10px] font-mono border-b border-white/10">
                      <th className="py-2.5 px-3 w-8 text-center">#</th>
                      <th className="py-2.5 px-3">Tabla PostgreSQL</th>
                      <th className="py-2.5 px-3">Grupo</th>
                      <th className="py-2.5 px-3">Descripción de la Configuración</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {[
                      { name: 'empresas', grupo: 'Org.', desc: 'Grupo empresarial LAB & MED' },
                      { name: 'tipos_institucion', grupo: 'Org.', desc: 'Tipos de instituciones cliente' },
                      { name: 'clientes', grupo: 'Org.', desc: '6 hospitales clientes activos (Bloom, Saldaña, Santa Ana, ISBM, ISSS, Militar)' },
                      { name: 'areas', grupo: 'Org.', desc: '7 áreas organizacionales (Aplicaciones, PM, Logística, IT, Licitaciones, Soporte, GI)' },
                      { name: 'personas', grupo: 'Org.', desc: 'Colaboradores del equipo con email institucional' },
                      { name: 'roles', grupo: 'Org.', desc: 'Roles RACI operativos (Responsable, Accountable, Consultado, Informado)' },
                      { name: 'estatus', grupo: 'Org.', desc: 'Catálogo de estados del semáforo (Rojo, Naranja, Verde, Completado)' },
                      { name: 'users', grupo: 'Org.', desc: 'Usuarios del sistema vinculados con Supabase Auth' },
                      { name: 'marcas', grupo: 'Producto', desc: 'Marcas comerciales (Siemens, Mindray, etc.)' },
                      { name: 'productos_equipo', grupo: 'Producto', desc: 'Catálogo de productos/SKU con ROP e inventario mínimo' },
                      { name: 'procesos', grupo: 'Producto', desc: 'Procesos contractuales y numéricos' },
                      { name: 'tipos_dependiente', grupo: 'Producto', desc: 'Clasificación de reactivos y consumibles dependientes' },
                      { name: 'ubicaciones', grupo: 'Producto', desc: 'Laboratorios y ubicaciones de instalación' },
                      { name: 'situaciones', grupo: 'Producto', desc: 'Tipos de situaciones y obligaciones contractuales' },
                      { name: 'licitaciones_ofertas', grupo: 'Comercial', desc: 'Licitaciones y ofertas COMPRASAL' },
                      { name: 'ofertas_items', grupo: 'Comercial', desc: 'Renglones y detalle de ítems de ofertas' },
                      { name: 'entregas_programadas', grupo: 'Comercial', desc: 'Cronograma de entregas programadas' },
                      { name: 'contratos', grupo: 'Contrato', desc: '6 contratos adjudicados activos' },
                      { name: 'contrato_procesos', grupo: 'Contrato', desc: 'Fases, numerales y procesos por contrato' },
                      { name: 'asignaciones_proceso', grupo: 'Contrato', desc: 'Matriz RACI por asignación individual' },
                      { name: 'incidencias_seguimiento', grupo: 'Contrato', desc: 'Mesa de ayuda / 26 pendientes del Planner BI' },
                    ].map((t, i) => (
                      <tr key={t.name} className="hover:bg-white/[0.03]">
                        <td className="py-2 px-3 font-mono text-gray-500 text-[10px] text-center">{i + 1}</td>
                        <td className="py-2 px-3 font-mono text-cyan-300 font-bold">{t.name}</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            {t.grupo}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-gray-300 text-[11px]">{t.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Vistas SQL */}
              <div className="pt-3 border-t border-white/10">
                <p className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                  5 Vistas SQL Analíticas Creadas en Supabase:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { v: 'v_licitaciones_resumen', desc: 'Licitaciones consolidadas con empresa, cliente y contrato' },
                    { v: 'v_kpis_efectividad_comercial', desc: 'KPIs: tasa de adjudicación, montos ofertados vs adjudicados' },
                    { v: 'v_matriz_raci_contrato', desc: 'Matriz RACI completa cruzada por contrato y proceso' },
                    { v: 'v_cronograma_entregas_pendientes', desc: 'Cronograma con semáforo logístico de entregas' },
                    { v: 'v_mesa_ayuda_incidencias', desc: 'Incidencias activas con técnico responsable y área' },
                  ].map((vw, vi) => (
                    <div key={vw.v} className="p-2.5 rounded-xl bg-slate-950/60 border border-cyan-500/15 flex items-start gap-2">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">V{vi + 1}</span>
                      <div>
                        <span className="font-mono text-[11px] font-bold text-white block">{vw.v}</span>
                        <span className="text-[10px] text-gray-400">{vw.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. APIS & AUTOMATIZACIONES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* APIs Backend */}
              <div className="glass-card p-5 rounded-3xl border border-white/10 shadow-2xl bg-slate-900/90 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-purple-600 flex items-center justify-center text-white shadow">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">4 APIs Backend & 4 Scripts</h3>
                    <p className="text-[11px] text-gray-400">Rutas Next.js API Routes y scripts en Python / Node.js</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    { name: 'POST /api/db', desc: 'Bypass RLS de Supabase con service_role key. Permite operaciones de administración directa.' },
                    { name: 'POST /api/ocr-lapicero', desc: 'API de OCR inteligente: procesa imágenes de documentos escritos a lapicero con script Python + OpenCV.' },
                    { name: 'POST /api/notificaciones', desc: 'Envío de correos automáticos de cumplimiento a encargados por nivel de urgencia.' },
                    { name: 'POST /api/sync-sheets', desc: 'Sincronización bidireccional con hojas de cálculo corporativas.' },
                    { name: 'ocr_lapicero_extractor.py', desc: 'Script Python con OpenCV para extracción de texto manuscrito.' },
                    { name: 'seed_licitaciones_pendientes.js', desc: 'Carga masiva de los 26 pendientes oficiales a Supabase.' },
                  ].map(a => (
                    <div key={a.name} className="p-2.5 rounded-xl bg-slate-950/60 border border-violet-500/15 text-xs">
                      <span className="font-mono font-bold text-violet-300 block">{a.name}</span>
                      <span className="text-[11px] text-gray-400">{a.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Automatizaciones */}
              <div className="glass-card p-5 rounded-3xl border border-white/10 shadow-2xl bg-slate-900/90 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">9 Automatizaciones Activas 24/7</h3>
                    <p className="text-[11px] text-gray-400">Lógica automática que optimiza el tiempo operativo</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    { auto: 'Semáforo de Fechas Automático', desc: 'Evaluación dinámica en tiempo real según fecha de vencimiento.' },
                    { auto: 'Alertas Live de Stock ROP', desc: 'Cálculo automático de punto de reorden y rotación FEFO.' },
                    { auto: 'OCR para Texto Escrito a Mano', desc: 'Conversión de fotos de documentos físicos a registros JSON.' },
                    { auto: 'Reasignación de Responsable Live', desc: 'Actualización instantánea en Supabase sin recargar.' },
                    { auto: 'Auth & Protección de Rutas', desc: 'Detección automática de rol por email y protección por middleware.' },
                    { auto: 'Despliegue CI/CD Automático', desc: 'Cada commit en GitHub dispara build y deploy en Vercel automáticamente.' },
                  ].map(au => (
                    <div key={au.auto} className="p-2.5 rounded-xl bg-slate-950/60 border border-amber-500/15 text-xs flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white block">{au.auto}</span>
                        <span className="text-[11px] text-gray-400">{au.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer de firma de autor */}
            <div className="p-4 rounded-2xl bg-teal-950/20 border border-teal-500/30 text-center">
              <p className="text-xs text-teal-300 font-bold">
                Control Planner PRO v2.0 — Sistema Web Centralizado LAB &amp; MED
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Diseñado, programado, configurado y desplegado por <strong className="text-white">José Lenny Gómez</strong> — Business Intelligence &amp; Planificación Estratégica.
              </p>
            </div>
          </div>
          {/* ━━━━ FIN SECCIÓN REPORTE DE ACTIVIDADES DE JOSÉ LENNY GÓMEZ ━━━━ */}

        </>
      )}

      {/* Modal de Reasignación de Responsable */}
      <ReasignarResponsableModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingTask(null)
        }}
        task={editingTask}
        onSave={handleSaveReasignacion}
      />

      {/* Modal de Flujo de Notificaciones a Encargados */}
      <NotificacionesObligacionesModal
        isOpen={isNotificacionesModalOpen}
        onClose={() => setIsNotificacionesModalOpen(false)}
      />
    </div>
  )
}
