import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { getSession } from '@/lib/session'
import { sendTaskNotification } from '@/lib/email'

export async function GET() {
  const session = await getSession()
  if (!session || session.role === 'cliente') return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  const tasks = db.prepare(`
    SELECT t.*, u.name as assigned_name, c.name as client_name
    FROM tasks t
    LEFT JOIN users u ON t.assigned_to = u.id
    LEFT JOIN clients c ON t.client_id = c.id
    ORDER BY t.due_date ASC
  `).all()
  return NextResponse.json(tasks)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role === 'cliente') return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  const { title, description, status, priority, assigned_to, client_id, due_date } = await req.json()
  const result = db.prepare('INSERT INTO tasks (title, description, status, priority, assigned_to, client_id, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)').run(title, description, status || 'todo', priority || 'media', assigned_to || null, client_id || null, due_date || null)

  // Send email notification to assigned user
  if (assigned_to) {
    const assignee = db.prepare('SELECT name, email FROM users WHERE id=?').get(assigned_to) as any
    if (assignee?.email) {
      sendTaskNotification({ to: assignee.email, taskTitle: title, assignedBy: session.name, dueDate: due_date, description }).catch(() => {})
    }
  }

  return NextResponse.json({ id: result.lastInsertRowid })
}

export async function PUT(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role === 'cliente') return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  const { id, ...body } = await req.json()
  db.prepare('UPDATE tasks SET title=?, description=?, status=?, priority=?, assigned_to=?, client_id=?, due_date=? WHERE id=?').run(body.title, body.description, body.status, body.priority, body.assigned_to || null, body.client_id || null, body.due_date || null, id)
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role === 'cliente') return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  const { id } = await req.json()
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id)
  return NextResponse.json({ ok: true })
}
