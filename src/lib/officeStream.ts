// Live office data — PURE POLLING, no long-lived connections.
//
// History: this used to be a shared SSE (EventSource) stream. On the constrained
// CloudLinux/cPanel host, long-lived connections pile up and exhaust the few
// Node workers — the stream stalls after the first frame, freezing movement,
// dropping chat and leaving "ghost" players behind. Everything that needed SSE
// (WebRTC signaling for in-office A/V) has been removed (calls go through
// Daily now), so the SSE connection is gone entirely.
//
// Instead, ONE short GET /api/escritorio/snapshot every POLL_MS carries all of
// it: presence/movement, chat, reactions, raised hands, meeting state and call
// invites. Short requests never hold a worker, so this stays live on the shared
// host — like a game client polling the server.
//
// Singleton on globalThis (survives HMR), ref-counted: polling stops when the
// last subscriber unmounts.

type PresenceFn = (players: unknown[]) => void
type ChatFn = (msg: unknown) => void
type SignalFn = (from: number, data: unknown) => void
type ReactionFn = (r: { id: number; name: string; emoji: string; t: number }) => void

interface StreamStore {
  refs: number
  presence: Set<PresenceFn>
  chat: Set<ChatFn>
  signal: Set<SignalFn>
  reaction: Set<ReactionFn>
  poll: ReturnType<typeof setInterval> | null
}

const g = globalThis as unknown as { __officeStream?: StreamStore }
const S: StreamStore = g.__officeStream ?? (g.__officeStream = {
  refs: 0, presence: new Set(), chat: new Set(), signal: new Set(), reaction: new Set(), poll: null,
})

if (!S.reaction) S.reaction = new Set() // survive HMR with an older store shape

const POLL_MS = 700

// Transient events (chat/reactions) ride on every snapshot for a short window,
// so we dedupe by sender+timestamp before fanning out.
const seen = new Set<string>()
function once(kind: string, id: number, t: number): boolean {
  const key = `${kind}:${id}:${t}`
  if (seen.has(key)) return false
  seen.add(key)
  if (seen.size > 400) { for (const k of seen) { seen.delete(k); if (seen.size <= 200) break } }
  return true
}

function startPolling() {
  if (S.poll) return
  const tick = () => {
    fetch('/api/escritorio/snapshot', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(a => {
        if (!a) return
        const players = Array.isArray(a) ? a : a.players
        if (Array.isArray(players)) S.presence.forEach(fn => fn(players))
        if (Array.isArray(a.chat)) {
          a.chat.forEach((m: { id: number; t: number }) => { if (once('c', m.id, m.t)) S.chat.forEach(fn => fn(m)) })
        }
        if (Array.isArray(a.reactions)) {
          a.reactions.forEach((r: { id: number; name: string; emoji: string; t: number }) => {
            if (once('r', r.id, r.t)) S.reaction.forEach(fn => fn(r))
          })
        }
      })
      .catch(() => {})
  }
  tick()
  S.poll = setInterval(tick, POLL_MS)
}

export interface OfficeStreamHandlers {
  presence?: PresenceFn
  chat?: ChatFn
  signal?: SignalFn
  reaction?: ReactionFn
}

export function subscribeOfficeStream(h: OfficeStreamHandlers): () => void {
  startPolling()
  S.refs++
  if (h.presence) S.presence.add(h.presence)
  if (h.chat) S.chat.add(h.chat)
  if (h.signal) S.signal.add(h.signal)
  if (h.reaction) S.reaction.add(h.reaction)
  return () => {
    if (h.presence) S.presence.delete(h.presence)
    if (h.chat) S.chat.delete(h.chat)
    if (h.signal) S.signal.delete(h.signal)
    if (h.reaction) S.reaction.delete(h.reaction)
    S.refs--
    if (S.refs <= 0) {
      if (S.poll) { clearInterval(S.poll); S.poll = null }
      S.refs = 0
    }
  }
}
