import { redirect } from 'next/navigation'

export default function AnalyticsPage() {
  // Redirect to the first tab by default
  redirect('/dashboard/analytics/gerencia')
}
