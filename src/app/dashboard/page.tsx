import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user?.email?.includes('aaltunaher') || user?.email?.includes('antonio')) {
    redirect('/dashboard/analytics/gerencia')
  }

  // Redirigir a Analytics Stock por defecto
  redirect('/dashboard/analytics/stock')
}
