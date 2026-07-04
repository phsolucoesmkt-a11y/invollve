import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { sendTaskReminder } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Tomorrow's date (YYYY-MM-DD) in São Paulo time, so "1 dia antes" lines up with
// the local calendar regardless of the server's timezone.
function tomorrowSP(): string {
  const sp = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
  sp.setDate(sp.getDate() + 1)
  const y = sp.getFullYear(), m = String(sp.getMonth() + 1).padStart(2, '0'), d = String(sp.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Called once a day by a cPanel cron job. E-mails a reminder for every task that
// is due TOMORROW, has the reminder on, hasn't been sent yet, and whose assignee
// has an e-mail. Protected by CRON_SECRET.
async function run(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return NextResponse.json({ error: 'CRON_SECRET não configurada' }, { status: 500 })
  const key = req.nextUrl.searchParams.get('key') || req.headers.get('x-cron-key')
  if (key !== secret) return NextResponse.json({ error: 'não autorizado' }, { status: 401 })

  if (!process.env.SMTP_USER) return NextResponse.json({ error: 'E-mail não configurado (SMTP_USER)' }, { status: 500 })

  const day = tomorrowSP()
  const tasks = await db.all<any>(`
    SELECT t.id, t.title, t.due_date, u.name AS assignee, u.email AS email
    FROM tasks t JOIN users u ON t.assigned_to = u.id
    WHERE t.reminder = 1 AND t.reminder_sent = 0 AND t.due_date = ?
      AND u.email IS NOT NULL AND u.email <> ''
  `, [day])

  let sent = 0
  const errors: string[] = []
  for (const t of tasks) {
    try {
      await sendTaskReminder({ to: t.email, name: t.assignee, taskTitle: t.title, dueDate: t.due_date })
      await db.run('UPDATE tasks SET reminder_sent = 1 WHERE id = ?', [t.id])
      sent++
    } catch (e: any) {
      errors.push(`tarefa ${t.id}: ${e?.message || 'falha no envio'}`)
    }
  }
  return NextResponse.json({ ok: true, day, candidates: tasks.length, sent, errors })
}

export async function GET(req: NextRequest) { return run(req) }
export async function POST(req: NextRequest) { return run(req) }
