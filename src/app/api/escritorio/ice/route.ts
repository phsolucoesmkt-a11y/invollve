import { getSession } from '@/lib/session'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/*
 * Returns the ICE server list (STUN + TURN) for the WebRTC mesh.
 *
 * Cross-country calls almost always need a real TURN relay to punch through
 * symmetric NAT/firewalls. We fetch fresh, time-limited TURN credentials from
 * Metered (free tier, 50GB/month) when configured via env:
 *   METERED_DOMAIN  e.g. "invollve.metered.live"
 *   METERED_API_KEY your Metered API key
 *
 * Credentials are issued server-side so the API key is never exposed to the
 * browser. If env isn't set we fall back to STUN + the legacy public relay
 * (works on same-network, may fail across countries).
 */

const STUN: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
]

// Metered TURN (Invollve account, free tier) — static credentials, used when the
// API-key env vars aren't configured. Reliable relay for cross-country calls.
const TURN_USER = '7cf0912d3a98f1bd5e599264'
const TURN_PASS = 'PAfHDY/JyRr+3rAC'
const METERED_TURN: RTCIceServer[] = [
  { urls: 'stun:stun.relay.metered.ca:80' },
  { urls: 'turn:global.relay.metered.ca:80', username: TURN_USER, credential: TURN_PASS },
  { urls: 'turn:global.relay.metered.ca:80?transport=tcp', username: TURN_USER, credential: TURN_PASS },
  { urls: 'turn:global.relay.metered.ca:443', username: TURN_USER, credential: TURN_PASS },
  { urls: 'turns:global.relay.metered.ca:443?transport=tcp', username: TURN_USER, credential: TURN_PASS },
]

export async function GET() {
  const session = await getSession()
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 })

  const apiKey = process.env.METERED_API_KEY
  const domain = process.env.METERED_DOMAIN

  if (apiKey && domain) {
    try {
      const r = await fetch(`https://${domain}/api/v1/turn/credentials?apiKey=${apiKey}`, { cache: 'no-store' })
      if (r.ok) {
        const turn = (await r.json()) as RTCIceServer[]
        if (Array.isArray(turn) && turn.length) {
          return Response.json({ iceServers: [...STUN, ...turn] })
        }
      }
    } catch {
      // fall through to legacy fallback below
    }
  }

  return Response.json({ iceServers: [...STUN, ...METERED_TURN] })
}
