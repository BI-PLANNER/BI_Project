import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user?.email?.toLowerCase().includes('aaltunaher') || user?.email?.toLowerCase().includes('gerencia')) {
    redirect('/dashboard/obligaciones')
  }

  redirect('/dashboard/stock')
}

