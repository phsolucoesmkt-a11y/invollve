import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { getSession } from '@/lib/session'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'socio') return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  const users = db.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY name').all()
  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'socio') return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  const { name, email, password, role } = await req.json()
  const hash = await bcrypt.hash(password, 10)
  try {
    const result = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(name, email, hash, role)
    return NextResponse.json({ id: result.lastInsertRowid })
  } catch {
    return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'socio') return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  const { id } = await req.json()
  if (id === session.id) return NextResponse.json({ error: 'Não é possível excluir a si mesmo' }, { status: 400 })
  db.prepare('DELETE FROM users WHERE id = ?').run(id)
  return NextResponse.json({ ok: true })
}
