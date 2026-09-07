import Sidebar from '@/components/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      {/* Main content — offset by sidebar width */}
      <main className="ml-[260px] transition-all duration-300">
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>

      {/* Ambient decoration */}
      <div className="ambient-glow bg-indigo-600" style={{ top: '10%', right: '5%' }} />
      <div className="ambient-glow bg-violet-600" style={{ bottom: '10%', left: '30%' }} />
    </div>
  )
}
