import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { CLIENTS, getShare, readRange, refreshIfStale, slugByToken } from '@/lib/socialMeta'

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
  // ?de=YYYY-MM-DD&ate=YYYY-MM-DD (no máximo 3 anos); padrão: ano atual + anterior
  const ano = new Date().getFullYear()
  const isDate = (v: string | null) => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v)
  let de = isDate(sp.get('de')) ? sp.get('de')! : `${ano - 1}-01-01`
  const ate = isDate(sp.get('ate')) ? sp.get('ate')! : `${ano}-12-31`
  if (Number(ate.slice(0, 4)) - Number(de.slice(0, 4)) > 3) de = `${Number(ate.slice(0, 4)) - 3}-01-01`
  const data = await readRange(cliente, de, ate)
  const share = interno ? await getShare(cliente) : null
  return NextResponse.json({
    ...data,
    de, ate,
    // detalhes técnicos e o link só para a equipe
    ultimo_erro: interno ? data.ultimo_erro : undefined,
    share_token: share?.token,
  })
}
