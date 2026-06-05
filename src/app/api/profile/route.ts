import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { getSession } from '@/lib/session'
import bcrypt from 'bcryptjs'

export async function PUT(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { name, phone, birthday, avatar_url, current_password, new_password } = await req.json()

  // Update basic info
  db.prepare('UPDATE users SET name=?, phone=?, birthday=?, avatar_url=? WHERE id=?').run(name, phone || null, birthday || null, avatar_url || null, session.id)

  // Sync birthday to rh_people
  if (birthday) {
    const existing = db.prepare('SELECT id FROM rh_people WHERE email = ?').get(session.email) as any
    if (existing) {
      db.prepare('UPDATE rh_people SET birthday=?, name=? WHERE email=?').run(birthday, name, session.email)
    } else {
      db.prepare('INSERT INTO rh_people (name, role, birthday, email) VALUES (?, ?, ?, ?)').run(name, 'Equipe', birthday, session.email)
    }
  }

  // Change password if requested
  if (current_password && new_password) {
    const user = db.prepare('SELECT password FROM users WHERE id=?').get(session.id) as any
    const valid = await bcrypt.compare(current_password, user.password)
    if (!valid) return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 400 })
    const hash = await bcrypt.hash(new_password, 10)
    db.prepare('UPDATE users SET password=? WHERE id=?').run(hash, session.id)
  }

  return NextResponse.json({ ok: true })
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const user = db.prepare('SELECT id, name, email, role, phone, birthday, avatar_url FROM users WHERE id=?').get(session.id)
  return NextResponse.json(user)
}
