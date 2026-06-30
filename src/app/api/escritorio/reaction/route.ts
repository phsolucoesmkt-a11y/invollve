import { getSession } from '@/lib/session'
import { emitReaction } from '@/lib/officeHub'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Allowed transient reactions (clap etc.) — whitelist so nothing arbitrary is broadcast.
const ALLOWED = new Set(['👏', '👍', '❤️', '🎉', '😂'])

// Send a transient reaction to everyone (broadcast via SSE, not stored).
export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 })

  let body: { emoji?: string }
  try { body = await req.json() } catch { return Response.json({ error: 'bad json' }, { status: 400 }) }

  const emoji = typeof body.emoji === 'string' && ALLOWED.has(body.emoji) ? body.emoji : '👏'
  emitReaction(session.id, session.name, emoji)
  return Response.json({ ok: true })
}
