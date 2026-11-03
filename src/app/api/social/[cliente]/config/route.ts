import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { CLIENTS, setConfig } from '@/lib/socialMeta'

// Salva o @ do perfil de quem entrega conteúdo (só equipe). Body: { nome: 'Amanda', handle: '@perfil' }
export async function POST(req: NextRequest, { params }: { params: Promise<{ cliente: string }> }) {
  const session = await getSession()
  if (!session || session.role === 'cliente') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { cliente } = await params
  const c = CLIENTS[cliente]
  if (!c) return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })

  const { nome, handle } = await req.json().catch(() => ({}))
  if (!(c.entregas || []).some(e => e.nome === nome)) return NextResponse.json({ error: 'Entrega desconhecida' }, { status: 400 })
  // aceita "@perfil", "perfil" ou o link instagram.com/perfil
  const h = String(handle || '').trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/^@/, '').split(/[/?#]/)[0]
  if (h && !/^[A-Za-z0-9._]{1,30}$/.test(h)) return NextResponse.json({ error: '@ inválido' }, { status: 400 })
  await setConfig(cliente, `handle:${nome}`, h || null)
  return NextResponse.json({ ok: true, handle: h || null })
}
