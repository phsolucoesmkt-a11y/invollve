import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import db from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const rows = await db.all('SELECT * FROM solange_mulheres ORDER BY id')
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { nome, whatsapp, email, quem_contatou, status, followup, obs } = await req.json()
  const result = await db.run(
    `INSERT INTO solange_mulheres (nome, whatsapp, email, quem_contatou, status, followup, obs)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [nome, whatsapp || '', email || '', quem_contatou || '', status || 'contato_feito', followup || '', obs || '']
  ) as any
  return NextResponse.json({ id: result.lastID })
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id, status, followup, obs } = await req.json()
  await db.run(
    `UPDATE solange_mulheres SET status=?, followup=?, obs=?, atualizado_em=datetime('now') WHERE id=?`,
    [status, followup || '', obs || '', id]
  )
  return NextResponse.json({ ok: true })
}
