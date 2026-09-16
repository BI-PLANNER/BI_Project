'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PieChart, BarChart3, FileText, CheckCircle } from 'lucide-react'

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const tabs = [
    { name: 'Dashboard Gerencia', href: '/dashboard/analytics/gerencia', icon: PieChart, color: 'text-indigo-400', activeBg: 'bg-indigo-500/20' },
    { name: 'Análisis de Precios', href: '/dashboard/analytics/precios', icon: BarChart3, color: 'text-emerald-400', activeBg: 'bg-emerald-500/20' },
    { name: 'Reportes BI', href: '/dashboard/analytics/reportes', icon: FileText, color: 'text-teal-400', activeBg: 'bg-teal-500/20' },
    { name: 'Cumplimiento', href: '/dashboard/analytics/cumplimiento', icon: CheckCircle, color: 'text-blue-400', activeBg: 'bg-blue-500/20' }
  ]

  return (
    <div className="flex flex-col h-full bg-[#0a0f1c] overflow-hidden">
      {/* Tab Navigation Header */}
      <div className="px-6 pt-6 pb-2 border-b border-white/5 flex-shrink-0">
        <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-3 mb-6">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BarChart3 size={18} className="text-white" />
          </span>
          Centro de Analítica BI
        </h1>
        
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
          {tabs.map(tab => {
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
                    ? `${tab.activeBg} ${tab.color} border-b-${tab.color.replace('text-', '')} md:border-white/10 shadow-sm` 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
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
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
