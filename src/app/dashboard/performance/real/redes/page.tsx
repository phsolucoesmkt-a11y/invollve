'use client'
import Link from 'next/link'
import SocialDashboard from '@/components/modules/social/SocialDashboard'

export default function RealRedesPage() {
  return (
    <div>
      <Link href="/dashboard/performance" className="mb-4 inline-block text-xs text-zinc-400 hover:text-white">← Performance</Link>
      <SocialDashboard cliente="real" interno />
    </div>
  )
}
