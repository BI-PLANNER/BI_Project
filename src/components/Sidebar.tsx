'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  FileText,
  CalendarClock,
  Boxes,
  LogOut,
  ChevronLeft,
  Database,
  PieChart as PieIcon,
  ShieldCheck,
  LayoutDashboard,
  BookOpen,
  Truck,
  BarChart3
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import LabMedLogo from '@/components/LabMedLogo'
import AlertsNotificationCenter from '@/components/AlertsNotificationCenter'

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // User state
  const [userProfile, setUserProfile] = useState<{
    email: string
    nombre: string
    apellido: string
    departamento: string
    isGerenteGeneral: boolean
    isLuisOrellana: boolean
    isJoseLenny: boolean
    isPersonaGlobal: boolean
    canViewReporte: boolean
  }>({
    email: '',
    nombre: 'Usuario',
    apellido: '',
    departamento: 'Cargando...',
    isGerenteGeneral: false,
    isLuisOrellana: false,
    isJoseLenny: false,
    isPersonaGlobal: false,
    canViewReporte: false
  })

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || !user.email) return

        const userEmail = user.email.toLowerCase()
        const isPersonaGlobal = userEmail.includes('personaglobal') || userEmail.includes('persona.global')
        const isGG = userEmail.includes('aaltunaher') || userEmail.includes('antonio')
        const isLuis = userEmail.includes('lorellana') || userEmail.includes('luis.orellana') || userEmail.includes('orellana')
        const isLenny = userEmail.includes('jose.gomez') || userEmail.includes('lenny') || (!isGG && !isLuis && !isPersonaGlobal)

        // Fetch public user row
        const { data: dbUser } = await supabase
          .from('users')
          .select('nombre, apellido, departamento')
          .ilike('email', userEmail)
          .maybeSingle()

        let defaultNombre = 'Usuario'
        let defaultApellido = ''
        let defaultDepto = 'Colaborador'

        if (isPersonaGlobal) {
          defaultNombre = 'PersonaGlobal'
          defaultApellido = 'Global'
          defaultDepto = 'Global / General'
        } else if (isLuis) {
          defaultNombre = 'Luis'
          defaultApellido = 'Orellana'
          defaultDepto = 'Gerencia de Integración'
        } else if (isGG) {
          defaultNombre = 'Antonio'
          defaultApellido = 'Altuna Hernandez'
          defaultDepto = 'Gerente General'
        } else if (isLenny) {
          defaultNombre = 'José Lenny'
          defaultApellido = 'Gómez'
          defaultDepto = 'Planificación Estratégica & Dirección'
        }

        const nombre = dbUser?.nombre || user.user_metadata?.nombre || defaultNombre
        const apellido = dbUser?.apellido || user.user_metadata?.apellido || defaultApellido
        const depto = dbUser?.departamento || user.user_metadata?.departamento || defaultDepto

        setUserProfile({
          email: userEmail,
          nombre,
          apellido,
          departamento: depto,
          isGerenteGeneral: isGG,
          isLuisOrellana: isLuis,
          isJoseLenny: isLenny,
          isPersonaGlobal,
          canViewReporte: isLuis || isLenny || isPersonaGlobal
        })
      } catch (err) {
        console.warn('Error loading user in sidebar:', err)
      }
    }
    loadUserProfile()
  }, [supabase])

  // Route guard para PersonaGlobal: Solo puede ver el Dashboard de Analítica Gerencial
  useEffect(() => {
    if (userProfile.isPersonaGlobal) {
      const allowedPaths = ['/dashboard/analytics', '/dashboard/analytics/gerencia', '/dashboard/analytics/reportes']
      if (!allowedPaths.some(p => pathname.startsWith(p))) {
        router.replace('/dashboard/analytics/gerencia')
      }
    }
  }, [userProfile.isPersonaGlobal, pathname, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  // Secciones permitidas para Luis Orellana
  const LUIS_ALLOWED_HREFS = [
    '/dashboard/analytics'
  ]

  // Navigation items (full list)
  const allNavItems = [
    { href: '/dashboard/contratos', label: 'Contratos & RACI', icon: FileText },
    { href: '/dashboard/planner', label: 'Panel Planner', icon: CalendarClock },
    { href: '/dashboard/garantias', label: 'Garantías', icon: ShieldCheck },
    ...(userProfile.canViewReporte ? [{
      href: '/dashboard/analytics/gerencia',
      label: 'Centro de Analítica BI',
      icon: PieIcon
    }] : []),
    { href: '/dashboard/tablas', label: 'Gestión por Tablas (21)', icon: Database }
  ]

  // Filtrar navegación según rol de usuario
  const navItems = userProfile.isPersonaGlobal
    ? [{ href: '/dashboard/analytics/gerencia', label: 'Centro de Analítica BI', icon: PieIcon }]
    : userProfile.isLuisOrellana
    ? allNavItems.filter(item => LUIS_ALLOWED_HREFS.includes(item.href))
    : allNavItems


  const initials = `${userProfile.nombre.charAt(0)}${userProfile.apellido.charAt(0) || userProfile.nombre.charAt(1) || 'U'}`.toUpperCase()

  return (
    <aside
      className={`sidebar fixed top-0 left-0 h-screen flex flex-col z-40 transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
    >
      {/* Logo Hub */}
      <div className="flex items-center px-3.5 h-16 border-b border-slate-300/[0.08] bg-white backdrop-blur-xl">
        <LabMedLogo size={collapsed ? 38 : 40} showText={!collapsed} glowing={true} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive ? 'active' : ''} justify-between`}
              title={collapsed ? item.label : undefined}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 flex-shrink-0 text-indigo-700" />
                {!collapsed && <span className="font-semibold text-xs">{item.label}</span>}
              </div>
              {!collapsed && (item as any).badge && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold border ${(item as any).badgeColor || 'bg-indigo-500/20 text-indigo-700 border-slate-300'}`}>
                  {(item as any).badge}
                </span>
              )}
            </Link>
          )
        })}

        {/* Widget / Centro de Alertas Críticas */}
        <div className="pt-2">
          <AlertsNotificationCenter isSidebar={true} collapsed={collapsed} />
        </div>
      </nav>

      {/* Active User RACI Profile */}
      {!collapsed ? (
        <div className="mx-3 mb-2 p-2.5 rounded-xl bg-white/[0.03] border border-slate-300 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-gray-500">Usuario Activo</span>
            <span className={`badge ${
              userProfile.isPersonaGlobal
                ? 'bg-purple-500/20 text-purple-700 border border-slate-300'
                : userProfile.isLuisOrellana
                ? 'bg-teal-500/20 text-teal-700 border border-slate-300'
                : userProfile.isGerenteGeneral
                ? 'bg-amber-500/20 text-amber-700 border border-slate-300'
                : 'bg-indigo-500/20 text-indigo-700'
            } text-[9px] px-1.5 font-mono`}>
              {userProfile.isPersonaGlobal ? 'Global' : userProfile.isLuisOrellana ? 'Jefatura' : userProfile.isGerenteGeneral ? 'Gerencia' : 'Control Total'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-md ${
              userProfile.isPersonaGlobal
                ? 'bg-purple-600 text-white'
                : userProfile.isLuisOrellana
                ? 'bg-[#34d399] text-black'
                : userProfile.isGerenteGeneral
                ? 'bg-[#fbbf24] text-black'
                : 'bg-white text-black'
            } flex items-center justify-center text-xs font-bold shadow-sm`}>
              {initials}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-gray-800 truncate">
                {userProfile.nombre} {userProfile.apellido}
              </p>
              <p className={`text-[10px] ${
                userProfile.isPersonaGlobal
                  ? 'text-purple-700'
                  : userProfile.isLuisOrellana
                  ? 'text-teal-700'
                  : userProfile.isGerenteGeneral
                  ? 'text-amber-700'
                  : 'text-indigo-700'
              } font-semibold truncate`}>
                {userProfile.departamento}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Bottom actions */}
      <div className="px-3 pb-4 space-y-2">
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-left hover:!text-red-700 hover:!bg-red-500/8"
          title={collapsed ? 'Cerrar sesión' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="sidebar-link w-full text-left"
          title={collapsed ? 'Expandir' : 'Colapsar'}
        >
          <ChevronLeft
            className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
          />
          {!collapsed && <span>Colapsar</span>}
        </button>
      </div>
    </aside>
  )
}

