import { getSession } from '@/lib/session'
import { remove, setMeeting } from '@/lib/officeHub'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Called via sendBeacon when the tab closes: removes the user's presence right
// away so their character doesn't linger as a ghost until the stale timeout.
export async function POST() {
  const session = await getSession()
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 })
  setMeeting(session.id, false)
  remove(session.id)
  return Response.json({ ok: true })
}
