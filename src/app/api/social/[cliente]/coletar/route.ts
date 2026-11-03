import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { CLIENTS, collect, getShare } from '@/lib/socialMeta'

export const maxDuration = 60

// Coleta manual (botão "Atualizar agora" / importar histórico). Máx. 62 dias por chamada.
export async function POST(req: NextRequest, { params }: { params: Promise<{ cliente: string }> }) {
  const session = await getSession()
  if (!session || session.role === 'cliente') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { cliente } = await params
  if (!CLIENTS[cliente]) return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })

  const { from, to } = await req.json().catch(() => ({}))
  if (from && to && (new Date(to).getTime() - new Date(from).getTime()) / 86400_000 > 62) {
    return NextResponse.json({ error: 'Período máximo de 62 dias por coleta' }, { status: 400 })
  }
  await getShare(cliente)
  try {
    const r = await collect(cliente, { from, to })
    return NextResponse.json({ ok: true, ...r })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
