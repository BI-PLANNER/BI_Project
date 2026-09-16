'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PieChart, BarChart3, FileText, CheckCircle, Boxes } from 'lucide-react'

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const tabs = [
    { name: 'Dashboard Analítica', href: '/dashboard/analytics/gerencia', icon: PieChart, color: 'text-indigo-700', activeBg: 'bg-indigo-500/20' },
    { name: 'Analítica', href: '/dashboard/analytics/precios', icon: BarChart3, color: 'text-emerald-700', activeBg: 'bg-emerald-500/20' },
    { name: 'Stock & Inventario', href: '/dashboard/analytics/stock', icon: Boxes, color: 'text-rose-700', activeBg: 'bg-rose-500/20' },
    { name: 'Cumplimiento', href: '/dashboard/analytics/cumplimiento', icon: CheckCircle, color: 'text-blue-700', activeBg: 'bg-blue-500/20' }
  ]

  return (
    <div className="flex flex-col h-full bg-[#0a0f1c] overflow-hidden">
      {/* Tab Navigation Header */}
      <div className="px-6 pt-6 pb-2 border-b border-gray-200 flex-shrink-0">
        <h1 className="text-2xl font-black text-gray-900 tracking-wide flex items-center gap-3 mb-6">
          <span className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-sm">
            <BarChart3 size={18} className="text-gray-900" />
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
                    ? `${tab.activeBg} ${tab.color} border-b-${tab.color.replace('text-', '')} md:border-slate-200 shadow-sm` 
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
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
