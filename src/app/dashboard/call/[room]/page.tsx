'use client'
import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DailyRoom from '@/components/DailyRoom'

export default function CallPage({ params }: { params: Promise<{ room: string }> }) {
  const { room } = use(params)
  const router = useRouter()
  const [displayName, setDisplayName] = useState<string | undefined>(undefined)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => {
        if (s?.name) setDisplayName(s.name)
      })
      .finally(() => setLoaded(true))
  }, [])

  const roomName = decodeURIComponent(room)

  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a0f] flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <span className="text-sm font-semibold text-white">📹 Reunião Invollve</span>
        <button
          onClick={() => router.push('/dashboard/reunioes')}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/20 transition"
        >
          Sair da reunião
        </button>
      </div>
      <div className="flex-1 min-h-0">
        {loaded && (
          <DailyRoom
            room={roomName}
            displayName={displayName}
            onLeave={() => router.push('/dashboard/reunioes')}
          />
        )}
      </div>
    </div>
  )
}
