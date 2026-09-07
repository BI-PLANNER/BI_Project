'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FileText,
  CalendarClock,
  Boxes,
  LogOut,
  ChevronLeft,
  Shield,
  ShieldCheck,
  Database,
  PieChart as PieIcon,
  Lock
} from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import LabMedLogo from '@/components/LabMedLogo'

const navItems = [
  { href: '/dashboard/stock', label: 'Stock & Inventario BI', icon: Boxes },
  { href: '/dashboard/contratos', label: 'Contratos & RACI', icon: FileText },
  { href: '/dashboard/planner', label: 'Panel Planner', icon: CalendarClock },
  { href: '/dashboard/garantias', label: 'Garantías', icon: ShieldCheck },
  { href: '/dashboard/tablas', label: 'Gestión por Tablas (21)', icon: Database },
  {
    href: '/dashboard/obligaciones',
    label: 'Dashboard Obligaciones',
    icon: PieIcon,
    badge: 'Gerente General',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30 font-bold'
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      className={`sidebar fixed top-0 left-0 h-screen flex flex-col z-40 transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
    >
      {/* Logo Hub */}
      <div className="flex items-center px-3.5 h-16 border-b border-white/[0.08] bg-slate-950/60 backdrop-blur-xl">
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
                <item.icon className="w-5 h-5 flex-shrink-0 text-indigo-400" />
                {!collapsed && <span className="font-semibold text-xs">{item.label}</span>}
              </div>
              {!collapsed && item.href === '/dashboard/stock' && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  Alertas Live
                </span>
              )}
              {!collapsed && (item as any).badge && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold border ${(item as any).badgeColor || 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'}`}>
                  {(item as any).badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Active User RACI Profile */}
      {!collapsed ? (
        <div className="mx-3 mb-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-gray-400">Usuario Activo</span>
            <span className="badge bg-indigo-500/20 text-indigo-300 text-[9px] px-1.5 font-mono">Control Total</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white shadow">
              LG
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-gray-100 truncate">José Lenny Gómez</p>
              <p className="text-[10px] text-amber-300 font-semibold truncate">⚡ Planner Estratégico & Gerente</p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Bottom actions */}
      <div className="px-3 pb-4 space-y-2">
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-left hover:!text-red-400 hover:!bg-red-500/8"
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
