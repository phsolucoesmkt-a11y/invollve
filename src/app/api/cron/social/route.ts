import { NextRequest, NextResponse } from 'next/server'
import { CLIENTS, collect, getShare } from '@/lib/socialMeta'

export const maxDuration = 60

// Coleta noturna do orgânico de todos os clientes.
// Chamar 1x por dia (ex.: 06:00) com o header "Authorization: Bearer <CRON_SECRET>" ou ?key=<CRON_SECRET>.
// Funciona com Vercel Cron, cron do cPanel (curl) ou cron-job.org.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  const key = req.headers.get('authorization')?.replace('Bearer ', '') || new URL(req.url).searchParams.get('key')
  if (!secret || key !== secret) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const results: Record<string, any> = {}
  for (const slug of Object.keys(CLIENTS)) {
    await getShare(slug)
    try { results[slug] = await collect(slug) } catch (e: any) { results[slug] = { error: e.message } }
  }
  return NextResponse.json({ ok: true, results })
}
