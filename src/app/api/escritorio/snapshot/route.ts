import { getSession } from '@/lib/session'
import { snapshot, touch } from '@/lib/officeHub'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Polling fallback for live presence. On the shared host the long-lived SSE
// connection can stall after the first frame (workers get exhausted), which
// freezes everyone in place. Short GET requests don't hold a worker open, so
// the client polls this to keep movement live even when SSE goes quiet.
export async function GET() {
  const session = await getSession()
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 })
  touch(session.id) // polling also counts as "present"
  return Response.json(snapshot(), { headers: { 'Cache-Control': 'no-store' } })
}
