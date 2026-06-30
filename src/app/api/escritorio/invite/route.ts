import { getSession } from '@/lib/session'
import { inviteCall, clearInvite } from '@/lib/officeHub'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// POST { to }        -> ring that user (creates a shared private room)
// POST { clear: id } -> drop a pending invite (target accepted/declined/cancel)
export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 })

  let body: { to?: number; clear?: number }
  try { body = await req.json() } catch { return Response.json({ error: 'bad json' }, { status: 400 }) }

  if (typeof body.clear === 'number') {
    clearInvite(body.clear)
    return Response.json({ ok: true })
  }
  if (typeof body.to !== 'number' || body.to === session.id) {
    return Response.json({ error: 'invalid target' }, { status: 400 })
  }
  const room = inviteCall(session.id, session.name, body.to)
  return Response.json({ ok: true, room })
}
