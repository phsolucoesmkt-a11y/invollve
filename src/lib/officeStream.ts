// Single shared SSE connection for the whole office page.
//
// The office canvas, the A/V CallProvider and the meeting room each need the
// live presence/chat/signal stream. Opening one EventSource per component means
// 2-3 long-lived connections per browser, which exhausts the limited Node
// workers on the constrained (CloudLinux) host — the second connection hangs,
// so WebRTC signaling never arrives and calls get stuck "connecting".
//
// This singleton opens ONE EventSource and fans events out to all subscribers,
// kept on globalThis so it survives HMR. Ref-counted: the connection closes
// only when the last subscriber unmounts.

type PresenceFn = (players: unknown[]) => void
type ChatFn = (msg: unknown) => void
type SignalFn = (from: number, data: unknown) => void
type ReactionFn = (r: { id: number; name: string; emoji: string; t: number }) => void

interface StreamStore {
  es: EventSource | null
  refs: number
  presence: Set<PresenceFn>
  chat: Set<ChatFn>
  signal: Set<SignalFn>
  reaction: Set<ReactionFn>
}

const g = globalThis as unknown as { __officeStream?: StreamStore }
const S: StreamStore = g.__officeStream ?? (g.__officeStream = {
  es: null, refs: 0, presence: new Set(), chat: new Set(), signal: new Set(), reaction: new Set(),
})

if (!S.reaction) S.reaction = new Set() // survive HMR with an older store shape

function open() {
  if (S.es) return
  const es = new EventSource('/api/escritorio/stream')
  es.onmessage = (e) => {
    try { const a = JSON.parse(e.data) as unknown[]; S.presence.forEach(fn => fn(a)) } catch {}
  }
  es.addEventListener('chat', (e) => {
    try { const m = JSON.parse((e as MessageEvent).data); S.chat.forEach(fn => fn(m)) } catch {}
  })
  es.addEventListener('signal', (e) => {
    try {
      const { from, data } = JSON.parse((e as MessageEvent).data) as { from: number; data: unknown }
      S.signal.forEach(fn => fn(from, data))
    } catch {}
  })
  es.addEventListener('reaction', (e) => {
    try { const r = JSON.parse((e as MessageEvent).data); S.reaction.forEach(fn => fn(r)) } catch {}
  })
  S.es = es
}

export interface OfficeStreamHandlers {
  presence?: PresenceFn
  chat?: ChatFn
  signal?: SignalFn
  reaction?: ReactionFn
}

export function subscribeOfficeStream(h: OfficeStreamHandlers): () => void {
  open()
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
    if (S.refs <= 0 && S.es) { S.es.close(); S.es = null; S.refs = 0 }
  }
}
