'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { PieChart, BarChart3, CheckCircle, Boxes, AlertTriangle, Briefcase } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isPersonaGlobal, setIsPersonaGlobal] = useState(false)

  useEffect(() => {
    async function checkUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user && user.email) {
          const email = user.email.toLowerCase()
          if (email.includes('personaglobal') || email.includes('persona.global')) {
            setIsPersonaGlobal(true)
          }
        }
      } catch (err) {
        console.warn('Error checking user in AnalyticsLayout:', err)
      }
    }
    checkUser()
  }, [supabase])

  // Redirigir a PersonaGlobal si intenta acceder a otra pestaña de analítica
  useEffect(() => {
    if (isPersonaGlobal && pathname !== '/dashboard/analytics/gerencia') {
      router.replace('/dashboard/analytics/gerencia')
    }
  }, [isPersonaGlobal, pathname, router])

  const tabs = [
    { name: 'Dashboard Analítica', href: '/dashboard/analytics/gerencia', icon: PieChart, color: 'text-indigo-700', activeBg: 'bg-indigo-500/20' },
    { name: 'Stock & Inventario', href: '/dashboard/analytics/stock', icon: Boxes, color: 'text-rose-700', activeBg: 'bg-rose-500/20' },
    { name: 'Ofertas vs Demanda', href: '/dashboard/analytics/demanda', icon: AlertTriangle, color: 'text-amber-700', activeBg: 'bg-amber-500/20' },
    { name: 'Licitaciones', href: '/dashboard/analytics/licitaciones', icon: Briefcase, color: 'text-cyan-700', activeBg: 'bg-cyan-500/20' },
    { name: 'Cumplimiento', href: '/dashboard/analytics/cumplimiento', icon: CheckCircle, color: 'text-blue-700', activeBg: 'bg-blue-500/20' }
  ]

  const visibleTabs = isPersonaGlobal
    ? tabs.filter(t => t.href === '/dashboard/analytics/gerencia')
    : tabs

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden w-full">
      {/* Tab Navigation Header */}
      <div className="px-4 md:px-8 pt-6 pb-2 border-b border-slate-300 flex-shrink-0 w-full max-w-[1800px] mx-auto">
        <h1 className="text-2xl font-black text-gray-900 tracking-wide flex items-center gap-3 mb-6">
          <span className="w-8 h-8 rounded-lg bg-white border border-slate-300 flex items-center justify-center shadow-sm">
            <BarChart3 size={18} className="text-gray-900" />
          </span>
          Centro de Analítica BI
        </h1>
        
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
          {visibleTabs.map(tab => {
            const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/')
            const Icon = tab.icon
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-t-xl md:rounded-xl text-sm font-bold transition-all duration-300
                  border-b-2 md:border-b-0 md:border border-transparent
                  ${isActive 
                    ? `${tab.activeBg} ${tab.color} border-b-${tab.color.replace('text-', '')} md:border-slate-300 shadow-sm` 
                    : 'text-slate-700 hover:text-gray-900 hover:bg-slate-50'
                  }
                `}
              >
                <Icon size={16} className={isActive ? tab.color : 'opacity-70'} />
                {tab.name}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 w-full max-w-[1800px] mx-auto">
        {children}
      </div>
    </div>
  )
}
