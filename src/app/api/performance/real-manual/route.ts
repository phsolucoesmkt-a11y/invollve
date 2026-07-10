import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import db from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const mes = new URL(req.url).searchParams.get('mes')
  if (!mes) return NextResponse.json({ error: 'Parâmetro mes obrigatório' }, { status: 400 })

  const rows = await db.all(
    'SELECT tipo, dados, atualizado_em FROM performance_real WHERE mes = ?',
    [mes]
  )
  const result: Record<string, any> = {}
  for (const row of rows as any[]) {
    result[row.tipo] = { dados: JSON.parse(row.dados), atualizado_em: row.atualizado_em }
  }
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { mes, tipo, dados } = await req.json()
  if (!mes || !tipo || !dados) return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 })

  await db.run(
    `INSERT INTO performance_real (mes, tipo, dados, atualizado_por, atualizado_em)
     VALUES (?, ?, ?, ?, datetime('now'))
     ON CONFLICT(mes, tipo) DO UPDATE SET dados=excluded.dados, atualizado_por=excluded.atualizado_por, atualizado_em=excluded.atualizado_em`,
    [mes, tipo, JSON.stringify(dados), session.id]
  )
  return NextResponse.json({ ok: true })
}
