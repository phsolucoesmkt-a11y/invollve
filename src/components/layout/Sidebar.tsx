'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { UserSession, PERMISSIONS } from '@/lib/auth'

const navItems = [
  { href: '/dashboard', label: 'Início', icon: '🏠', module: null },
  { href: '/dashboard/financeiro', label: 'Financeiro', icon: '💰', module: 'financeiro' },
  { href: '/dashboard/comercial', label: 'Comercial', icon: '🚀', module: 'clientes' },
  { href: '/dashboard/clientes', label: 'Clientes', icon: '👥', module: 'clientes' },
  { href: '/dashboard/tarefas', label: 'Tarefas', icon: '✅', module: 'tarefas' },
  { href: '/dashboard/performance', label: 'Performance', icon: '📈', module: 'clientes' },
  { href: '/dashboard/rh', label: 'RH & Equipe', icon: '🎂', module: 'rh' },
  { href: '/dashboard/drive', label: 'Drive', icon: '📁', module: 'drive' },
  { href: '/dashboard/reunioes', label: 'Reuniões', icon: '📅', module: 'reunioes' },
  { href: '/dashboard/processos', label: 'Processos', icon: '⚙️', module: 'processos' },
  { href: '/dashboard/agentes', label: 'Agentes de IA', icon: '🤖', module: 'agentes' },
  { href: '/dashboard/chat', label: 'Chat', icon: '💬', module: 'tarefas' },
  { href: '/dashboard/usuarios', label: 'Usuários', icon: '🔧', module: 'usuarios' },
  { href: '/dashboard/perfil', label: 'Meu Perfil', icon: '👤', module: null },
]

export default function Sidebar({ session }: { session: UserSession }) {
  const pathname = usePathname()
  const router = useRouter()

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const visibleItems = navItems.filter(item =>
    item.module === null || PERMISSIONS[item.module]?.includes(session.role)
  )

  return (
    <aside className="w-64 flex flex-col border-r border-white/5 bg-[#0a0a0e]">
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-lg"
            style={{ background: 'linear-gradient(135deg, #6c3de8, #ec4899)' }}>
            I
          </div>
          <div>
            <p className="font-black text-white text-sm tracking-wide">INVOLLVE</p>
            <p className="text-xs text-zinc-500">Gestão de Agência</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {visibleItems.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${active
                ? 'bg-purple-600/20 text-purple-300 font-medium'
                : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-white/5">
        <div className="px-3 py-2 mb-2">
          <p className="text-sm font-medium text-white truncate">{session.name}</p>
          <p className="text-xs text-zinc-500 truncate">{session.email}</p>
        </div>
        <button onClick={logout}
          className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-400 hover:bg-white/5 hover:text-white transition-all">
          <span>🚪</span>
          <span>Sair</span>
        </button>
      </div>
    </aside>
  )
}
