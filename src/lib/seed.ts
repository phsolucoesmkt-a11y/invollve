import db from './db'
import bcrypt from 'bcryptjs'

export async function seedAdmin() {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@invollve.com')
  if (existing) return

  const hash = await bcrypt.hash('invollve2024', 10)
  db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
    'Administrador', 'admin@invollve.com', hash, 'socio'
  )
  console.log('Admin criado: admin@invollve.com / invollve2024')
}
