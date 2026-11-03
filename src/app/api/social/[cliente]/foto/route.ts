import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { CLIENTS, postImageUrl, slugByToken } from '@/lib/socialMeta'

// Foto de um post (?p=plataforma&id=post_id). Os links da Meta expiram,
// então o servidor busca a imagem atual e devolve com cache de 1 dia.
export async function GET(req: NextRequest, { params }: { params: Promise<{ cliente: string }> }) {
  const { cliente } = await params
  if (!CLIENTS[cliente]) return new NextResponse(null, { status: 404 })

  const sp = new URL(req.url).searchParams
  const t = sp.get('t')
  const session = await getSession()
  const interno = !!session && session.role !== 'cliente'
  if (!interno && (!t || (await slugByToken(t)) !== cliente)) return new NextResponse(null, { status: 401 })

  const plataforma = sp.get('p') || 'instagram'
  const id = sp.get('id') || ''
  const url = await postImageUrl(cliente, plataforma, id)
  if (url?.startsWith('data:image/')) {
    // imagem embutida (usada nos dados de teste local)
    const [meta, b64] = url.slice(5).split(',')
    return new NextResponse(Buffer.from(b64, meta.endsWith(';base64') ? 'base64' : 'utf8'), {
      headers: { 'Content-Type': meta.split(';')[0], 'Cache-Control': 'private, max-age=86400' },
    })
  }
  if (url) {
    try {
      const res = await fetch(url, { cache: 'no-store' })
      if (res.ok) {
        return new NextResponse(res.body, {
          headers: {
            'Content-Type': res.headers.get('content-type') || 'image/jpeg',
            'Cache-Control': 'private, max-age=86400',
          },
        })
      }
    } catch { /* cai na imagem padrão */ }
  }
  // Sem foto disponível: quadro neutro
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a1640"/><stop offset="1" stop-color="#14101c"/></linearGradient></defs>
    <rect width="400" height="500" fill="url(#g)"/>
    <g fill="none" stroke="#6f5f8a" stroke-width="10" stroke-linejoin="round"><rect x="140" y="190" width="120" height="100" rx="14"/><circle cx="200" cy="240" r="26"/></g>
  </svg>`
  return new NextResponse(svg, { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'private, max-age=3600' } })
}
