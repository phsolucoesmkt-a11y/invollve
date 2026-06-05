import { NextResponse } from 'next/server'
import db from '@/lib/db'
import bcrypt from 'bcryptjs'

// Rota de seed — só funciona se não houver usuários cadastrados
export async function GET() {
  const count = (db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number }).c
  if (count > 0) {
    return NextResponse.json({ message: 'Banco já inicializado', users: count })
  }

  const hash = await bcrypt.hash('invollve2024', 10)
  db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
    'Alexandre', 'admin@invollve.com.br', hash, 'socio'
  )

  return NextResponse.json({
    ok: true,
    message: 'Usuário admin criado!',
    email: 'admin@invollve.com.br',
    senha: 'invollve2024'
  })
}
