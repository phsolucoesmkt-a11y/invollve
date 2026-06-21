'use client'
import { useEffect, useRef, useState } from 'react'
import { UserSession } from '@/lib/auth'

/*
 * Sala de Reunião — vídeo/áudio confiável via Jitsi embutido.
 *
 * A chamada P2P caseira (mesh + sinalização SSE) não fica estável na hospedagem
 * compartilhada (poucos workers Node seguram as conexões e a chamada trava). Para
 * funcionar de qualquer lugar do mundo (como Google Meet), embutimos uma sala real
 * do Jitsi (open-source, grátis), que cuida da sinalização, do TURN e da escala.
 *
 * A "antessala" (escritório top-down com os avatares) continua sendo a nossa — só o
 * MOTOR de A/V dentro da reunião passa a ser o Jitsi. Todo mundo entra na mesma sala.
 */

const JITSI_DOMAIN = 'meet.jit.si'
// Sala fixa e compartilhada da equipe (nome longo p/ não ser adivinhado).
// Para mais privacidade no futuro: Jitsi auto-hospedado ou senha/lobby.
const ROOM = 'InvollveEscritorioReuniao-9f4a7c2e8b51'

declare global {
  interface Window { JitsiMeetExternalAPI?: new (domain: string, options: Record<string, unknown>) => { dispose: () => void; addEventListener: (ev: string, cb: () => void) => void } }
}

function loadJitsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.JitsiMeetExternalAPI) return resolve()
    const existing = document.querySelector('script[data-jitsi]') as HTMLScriptElement | null
    if (existing) { existing.addEventListener('load', () => resolve()); existing.addEventListener('error', () => reject(new Error('load'))); return }
    const s = document.createElement('script')
    s.src = `https://${JITSI_DOMAIN}/external_api.js`
    s.async = true
    s.dataset.jitsi = '1'
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('load'))
    document.head.appendChild(s)
  })
}

export default function MeetingRoom({ session, onLeave }: { session: UserSession; avatarColor?: string; onLeave: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<{ dispose: () => void; addEventListener: (ev: string, cb: () => void) => void } | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let disposed = false
    loadJitsiScript()
      .then(() => {
        if (disposed || !containerRef.current || !window.JitsiMeetExternalAPI) return
        const api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
          roomName: ROOM,
          parentNode: containerRef.current,
          width: '100%',
          height: '100%',
          userInfo: { displayName: session.name },
          configOverwrite: {
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            startWithAudioMuted: false,
            startWithVideoMuted: true,
          },
          interfaceConfigOverwrite: {
            MOBILE_APP_PROMO: false,
            SHOW_JITSI_WATERMARK: false,
            SHOW_CHROME_EXTENSION_BANNER: false,
            DEFAULT_BACKGROUND: '#0a0613',
          },
        })
        apiRef.current = api
        api.addEventListener('readyToClose', () => onLeave())
      })
      .catch(() => setError(true))
    return () => { disposed = true; try { apiRef.current?.dispose() } catch {} ; apiRef.current = null }
  }, [session.name, onLeave])

  return (
    <div className="absolute inset-0 z-40 flex flex-col" style={{ background: '#0a0613' }}>
      {/* header */}
      <div className="flex items-center justify-between px-5 py-2.5 flex-shrink-0 border-b border-[var(--border)]">
        <div className="flex items-center gap-2 text-white">
          <span className="text-lg">📹</span>
          <span className="font-semibold">Sala de Reunião</span>
        </div>
        <button onClick={onLeave} title="Sair da reunião"
          className="h-9 px-4 rounded-full flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-all">
          Sair
        </button>
      </div>

      {/* Jitsi embed (or fallback) */}
      <div className="relative flex-1 min-h-0">
        {!error ? (
          <div ref={containerRef} className="absolute inset-0" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6">
            <p className="text-white font-medium">Não consegui carregar a sala de vídeo aqui.</p>
            <p className="text-[var(--muted)] text-sm max-w-md">Pode ser bloqueio de rede/extensão. Você pode abrir a mesma sala numa aba nova:</p>
            <a href={`https://${JITSI_DOMAIN}/${ROOM}`} target="_blank" rel="noopener noreferrer"
              className="btn-primary px-5 py-2.5 text-sm">Abrir sala de reunião ↗</a>
          </div>
        )}
        {/* loading hint behind the iframe until Jitsi paints */}
        {!error && (
          <div className="absolute inset-0 -z-10 flex items-center justify-center text-[var(--muted)] text-sm">
            Conectando à sala de vídeo…
          </div>
        )}
      </div>
    </div>
  )
}
