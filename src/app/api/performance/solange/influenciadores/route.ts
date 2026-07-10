import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import db from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const rows = await db.all('SELECT * FROM solange_influenciadores ORDER BY id')
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { nome, perfil, seguidores, nicho, status, obs } = await req.json()
  const result = await db.run(
    `INSERT INTO solange_influenciadores (nome, perfil, seguidores, nicho, status, obs) VALUES (?, ?, ?, ?, ?, ?)`,
    [nome, perfil || '', seguidores || '', nicho || '', status || 'chamado', obs || '']
  ) as any
  return NextResponse.json({ id: result.lastID })
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id, status, obs, perfil, seguidores, nicho } = await req.json()
  await db.run(
    `UPDATE solange_influenciadores SET status=?, obs=?, perfil=?, seguidores=?, nicho=?, atualizado_em=datetime('now') WHERE id=?`,
    [status, obs || '', perfil || '', seguidores || '', nicho || '', id]
  )
  return NextResponse.json({ ok: true })
}
