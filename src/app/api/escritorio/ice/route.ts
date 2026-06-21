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

// Last-resort fallback (legacy free relay — unreliable, kept only as a backup).
const LEGACY_TURN: RTCIceServer[] = [
  { urls: 'turn:a.relay.metered.ca:80',  username: 'openrelayproject', credential: 'openrelayproject' },
  { urls: 'turn:a.relay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
  { urls: 'turn:a.relay.metered.ca:443?transport=tcp', username: 'openrelayproject', credential: 'openrelayproject' },
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

  return Response.json({ iceServers: [...STUN, ...LEGACY_TURN] })
}
