import { getSession } from '@/lib/session'
import { snapshot, recentChat, touch } from '@/lib/officeHub'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Polling endpoint for live presence + chat. On the shared host the long-lived
// SSE connection can stall after the first frame (workers get exhausted), which
// freezes everyone in place and drops chat. Short GET requests don't hold a
// worker open, so the client polls this to keep everything live even when SSE
// goes quiet. Chat rides along (clients dedupe by id+timestamp).
export async function GET() {
  const session = await getSession()
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 })
  touch(session.id) // polling also counts as "present"
  return Response.json({ players: snapshot(), chat: recentChat() }, { headers: { 'Cache-Control': 'no-store' } })
}
