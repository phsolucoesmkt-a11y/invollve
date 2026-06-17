'use client'
import { usePathname, useRouter } from 'next/navigation'
import { UserSession } from '@/lib/auth'
import OfficeCanvas from './OfficeCanvas'
import OfficeCall from './OfficeCall'

// When the user is on this path, the office is fullscreen and "walkable".
// Any other dashboard path opens as a floating window ON TOP of the live office.
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

export default function OfficeShell({ session, children }: { session: UserSession; children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const overlayOpen = pathname !== OFFICE_PATH

  function closeWindow() {
    router.push(OFFICE_PATH)
  }

  return (
    <div className="relative flex-1 h-screen overflow-hidden bg-[#08080c]">
      {/* Persistent, always-alive office layer — never unmounts across navigation */}
      <div
        className={`absolute inset-0 transition-all duration-300 ${
          overlayOpen ? 'scale-[0.99] blur-[2px] brightness-[0.55]' : ''
        }`}
      >
        <OfficeCanvas session={session} active={!overlayOpen} />
      </div>

      {/* Floating module window on top of the office */}
      {overlayOpen && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center p-3 sm:p-6"
          onClick={closeWindow}
        >
          <div
            className="flex flex-col w-full h-full max-w-[1400px] rounded-2xl border border-white/10 bg-[#0f0f13] shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Window title bar */}
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-white/5 bg-[#0a0a0e] flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80" />
                </span>
                <span className="ml-2 text-sm font-semibold text-white">{titleFor(pathname)}</span>
              </div>
              <button
                onClick={closeWindow}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
                title="Voltar ao escritório"
              >
                🏢 Voltar ao escritório
              </button>
            </div>
            {/* Module content */}
            <div className="flex-1 overflow-auto p-6">{children}</div>
          </div>
        </div>
      )}

      {/* A/V call controls + remote tiles — stays usable even while a module window is open */}
      <OfficeCall session={session} />
    </div>
  )
}
