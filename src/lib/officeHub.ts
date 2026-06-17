// In-memory presence + chat hub for the virtual office.
// Shared across route handlers via globalThis so it survives HMR / module reloads
// and is a true singleton within the Node server process. Fine for a small team
// (single process); swap for Redis pub/sub if it ever needs to scale horizontally.

export type OfficeStatus = 'online' | 'ocupado' | 'reuniao'

export interface OfficePlayer {
  id: number
  name: string
  role: string
  x: number
  y: number
  status: OfficeStatus
  t: number
}

export interface ChatMsg {
  id: number     // sender id
  name: string
  x: number      // sender position at send time (for proximity)
  y: number
  text: string
  t: number
}

type Listener = (frame: string) => void // receives a ready-to-write SSE frame

interface Hub {
  players: Map<number, OfficePlayer>
  chat: ChatMsg[]
  listeners: Set<Listener>
}

const STALE_MS = 12000
const CHAT_MAX = 40

const g = globalThis as unknown as { __officeHub?: Hub }
const hub: Hub = g.__officeHub ?? (g.__officeHub = { players: new Map(), chat: [], listeners: new Set() })
// rehydrate fields that may be missing if the singleton predates a code change (HMR)
if (!hub.chat) hub.chat = []

export function snapshot(): OfficePlayer[] {
  const now = Date.now()
  const out: OfficePlayer[] = []
  for (const [id, p] of hub.players) {
    if (now - p.t > STALE_MS) hub.players.delete(id)
    else out.push(p)
  }
  return out
}

const presenceFrame = () => `data: ${JSON.stringify(snapshot())}\n\n`
const chatFrame = (m: ChatMsg) => `event: chat\ndata: ${JSON.stringify(m)}\n\n`
const emit = (frame: string) => { for (const l of hub.listeners) l(frame) }

export function broadcast() { emit(presenceFrame()) }

export function upsert(p: Omit<OfficePlayer, 't'>) {
  hub.players.set(p.id, { ...p, t: Date.now() })
  broadcast()
}

export function remove(id: number) {
  if (hub.players.delete(id)) broadcast()
}

export function postChat(m: Omit<ChatMsg, 't'>): ChatMsg {
  const msg = { ...m, t: Date.now() }
  hub.chat.push(msg)
  if (hub.chat.length > CHAT_MAX) hub.chat.shift()
  emit(chatFrame(msg))
  return msg
}

export function subscribe(l: Listener): () => void {
  hub.listeners.add(l)
  return () => hub.listeners.delete(l)
}

// Frames sent to a client right when it connects: current presence + recent chat.
export function initialFrames(): string {
  const now = Date.now()
  const recent = hub.chat.filter(m => now - m.t < 60000)
  return presenceFrame() + recent.map(chatFrame).join('')
}
