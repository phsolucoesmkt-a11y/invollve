import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import db from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const rows = await db.all('SELECT * FROM solange_stories ORDER BY criado_em DESC')
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { semana, acao, descricao, alcance, cliques, respostas, status } = await req.json()
  const result = await db.run(
    `INSERT INTO solange_stories (semana, acao, descricao, alcance, cliques, respostas, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [semana, acao, descricao || '', alcance || 0, cliques || 0, respostas || 0, status || 'planejado']
  ) as any
  return NextResponse.json({ id: result.lastID })
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id, alcance, cliques, respostas, status, descricao } = await req.json()
  await db.run(
    `UPDATE solange_stories SET alcance=?, cliques=?, respostas=?, status=?, descricao=? WHERE id=?`,
    [alcance || 0, cliques || 0, respostas || 0, status, descricao || '', id]
  )
  return NextResponse.json({ ok: true })
}
