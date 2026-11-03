import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { CLIENTS, getShare, readYear, refreshIfStale, slugByToken } from '@/lib/socialMeta'

// Dados do dashboard de redes. Acesso: usuário logado da Invollve OU link público (?t=token).
export async function GET(req: NextRequest, { params }: { params: Promise<{ cliente: string }> }) {
  const { cliente } = await params
  if (!CLIENTS[cliente]) return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })

  const sp = new URL(req.url).searchParams
  const t = sp.get('t')
  const session = await getSession()
  const interno = !!session && session.role !== 'cliente'
  if (!interno && (!t || (await slugByToken(t)) !== cliente)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  await refreshIfStale(cliente)
  const ano = Number(sp.get('ano')) || new Date().getFullYear()
  const data = await readYear(cliente, ano)
  const share = interno ? await getShare(cliente) : null
  return NextResponse.json({
    ...data,
    ano,
    // detalhes técnicos e o link só para a equipe
    ultimo_erro: interno ? data.ultimo_erro : undefined,
    share_token: share?.token,
  })
}
