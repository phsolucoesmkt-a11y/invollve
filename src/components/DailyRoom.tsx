'use client'
import { useEffect, useState } from 'react'

// Sala de vídeo via Daily.co. Pede ao servidor a URL da sala (criando-a se
// necessário) e embute a chamada pronta do Daily num iframe. Câmera, áudio,
// compartilhar tela e chat já vêm prontos — sem tela de "esperando moderador".
export default function DailyRoom({
  room,
  displayName,
  max,
}: {
  room: string
  displayName?: string
  max?: number
  onLeave?: () => void
}) {
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/daily', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room, max }),
    })
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok) throw new Error(data?.error || 'Falha ao abrir a sala')
        return data
      })
      .then((data) => {
        if (cancelled) return
        const base = data.url as string
        const sep = base.includes('?') ? '&' : '?'
        // Passa o nome do usuário pra entrar já identificado.
        setUrl(displayName ? `${base}${sep}t=&userName=${encodeURIComponent(displayName)}` : base)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message)
      })
    return () => {
      cancelled = true
    }
  }, [room, displayName, max])

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center text-center p-8">
        <div>
          <p className="text-white font-semibold mb-2">Não foi possível abrir a chamada</p>
          <p className="text-zinc-400 text-sm">{error}</p>
          <p className="text-zinc-500 text-xs mt-3">Verifique se a chave do Daily está configurada no servidor.</p>
        </div>
      </div>
    )
  }

  if (!url) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-zinc-400 text-sm">Preparando a sala…</p>
      </div>
    )
  }

  return (
    <iframe
      title="Reunião"
      src={url}
      className="h-full w-full border-0"
      allow="camera; microphone; fullscreen; speaker; display-capture; autoplay; clipboard-write"
    />
  )
}
