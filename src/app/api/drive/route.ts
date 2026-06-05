import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session || session.role === 'cliente') return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  const links = db.prepare(`
    SELECT d.*, c.name as client_name FROM drive_links d
    LEFT JOIN clients c ON d.client_id = c.id
    ORDER BY d.category, d.name
  `).all()
  return NextResponse.json(links)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role === 'cliente') return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  const { name, url, category, client_id } = await req.json()
  const result = db.prepare('INSERT INTO drive_links (name, url, category, client_id) VALUES (?, ?, ?, ?)').run(name, url, category, client_id || null)
  return NextResponse.json({ id: result.lastInsertRowid })
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role === 'cliente') return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  const { id } = await req.json()
  db.prepare('DELETE FROM drive_links WHERE id = ?').run(id)
  return NextResponse.json({ ok: true })
}
