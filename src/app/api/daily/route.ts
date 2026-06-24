import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

// Garante que uma sala exista no Daily e devolve a URL pra entrar.
// A chave (DAILY_API_KEY) fica só no servidor, nunca vai pro navegador.
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const apiKey = process.env.DAILY_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'DAILY_API_KEY não configurada no servidor' }, { status: 500 })
  }

  const { room, max } = await req.json()
  if (!room || typeof room !== 'string') {
    return NextResponse.json({ error: 'Sala inválida' }, { status: 400 })
  }
  // Limite opcional de participantes (ex.: 2 para a reunião 1a1 privada).
  const maxParticipants = typeof max === 'number' && max > 0 ? Math.floor(max) : undefined
  // Daily aceita só letras, números, hífen e underline no nome da sala.
  const name = room.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 60) || 'reuniao'

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  }

  try {
    // Já existe? Usa a que está lá.
    const existing = await fetch(`https://api.daily.co/v1/rooms/${name}`, { headers })
    if (existing.ok) {
      const data = await existing.json()
      return NextResponse.json({ url: data.url, name })
    }

    // Não existe: cria a sala.
    const created = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name,
        privacy: 'public',
        properties: {
          enable_prejoin_ui: true,
          enable_screenshare: true,
          enable_chat: true,
          start_video_off: false,
          start_audio_off: false,
          ...(maxParticipants ? { max_participants: maxParticipants } : {}),
        },
      }),
    })
    if (!created.ok) {
      const txt = await created.text()
      return NextResponse.json({ error: 'Falha ao criar sala no Daily', detail: txt }, { status: 502 })
    }
    const data = await created.json()
    return NextResponse.json({ url: data.url, name })
  } catch (e: any) {
    return NextResponse.json({ error: 'Erro de rede ao falar com o Daily', detail: e?.message }, { status: 502 })
  }
}
