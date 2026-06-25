'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { UserSession } from '@/lib/auth'
import OfficeCanvas from './OfficeCanvas'
import { CallProvider, CallControls, OfficeTiles } from './OfficeCall'
import DailyRoom from '@/components/DailyRoom'
import { subscribeOfficeStream } from '@/lib/officeStream'
import AvatarSelect, { shouldShowAvatarSelect, getAvatarColor } from './AvatarSelect'

const OFFICE_PATH = '/dashboard/escritorio'

const TITLES: Record<string, string> = {
  '/dashboard':             '🏠 Início',
  '/dashboard/financeiro':  '💰 Financeiro',
  '/dashboard/comercial':   '🚀 Comercial',
  '/dashboard/clientes':    '👥 Clientes',
  '/dashboard/tarefas':     '✅ Tarefas',
  '/dashboard/performance': '📈 Performance',
  '/dashboard/rh':          '🎂 RH & Equipe',
  '/dashboard/drive':       '📁 Drive',
  '/dashboard/reunioes':    '📅 Reuniões',
  '/dashboard/processos':   '⚙️ Processos',
  '/dashboard/joao':        '🧑‍💼 João (IA)',
  '/dashboard/agentes':     '🤖 Agentes de IA',
  '/dashboard/chat':        '💬 Chat',
  '/dashboard/usuarios':    '🔧 Usuários',
  '/dashboard/perfil':      '👤 Meu Perfil',
}

function titleFor(pathname: string): string {
  if (TITLES[pathname]) return TITLES[pathname]
  const match = Object.keys(TITLES)
    .filter(k => k !== '/dashboard' && pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0]
  return match ? TITLES[match] : 'Invollve'
}

const post = (url: string, body: unknown) =>
  fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), keepalive: true }).catch(() => {})

export default function OfficeShell({ session, children }: { session: UserSession; children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const overlayOpen = pathname !== OFFICE_PATH

  // Avatar selection shown once per session on first enter
  const [showSelect, setShowSelect] = useState(false)
  const [avatarColor, setAvatarColor] = useState<string>('')
  const [inMeeting, setInMeeting] = useState(false)
  const [inPrivate, setInPrivate] = useState(false)
  const [pipMin, setPipMin] = useState(false) // call manually minimized to a corner
  const [handUp, setHandUp] = useState(false)  // my hand raised in the call
  const [raisedHands, setRaisedHands] = useState<{ id: number; name: string }[]>([]) // everyone with a raised hand

  useEffect(() => {
    setAvatarColor(getAvatarColor(session.role))
    setShowSelect(shouldShowAvatarSelect())
  }, [session.role])

  // Presence heartbeat — keeps this user in the hub (assigns a seat) and fresh.
  useEffect(() => {
    if (showSelect) return
    const beat = () => {
      const status = (inMeeting || inPrivate) ? 'reuniao' : overlayOpen ? 'ocupado' : 'online'
      post('/api/escritorio/move', { status, avatarColor: avatarColor || null })
    }
    beat()
    const id = setInterval(beat, 3000)
    return () => clearInterval(id)
  }, [showSelect, inMeeting, inPrivate, overlayOpen, avatarColor])

  // Opening another module no longer leaves the call — it shrinks to a PiP
  // (handled in render). The call only ends when the user clicks "Sair".

  // Leave the meeting if the tab is closed.
  useEffect(() => {
    const onUnload = () => { if (inMeeting) post('/api/escritorio/meeting', { join: false }) }
    window.addEventListener('beforeunload', onUnload)
    return () => window.removeEventListener('beforeunload', onUnload)
  }, [inMeeting])

  function closeWindow() { router.push(OFFICE_PATH) }
  function handleEnter(color: string) { setAvatarColor(color); setShowSelect(false) }

  const enterMeeting = useCallback(() => {
    router.push(OFFICE_PATH)
    post('/api/escritorio/meeting', { join: true })
    setInPrivate(false); setPipMin(false); setHandUp(false); setInMeeting(true)
  }, [router])

  // Private 1-on-1: opens a separate Daily room limited to 2 people.
  const enterPrivate = useCallback(() => {
    router.push(OFFICE_PATH)
    setInMeeting(false); setPipMin(false); setHandUp(false); setInPrivate(true)
  }, [router])

  // Shared call helpers (the call can be full-screen or a floating PiP).
  const inCall = inMeeting || inPrivate
  const callPip = inCall && (overlayOpen || pipMin) // PiP when on another module, or minimized
  const leaveCall = useCallback(() => {
    setPipMin(false); setHandUp(false)
    post('/api/escritorio/meeting', { join: false })
    setInMeeting(false); setInPrivate(false)
  }, [])
  const expandCall = useCallback(() => { setPipMin(false); router.push(OFFICE_PATH) }, [router])

  // Raise / lower my hand — reuses the office presence system, so everyone in
  // the call (same app, same stream) sees the raised hand in real time. The
  // server POST lives in an effect (not inside the state updater) so it fires
  // exactly once per change.
  const toggleHand = useCallback(() => setHandUp(prev => !prev), [])
  const handSynced = useState(() => ({ first: true }))[0]
  useEffect(() => {
    if (handSynced.first) { handSynced.first = false; return }
    post('/api/escritorio/hand', { raised: handUp })
  }, [handUp, handSynced])

  // While in a call, watch presence to show who currently has a hand raised.
  useEffect(() => {
    if (!inCall) { setRaisedHands([]); return }
    const onPresence = (players: unknown[]) => {
      const arr = players as { id: number; name?: string; hand?: boolean }[]
      setRaisedHands(arr.filter(p => p.hand).map(p => ({ id: p.id, name: p.name || 'Alguém' })))
    }
    return subscribeOfficeStream({ presence: onPresence })
  }, [inCall])

  return (
    <CallProvider session={session}>
      <div className="relative flex-1 h-screen overflow-hidden">
        {/* Office canvas (paused while in a call) */}
        <div className={`absolute inset-0 transition-all duration-300 ${overlayOpen ? 'scale-[0.99] blur-[2px] brightness-[0.55]' : ''}`}>
          <OfficeCanvas session={session} active={!overlayOpen && !showSelect && !inCall} avatarColor={avatarColor} onEnterMeeting={enterMeeting} onEnterPrivate={enterPrivate} />
        </div>

        {/* Floating module window */}
        {overlayOpen && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-3 sm:p-6" onClick={closeWindow}>
            <div
              className="flex flex-col w-full h-full max-w-[1400px] rounded-2xl border border-[var(--border-2)] shadow-2xl overflow-hidden backdrop-blur-xl"
              style={{ background: 'linear-gradient(180deg, rgba(20,12,38,0.96), rgba(10,6,19,0.96))' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-[var(--border)] bg-white/[0.02] flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--grad)' }} />
                  <span className="text-sm font-semibold text-white">{titleFor(pathname)}</span>
                </div>
                <button
                  onClick={closeWindow}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--muted)] hover:text-white bg-white/[0.04] hover:bg-white/[0.09] border border-[var(--border)] transition-all"
                >
                  🏢 Voltar ao escritório
                </button>
              </div>
              <div className="flex-1 overflow-auto p-6">{children}</div>
            </div>
          </div>
        )}

        {/* Avatar selection overlay (once per session) */}
        {showSelect && <AvatarSelect session={session} onEnter={handleEnter} />}

        {/* Office dock + enter-meeting button — only when not already in a call */}
        {!showSelect && !overlayOpen && !inCall && (
          <>
            <OfficeTiles />
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-end gap-3">
              <CallControls variant="office" />
              <button onClick={enterMeeting} title="Entrar na reunião"
                className="h-11 px-5 rounded-full flex items-center gap-2 text-white text-sm font-semibold shadow-xl transition-all hover:brightness-110 active:scale-95"
                style={{ background: 'var(--grad)' }}>
                📹 Entrar na reunião
              </button>
            </div>
          </>
        )}

        {/* THE CALL — persistent while in a call. Full-screen on the office, or a
            floating PiP when you open another section, so the call NEVER drops.
            The Daily iframe stays mounted; only its container resizes. */}
        {inCall && (
          <div
            className="absolute flex flex-col bg-[#0a0a0f] overflow-hidden border border-white/10"
            style={{
              // Single element that morphs between full-screen and the corner
              // PiP, so the call visibly shrinks down with a smooth transition.
              transitionProperty: 'top, left, width, height, border-radius, box-shadow',
              transitionDuration: '440ms',
              transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
              willChange: 'top, left, width, height',
              ...(callPip
                ? { top: 'calc(100% - 246px)', left: 'calc(100% - 356px)', width: 340, height: 230, borderRadius: 14, boxShadow: '0 24px 60px rgba(0,0,0,0.55)', zIndex: 50 }
                : { top: 0, left: 0, width: '100%', height: '100%', borderRadius: 0, boxShadow: '0 0 0 0 rgba(0,0,0,0)', zIndex: 40 }),
            }}
          >
            <div className="flex items-center justify-between gap-2 px-3 py-1.5 border-b border-white/10 flex-shrink-0">
              <span className="text-xs font-semibold text-white truncate">
                {inPrivate ? '🔒 Reunião 1a1' : '📹 Sala de reunião'}
              </span>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button onClick={toggleHand} title={handUp ? 'Abaixar a mão' : 'Levantar a mão'}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition active:scale-95 ${handUp ? 'bg-amber-400 text-black shadow' : 'text-white bg-white/10 hover:bg-white/20'}`}>
                  <span className={handUp ? 'inline-block animate-pulse' : ''}>✋</span>{callPip ? '' : (handUp ? ' Abaixar' : ' Levantar a mão')}
                </button>
                {callPip ? (
                  <button onClick={expandCall} title="Expandir"
                    className="px-2.5 py-1 rounded-lg text-xs font-medium text-white bg-white/10 hover:bg-white/20 transition">Expandir</button>
                ) : (
                  <button onClick={() => setPipMin(true)} title="Minimizar (continua em janelinha)"
                    className="px-2.5 py-1 rounded-lg text-xs font-medium text-white bg-white/10 hover:bg-white/20 transition">Minimizar</button>
                )}
                <button onClick={leaveCall} title="Sair da chamada"
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-500 transition">Sair</button>
              </div>
            </div>
            {raisedHands.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-400/15 border-b border-amber-400/30 flex-shrink-0 overflow-hidden">
                <span className="text-xs flex-shrink-0">✋</span>
                <span className="text-amber-100 text-[11px] truncate">{raisedHands.map(h => h.name).join(', ')}</span>
              </div>
            )}
            <div className="flex-1 min-h-0">
              <DailyRoom room={inPrivate ? 'invollve-1a1' : 'invollve-escritorio'} max={inPrivate ? 2 : undefined} displayName={session.name} />
            </div>
          </div>
        )}
      </div>
    </CallProvider>
  )
}
