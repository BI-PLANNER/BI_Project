'use client'

import { useState } from 'react'
import {
  FileText, Database, Layers, Zap, CheckCircle2, Server,
  Code2, GitBranch, Table2, Eye, Shield, Building2, Users,
  BarChart3, Activity, Boxes, ShieldCheck, ClipboardList,
  CalendarClock, HelpCircle, Truck, Star, Link2, Cpu,
  FolderOpen, BookOpen, Package, ArrowUpRight, Globe,
  Sparkles, Award, TrendingUp, RefreshCw, ChevronRight
} from 'lucide-react'

const MODULES = [
  { icon: Boxes, label: 'Stock & Inventario BI', ruta: '/dashboard/stock', lineas: 3295, desc: 'Control de inventario con ROP automático, semáforo de stock, alertas live CRITICO/REORDEN/FEFO, análisis de demanda mensual con gráficas Recharts y CRUD completo.', color: 'teal', estado: 'Producción' },
  { icon: FileText, label: 'Contratos & RACI', ruta: '/dashboard/contratos', lineas: 1295, desc: '6 contratos institucionales con hospitales públicos. Matriz RACI (Responsable/Accountable/Consultado/Informado) por numeral. Control de fianzas de cumplimiento.', color: 'cyan', estado: 'Producción' },
  { icon: CalendarClock, label: 'Panel Planner', ruta: '/dashboard/planner', lineas: 1618, desc: '26 pendientes oficiales del ciclo operativo. Semáforo automático por fecha. Reasignación de responsable en tiempo real. Generador de email de presión URGENTE/CRÍTICO.', color: 'indigo', estado: 'Producción' },
  { icon: ShieldCheck, label: 'Garantías & Fianzas', ruta: '/dashboard/garantias', lineas: 391, desc: 'Control de fianzas de cumplimiento y buena inversión por contrato. Estado y vencimiento con alertas de fecha.', color: 'emerald', estado: 'Producción' },
  { icon: Database, label: 'Gestión por Tablas (21)', ruta: '/dashboard/tablas', lineas: 867, desc: 'CRUD maestro de las 21 tablas del sistema. Edición directa de catálogos: áreas, personas, clientes, ubicaciones. Conteos en vivo desde Supabase.', color: 'violet', estado: 'Producción' },
  { icon: BarChart3, label: 'Dashboard Obligaciones', ruta: '/dashboard/obligaciones', lineas: 1382, desc: 'Panel ejecutivo con 4 gráficas de pastel interactivas. Reporte de Cumplimiento por Responsable con ranking 🥇🥈🥉 y scorecards. Exportación CSV. Notificaciones masivas.', color: 'amber', estado: 'Producción' },
  { icon: HelpCircle, label: 'Kardex / Mesa de Ayuda', ruta: '/dashboard/kardex', lineas: 537, desc: 'Registro y seguimiento de incidencias técnicas. Semáforo de vencimiento automático. Asignación de técnico responsable por área.', color: 'rose', estado: 'Producción' },
  { icon: Truck, label: 'Pedidos & Entregas', ruta: '/dashboard/pedidos', lineas: 380, desc: 'Cronograma de entregas programadas por contrato y hospital. Actualización de estado (Pendiente / En Tránsito / Entregado).', color: 'orange', estado: 'Producción' },
  { icon: Layers, label: 'Fases de Contratos', ruta: '/dashboard/fases', lineas: 1083, desc: 'Checklist por numeral de contrato COMPRASAL. Matriz de entregas cruzada por hospital y producto. 2,766 líneas de data migrada desde Excel.', color: 'pink', estado: 'Producción' },
  { icon: TrendingUp, label: 'Análisis BI', ruta: '/dashboard/analisis', lineas: 0, desc: 'Módulo de análisis avanzado de indicadores comerciales y KPIs de efectividad.', color: 'sky', estado: 'Producción' },
  { icon: BookOpen, label: 'Reporte Técnico', ruta: '/dashboard/reporte', lineas: 0, desc: 'Documentación viva de toda la plataforma — esta página.', color: 'teal', estado: 'Producción' },
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
  { name: 'clientes', grupo: 'Org.', desc: '6 hospitales clientes activos' },
  { name: 'areas', grupo: 'Org.', desc: '7 áreas organizacionales' },
  { name: 'personas', grupo: 'Org.', desc: 'Colaboradores del equipo' },
  { name: 'roles', grupo: 'Org.', desc: 'Roles RACI operativos' },
  { name: 'estatus', grupo: 'Org.', desc: 'Catálogo de estados (semáforo)' },
  { name: 'users', grupo: 'Org.', desc: 'Usuarios del sistema con auth' },
  { name: 'marcas', grupo: 'Producto', desc: 'Marcas comerciales (Siemens, etc.)' },
  { name: 'productos_equipo', grupo: 'Producto', desc: 'Catálogo de productos/SKU' },
  { name: 'procesos', grupo: 'Producto', desc: 'Procesos contractuales' },
  { name: 'tipos_dependiente', grupo: 'Producto', desc: 'Clasificación de dependientes' },
  { name: 'ubicaciones', grupo: 'Producto', desc: 'Laboratorios y ubicaciones' },
  { name: 'situaciones', grupo: 'Producto', desc: 'Tipos de situación/obligación' },
  { name: 'licitaciones_ofertas', grupo: 'Comercial', desc: 'Licitaciones y ofertas COMPRASAL' },
  { name: 'ofertas_items', grupo: 'Comercial', desc: 'Renglones de ofertas' },
  { name: 'entregas_programadas', grupo: 'Comercial', desc: 'Cronograma de entregas' },
  { name: 'contratos', grupo: 'Contrato', desc: '6 contratos adjudicados' },
  { name: 'contrato_procesos', grupo: 'Contrato', desc: 'Fases y procesos por contrato' },
  { name: 'asignaciones_proceso', grupo: 'Contrato', desc: 'Matriz RACI por asignación' },
  { name: 'incidencias_seguimiento', grupo: 'Contrato', desc: 'Mesa de ayuda / pendientes' },
]

const GRUPO_COLORS: Record<string, string> = {
  'Org.': '#0d9488',
  'Producto': '#0891b2',
  'Comercial': '#8b5cf6',
  'Contrato': '#ec4899',
}

const STACK = [
  { label: 'Framework', value: 'Next.js 14', sub: 'App Router · TypeScript 5', icon: '⚡' },
  { label: 'Base de Datos', value: 'Supabase', sub: 'PostgreSQL · Auth · RLS', icon: '🗄️' },
  { label: 'Despliegue', value: 'Vercel', sub: 'CI/CD desde GitHub main', icon: '🚀' },
  { label: 'Gráficas', value: 'Recharts', sub: 'SVG interactivo · Pie · Bar', icon: '📊' },
  { label: 'Estilos', value: 'CSS Custom', sub: 'Dark mode · Glassmorphism · Teal', icon: '🎨' },
  { label: 'Íconos', value: 'Lucide React', sub: '40+ íconos utilizados', icon: '✦' },
  { label: 'OCR/IA', value: 'Python + OpenCV', sub: 'Lectura de documentos físicos', icon: '🤖' },
  { label: 'Workflow', value: 'n8n', sub: 'Automatización de notificaciones', icon: '⚙️' },
]

type TabId = 'resumen' | 'modulos' | 'bd' | 'apis' | 'automatizaciones'

const TABS: { id: TabId; label: string; icon: any; count: string }[] = [
  { id: 'resumen', label: 'Resumen General', icon: BarChart3, count: '' },
  { id: 'modulos', label: 'Módulos', icon: Layers, count: '11' },
  { id: 'bd', label: 'Base de Datos', icon: Database, count: '21+5' },
  { id: 'apis', label: 'APIs & Scripts', icon: Code2, count: '4+4' },
  { id: 'automatizaciones', label: 'Automatizaciones', icon: Zap, count: '9' },
]

export default function ReporteTecnicoPage() {
  const [activeTab, setActiveTab] = useState<TabId>('resumen')

  const totalLines = MODULES.reduce((a, m) => a + m.lineas, 0)

  return (
    <div className="space-y-6 pb-16">

      {/* ══════════ HEADER ══════════ */}
      <div className="glass-card p-6 rounded-3xl border border-teal-500/30 bg-gradient-to-br from-slate-900 via-teal-950/40 to-slate-900 relative overflow-hidden shadow-2xl">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-teal-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-64 h-64 bg-cyan-500/8 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="badge bg-teal-500/20 text-teal-300 font-mono font-bold text-[10px] border border-teal-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> DOCUMENTACIÓN OFICIAL DE ACTIVIDADES
            </span>
            <span className="badge bg-emerald-500/20 text-emerald-300 font-mono text-[10px] border border-emerald-500/30">
              v2.0 · Septiembre 2026
            </span>
            <span className="badge bg-indigo-500/20 text-indigo-300 font-mono text-[10px] border border-indigo-500/30">
              🚀 En Producción — Vercel
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight mb-2">
            Reporte de Actividades & Logros Técnicos
          </h1>
          <p className="text-sm text-gray-300 max-w-3xl leading-relaxed">
            Documentación completa de todo el trabajo realizado en la plataforma
            <strong className="text-teal-300"> Control Planner PRO — LAB &amp; MED</strong>.
            Desarrollado por <strong className="text-white">José Lenny Gómez</strong> — Área de Business Intelligence &amp; Planificación Estratégica.
          </p>

          {/* KPI STRIP */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t border-white/10">
            {[
              { label: 'Módulos', value: '11', sub: 'páginas funcionales', color: 'text-teal-300' },
              { label: 'Tablas BD', value: '21', sub: '+ 5 vistas SQL', color: 'text-cyan-300' },
              { label: 'Componentes', value: '9', sub: 'TSX reutilizables', color: 'text-indigo-300' },
              { label: 'APIs Backend', value: '4', sub: '+ 4 scripts Python/JS', color: 'text-violet-300' },
              { label: 'Líneas Código', value: '~' + Math.round(totalLines / 1000) + 'K+', sub: 'TypeScript / TSX', color: 'text-amber-300' },
            ].map(k => (
              <div key={k.label} className="bg-slate-950/60 rounded-2xl p-3 border border-white/10">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">{k.label}</span>
                <span className={`text-2xl font-black font-mono ${k.color}`}>{k.value}</span>
                <span className="text-[10px] text-gray-500 block">{k.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════ TABS ══════════ */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
              activeTab === tab.id
                ? 'bg-teal-500/20 text-teal-200 border-teal-500/40 shadow-lg shadow-teal-500/10'
                : 'bg-slate-900/60 text-gray-400 border-white/10 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
            {tab.count && (
              <span className="bg-white/10 px-1.5 py-0.5 rounded-full font-mono text-[10px]">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════ RESUMEN GENERAL ══════════ */}
      {activeTab === 'resumen' && (
        <div className="space-y-5">

          {/* Descripción del proyecto */}
          <div className="glass-card p-5 rounded-2xl border border-teal-500/20 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-600 flex items-center justify-center shadow">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-sm font-black text-white">¿Qué es Control Planner PRO?</h2>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed mb-4">
              Plataforma empresarial de gestión integral desarrollada desde cero para centralizar la operación de
              LAB &amp; MED con sus 6 hospitales clientes. Reemplaza múltiples archivos Excel dispersos por un
              <strong className="text-teal-300"> sistema web centralizado, seguro y en tiempo real</strong>,
              accesible desde cualquier dispositivo con internet.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-950/60 rounded-xl p-3 border border-teal-500/20">
                <p className="text-[10px] text-teal-400 uppercase font-bold mb-1">Problema que resuelve</p>
                <p className="text-xs text-gray-300">Elimina la dispersión de información en Excel, WhatsApp y correos. Centraliza licitaciones, contratos, pendientes e inventario en un solo sistema.</p>
              </div>
              <div className="bg-slate-950/60 rounded-xl p-3 border border-cyan-500/20">
                <p className="text-[10px] text-cyan-400 uppercase font-bold mb-1">Usuarios que lo usan</p>
                <p className="text-xs text-gray-300">Gerencia General, PM, Aplicaciones, IT, Logística, Soporte y Licitaciones. Roles diferenciados con acceso controlado.</p>
              </div>
              <div className="bg-slate-950/60 rounded-xl p-3 border border-amber-500/20">
                <p className="text-[10px] text-amber-400 uppercase font-bold mb-1">Impacto operativo</p>
                <p className="text-xs text-gray-300">Semáforos automáticos, alertas en vivo, reportes exportables y notificaciones automáticas. Reducción de tiempo en seguimiento manual.</p>
              </div>
            </div>
          </div>

          {/* Stack tecnológico */}
          <div className="glass-card p-5 rounded-2xl border border-white/10 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow">
                <Cpu className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-sm font-black text-white">Stack Tecnológico</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {STACK.map(s => (
                <div key={s.label} className="bg-slate-950/60 rounded-xl p-3 border border-white/8">
                  <span className="text-xl block mb-1">{s.icon}</span>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">{s.label}</p>
                  <p className="text-sm font-black text-white">{s.value}</p>
                  <p className="text-[10px] text-gray-500">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Infraestructura */}
          <div className="glass-card p-5 rounded-2xl border border-indigo-500/20 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center shadow">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-sm font-black text-white">Infraestructura & Conexiones</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { titulo: 'Supabase PostgreSQL', estado: 'CONECTADO', color: 'emerald', desc: '21 tablas · 5 vistas · Auth · RLS · Row Level Security · Cloud us-east-1' },
                { titulo: 'Vercel Edge Network', estado: 'ACTIVO', color: 'emerald', desc: 'control-planner.vercel.app · HTTPS · Deploy desde GitHub · CI/CD automático' },
                { titulo: 'API Route /api/db', estado: 'OPERATIVA', color: 'emerald', desc: 'POST: INSERT / UPDATE / DELETE / SELECT · Bypass RLS con service_role key' },
                { titulo: 'GitHub Repository', estado: 'SINCRONIZADO', color: 'emerald', desc: 'github.com/BI-PLANNER/BI_Project · rama main · Deploy automático en cada push' },
              ].map(c => (
                <div key={c.titulo} className={`bg-slate-950/60 rounded-xl p-4 border border-${c.color}-500/20 space-y-1.5`}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-black text-white">{c.titulo}</span>
                    <span className={`ml-auto text-[9px] font-bold bg-${c.color}-500/20 text-${c.color}-300 px-2 py-0.5 rounded-full border border-${c.color}-500/30`}>{c.estado}</span>
                  </div>
                  <p className="text-[11px] text-gray-400">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Logros clave */}
          <div className="glass-card p-5 rounded-2xl border border-amber-500/20 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow">
                <Award className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-sm font-black text-white">14 Logros Técnicos Clave</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                'Diseño completo de base de datos relacional normalizada (3FN) desde cero',
                '11 módulos del dashboard completamente funcionales en producción',
                '9 componentes reutilizables de alto rendimiento',
                '4 APIs backend con lógica de negocio propia',
                'Sistema OCR para digitalizar documentos físicos escritos a lapicero',
                'Automatización de notificaciones por email para encargados',
                'Integración con n8n para workflows de automatización',
                'CI/CD automático — cada push a GitHub despliega solo a Vercel',
                'Migración de datos reales desde Excel a PostgreSQL (~175KB)',
                'Sistema de roles y acceso diferenciado por perfil (Gerencia / Control Total)',
                'Reporte ejecutivo de cumplimiento por responsable del Planner BI',
                'Análisis de demanda mensual con gráficas interactivas Recharts',
                'Exportación a CSV/Excel desde cualquier módulo',
                'Modo oscuro premium con paleta Teal/Aqua Marina personalizada',
              ].map((logro, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-300">{logro}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════ MÓDULOS ══════════ */}
      {activeTab === 'modulos' && (
        <div className="space-y-4">
          <p className="text-xs text-gray-400 ml-1">11 módulos del dashboard, todos en producción y accesibles desde el sidebar.</p>
          {MODULES.map((mod, idx) => (
            <div key={mod.ruta} className="glass-card p-5 rounded-2xl border border-white/10 shadow-xl hover:border-teal-500/30 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600/30 to-cyan-600/30 border border-teal-500/30 flex items-center justify-center shrink-0">
                  <mod.icon className="w-5 h-5 text-teal-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] text-gray-500">#{String(idx + 1).padStart(2, '0')}</span>
                    <h3 className="font-black text-white text-sm">{mod.label}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ✅ {mod.estado}
                    </span>
                    {mod.lineas > 0 && (
                      <span className="text-[10px] font-mono text-gray-500 ml-auto">{mod.lineas.toLocaleString()} líneas</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{mod.desc}</p>
                  <p className="text-[10px] font-mono text-teal-400 mt-1.5">{mod.ruta}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Componentes */}
          <div className="glass-card p-5 rounded-2xl border border-indigo-500/20 shadow-xl mt-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow">
                <Package className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-sm font-black text-white">9 Componentes Reutilizables (src/components)</h2>
            </div>
            <div className="space-y-2">
              {COMPONENTS.map(c => (
                <div key={c.name} className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/40 border border-white/5 hover:bg-white/[0.03] transition-colors">
                  <div className="font-mono text-[10px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-lg shrink-0 whitespace-nowrap">
                    {c.kb}KB
                  </div>
                  <div>
                    <p className="font-mono text-xs font-bold text-white">{c.name}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════ BASE DE DATOS ══════════ */}
      {activeTab === 'bd' && (
        <div className="space-y-5">
          <div className="glass-card p-5 rounded-2xl border border-teal-500/20 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-600 flex items-center justify-center shadow">
                <Database className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-sm font-black text-white">21 Tablas — Modelo Relacional 3FN</h2>
            </div>
            <p className="text-xs text-gray-400 mb-4">Diseño propio desde cero, normalizado en Tercera Forma Normal. Schema: 812 líneas SQL (~27KB). Data real migrada desde Excel: ~175KB.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="text-gray-400 uppercase text-[10px] font-mono border-b border-white/10">
                    <th className="py-2 px-3 text-left w-8">#</th>
                    <th className="py-2 px-3 text-left">Tabla</th>
                    <th className="py-2 px-3 text-left">Grupo</th>
                    <th className="py-2 px-3 text-left">Descripción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {TABLES.map((t, i) => (
                    <tr key={t.name} className="hover:bg-white/[0.03]">
                      <td className="py-2 px-3 font-mono text-gray-500 text-[10px]">{String(i + 1).padStart(2, '0')}</td>
                      <td className="py-2 px-3 font-mono text-teal-300 text-[11px] font-bold">{t.name}</td>
                      <td className="py-2 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ backgroundColor: GRUPO_COLORS[t.grupo] + '20', color: GRUPO_COLORS[t.grupo], border: '1px solid ' + GRUPO_COLORS[t.grupo] + '40' }}>
                          {t.grupo}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-gray-400 text-[11px]">{t.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vistas SQL */}
          <div className="glass-card p-5 rounded-2xl border border-cyan-500/20 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow">
                <Eye className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-sm font-black text-white">5 Vistas SQL Analíticas</h2>
            </div>
            <div className="space-y-2">
              {[
                { v: 'v_licitaciones_resumen', desc: 'Licitaciones consolidadas con empresa, cliente y contrato adjudicado' },
                { v: 'v_kpis_efectividad_comercial', desc: 'KPIs: tasa de adjudicación, montos ofertados vs. adjudicados' },
                { v: 'v_matriz_raci_contrato', desc: 'Matriz RACI completa cruzada por contrato y proceso' },
                { v: 'v_cronograma_entregas_pendientes', desc: 'Cronograma con semáforo logístico de entregas programadas' },
                { v: 'v_mesa_ayuda_incidencias', desc: 'Incidencias activas con técnico responsable y área asignada' },
              ].map((row, i) => (
                <div key={row.v} className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/40 border border-cyan-500/10 hover:bg-white/[0.03]">
                  <span className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-[10px] font-black text-cyan-300 shrink-0">V{i + 1}</span>
                  <div>
                    <p className="font-mono text-[11px] font-bold text-cyan-300">{row.v}</p>
                    <p className="text-[11px] text-gray-400">{row.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════ APIs & SCRIPTS ══════════ */}
      {activeTab === 'apis' && (
        <div className="space-y-5">
          <div className="glass-card p-5 rounded-2xl border border-violet-500/20 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-violet-600 to-purple-600 flex items-center justify-center shadow">
                <Code2 className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-sm font-black text-white">4 Rutas API Backend (Next.js API Routes)</h2>
            </div>
            <div className="space-y-3">
              {APIS.map(api => (
                <div key={api.ruta} className="p-4 rounded-xl bg-slate-950/60 border border-violet-500/15 hover:bg-white/[0.03]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">{api.metodo}</span>
                    <span className="font-mono text-xs font-bold text-violet-300">{api.ruta}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">{api.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-amber-500/20 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow">
                <GitBranch className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-sm font-black text-white">4 Scripts de Automatización (scripts/)</h2>
            </div>
            <div className="space-y-3">
              {SCRIPTS.map(s => (
                <div key={s.name} className="p-4 rounded-xl bg-slate-950/60 border border-amber-500/15 hover:bg-white/[0.03]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">{s.tipo}</span>
                    <span className="font-mono text-xs font-bold text-amber-300">{s.name}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Capa API interna */}
          <div className="glass-card p-5 rounded-2xl border border-teal-500/20 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-600 flex items-center justify-center shadow">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-sm font-black text-white">Capa de Acceso a Datos — api_3fn.ts (22 funciones)</h2>
            </div>
            <p className="text-xs text-gray-400 mb-3">Archivo centralizado que abstrae todas las consultas a Supabase. Evita código repetido y centraliza los patrones de error y transformación de datos.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { tipo: 'CRUD', count: 4, desc: 'insert, update, delete, upsert' },
                { tipo: 'Fetch', count: 13, desc: 'fetchTabla por cada módulo' },
                { tipo: 'Vistas', count: 5, desc: 'fetchV* por vista SQL' },
                { tipo: 'Total', count: 22, desc: 'funciones TypeScript' },
              ].map(g => (
                <div key={g.tipo} className="bg-slate-950/60 rounded-xl p-3 border border-teal-500/15 text-center">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">{g.tipo}</p>
                  <p className="text-2xl font-black text-teal-300 font-mono">{g.count}</p>
                  <p className="text-[10px] text-gray-500">{g.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════ AUTOMATIZACIONES ══════════ */}
      {activeTab === 'automatizaciones' && (
        <div className="space-y-3">
          <p className="text-xs text-gray-400 ml-1">Automatizaciones activas en la plataforma — todas funcionando en producción.</p>
          {[
            { icon: Activity, label: 'Semáforo Automático de Fechas', tipo: 'Frontend', desc: 'calcularSemaforoFecha() evalúa días restantes y asigna Verde/Naranja/Rojo en tiempo real. Activo en Kardex, Planner, Contratos y Obligaciones.', color: 'teal' },
            { icon: Boxes, label: 'Alertas Live de Inventario', tipo: 'Frontend', desc: 'AlertsNotificationCenter calcula ROP, días de cobertura y niveles CRITICO/REORDEN/FEFO desde el stock actual y consumo diario por SKU.', color: 'cyan' },
            { icon: Globe, label: 'API /api/db — Bypass RLS', tipo: 'Backend', desc: 'Endpoint que ejecuta operaciones con clave de servicio (service_role), evitando bloqueos de Row Level Security para operaciones de administrador.', color: 'violet' },
            { icon: Server, label: 'OCR de Documentos a Lapicero', tipo: 'Backend', desc: 'API /api/ocr-lapicero ejecuta script Python + OpenCV para leer documentos físicos escritos a mano y convertirlos en registros digitales estructurados.', color: 'indigo' },
            { icon: Users, label: 'Reasignación de Responsable', tipo: 'Full Stack', desc: 'ReasignarResponsableModal actualiza el responsable en incidencias_seguimiento vía Supabase en tiempo real sin recargar la página.', color: 'emerald' },
            { icon: Shield, label: 'Autenticación & Roles Supabase', tipo: 'Supabase', desc: 'Login/logout con Supabase Auth. Roles detectados automáticamente por email. Redirección a /login si no autenticado. Middleware de protección de rutas.', color: 'amber' },
            { icon: GitBranch, label: 'Deploy CI/CD Automático', tipo: 'DevOps', desc: 'Cada push a rama main en GitHub dispara build y deploy automático en Vercel en ~1-2 minutos sin intervención manual.', color: 'rose' },
            { icon: BarChart3, label: 'Análisis Demanda Mensual', tipo: 'Frontend', desc: 'DynamicMonthlyDemandAnalytics agrupa datos históricos por producto/mes y genera gráficas Recharts interactivas en tiempo real.', color: 'pink' },
            { icon: ClipboardList, label: 'Reporte de Cumplimiento por Persona', tipo: 'Frontend', desc: 'Calcula automáticamente la tasa de cumplimiento por responsable desde los 26 hitos del Planner. Genera ranking con scorecards visuales.', color: 'orange' },
          ].map((auto, idx) => (
            <div key={idx} className="glass-card p-4 rounded-2xl border border-white/10 shadow-xl hover:border-teal-500/30 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600/20 to-cyan-600/20 border border-teal-500/30 flex items-center justify-center shrink-0">
                  <auto.icon className="w-4 h-4 text-teal-300" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-black text-white text-sm">{auto.label}</p>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">{auto.tipo}</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">✅ Activa</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">{auto.desc}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Nota final */}
          <div className="glass-card p-4 rounded-2xl border border-teal-500/20 bg-teal-950/10 mt-2">
            <div className="flex items-start gap-2">
              <Star className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-black text-teal-300 mb-1">Nota Técnica para Liderazgo</p>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  Todas las automatizaciones de frontend están implementadas con React Hooks (useMemo, useCallback, useEffect).
                  Las de backend usan Next.js API Routes con variables de entorno seguras en Vercel.
                  El sistema corre 24/7 en la nube sin mantenimiento manual, con CI/CD automático desde GitHub.
                  <strong className="text-white"> Este sistema fue diseñado, desarrollado y desplegado completamente por José Lenny Gómez.</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center pt-4 border-t border-white/5">
        <p className="text-[11px] text-gray-500">
          Control Planner PRO v2.0 · LABANDMED SV ·
          Desarrollado por <strong className="text-teal-400">José Lenny Gómez</strong> · Business Intelligence
        </p>
        <p className="text-[10px] text-gray-600 mt-0.5">
          {new Date().toLocaleDateString('es-SV', { dateStyle: 'full' })}
        </p>
      </div>
    </div>
  )
}
