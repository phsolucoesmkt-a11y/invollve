'use client'
import Link from 'next/link'

export default function PerformancePage() {
  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">📈 Performance</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Link href="/dashboard/performance/real"
          className="glass rounded-2xl p-5 border border-purple-500/30 hover:border-purple-500/60 transition group cursor-pointer">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🏭</span>
            <div>
              <p className="font-bold text-white group-hover:text-purple-300 transition">Real Equipamentos</p>
              <p className="text-xs text-zinc-400">OKRs, metas e acompanhamento semanal</p>
            </div>
          </div>
          <span className="text-xs text-purple-400 font-semibold">Abrir dashboard →</span>
        </Link>
      </div>
    </div>
  )
}
