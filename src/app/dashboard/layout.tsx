import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import Sidebar from '@/components/layout/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role === 'cliente') redirect('/portal')

  return (
    <div className="flex h-screen bg-[#0f0f13] overflow-hidden">
      <Sidebar session={session} />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  )
}
