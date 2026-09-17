'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  FileText, Database, Layers, Zap, CheckCircle2, Server,
  Code2, GitBranch, Table2, Eye, Shield, Building2, Users,
  BarChart3, Activity, Boxes, ShieldCheck, ClipboardList,
  CalendarClock, HelpCircle, Truck, Star, Link2, Cpu,
  FolderOpen, BookOpen, Package, ArrowUpRight, Globe,
  Sparkles, Award, TrendingUp, RefreshCw, Printer, Copy, Check,
  ShieldAlert, LogIn, ArrowLeft, Lock
} from 'lucide-react'

const MODULES = [
  { icon: Boxes, label: 'Stock & Inventario BI', ruta: '/dashboard/stock', lineas: 3295, desc: 'Control de inventario con ROP automático, semáforo de stock, alertas live CRITICO/REORDEN/FEFO, análisis de demanda mensual con gráficas Recharts y CRUD completo.', color: 'teal', estado: 'Producción' },
  { icon: FileText, label: 'Contratos & RACI', ruta: '/dashboard/contratos', lineas: 1295, desc: '6 contratos institucionales con hospitales públicos. Matriz RACI (Responsable/Accountable/Consultado/Informado) por numeral. Control de fianzas de cumplimiento.', color: 'cyan', estado: 'Producción' },
  { icon: CalendarClock, label: 'Panel Planner', ruta: '/dashboard/planner', lineas: 1618, desc: '26 pendientes oficiales del ciclo operativo. Semáforo automático por fecha. Reasignación de responsable en tiempo real. Generador de email de presión URGENTE/CRÍTICO.', color: 'indigo', estado: 'Producción' },
  { icon: ShieldCheck, label: 'Garantías & Fianzas', ruta: '/dashboard/garantias', lineas: 391, desc: 'Control de fianzas de cumplimiento y buena inversión por contrato. Estado y vencimiento con alertas de fecha.', color: 'emerald', estado: 'Producción' },
  { icon: Database, label: 'Gestión por Tablas (21)', ruta: '/dashboard/tablas', lineas: 867, desc: 'CRUD maestro de las 21 tablas del sistema. Edición directa de catálogos: áreas, personas, clientes, ubicaciones. Conteos en vivo desde Supabase.', color: 'violet', estado: 'Producción' },
  { icon: BarChart3, label: 'Dashboard Obligaciones', ruta: '/dashboard/obligaciones', lineas: 1382, desc: 'Panel ejecutivo con 4 gráficas de pastel interactivas. Reporte de Cumplimiento por Responsable con ranking y scorecards. Exportación CSV. Notificaciones masivas.', color: 'amber', estado: 'Producción' },
  { icon: HelpCircle, label: 'Kardex / Mesa de Ayuda', ruta: '/dashboard/kardex', lineas: 537, desc: 'Registro y seguimiento de incidencias técnicas. Semáforo de vencimiento automático. Asignación de técnico responsable por área.', color: 'rose', estado: 'Producción' },
  { icon: Truck, label: 'Pedidos & Entregas', ruta: '/dashboard/pedidos', lineas: 380, desc: 'Cronograma de entregas programadas por contrato y hospital. Actualización de estado (Pendiente / En Tránsito / Entregado).', color: 'orange', estado: 'Producción' },
  { icon: Layers, label: 'Fases de Contratos', ruta: '/dashboard/fases', lineas: 1083, desc: 'Checklist por numeral de contrato COMPRASAL. Matriz de entregas cruzada por hospital y producto. 2,766 líneas de data migrada desde Excel.', color: 'pink', estado: 'Producción' },
  { icon: TrendingUp, label: 'Análisis BI', ruta: '/dashboard/analisis', lineas: 450, desc: 'Módulo de análisis avanzado de indicadores comerciales y KPIs de efectividad.', color: 'sky', estado: 'Producción' },
  { icon: BookOpen, label: 'Reporte de Actividades', ruta: '/dashboard/reporte', lineas: 560, desc: 'Informe técnico de cumplimiento y desarrollos — esta página.', color: 'teal', estado: 'Producción' },
]

const COMPONENTS = [
  { name: 'AlertsNotificationCenter.tsx', kb: 33, desc: 'Centro de alertas live: CRITICO / REORDEN / FEFO calculado desde ROP y consumo diario.' },
  { name: 'DynamicMonthlyDemandAnalytics.tsx', kb: 55, desc: 'Análisis de demanda mensual agrupada por producto con gráficas Recharts dinámicas.' },
  { name: 'NeoChartPieDonut.tsx', kb: 16, desc: 'Gráfica pastel/anillo interactiva con leyenda, insight y callback de selección de slice.' },
  { name: 'NotificacionesObligacionesModal.tsx', kb: 12, desc: 'Flujo automatizado de notificaciones masivas a encargados por email.' },
  { name: 'PresionEmailModal.tsx', kb: 9, desc: 'Generador de email de presión con plantilla URGENTE/CRÍTICO/RECORDATORIO.' },
  { name: 'ReasignarResponsableModal.tsx', kb: 21, desc: 'Modal de reasignación con lista de personas en vivo desde Supabase.' },
  { name: 'ReporteDetalladoLicitaciones.tsx', kb: 32, desc: 'Reporte exportable de licitaciones con filtros, gráficas y exportación a Excel.' },
  { name: 'Sidebar.tsx', kb: 8, desc: 'Navegación lateral con detección de roles por email y badges de acceso.' },
  { name: 'LabMedLogo.tsx', kb: 7, desc: 'Logo institucional LAB & MED en SVG vectorial.' },
]

const APIS = [
  { ruta: '/api/db', metodo: 'POST', desc: 'Bypass de Row Level Security de Supabase usando service_role key. Permite INSERT/UPDATE/DELETE/SELECT en todas las tablas desde el servidor.' },
  { ruta: '/api/ocr-lapicero', metodo: 'POST', desc: 'API de OCR inteligente: procesa imágenes de documentos físicos escritos a lapicero. Ejecuta script Python + OpenCV para extraer ítems contractuales digitalmente.' },
  { ruta: '/api/notificaciones', metodo: 'POST', desc: 'Envío automático de correos de cumplimiento a encargados con plantillas diferenciadas por nivel de urgencia.' },
  { ruta: '/api/sync-sheets', metodo: 'POST', desc: 'Sincronización bidireccional de datos con hojas de cálculo Google Sheets corporativas.' },
]

const SCRIPTS = [
  { name: 'ocr_lapicero_extractor.py', tipo: 'Python', desc: 'Algoritmo OCR con OpenCV para extraer texto de documentos físicos escritos a lapicero y convertirlos a registros estructurados JSON.' },
  { name: 'seed_licitaciones_pendientes.js', tipo: 'Node.js', desc: 'Carga masiva de los 26 pendientes oficiales del Planner BI a la tabla incidencias_seguimiento en Supabase.' },
  { name: 'sync_areas_and_users.js', tipo: 'Node.js', desc: 'Sincronización de áreas organizacionales y usuarios del sistema entre el frontend y Supabase.' },
  { name: 'workflow_n8n_notificaciones.json', tipo: 'n8n', desc: 'Workflow de automatización n8n para notificaciones programadas de cumplimiento contractual.' },
]

const TABLES = [
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
]

const GRUPO_COLORS: Record<string, string> = {
  'Org.': '#0d9488',
  'Producto': '#0891b2',
  'Comercial': '#8b5cf6',
  'Contrato': '#ec4899',
}

const STACK = [
  { label: 'Framework Web', value: 'Next.js 14', sub: 'App Router · TypeScript 5', icon: '⚡' },
  { label: 'Base de Datos', value: 'Supabase Cloud', sub: 'PostgreSQL 15 · RLS · Auth', icon: '🗄️' },
  { label: 'Despliegue', value: 'Vercel Cloud', sub: 'CI/CD automático desde GitHub', icon: '🚀' },
  { label: 'Gráficas BI', value: 'Recharts', sub: 'SVG interactivo · Donut · Bar', icon: '📊' },
  { label: 'Estilos Custom', value: 'Tailwind + CSS', sub: 'Dark mode · Teal/Aqua · Glass', icon: '🎨' },
  { label: 'Lógica OCR', value: 'Python + OpenCV', sub: 'Lectura de documentos manuscritos', icon: '🤖' },
]

export default function ReporteTecnicoPage() {
  const supabase = createClient()
  const [copied, setCopied] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [canAccess, setCanAccess] = useState(false)
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('')
  const [currentUserName, setCurrentUserName] = useState<string>('')

  const totalLines = MODULES.reduce((a, m) => a + m.lineas, 0)

  useEffect(() => {
    async function verifyPermission() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || !user.email) {
          // No user logged in
          setCanAccess(false)
          setAuthLoading(false)
          return
        }

        const email = user.email.toLowerCase()
        setCurrentUserEmail(email)

        const isLuis = email.includes('lorellana') || email.includes('luis.orellana') || email.includes('orellana')
        const isLenny = email.includes('jose.gomez') || email.includes('lenny')

        const allowed = isLuis || isLenny
        setCanAccess(allowed)
        setCurrentUserName(isLuis ? 'Luis Orellana' : isLenny ? 'José Lenny Gómez' : email)
      } catch (err) {
        console.warn('Error verifying auth in Reporte page:', err)
        setCanAccess(false)
      } finally {
        setAuthLoading(false)
      }
    }
    verifyPermission()
  }, [supabase])

  const handleCopySummary = () => {
    let text = `📋 *INFORME OFICIAL DE ENTREGABLES & CUMPLIMIENTO — BI PLANNER*\n`
    text += `👤 Desarrollado por: José Lenny Gómez (Planificación Estratégica & BI)\n`
    text += `🏢 Empresa: LAB & MED SV | Sistema: Control Planner PRO v2.0\n`
    text += `📅 Fecha de Emisión: ${new Date().toLocaleDateString('es-SV', { dateStyle: 'full' })}\n`
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
    text += `🚀 RESUMEN DE TRABAJO ENTREGADO EN PRODUCCIÓN:\n`
    text += `• 💻 11 Módulos Web completos (~11,500+ líneas de código TypeScript)\n`
    text += `• 🗄️ 21 Tablas PostgreSQL (Diseñadas en 3FN) + 5 Vistas SQL analíticas en Supabase\n`
    text += `• ⚡ 4 APIs Backend Next.js + 4 Scripts de Automatización (Python OpenCV OCR)\n`
    text += `• 🤖 9 Automatizaciones operativas activas 24/7 (Semáforo, Alertas ROP, Vercel CI/CD)\n`
    text += `• 📊 4 Gráficas de Pastel interactivas y Reporte de Cumplimiento por Responsable\n\n`
    text += `🌐 Plataforma en Producción: https://control-planner.vercel.app\n`

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  // 1. Estado de carga de autenticación
  if (authLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-slate-300 border-t-teal-400 rounded-full animate-spin" />
        <p className="text-xs font-mono text-gray-500">Verificando permisos de acceso...</p>
      </div>
    )
  }

  // 2. Estado de Acceso Restringido (Solo Luis Orellana y José Lenny Gómez)
  if (!canAccess) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="glass-card max-w-lg w-full p-8 rounded-3xl border border-slate-300 bg-white text-center space-y-5 shadow-sm backdrop-blur-xl">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-slate-300 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="badge bg-amber-500/20 text-amber-700 font-mono font-bold text-xs border border-slate-300 px-3 py-1">
              🔒 ACCESO EXCLUSIVO
            </span>
            <h2 className="text-2xl font-black text-gray-900">Reporte de Actividades & Cumplimiento</h2>
            <p className="text-xs text-gray-600 leading-relaxed pt-1">
              Este informe técnico oficial de entregables de Business Intelligence está restringido y configurado para visualización exclusiva de:
            </p>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-300 text-xs font-mono space-y-1.5 text-left mt-3">
              <p className="font-bold text-teal-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                🎯 Luis Orellana <span className="text-[10px] text-teal-700/70">(Gerencia de Integración)</span>
              </p>
              <p className="text-gray-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-500" />
                👤 José Lenny Gómez <span className="text-[10px] text-gray-500">(Planificación Estratégica BI)</span>
              </p>
            </div>

            {currentUserEmail && (
              <p className="text-[11px] text-gray-500 pt-2">
                Usuario activo no autorizado: <span className="text-gray-600 font-mono font-bold">{currentUserEmail}</span>
              </p>
            )}
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard/stock"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-700 text-gray-900 font-bold text-xs flex items-center justify-center gap-2 border border-slate-300 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ir al Dashboard General</span>
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white border border-slate-300 text-gray-900 font-black text-xs flex items-center justify-center gap-2 transition hover:opacity-90 shadow-sm cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Iniciar Sesión como Luis Orellana</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-20 max-w-[1500px] mx-auto">

      {/* ══════════ 1. HEADER PRINCIPAL ══════════ */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-300 bg-white border border-slate-300 relative overflow-hidden shadow-sm">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="badge bg-teal-500/20 text-teal-700 font-mono font-bold text-xs border border-slate-300 flex items-center gap-1.5 px-3 py-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-700" /> CUMPLIMIENTO & ENTREGABLES TÉCNICOS
            </span>
            <span className="badge bg-emerald-500/20 text-emerald-700 font-mono text-xs border border-slate-300 px-3 py-1">
              v2.0 · En Producción — Vercel
            </span>
            <span className="badge bg-indigo-500/20 text-indigo-700 font-mono text-xs border border-slate-300 px-3 py-1">
              Supabase PostgreSQL Cloud
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight mb-2">
            Reporte de Actividades & Cumplimiento BI
          </h1>
          <p className="text-sm md:text-base text-gray-600 max-w-4xl leading-relaxed">
            Informe oficial de constancia de desarrollos, configuraciones de base de datos, conexiones y automatizaciones realizadas en la plataforma
            <strong className="text-teal-700"> Control Planner PRO — LAB &amp; MED</strong>.
            Desarrollado y presentado por <strong className="text-gray-900">José Lenny Gómez</strong> (Planificación Estratégica &amp; Business Intelligence) para la <strong className="text-amber-700">Dirección y Jefatura Inmediata</strong>.
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-5 border-t border-slate-300">
            {/* KPI STRIP */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 flex-1">
              {[
                { label: 'Módulos UI', value: '11', sub: 'páginas web funcionales', color: 'text-teal-700' },
                { label: 'Tablas BD 3FN', value: '21', sub: '+ 5 Vistas SQL analíticas', color: 'text-cyan-700' },
                { label: 'Componentes', value: '9', sub: 'TSX reutilizables', color: 'text-indigo-700' },
                { label: 'APIs & Scripts', value: '4+4', sub: 'Python OpenCV & Node', color: 'text-violet-700' },
                { label: 'Líneas Código', value: '~11.5K+', sub: 'TypeScript / TSX', color: 'text-amber-700' },
              ].map(k => (
                <div key={k.label} className="bg-white rounded-2xl p-3 border border-slate-300 shadow-inner">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">{k.label}</span>
                  <span className={`text-2xl font-black font-mono ${k.color}`}>{k.value}</span>
                  <span className="text-[10px] text-gray-500 block">{k.sub}</span>
                </div>
              ))}
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={handleCopySummary}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-white border border-slate-300 text-gray-900 font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-700" />
                    <span className="text-emerald-700">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-teal-700" />
                    <span>Copiar Resumen</span>
                  </>
                )}
              </button>

              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 text-gray-900 font-black text-xs flex items-center gap-2 hover:opacity-90 transition cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / Guardar PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ 2. RESUMEN DE IMPACTO OPERATIVO ══════════ */}
      <div className="glass-card p-6 rounded-3xl border border-slate-300 shadow-sm bg-white space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-white border border-slate-300 flex items-center justify-center text-gray-900 shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900">Objetivo del Sistema & Valor Aportado a la Empresa</h2>
            <p className="text-xs text-gray-500">Control Planner PRO — Solución de Inteligencia de Negocios para LAB &amp; MED</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed">
          Plataforma web empresarial desarrollada desde cero para centralizar, auditar y automatizar toda la operación comercial, logística, contractual y de soporte técnico de
          <strong className="text-teal-700"> LAB &amp; MED con sus 6 hospitales clientes</strong>. Reemplaza hojas de cálculo Excel dispersas por un
          <strong className="text-gray-900"> sistema central en tiempo real en la nube</strong>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-white rounded-2xl p-4 border border-slate-300 space-y-1">
            <p className="text-xs text-teal-700 uppercase font-black flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Problema Operativo Resuelto
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              Elimina la fragmentación de archivos Excel, correos y registros manuales. Centraliza licitaciones, contratos, matriz RACI, stock de reactivos y entregas en una sola fuente oficial.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-300 space-y-1">
            <p className="text-xs text-cyan-700 uppercase font-black flex items-center gap-1.5">
              <Users className="w-4 h-4" /> Usuarios & Roles Cobertura
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              Utilizado por Gerencia General, Project Management (PM), Aplicaciones, IT, Logística, Soporte Técnico y Licitaciones. Roles con seguridad RLS en Supabase.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-300 space-y-1">
            <p className="text-xs text-amber-700 uppercase font-black flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> Eficiencia & Automatización
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              Semáforos automáticos de vencimiento, alertas live de punto de reorden (ROP), OCR para texto escrito a mano y reportes ejecutivos exportables a Excel/PDF.
            </p>
          </div>
        </div>
      </div>

      {/* ══════════ 2.1 ARQUITECTURA SAAS (SOFTWARE AS A SERVICE) & VALOR ESTRATÉGICO ══════════ */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-300 bg-white border border-slate-300 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-300 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-300 flex items-center justify-center text-gray-900 shadow-sm">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="badge bg-cyan-500/20 text-cyan-700 font-mono font-bold text-[10px] border border-slate-300 px-2.5 py-0.5">
                  MODALIDAD SAAS CLOUD
                </span>
                <span className="badge bg-emerald-500/20 text-emerald-700 font-mono font-bold text-[10px] border border-slate-300 px-2.5 py-0.5">
                  PROPIEDAD 100% LAB & MED
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 mt-1">
                Modelo de Arquitectura SaaS (Software as a Service) &amp; Valor para la Jefatura
              </h2>
            </div>
          </div>
          <p className="text-xs font-mono text-cyan-700 bg-cyan-50 px-3 py-1.5 rounded-xl border border-slate-300 self-start md:self-auto">
            ⚡ Infraestructura Serverless · Alta Disponibilidad 99.9%
          </p>
        </div>

        <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
          <strong>Control Planner PRO</strong> fue diseñado y construido como una solución <strong className="text-cyan-700">SaaS Empresarial (Software como Servicio)</strong>.
          A diferencia del software de escritorio o los archivos locales tradicionales, esta arquitectura permite a la empresa operar con estándares de tecnología de primer nivel, reduciendo costos de mantenimiento a cero y garantizando acceso inmediato desde cualquier lugar.
        </p>

        {/* 4 PILARES DEL MODELO SAAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-300 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-700 flex items-center justify-center font-bold text-sm">
              ☁️
            </div>
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">1. Cero Instalación Local</h3>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              No requiere instalar ejecutables ni configurar servidores físicos en la oficina. Se accede mediante navegador web con conexión cifrada SSL/TLS.
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-300 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-700 flex items-center justify-center font-bold text-sm">
              🔄
            </div>
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">2. Despliegues Continuos (CI/CD)</h3>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Las actualizaciones de lógica, nuevos reportes o ajustes de semáforos se publican en caliente en la nube en segundos sin interrumpir la operación.
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-300 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-700 flex items-center justify-center font-bold text-sm">
              🔐
            </div>
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">3. Seguridad &amp; RLS Multi-Rol</h3>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Políticas de Row Level Security (RLS) en PostgreSQL que aíslan datos confidenciales y aseguran que cada perfil vea solo lo que le corresponde.
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-300 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold text-sm">
              💰
            </div>
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">4. Ahorro Masivo de Licencias</h3>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Ahorro de $15,000–$25,000 anuales al evitar licencias por usuario de SaaS comerciales externos (como Salesforce, Monday o QuickBase Enterprise).
            </p>
          </div>
        </div>

        {/* TABLA COMPARATIVA DE VALOR */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-white text-gray-500 uppercase text-[10px] font-mono border-b border-slate-300">
                <th className="py-3 px-3">Criterio de Evaluación</th>
                <th className="py-3 px-3 text-red-700">❌ Archivos Excel / Manual</th>
                <th className="py-3 px-3 text-amber-700">⚠️ SaaS Terceros (Monday / Salesforce)</th>
                <th className="py-3 px-3 text-teal-700">✅ Control Planner PRO (SaaS Propio)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 text-gray-600">
              <tr className="hover:bg-slate-100">
                <td className="py-2.5 px-3 font-bold text-gray-900">Sincronización en Tiempo Real</td>
                <td className="py-2.5 px-3 text-gray-500">Nula (archivos duplicados y desfasados)</td>
                <td className="py-2.5 px-3 text-gray-600">Sí, pero limitada por plan contratado</td>
                <td className="py-2.5 px-3 text-teal-700 font-bold">Inmediata en PostgreSQL Cloud</td>
              </tr>
              <tr className="hover:bg-slate-100">
                <td className="py-2.5 px-3 font-bold text-gray-900">Adaptación a Hospitales y Licitaciones</td>
                <td className="py-2.5 px-3 text-gray-500">Riesgosa / Fórmulas propensas a error</td>
                <td className="py-2.5 px-3 text-gray-600">Rígida, no entiende COMPRASAL ni RACI local</td>
                <td className="py-2.5 px-3 text-teal-700 font-bold">100% Diseñada para los 6 contratos de LAB &amp; MED</td>
              </tr>
              <tr className="hover:bg-slate-100">
                <td className="py-2.5 px-3 font-bold text-gray-900">Digitalización con OCR de Lapicero</td>
                <td className="py-2.5 px-3 text-gray-500">Imposible (digitación manual lenta)</td>
                <td className="py-2.5 px-3 text-gray-500">Requiere add-ons costosos de terceros</td>
                <td className="py-2.5 px-3 text-teal-700 font-bold">Algoritmo Python OpenCV integrado</td>
              </tr>
              <tr className="hover:bg-slate-100">
                <td className="py-2.5 px-3 font-bold text-gray-900">Costo por Usuario / Mensualidad</td>
                <td className="py-2.5 px-3 text-gray-500">Oculto en horas hombre perdidas</td>
                <td className="py-2.5 px-3 text-amber-700 font-bold">$40 - $120 / usuario / mes</td>
                <td className="py-2.5 px-3 text-emerald-700 font-bold">$0 en licencias (Propiedad de LAB &amp; MED)</td>
              </tr>
              <tr className="hover:bg-slate-100">
                <td className="py-2.5 px-3 font-bold text-gray-900">Propiedad Intelectual &amp; Código Fuente</td>
                <td className="py-2.5 px-3 text-gray-500">Ninguna ventaja competitiva</td>
                <td className="py-2.5 px-3 text-gray-500">Datos cautivos en servidor ajeno</td>
                <td className="py-2.5 px-3 text-teal-700 font-bold">Activo digital exclusivo de la empresa</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════ 3. LOS 11 MÓDULOS DE LA APLICACIÓN WEB ══════════ */}
      <div className="glass-card p-6 rounded-3xl border border-slate-300 shadow-sm bg-white space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-white border border-slate-300 flex items-center justify-center text-gray-900 shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">Catálogo de 11 Módulos Desarrollados en Producción</h2>
              <p className="text-xs text-gray-500">Páginas web completamente operativas y accesibles desde el menú lateral (Sidebar)</p>
            </div>
          </div>
          <span className="badge bg-teal-500/20 text-teal-700 font-mono font-bold text-xs border border-slate-300 px-3 py-1">
            100% Funcionales
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map((mod, idx) => (
            <div key={mod.ruta} className="bg-white rounded-2xl p-4 border border-slate-300 hover:border-slate-300 transition-all flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-gray-500 font-bold">MÓDULO #{String(idx + 1).padStart(2, '0')}</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-700 border border-slate-300">
                    ✅ {mod.estado}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <mod.icon className="w-4 h-4 text-teal-700 shrink-0" />
                  <h3 className="font-black text-gray-900 text-sm truncate">{mod.label}</h3>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{mod.desc}</p>
              </div>

              <div className="pt-2 border-t border-slate-300 flex items-center justify-between text-[10px] font-mono">
                <span className="text-teal-700">{mod.ruta}</span>
                <span className="text-gray-500">{mod.lineas > 0 ? `${mod.lineas} líneas` : 'Módulo BI'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════ 4. BASE DE DATOS POSTGRESQL (21 TABLAS + 5 VISTAS) ══════════ */}
      <div className="glass-card p-6 rounded-3xl border border-slate-300 shadow-sm bg-white space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-white border border-slate-300 flex items-center justify-center text-gray-900 shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">Modelo de Base de Datos PostgreSQL (21 Tablas 3FN + 5 Vistas SQL)</h2>
              <p className="text-xs text-gray-500">Diseñado desde cero en Tercera Forma Normal en Supabase Cloud</p>
            </div>
          </div>
          <span className="badge bg-cyan-500/20 text-cyan-700 font-mono font-bold text-xs border border-slate-300 px-3 py-1">
            21 Tablas Relacionales
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-white text-gray-500 uppercase text-[10px] font-mono border-b border-slate-300">
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-3">Tabla en Supabase</th>
                <th className="py-3 px-3">Clasificación</th>
                <th className="py-3 px-4">Descripción & Propósito de la Configuración</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 text-gray-600">
              {TABLES.map((t, i) => (
                <tr key={t.name} className="hover:bg-white/[0.03] transition-colors">
                  <td className="py-2.5 px-3 font-mono text-gray-500 text-[10px] text-center">{i + 1}</td>
                  <td className="py-2.5 px-3 font-mono text-cyan-700 font-bold">{t.name}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-700 border border-slate-300">
                      {t.grupo}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-gray-600 text-[11px]">{t.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Vistas SQL Analíticas */}
        <div className="pt-4 border-t border-slate-300 space-y-3">
          <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-700" /> 5 Vistas SQL Analíticas Creadas en Supabase
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { v: 'v_licitaciones_resumen', desc: 'Licitaciones consolidadas con empresa, cliente y contrato adjudicado' },
              { v: 'v_kpis_efectividad_comercial', desc: 'KPIs: tasa de adjudicación, montos ofertados vs. adjudicados' },
              { v: 'v_matriz_raci_contrato', desc: 'Matriz RACI completa cruzada por contrato y proceso' },
              { v: 'v_cronograma_entregas_pendientes', desc: 'Cronograma con semáforo logístico de entregas programadas' },
              { v: 'v_mesa_ayuda_incidencias', desc: 'Incidencias activas con técnico responsable y área asignada' },
            ].map((vw, vi) => (
              <div key={vw.v} className="p-3 rounded-xl bg-white border border-slate-300 flex items-start gap-3">
                <span className="font-mono text-xs font-black px-2 py-1 rounded bg-cyan-500/20 text-cyan-700 border border-slate-300 shrink-0">
                  V{vi + 1}
                </span>
                <div>
                  <span className="font-mono text-xs font-bold text-gray-900 block">{vw.v}</span>
                  <span className="text-xs text-gray-500">{vw.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════ 5. APIS, SCRIPTS PYTHON & AUTOMATIZACIONES ══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* APIs Backend & Scripts */}
        <div className="glass-card p-6 rounded-3xl border border-slate-300 shadow-sm bg-white space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-white border border-slate-300 flex items-center justify-center text-gray-900 shadow-sm">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">4 APIs Backend & 4 Scripts de Automatización</h2>
              <p className="text-xs text-gray-500">Rutas API de Next.js y scripts desarrollados en Python & Node.js</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {APIS.map(api => (
              <div key={api.ruta} className="p-3 rounded-xl bg-white border border-slate-300 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-700 border border-slate-300">{api.metodo}</span>
                  <span className="font-mono text-xs font-bold text-violet-700">{api.ruta}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{api.desc}</p>
              </div>
            ))}

            {SCRIPTS.map(s => (
              <div key={s.name} className="p-3 rounded-xl bg-white border border-slate-300 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 border border-slate-300">{s.tipo}</span>
                  <span className="font-mono text-xs font-bold text-amber-700">{s.name}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 9 Automatizaciones Activas */}
        <div className="glass-card p-6 rounded-3xl border border-slate-300 shadow-sm bg-white space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-white border border-slate-300 flex items-center justify-center text-gray-900 shadow-sm">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">9 Automatizaciones Operativas Activas</h2>
              <p className="text-xs text-gray-500">Funcionalidades automatizadas corriendo 24/7 sin intervención manual</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {[
              { label: 'Semáforo Automático de Fechas', tipo: 'Frontend', desc: 'calcularSemaforoFecha() evalúa días restantes y asigna Verde/Naranja/Rojo en tiempo real. Activo en Kardex, Planner, Contratos y Obligaciones.' },
              { label: 'Alertas Live de Stock ROP', tipo: 'Frontend', desc: 'AlertsNotificationCenter calcula ROP, días de cobertura y niveles CRITICO/REORDEN/FEFO desde el stock actual y consumo diario por SKU.' },
              { label: 'API /api/db — Bypass RLS', tipo: 'Backend', desc: 'Endpoint que ejecuta operaciones con clave de servicio (service_role), evitando bloqueos de Row Level Security para operaciones de administrador.' },
              { label: 'OCR de Documentos a Lapicero', tipo: 'Backend', desc: 'API /api/ocr-lapicero ejecuta script Python + OpenCV para leer documentos físicos escritos a mano y convertirlos en registros digitales estructurados.' },
              { label: 'Reasignación de Responsable', tipo: 'Full Stack', desc: 'ReasignarResponsableModal actualiza el responsable en incidencias_seguimiento vía Supabase en tiempo real sin recargar la página.' },
              { label: 'Autenticación & Roles Supabase', tipo: 'Supabase', desc: 'Login/logout con Supabase Auth. Roles detectados automáticamente por email. Redirección a /login si no autenticado. Middleware de protección de rutas.' },
              { label: 'Deploy CI/CD Automático', tipo: 'DevOps', desc: 'Cada push a rama main en GitHub dispara build y deploy automático en Vercel en ~1-2 minutos sin intervención manual.' },
              { label: 'Análisis Demanda Mensual', tipo: 'Frontend', desc: 'DynamicMonthlyDemandAnalytics agrupa datos históricos por producto/mes y genera gráficas Recharts interactivas en tiempo real.' },
              { label: 'Reporte de Cumplimiento por Persona', tipo: 'Frontend', desc: 'Calcula automáticamente la tasa de cumplimiento por responsable desde los 26 hitos del Planner. Genera ranking con scorecards visuales.' },
            ].map((auto, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-white border border-slate-300 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-xs">{auto.label}</span>
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-teal-500/20 text-teal-700 border border-slate-300">{auto.tipo}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">{auto.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════ 6. 14 LOGROS TÉCNICOS Y CONSTANCIA DE TRABAJO ══════════ */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-300 bg-white border border-slate-300 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white border border-slate-300 flex items-center justify-center text-gray-900 shadow-sm">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900">Constancia de 14 Logros Técnicos Entregados</h2>
            <p className="text-xs text-gray-600">Resumen ejecutivo para la Dirección y Jefatura General sobre las actividades completadas</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {[
            'Diseño completo de base de datos relacional normalizada (3FN) desde cero',
            '11 módulos del dashboard completamente funcionales en producción en Vercel',
            '9 componentes reutilizables TypeScript / React de alto rendimiento',
            '4 APIs backend de lógica de negocio y bypass seguro de Row Level Security',
            'Sistema OCR en Python + OpenCV para digitalizar documentos escritos a lapicero',
            'Automatización de notificaciones masivas por email a encargados de área',
            'Integración con n8n para workflows automáticos de recordatorios de cumplimiento',
            'CI/CD automático — cada actualización en GitHub despliega en Vercel',
            'Migración masiva de datos reales desde Excel a PostgreSQL en Supabase Cloud',
            'Sistema de roles y control de acceso por perfil de usuario',
            'Reporte de cumplimiento por responsable con ranking y scorecards de efectividad',
            'Análisis de demanda mensual agrupada con gráficas Recharts interactivas',
            'Módulos con exportación instantánea a Excel (CSV) e impresión en PDF',
            'Modo oscuro empresarial con diseño personalizado en tono Teal/Aqua Marina',
          ].map((logro, i) => (
            <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-300">
              <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <span className="text-xs text-gray-700 font-medium leading-relaxed">{logro}</span>
            </div>
          ))}
        </div>

        {/* FIRMA FORMAL */}
        <div className="pt-6 mt-6 border-t border-slate-300 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div>
            <p className="font-bold text-gray-900">Control Planner PRO v2.0 — LAB &amp; MED SV</p>
            <p className="text-[11px] text-gray-500">Documento de Constancia de Trabajo y Entregables de Business Intelligence</p>
          </div>

          <div className="text-right bg-white p-3.5 rounded-2xl border border-slate-300">
            <p className="font-mono text-teal-700 font-black text-sm">José Lenny Gómez</p>
            <p className="text-[10px] text-gray-500 font-bold">Planificación Estratégica &amp; Business Intelligence</p>
            <p className="text-[9px] text-gray-500 font-mono mt-0.5">{new Date().toLocaleDateString('es-SV', { dateStyle: 'full' })}</p>
          </div>
        </div>
      </div>

    </div>
  )
}
