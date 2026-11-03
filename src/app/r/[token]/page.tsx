import { notFound } from 'next/navigation'
import { slugByToken } from '@/lib/socialMeta'
import SocialDashboard from '@/components/modules/social/SocialDashboard'

// Página pública (sem login) do dashboard de redes — link enviado ao cliente.
export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  return { title: 'Redes sociais · Invollve', robots: { index: false, follow: false } }
}

export default async function PublicSocialPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const cliente = await slugByToken(token)
  if (!cliente) notFound()

  return (
    <main className="app-bg min-h-screen px-4 py-8 md:px-8">
      <SocialDashboard cliente={cliente} token={token} />
      <p className="mt-8 text-center text-xs text-zinc-500">Relatório preparado pela Invollve</p>
    </main>
  )
}
