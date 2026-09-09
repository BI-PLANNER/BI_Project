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
        <div className="w-10 h-10 border-4 border-teal-500/30 border-t-teal-400 rounded-full animate-spin" />
        <p className="text-xs font-mono text-gray-400">Verificando permisos de acceso...</p>
      </div>
    )
  }

  // 2. Estado de Acceso Restringido (Solo Luis Orellana y José Lenny Gómez)
  if (!canAccess) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="glass-card max-w-lg w-full p-8 rounded-3xl border border-amber-500/30 bg-slate-900/95 text-center space-y-5 shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="badge bg-amber-500/20 text-amber-300 font-mono font-bold text-xs border border-amber-500/30 px-3 py-1">
              🔒 ACCESO EXCLUSIVO
            </span>
            <h2 className="text-2xl font-black text-white">Reporte de Actividades & Cumplimiento</h2>
            <p className="text-xs text-gray-300 leading-relaxed pt-1">
              Este informe técnico oficial de entregables de Business Intelligence está restringido y configurado para visualización exclusiva de:
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-teal-500/20 text-xs font-mono space-y-1.5 text-left mt-3">
              <p className="font-bold text-teal-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                🎯 Luis Orellana <span className="text-[10px] text-teal-400/70">(Gerencia de Integración)</span>
              </p>
              <p className="text-gray-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-500" />
                👤 José Lenny Gómez <span className="text-[10px] text-gray-500">(Planificación Estratégica BI)</span>
              </p>
            </div>

            {currentUserEmail && (
              <p className="text-[11px] text-gray-500 pt-2">
                Usuario activo no autorizado: <span className="text-gray-300 font-mono font-bold">{currentUserEmail}</span>
              </p>
            )}
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard/stock"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/10 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ir al Dashboard General</span>
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition hover:opacity-90 shadow-lg shadow-teal-500/20 cursor-pointer"
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
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-teal-500/30 bg-gradient-to-br from-slate-900 via-teal-950/40 to-slate-900 relative overflow-hidden shadow-2xl">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="badge bg-teal-500/20 text-teal-300 font-mono font-bold text-xs border border-teal-500/30 flex items-center gap-1.5 px-3 py-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" /> CUMPLIMIENTO & ENTREGABLES TÉCNICOS
            </span>
            <span className="badge bg-emerald-500/20 text-emerald-300 font-mono text-xs border border-emerald-500/30 px-3 py-1">
              v2.0 · En Producción — Vercel
            </span>
            <span className="badge bg-indigo-500/20 text-indigo-300 font-mono text-xs border border-indigo-500/30 px-3 py-1">
              Supabase PostgreSQL Cloud
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2">
            Reporte de Actividades & Cumplimiento BI
          </h1>
          <p className="text-sm md:text-base text-gray-300 max-w-4xl leading-relaxed">
            Informe oficial de constancia de desarrollos, configuraciones de base de datos, conexiones y automatizaciones realizadas en la plataforma
            <strong className="text-teal-300"> Control Planner PRO — LAB &amp; MED</strong>.
            Desarrollado y presentado por <strong className="text-white">José Lenny Gómez</strong> (Planificación Estratégica &amp; Business Intelligence) para la <strong className="text-amber-300">Dirección y Jefatura Inmediata</strong>.
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-5 border-t border-white/10">
            {/* KPI STRIP */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 flex-1">
              {[
                { label: 'Módulos UI', value: '11', sub: 'páginas web funcionales', color: 'text-teal-300' },
                { label: 'Tablas BD 3FN', value: '21', sub: '+ 5 Vistas SQL analíticas', color: 'text-cyan-300' },
                { label: 'Componentes', value: '9', sub: 'TSX reutilizables', color: 'text-indigo-300' },
                { label: 'APIs & Scripts', value: '4+4', sub: 'Python OpenCV & Node', color: 'text-violet-300' },
                { label: 'Líneas Código', value: '~11.5K+', sub: 'TypeScript / TSX', color: 'text-amber-300' },
              ].map(k => (
                <div key={k.label} className="bg-slate-950/70 rounded-2xl p-3 border border-white/10 shadow-inner">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">{k.label}</span>
                  <span className={`text-2xl font-black font-mono ${k.color}`}>{k.value}</span>
                  <span className="text-[10px] text-gray-500 block">{k.sub}</span>
                </div>
              ))}
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={handleCopySummary}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-teal-300" />
                    <span>Copiar Resumen</span>
                  </>
                )}
              </button>

              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-slate-950 font-black text-xs flex items-center gap-2 hover:opacity-90 transition cursor-pointer shadow-lg shadow-teal-500/20"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / Guardar PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ 2. RESUMEN DE IMPACTO OPERATIVO ══════════ */}
      <div className="glass-card p-6 rounded-3xl border border-teal-500/20 shadow-2xl bg-slate-900/90 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-lg">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Objetivo del Sistema & Valor Aportado a la Empresa</h2>
            <p className="text-xs text-gray-400">Control Planner PRO — Solución de Inteligencia de Negocios para LAB &amp; MED</p>
          </div>
        </div>

        <p className="text-sm text-gray-300 leading-relaxed">
          Plataforma web empresarial desarrollada desde cero para centralizar, auditar y automatizar toda la operación comercial, logística, contractual y de soporte técnico de
          <strong className="text-teal-300"> LAB &amp; MED con sus 6 hospitales clientes</strong>. Reemplaza hojas de cálculo Excel dispersas por un
          <strong className="text-white"> sistema central en tiempo real en la nube</strong>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-950/60 rounded-2xl p-4 border border-teal-500/20 space-y-1">
            <p className="text-xs text-teal-400 uppercase font-black flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Problema Operativo Resuelto
            </p>
            <p className="text-xs text-gray-300 leading-relaxed">
              Elimina la fragmentación de archivos Excel, correos y registros manuales. Centraliza licitaciones, contratos, matriz RACI, stock de reactivos y entregas en una sola fuente oficial.
            </p>
          </div>

          <div className="bg-slate-950/60 rounded-2xl p-4 border border-cyan-500/20 space-y-1">
            <p className="text-xs text-cyan-400 uppercase font-black flex items-center gap-1.5">
              <Users className="w-4 h-4" /> Usuarios & Roles Cobertura
            </p>
            <p className="text-xs text-gray-300 leading-relaxed">
              Utilizado por Gerencia General, Project Management (PM), Aplicaciones, IT, Logística, Soporte Técnico y Licitaciones. Roles con seguridad RLS en Supabase.
            </p>
          </div>

          <div className="bg-slate-950/60 rounded-2xl p-4 border border-amber-500/20 space-y-1">
            <p className="text-xs text-amber-400 uppercase font-black flex items-center gap-1.5">
              <Zap className="w-4 h-4" /> Eficiencia & Automatización
            </p>
            <p className="text-xs text-gray-300 leading-relaxed">
              Semáforos automáticos de vencimiento, alertas live de punto de reorden (ROP), OCR para texto escrito a mano y reportes ejecutivos exportables a Excel/PDF.
            </p>
          </div>
        </div>
      </div>

      {/* ══════════ 3. LOS 11 MÓDULOS DE LA APLICACIÓN WEB ══════════ */}
      <div className="glass-card p-6 rounded-3xl border border-white/10 shadow-2xl bg-slate-900/90 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-teal-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Catálogo de 11 Módulos Desarrollados en Producción</h2>
              <p className="text-xs text-gray-400">Páginas web completamente operativas y accesibles desde el menú lateral (Sidebar)</p>
            </div>
          </div>
          <span className="badge bg-teal-500/20 text-teal-300 font-mono font-bold text-xs border border-teal-500/30 px-3 py-1">
            100% Funcionales
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map((mod, idx) => (
            <div key={mod.ruta} className="bg-slate-950/70 rounded-2xl p-4 border border-white/10 hover:border-teal-500/40 transition-all flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-gray-500 font-bold">MÓDULO #{String(idx + 1).padStart(2, '0')}</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ✅ {mod.estado}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <mod.icon className="w-4 h-4 text-teal-400 shrink-0" />
                  <h3 className="font-black text-white text-sm truncate">{mod.label}</h3>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{mod.desc}</p>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                <span className="text-teal-400">{mod.ruta}</span>
                <span className="text-gray-500">{mod.lineas > 0 ? `${mod.lineas} líneas` : 'Módulo BI'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════ 4. BASE DE DATOS POSTGRESQL (21 TABLAS + 5 VISTAS) ══════════ */}
      <div className="glass-card p-6 rounded-3xl border border-white/10 shadow-2xl bg-slate-900/90 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Modelo de Base de Datos PostgreSQL (21 Tablas 3FN + 5 Vistas SQL)</h2>
              <p className="text-xs text-gray-400">Diseñado desde cero en Tercera Forma Normal en Supabase Cloud</p>
            </div>
          </div>
          <span className="badge bg-cyan-500/20 text-cyan-300 font-mono font-bold text-xs border border-cyan-500/30 px-3 py-1">
            21 Tablas Relacionales
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/90 text-gray-400 uppercase text-[10px] font-mono border-b border-white/10">
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-3">Tabla en Supabase</th>
                <th className="py-3 px-3">Clasificación</th>
                <th className="py-3 px-4">Descripción & Propósito de la Configuración</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {TABLES.map((t, i) => (
                <tr key={t.name} className="hover:bg-white/[0.03] transition-colors">
                  <td className="py-2.5 px-3 font-mono text-gray-500 text-[10px] text-center">{i + 1}</td>
                  <td className="py-2.5 px-3 font-mono text-cyan-300 font-bold">{t.name}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {t.grupo}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-gray-300 text-[11px]">{t.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Vistas SQL Analíticas */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" /> 5 Vistas SQL Analíticas Creadas en Supabase
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { v: 'v_licitaciones_resumen', desc: 'Licitaciones consolidadas con empresa, cliente y contrato adjudicado' },
              { v: 'v_kpis_efectividad_comercial', desc: 'KPIs: tasa de adjudicación, montos ofertados vs. adjudicados' },
              { v: 'v_matriz_raci_contrato', desc: 'Matriz RACI completa cruzada por contrato y proceso' },
              { v: 'v_cronograma_entregas_pendientes', desc: 'Cronograma con semáforo logístico de entregas programadas' },
              { v: 'v_mesa_ayuda_incidencias', desc: 'Incidencias activas con técnico responsable y área asignada' },
            ].map((vw, vi) => (
              <div key={vw.v} className="p-3 rounded-xl bg-slate-950/70 border border-cyan-500/15 flex items-start gap-3">
                <span className="font-mono text-xs font-black px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0">
                  V{vi + 1}
                </span>
                <div>
                  <span className="font-mono text-xs font-bold text-white block">{vw.v}</span>
                  <span className="text-xs text-gray-400">{vw.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════ 5. APIS, SCRIPTS PYTHON & AUTOMATIZACIONES ══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* APIs Backend & Scripts */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 shadow-2xl bg-slate-900/90 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-violet-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">4 APIs Backend & 4 Scripts de Automatización</h2>
              <p className="text-xs text-gray-400">Rutas API de Next.js y scripts desarrollados en Python & Node.js</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {APIS.map(api => (
              <div key={api.ruta} className="p-3 rounded-xl bg-slate-950/70 border border-violet-500/15 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">{api.metodo}</span>
                  <span className="font-mono text-xs font-bold text-violet-300">{api.ruta}</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{api.desc}</p>
              </div>
            ))}

            {SCRIPTS.map(s => (
              <div key={s.name} className="p-3 rounded-xl bg-slate-950/70 border border-amber-500/15 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">{s.tipo}</span>
                  <span className="font-mono text-xs font-bold text-amber-300">{s.name}</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 9 Automatizaciones Activas */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 shadow-2xl bg-slate-900/90 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">9 Automatizaciones Operativas Activas</h2>
              <p className="text-xs text-gray-400">Funcionalidades automatizadas corriendo 24/7 sin intervención manual</p>
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
              <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-teal-500/15 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{auto.label}</span>
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">{auto.tipo}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">{auto.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════ 6. 14 LOGROS TÉCNICOS Y CONSTANCIA DE TRABAJO ══════════ */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Constancia de 14 Logros Técnicos Entregados</h2>
            <p className="text-xs text-gray-300">Resumen ejecutivo para la Dirección y Jefatura General sobre las actividades completadas</p>
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
            <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-amber-500/15">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span className="text-xs text-gray-200 font-medium leading-relaxed">{logro}</span>
            </div>
          ))}
        </div>

        {/* FIRMA FORMAL */}
        <div className="pt-6 mt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div>
            <p className="font-bold text-white">Control Planner PRO v2.0 — LAB &amp; MED SV</p>
            <p className="text-[11px] text-gray-400">Documento de Constancia de Trabajo y Entregables de Business Intelligence</p>
          </div>

          <div className="text-right bg-slate-950/80 p-3.5 rounded-2xl border border-teal-500/30">
            <p className="font-mono text-teal-300 font-black text-sm">José Lenny Gómez</p>
            <p className="text-[10px] text-gray-400 font-bold">Planificación Estratégica &amp; Business Intelligence</p>
            <p className="text-[9px] text-gray-500 font-mono mt-0.5">{new Date().toLocaleDateString('es-SV', { dateStyle: 'full' })}</p>
          </div>
        </div>
      </div>

    </div>
  )
}
