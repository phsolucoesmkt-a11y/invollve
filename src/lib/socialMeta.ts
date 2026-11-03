import 'server-only'
import db from './db'

// Coleta do orgânico (Instagram + Facebook) pela Graph API da Meta.
// Grava um valor por dia em social_metrics; semana/mês são somados na leitura,
// exceto o alcance do Instagram (pessoas únicas), que a Meta devolve já sem repetição por período.

const GRAPH = 'https://graph.facebook.com/v22.0'
const TOKEN = process.env.META_ACCESS_TOKEN

export interface SocialClient {
  slug: string
  nome: string
  igId: string
  pageId?: string
  // Quem entrega conteúdos fixos por mês (ex.: Amanda, 4/mês). Com @ configurado, posts que citam o @ são marcados sozinhos.
  entregas?: { nome: string; meta: number; handle?: string }[]
}

export const CLIENTS: Record<string, SocialClient> = {
  real: {
    slug: 'real',
    nome: 'Real Equipamentos',
    igId: process.env.META_REAL_IG_ID || '17841400315502599',
    pageId: process.env.META_REAL_PAGE_ID || undefined,
    entregas: [{ nome: 'Amanda', meta: 4, handle: process.env.META_REAL_AMANDA_HANDLE || undefined }],
  },
}

// Cada métrica tenta os nomes da API em ordem (a Meta renomeia métricas entre versões).
const IG_METRICS: { key: string; api: string[]; breakdown?: string }[] = [
  { key: 'visualizacoes', api: ['views'] },
  { key: 'alcance', api: ['reach'] },
  { key: 'interacoes', api: ['total_interactions'] },
  { key: 'cliques_link', api: ['website_clicks', 'profile_links_taps'] },
  { key: 'visitas_perfil', api: ['profile_views'] },
  { key: 'novos_seguidores', api: ['follows_and_unfollows'], breakdown: 'follow_type' },
]

const FB_METRICS: { key: string; api: string[] }[] = [
  { key: 'visualizacoes', api: ['page_media_view', 'page_impressions'] },
  { key: 'visualizadores', api: ['page_total_media_view_unique', 'page_impressions_unique'] },
  { key: 'interacoes', api: ['page_post_engagements'] },
  { key: 'cliques_link', api: ['page_total_actions'] },
  { key: 'visitas_pagina', api: ['page_views_total'] },
  { key: 'novos_seguidores', api: ['page_daily_follows_unique', 'page_fan_adds_unique'] },
]

// ── datas (dia no fuso de Brasília, formato YYYY-MM-DD) ─────────────────────────
export function todayBR(): string {
  return new Date(Date.now() - 3 * 3600_000).toISOString().slice(0, 10)
}
export function addDays(d: string, n: number): string {
  const t = new Date(d + 'T12:00:00Z')
  t.setUTCDate(t.getUTCDate() + n)
  return t.toISOString().slice(0, 10)
}
function tsBR(d: string): number {
  return Math.floor(new Date(d + 'T00:00:00-03:00').getTime() / 1000)
}
export function weekStart(d: string): string {
  const dow = new Date(d + 'T12:00:00Z').getUTCDay() // 0 = domingo
  return addDays(d, -((dow + 6) % 7)) // segunda-feira
}

async function graph(path: string, params: Record<string, string>, token = TOKEN): Promise<any> {
  const qs = new URLSearchParams({ ...params, access_token: token || '' })
  const res = await fetch(`${GRAPH}/${path}?${qs}`, { cache: 'no-store' })
  const json = await res.json().catch(() => ({}))
  if (json.error) throw new Error(json.error.message || 'Erro na API da Meta')
  return json
}

async function save(cliente: string, plataforma: string, metrica: string, gran: string, inicio: string, valor: number) {
  await db.run(
    `INSERT INTO social_metrics (cliente, plataforma, metrica, granularidade, inicio, valor, atualizado_em)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(cliente, plataforma, metrica, granularidade, inicio)
     DO UPDATE SET valor=excluded.valor, atualizado_em=excluded.atualizado_em`,
    [cliente, plataforma, metrica, gran, inicio, valor]
  )
}

// ── Instagram ────────────────────────────────────────────────────────────────
// Lembra qual nome de métrica funcionou para não repetir chamadas que falham.
const igWorking: Record<string, string | null> = {}

async function igTotal(igId: string, apiName: string, since: string, untilExcl: string, breakdown?: string): Promise<number> {
  const params: Record<string, string> = {
    metric: apiName, metric_type: 'total_value', period: 'day',
    since: String(tsBR(since)), until: String(tsBR(untilExcl)),
  }
  if (breakdown) params.breakdown = breakdown
  const json = await graph(`${igId}/insights`, params)
  const item = json.data?.[0]
  if (!item) return 0
  if (breakdown) {
    // follows_and_unfollows: soma só quem seguiu
    const results = item.total_value?.breakdowns?.[0]?.results || []
    const follows = results.find((r: any) => (r.dimension_values || []).includes('FOLLOWER'))
    return follows?.value || 0
  }
  return item.total_value?.value || 0
}

async function igMetric(igId: string, m: typeof IG_METRICS[number], since: string, untilExcl: string): Promise<number | null> {
  const names = igWorking[m.key] !== undefined ? (igWorking[m.key] ? [igWorking[m.key]!] : []) : m.api
  for (const name of names) {
    try {
      const v = await igTotal(igId, name, since, untilExcl, m.breakdown)
      igWorking[m.key] = name
      return v
    } catch {
      /* tenta o próximo nome */
    }
  }
  if (igWorking[m.key] === undefined) igWorking[m.key] = null
  return null
}

async function collectInstagram(c: SocialClient, days: string[], errors: string[]) {
  for (const day of days) {
    // as 6 métricas do dia em paralelo
    await Promise.all(IG_METRICS.map(async m => {
      const v = await igMetric(c.igId, m, day, addDays(day, 1))
      if (v != null) await save(c.slug, 'instagram', m.key, 'dia', day, v)
    }))
  }
  const missing = IG_METRICS.filter(m => igWorking[m.key] === null).map(m => m.key)
  if (missing.length) errors.push(`Instagram sem: ${missing.join(', ')}`)
}

// Alcance de semana/mês: pessoas únicas no período inteiro (não dá pra somar os dias).
// A API aceita no máximo 30 dias por consulta; meses de 31 dias perdem só o último dia da deduplicação.
async function collectInstagramReach(c: SocialClient, gran: 'semana' | 'mes', start: string, endIncl: string) {
  const until = addDays(endIncl, 1)
  let total = 0
  let from = start
  while (from < until) {
    const to = addDays(from, 30) < until ? addDays(from, 30) : until
    const v = await igMetric(c.igId, IG_METRICS[1], from, to)
    if (v == null) return
    total += v
    from = to
  }
  await save(c.slug, 'instagram', 'alcance', gran, start, total)
}

async function snapshotFollowers(c: SocialClient, pageToken: string | null, day: string) {
  try {
    const ig = await graph(c.igId, { fields: 'followers_count' })
    if (ig.followers_count != null) await save(c.slug, 'instagram', 'seguidores_total', 'dia', day, ig.followers_count)
  } catch { /* segue */ }
  if (c.pageId && pageToken) {
    try {
      const fb = await graph(c.pageId, { fields: 'followers_count' }, pageToken)
      if (fb.followers_count != null) await save(c.slug, 'facebook', 'seguidores_total', 'dia', day, fb.followers_count)
    } catch { /* segue */ }
  }
}

// ── Facebook (página) ──────────────────────────────────────────────────────────
// Métricas de página exigem o token da própria página, obtido a partir do token principal.
async function pageAccess(c: SocialClient): Promise<{ pageId: string; token: string } | null> {
  try {
    const json = await graph('me/accounts', { fields: 'id,name,access_token,instagram_business_account{id}', limit: '100' })
    const pages: any[] = json.data || []
    const page = c.pageId
      ? pages.find(p => p.id === c.pageId)
      : pages.find(p => p.instagram_business_account?.id === c.igId)
    if (page?.access_token) return { pageId: page.id, token: page.access_token }
  } catch { /* token pode não listar páginas — tenta direto abaixo */ }
  if (c.pageId) {
    try {
      const json = await graph(c.pageId, { fields: 'access_token' })
      if (json.access_token) return { pageId: c.pageId, token: json.access_token }
    } catch { /* sem acesso */ }
  }
  return null
}

async function collectFacebook(c: SocialClient, page: { pageId: string; token: string }, from: string, toIncl: string, errors: string[]) {
  const missing: string[] = []
  for (const m of FB_METRICS) {
    let ok = false
    for (const name of m.api) {
      try {
        const json = await graph(`${page.pageId}/insights`, {
          metric: name, period: 'day',
          since: from, until: addDays(toIncl, 1),
        }, page.token)
        const values: any[] = json.data?.[0]?.values || []
        for (const v of values) {
          // end_time é a meia-noite (horário do Pacífico) do fim do dia → o dia medido é o anterior
          const day = addDays(String(v.end_time).slice(0, 10), -1)
          if (day >= from && day <= toIncl) await save(c.slug, 'facebook', m.key, 'dia', day, Number(v.value) || 0)
        }
        ok = true
        break
      } catch { /* tenta o próximo nome */ }
    }
    if (!ok) missing.push(m.key)
  }
  if (missing.length) errors.push(`Facebook sem: ${missing.join(', ')}`)
}

// ── Posts (conteúdos) ───────────────────────────────────────────────────────────
// Guarda cada post com seus números; os números de um post continuam crescendo dias
// depois de publicado, por isso a coleta diária reatualiza os posts dos últimos 35 dias.
type PostRow = {
  plataforma: string; post_id: string; data: string; tipo: string; legenda: string | null
  thumb_url: string | null; permalink: string | null
  visualizacoes: number | null; alcance: number | null; interacoes: number | null
  curtidas: number | null; comentarios: number | null; salvos: number | null; compart: number | null
}

async function savePost(cliente: string, p: PostRow, autoAutor: string | null) {
  await db.run(
    `INSERT INTO social_posts (cliente, plataforma, post_id, data, tipo, legenda, thumb_url, permalink,
       visualizacoes, alcance, interacoes, curtidas, comentarios, salvos, compart, autor, atualizado_em)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(cliente, plataforma, post_id) DO UPDATE SET
       data=excluded.data, tipo=excluded.tipo, legenda=excluded.legenda, thumb_url=excluded.thumb_url, permalink=excluded.permalink,
       visualizacoes=excluded.visualizacoes, alcance=excluded.alcance, interacoes=excluded.interacoes,
       curtidas=excluded.curtidas, comentarios=excluded.comentarios, salvos=excluded.salvos, compart=excluded.compart,
       autor=COALESCE(social_posts.autor, excluded.autor), atualizado_em=excluded.atualizado_em`,
    [cliente, p.plataforma, p.post_id, p.data, p.tipo, p.legenda, p.thumb_url, p.permalink,
      p.visualizacoes, p.alcance, p.interacoes, p.curtidas, p.comentarios, p.salvos, p.compart, autoAutor]
  )
}

// Executa no máximo `n` chamadas ao mesmo tempo
async function pool<T>(items: T[], n: number, fn: (item: T) => Promise<void>) {
  let i = 0
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) await fn(items[i++])
  }))
}

function autoAutor(c: SocialClient, legenda: string | null): string | null {
  const txt = (legenda || '').toLowerCase()
  for (const e of c.entregas || []) {
    if (e.handle && txt.includes(e.handle.toLowerCase().replace(/^@?/, '@'))) return e.nome
  }
  return null
}

async function collectInstagramPosts(c: SocialClient, from: string, toIncl: string, errors: string[]) {
  const fields = 'id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count'
  const posts: any[] = []
  try {
    let json = await graph(`${c.igId}/media`, { fields, limit: '50' })
    // a lista vem do mais novo para o mais antigo; para quando passar do início do período
    for (let page = 0; page < 40; page++) {
      for (const m of json.data || []) {
        const d = toBR(m.timestamp)
        if (d >= from && d <= toIncl) posts.push(m)
      }
      const last = json.data?.[json.data.length - 1]
      if (!json.paging?.next || !last || toBR(last.timestamp) < from) break
      const res = await fetch(json.paging.next, { cache: 'no-store' })
      json = await res.json()
      if (json.error) throw new Error(json.error.message)
    }
  } catch (e: any) {
    errors.push(`Posts do Instagram: ${e.message}`)
    return
  }

  await pool(posts, 5, async m => {
    const ins: Record<string, number> = {}
    for (const metric of ['views,reach,total_interactions,saved,shares', 'reach,total_interactions,saved,shares', 'reach']) {
      try {
        const json = await graph(`${m.id}/insights`, { metric })
        for (const it of json.data || []) ins[it.name] = it.values?.[0]?.value ?? it.total_value?.value ?? 0
        break
      } catch { /* tenta um conjunto menor de métricas */ }
    }
    const tipo = m.media_product_type === 'REELS' ? 'reels' : m.media_type === 'CAROUSEL_ALBUM' ? 'carrossel' : m.media_type === 'VIDEO' ? 'video' : 'foto'
    await savePost(c.slug, {
      plataforma: 'instagram', post_id: m.id, data: m.timestamp, tipo,
      legenda: m.caption ?? null, thumb_url: m.thumbnail_url || m.media_url || null, permalink: m.permalink ?? null,
      visualizacoes: ins.views ?? null, alcance: ins.reach ?? null, interacoes: ins.total_interactions ?? null,
      curtidas: m.like_count ?? null, comentarios: m.comments_count ?? null, salvos: ins.saved ?? null, compart: ins.shares ?? null,
    }, autoAutor(c, m.caption ?? null))
  })
}

async function collectFacebookPosts(c: SocialClient, page: { pageId: string; token: string }, from: string, toIncl: string, errors: string[]) {
  let posts: any[] = []
  try {
    const json = await graph(`${page.pageId}/posts`, {
      fields: 'id,message,created_time,full_picture,permalink_url,shares,reactions.summary(total_count).limit(0),comments.summary(total_count).limit(0)',
      since: String(tsBR(from)), until: String(tsBR(addDays(toIncl, 1))), limit: '100',
    }, page.token)
    posts = json.data || []
  } catch (e: any) {
    errors.push(`Posts do Facebook: ${e.message}`)
    return
  }
  await pool(posts, 5, async p => {
    const ins: Record<string, number> = {}
    for (const metric of ['post_media_view,post_total_media_view_unique', 'post_impressions,post_impressions_unique']) {
      try {
        const json = await graph(`${p.id}/insights`, { metric }, page.token)
        for (const it of json.data || []) ins[it.name] = Number(it.values?.[0]?.value) || 0
        break
      } catch { /* tenta os nomes antigos */ }
    }
    const reacoes = p.reactions?.summary?.total_count ?? null
    const coment = p.comments?.summary?.total_count ?? null
    const comp = p.shares?.count ?? null
    await savePost(c.slug, {
      plataforma: 'facebook', post_id: p.id, data: p.created_time, tipo: 'post',
      legenda: p.message ?? null, thumb_url: p.full_picture ?? null, permalink: p.permalink_url ?? null,
      visualizacoes: ins.post_media_view ?? ins.post_impressions ?? null,
      alcance: ins.post_total_media_view_unique ?? ins.post_impressions_unique ?? null,
      interacoes: reacoes != null || coment != null || comp != null ? (reacoes || 0) + (coment || 0) + (comp || 0) : null,
      curtidas: reacoes, comentarios: coment, salvos: null, compart: comp,
    }, autoAutor(c, p.message ?? null))
  })
}

// Data/hora da Meta (UTC) → dia no fuso de Brasília
function toBR(iso: string): string {
  return new Date(new Date(iso).getTime() - 3 * 3600_000).toISOString().slice(0, 10)
}

export async function readPosts(slug: string, from: string, to: string) {
  const rows = await db.all<Record<string, unknown>>(
    `SELECT plataforma, post_id, data, tipo, legenda, permalink, visualizacoes, alcance, interacoes,
            curtidas, comentarios, salvos, compart, autor
     FROM social_posts WHERE cliente = ? AND data >= ? AND data < ? ORDER BY data DESC`,
    [slug, `${from}T03:00:00`, `${addDays(to, 1)}T03:00:00`]
  )
  return { posts: rows, entregas: (CLIENTS[slug]?.entregas || []).map(e => ({ nome: e.nome, meta: e.meta })) }
}

export async function tagPost(slug: string, plataforma: string, postId: string, autor: string | null) {
  await db.run('UPDATE social_posts SET autor = ? WHERE cliente = ? AND plataforma = ? AND post_id = ?', [autor, slug, plataforma, postId])
}

// Endereço atual da foto do post (os links da Meta expiram, então pedimos um novo quando dá)
export async function postImageUrl(slug: string, plataforma: string, postId: string): Promise<string | null> {
  const row = await db.get<{ thumb_url: string | null }>(
    'SELECT thumb_url FROM social_posts WHERE cliente = ? AND plataforma = ? AND post_id = ?', [slug, plataforma, postId]
  )
  if (!row) return null
  if (TOKEN && plataforma === 'instagram') {
    try {
      const m = await graph(postId, { fields: 'media_url,thumbnail_url' })
      const fresh = m.thumbnail_url || m.media_url
      if (fresh) {
        if (fresh !== row.thumb_url) await db.run('UPDATE social_posts SET thumb_url = ? WHERE cliente = ? AND post_id = ?', [fresh, slug, postId])
        return fresh
      }
    } catch { /* usa a guardada */ }
  }
  return row.thumb_url
}

// ── Coleta principal ───────────────────────────────────────────────────────────
export async function collect(slug: string, opts: { from?: string; to?: string } = {}) {
  const c = CLIENTS[slug]
  if (!c) throw new Error('Cliente não encontrado')
  if (!TOKEN) throw new Error('META_ACCESS_TOKEN não configurado no servidor')

  const today = todayBR()
  // Padrão: últimos 3 dias fechados (a Meta ainda ajusta os números por ~48h)
  const to = opts.to && opts.to < today ? opts.to : addDays(today, -1)
  const from = opts.from || addDays(to, -2)
  const days: string[] = []
  for (let d = from; d <= to; d = addDays(d, 1)) days.push(d)

  // Esquece falhas de coletas anteriores (podem ter sido instabilidade da rede)
  for (const k of Object.keys(igWorking)) if (igWorking[k] === null) delete igWorking[k]
  const errors: string[] = []
  await collectInstagram(c, days, errors)

  // Alcance único das semanas e meses tocados por esta coleta
  const weeks = new Set(days.map(weekStart))
  for (const w of weeks) {
    const end = addDays(w, 6) < to ? addDays(w, 6) : to
    await collectInstagramReach(c, 'semana', w, end)
  }
  const months = new Set(days.map(d => d.slice(0, 7)))
  for (const m of months) {
    const last = new Date(Number(m.slice(0, 4)), Number(m.slice(5, 7)), 0).getDate()
    const end = `${m}-${String(last).padStart(2, '0')}` < to ? `${m}-${String(last).padStart(2, '0')}` : to
    await collectInstagramReach(c, 'mes', `${m}-01`, end)
  }

  const page = await pageAccess(c)
  if (page) {
    c.pageId = page.pageId
    // Página aceita até ~90 dias por consulta
    for (let s = from; s <= to; s = addDays(s, 90)) {
      const e = addDays(s, 89) < to ? addDays(s, 89) : to
      await collectFacebook(c, page, s, e, errors)
    }
  } else {
    errors.push('Facebook: o token não tem acesso à página da Real')
  }

  // Posts: na coleta diária reatualiza os últimos 35 dias; na importação, o período pedido
  const postsFrom = opts.from || addDays(to, -35)
  await collectInstagramPosts(c, postsFrom, to, errors)
  if (page) await collectFacebookPosts(c, page, postsFrom, to, errors)

  if (!opts.from) await snapshotFollowers(c, page?.token ?? null, to)

  await db.run(
    `UPDATE social_share SET ultima_coleta = datetime('now'), ultimo_erro = ? WHERE cliente = ?`,
    [errors.length ? [...new Set(errors)].join(' · ') : null, slug]
  )
  return { from, to, errors: [...new Set(errors)] }
}

// ── Link compartilhável ─────────────────────────────────────────────────────────
export async function getShare(slug: string) {
  let row = await db.get<{ token: string; ultima_coleta: string | null; ultimo_erro: string | null }>(
    'SELECT token, ultima_coleta, ultimo_erro FROM social_share WHERE cliente = ?', [slug]
  )
  if (!row) {
    const token = crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await db.run('INSERT OR IGNORE INTO social_share (cliente, token) VALUES (?, ?)', [slug, token])
    row = await db.get('SELECT token, ultima_coleta, ultimo_erro FROM social_share WHERE cliente = ?', [slug])
  }
  return row!
}

export async function slugByToken(token: string): Promise<string | null> {
  const row = await db.get<{ cliente: string }>('SELECT cliente FROM social_share WHERE token = ?', [token])
  return row?.cliente ?? null
}

// Garante dados frescos mesmo se o agendamento noturno não rodar:
// se a última coleta tem mais de 20h, coleta de novo (uma vez — marca antes de começar).
export async function refreshIfStale(slug: string) {
  if (!TOKEN) return
  const share = await getShare(slug)
  const last = share.ultima_coleta ? new Date(share.ultima_coleta.replace(' ', 'T') + 'Z').getTime() : 0
  if (Date.now() - last < 20 * 3600_000) return
  await db.run(`UPDATE social_share SET ultima_coleta = datetime('now') WHERE cliente = ?`, [slug])
  try { await collect(slug) } catch (e: any) {
    await db.run('UPDATE social_share SET ultimo_erro = ? WHERE cliente = ?', [e.message, slug])
  }
}

export async function readRange(slug: string, from: string, to: string) {
  const rows = await db.all<{ plataforma: string; metrica: string; granularidade: string; inicio: string; valor: number }>(
    `SELECT plataforma, metrica, granularidade, inicio, valor FROM social_metrics
     WHERE cliente = ? AND inicio >= ? AND inicio <= ? ORDER BY inicio`,
    [slug, from, to]
  )
  const share = await getShare(slug)
  return { cliente: CLIENTS[slug]?.nome, rows, ultima_coleta: share.ultima_coleta, ultimo_erro: share.ultimo_erro, token_ok: !!TOKEN }
}
