import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { CLIENTS, readPosts, slugByToken, tagPost } from '@/lib/socialMeta'

const isDate = (v: string | null) => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v)

// Posts do período (?de&ate). Acesso: equipe logada OU link público (?t=token).
export async function GET(req: NextRequest, { params }: { params: Promise<{ cliente: string }> }) {
  const { cliente } = await params
  if (!CLIENTS[cliente]) return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })

  const sp = new URL(req.url).searchParams
  const t = sp.get('t')
  const session = await getSession()
  const interno = !!session && session.role !== 'cliente'
  if (!interno && (!t || (await slugByToken(t)) !== cliente)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const de = sp.get('de'), ate = sp.get('ate')
  if (!isDate(de) || !isDate(ate)) return NextResponse.json({ error: 'Período inválido' }, { status: 400 })
  return NextResponse.json(await readPosts(cliente, de!, ate!))
}

// Marca/desmarca quem entregou o post (só equipe). Body: { plataforma, post_id, autor: 'Amanda' | null }
export async function POST(req: NextRequest, { params }: { params: Promise<{ cliente: string }> }) {
  const session = await getSession()
  if (!session || session.role === 'cliente') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { cliente } = await params
  const c = CLIENTS[cliente]
  if (!c) return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })

  const { plataforma, post_id, autor } = await req.json().catch(() => ({}))
  if (!plataforma || !post_id) return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 })
  if (autor != null && !(c.entregas || []).some(e => e.nome === autor)) {
    return NextResponse.json({ error: 'Autor desconhecido' }, { status: 400 })
  }
  await tagPost(cliente, plataforma, post_id, autor ?? null)
  return NextResponse.json({ ok: true })
}
