import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { getSession } from '@/lib/session'

// Dias que um lead perdido fica no funil antes de ser excluído automaticamente.
const LOST_LEAD_TTL_DAYS = 5

function nowSql() {
  // formato compatível com datetime('now') do SQLite: 'YYYY-MM-DD HH:MM:SS' em UTC
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

export async function GET() {
  const session = await getSession()
  if (!session || session.role === 'cliente') return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  // Exclusão automática: leads perdidos há mais de LOST_LEAD_TTL_DAYS dias somem do funil.
  await db.run(
    `DELETE FROM leads WHERE stage = 'perdido' AND lost_at IS NOT NULL AND lost_at <= datetime('now', ?)`,
    [`-${LOST_LEAD_TTL_DAYS} days`]
  )
  const leads = await db.all(`
    SELECT l.*, u.name as responsible_name FROM leads l
    LEFT JOIN users u ON l.responsible_id = u.id
    ORDER BY l.created_at DESC
  `)
  return NextResponse.json(leads)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role === 'cliente') return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  const { name, company, email, phone, stage, value, notes, responsible_id } = await req.json()
  const finalStage = stage || 'prospeccao'
  const lost_at = finalStage === 'perdido' ? nowSql() : null
  const result = await db.run(
    'INSERT INTO leads (name, company, email, phone, stage, value, notes, responsible_id, lost_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [name, company, email, phone, finalStage, value || null, notes, responsible_id || null, lost_at]
  )
  return NextResponse.json({ id: result.lastInsertRowid })
}

export async function PUT(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role === 'cliente') return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  const { id, ...body } = await req.json()
  // Marca lost_at ao entrar em "perdido" (preservando a data original); limpa ao sair.
  let lost_at: string | null = null
  if (body.stage === 'perdido') {
    const current = await db.get<{ lost_at: string | null }>('SELECT lost_at FROM leads WHERE id=?', [id])
    lost_at = current?.lost_at || nowSql()
  }
  await db.run(
    'UPDATE leads SET name=?, company=?, email=?, phone=?, stage=?, value=?, notes=?, responsible_id=?, lost_at=? WHERE id=?',
    [body.name, body.company, body.email, body.phone, body.stage, body.value || null, body.notes, body.responsible_id || null, lost_at, id]
  )
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role === 'cliente') return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  const { id } = await req.json()
  await db.run('DELETE FROM leads WHERE id = ?', [id])
  return NextResponse.json({ ok: true })
}
