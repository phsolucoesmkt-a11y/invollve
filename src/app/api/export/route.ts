import { NextResponse } from 'next/server'
import db from '@/lib/db'
import { getSession } from '@/lib/session'

// Rota TEMPORÁRIA de backup. Exige sessão de sócio. Remover após a migração.
const TABLES = [
  'users', 'leads', 'chat_messages', 'clients', 'tasks',
  'financial_entries', 'rh_people', 'drive_links', 'meetings', 'client_data',
]

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'socio') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const dump: Record<string, any[]> = {}
  for (const table of TABLES) {
    try {
      dump[table] = await db.all(`SELECT * FROM ${table}`)
    } catch (e: any) {
      dump[table] = [{ __error: e.message }]
    }
  }

  return NextResponse.json({ exported_at: new Date().toISOString(), data: dump })
}
