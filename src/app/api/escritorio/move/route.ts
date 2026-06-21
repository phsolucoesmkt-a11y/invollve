import { getSession } from '@/lib/session'
import { upsert, snapshot, OfficeStatus } from '@/lib/officeHub'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 })

  let body: { x?: number; y?: number; status?: string; avatarColor?: string }
  try { body = await req.json() } catch { return Response.json({ error: 'bad json' }, { status: 400 }) }

  const status: OfficeStatus =
    body.status === 'ocupado' || body.status === 'reuniao' ? body.status : 'online'

  // Preserve existing position when the heartbeat omits x/y
  const existing = snapshot().find(p => p.id === session.id)
  const x = typeof body.x === 'number' ? body.x : (existing?.x ?? 400)
  const y = typeof body.y === 'number' ? body.y : (existing?.y ?? 170)

  upsert({
    id: session.id,
    name: session.name,
    role: session.role,
    avatarColor: typeof body.avatarColor === 'string' ? body.avatarColor : undefined,
    x, y, status,
  })

  return Response.json({ ok: true })
}
