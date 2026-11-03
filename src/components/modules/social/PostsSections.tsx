'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Eye, Users, Heart, Bookmark, Share2, MessageCircle, ExternalLink, Trophy, Flame,
  CheckCircle2, Clock, ChevronLeft, ChevronRight, UserCheck, Plus, X, Film, Images, Image as ImageIcon,
} from 'lucide-react'
import { CountUp, fmt, fmtShort } from './charts'

type Post = {
  plataforma: string; post_id: string; data: string; tipo: string | null; legenda: string | null; permalink: string | null
  visualizacoes: number | null; alcance: number | null; interacoes: number | null
  curtidas: number | null; comentarios: number | null; salvos: number | null; compart: number | null; autor: string | null
}
type SortKey = 'visualizacoes' | 'alcance' | 'interacoes'

const SORTS: { key: SortKey; label: string; Icon: typeof Eye }[] = [
  { key: 'visualizacoes', label: 'Visualizações', Icon: Eye },
  { key: 'alcance', label: 'Alcance', Icon: Users },
  { key: 'interacoes', label: 'Interações', Icon: Heart },
]
const TIPOS: Record<string, { label: string; Icon: typeof Eye }> = {
  reels: { label: 'Reels', Icon: Film },
  video: { label: 'Vídeo', Icon: Film },
  carrossel: { label: 'Carrossel', Icon: Images },
  foto: { label: 'Foto', Icon: ImageIcon },
  post: { label: 'Post', Icon: ImageIcon },
}
const MESES_LONGO = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

const addDays = (d: string, n: number) => { const t = new Date(d + 'T12:00:00Z'); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10) }
const monthEnd = (m: string) => `${m}-${String(new Date(Number(m.slice(0, 4)), Number(m.slice(5, 7)), 0).getDate()).padStart(2, '0')}`
const addMonths = (m: string, n: number) => { const d = new Date(Date.UTC(Number(m.slice(0, 4)), Number(m.slice(5, 7)) - 1 + n, 1)); return d.toISOString().slice(0, 7) }
const brDate = (iso: string) => new Date(new Date(iso).getTime() - 3 * 3600_000).toISOString().slice(0, 10)
const fmtData = (iso: string) => {
  const d = brDate(iso)
  return `${d.slice(8, 10)}/${d.slice(5, 7)}`
}

export default function PostsSections({ cliente, token, interno, plat, start, end, color, soft, platNome }: {
  cliente: string; token?: string; interno?: boolean; plat: string; start: string; end: string
  color: string; soft: string; platNome: string
}) {
  // mês das entregas: o mês que ocupa o meio do período escolhido
  const meio = addDays(start, Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 86400_000 / 2))
  const [mes, setMes] = useState(meio.slice(0, 7))
  useEffect(() => { setMes(meio.slice(0, 7)) }, [meio])

  const [posts, setPosts] = useState<Post[]>([])
  const [entregas, setEntregas] = useState<{ nome: string; meta: number }[]>([])
  const [sort, setSort] = useState<SortKey>('visualizacoes')
  const [picking, setPicking] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const de = start < `${mes}-01` ? start : `${mes}-01`
  const ate = end > monthEnd(mes) ? end : monthEnd(mes)
  const load = useCallback(async () => {
    const qs = new URLSearchParams({ de, ate })
    if (token) qs.set('t', token)
    try {
      const res = await fetch(`/api/social/${cliente}/posts?${qs}`, { cache: 'no-store' })
      if (!res.ok) return
      const json = await res.json()
      setPosts(json.posts || [])
      setEntregas(json.entregas || [])
    } finally { setLoaded(true) }
  }, [cliente, token, de, ate])
  useEffect(() => { load() }, [load])

  const foto = (p: Post) => `/api/social/${cliente}/foto?${new URLSearchParams({ p: p.plataforma, id: p.post_id, ...(token ? { t: token } : {}) })}`

  const top = useMemo(() => posts
    .filter(p => p.plataforma === plat && brDate(p.data) >= start && brDate(p.data) <= end)
    .sort((a, b) => (b[sort] ?? -1) - (a[sort] ?? -1))
    .slice(0, 6), [posts, plat, start, end, sort])
  const totalPeriodo = posts.filter(p => p.plataforma === plat && brDate(p.data) >= start && brDate(p.data) <= end).length

  async function marcar(p: Post, autor: string | null) {
    setPosts(ps => ps.map(x => (x.post_id === p.post_id && x.plataforma === p.plataforma ? { ...x, autor } : x)))
    await fetch(`/api/social/${cliente}/posts`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plataforma: p.plataforma, post_id: p.post_id, autor }),
    })
  }

  const sortLabel = SORTS.find(s => s.key === sort)!.label

  return (
    <>
      {/* ── Conteúdos que mais entregaram ─────────────────────────────────────── */}
      <section className="sd-card sd-in mb-5" style={{ animationDelay: '660ms' }}>
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="flex items-center gap-2 text-[15px] font-black text-white"><Flame size={17} style={{ color }} />Conteúdos que mais entregaram</h2>
            <p className="mt-0.5 text-xs text-zinc-400">{totalPeriodo} post{totalPeriodo === 1 ? '' : 's'} no {platNome} neste período · ordenados por {sortLabel.toLowerCase()}</p>
          </div>
          <div className="flex rounded-xl border border-white/10 p-1">
            {SORTS.map(s => (
              <button key={s.key} onClick={() => setSort(s.key)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-300 ${sort === s.key ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
                style={sort === s.key ? { background: soft, boxShadow: `inset 0 0 0 1px ${color}` } : {}}>
                <s.Icon size={13} />{s.label}
              </button>
            ))}
          </div>
        </header>
        <div className="p-5">
          {!loaded ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map(i => <div key={i} className="h-80 animate-pulse rounded-2xl bg-white/[0.03]" />)}</div>
          ) : top.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-400">Nenhum post publicado no {platNome} neste período.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {top.map((p, i) => (
                <PostCard key={`${p.plataforma}-${p.post_id}-${sort}`} p={p} rank={i + 1} sort={sort} color={color} soft={soft} foto={foto(p)}
                  delay={i * 70} entregas={interno ? entregas : []} onTag={autor => marcar(p, autor)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Entregas mensais (Amanda) ───────────────────────────────────────────── */}
      {entregas.map(e => {
        const doMes = posts.filter(p => p.autor === e.nome && brDate(p.data).slice(0, 7) === mes).sort((a, b) => a.data.localeCompare(b.data))
        const n = doMes.length
        const ok = n >= e.meta
        const slots = Math.max(e.meta, n)
        const candidatos = posts.filter(p => !p.autor && brDate(p.data).slice(0, 7) === mes)
        const mesIdx = Number(mes.slice(5, 7)) - 1
        const ring = 2 * Math.PI * 30
        return (
          <section key={e.nome} className="sd-card sd-in mb-5" style={{ animationDelay: '720ms' }}>
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
              <h2 className="flex items-center gap-2 text-[15px] font-black text-white"><UserCheck size={17} className="text-zinc-400" />Entregas da {e.nome}</h2>
              <div className="flex items-center gap-1 rounded-xl border border-white/10 p-1">
                <button aria-label="Mês anterior" onClick={() => setMes(m => addMonths(m, -1))} className="rounded-lg p-1.5 text-zinc-300 hover:bg-white/5 active:scale-90"><ChevronLeft size={16} /></button>
                <span className="min-w-[120px] text-center text-sm font-bold capitalize text-white">{MESES_LONGO[mesIdx]} {mes.slice(0, 4)}</span>
                <button aria-label="Próximo mês" onClick={() => setMes(m => addMonths(m, 1))} className="rounded-lg p-1.5 text-zinc-300 hover:bg-white/5 active:scale-90"><ChevronRight size={16} /></button>
              </div>
            </header>
            <div className="grid gap-5 p-5 lg:grid-cols-[220px_1fr]">
              {/* Placar */}
              <div className="flex items-center gap-4 lg:flex-col lg:justify-center lg:text-center">
                <svg width="88" height="88" viewBox="0 0 80 80" className="shrink-0 -rotate-90">
                  <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                  <circle cx="40" cy="40" r="30" fill="none" stroke={ok ? '#4ade80' : color} strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={ring} strokeDashoffset={ring * (1 - Math.min(1, n / e.meta))} style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.2,.8,.2,1)' }} />
                  <text x="40" y="40" transform="rotate(90 40 40)" textAnchor="middle" dominantBaseline="central" fontSize="20" fontWeight="900" fill="#f3f0f8">{n}/{e.meta}</text>
                </svg>
                <div>
                  <p className="text-sm font-bold text-white">{n} de {e.meta} conteúdos entregues</p>
                  <p className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${ok ? 'bg-green-400/10 text-green-400' : 'bg-white/5 text-zinc-300'}`}>
                    {ok ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                    {ok ? 'Meta do mês entregue' : `Falta${e.meta - n > 1 ? 'm' : ''} ${e.meta - n}`}
                  </p>
                  {interno && (
                    <button onClick={() => setPicking(v => !v)} className="mt-3 flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/5 lg:mx-auto">
                      {picking ? <X size={13} /> : <Plus size={13} />}{picking ? 'Fechar' : `Marcar conteúdos da ${e.nome}`}
                    </button>
                  )}
                </div>
              </div>

              {/* Os conteúdos do mês */}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {Array.from({ length: slots }).map((_, i) => {
                  const p = doMes[i]
                  if (!p) return (
                    <div key={i} className="flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/10 text-zinc-500">
                      <Clock size={20} />
                      <span className="text-xs font-semibold">Conteúdo {i + 1}</span>
                      <span className="text-[11px]">aguardando</span>
                    </div>
                  )
                  return (
                    <a key={p.post_id} href={p.permalink || undefined} target="_blank" rel="noreferrer"
                      className="sd-in group relative block aspect-[4/5] overflow-hidden rounded-2xl border border-white/10" style={{ animationDelay: `${780 + i * 80}ms` }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={foto(p)} alt={p.legenda?.slice(0, 80) || 'Conteúdo'} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                      <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-green-500/90 px-2 py-0.5 text-[10px] font-black text-black"><CheckCircle2 size={11} />{i + 1}</span>
                      <div className="absolute inset-x-0 bottom-0 p-3">
                        <p className="text-[11px] text-zinc-300">{fmtData(p.data)} · {TIPOS[p.tipo || 'post']?.label || 'Post'}</p>
                        <p className="flex items-center gap-1 text-sm font-black text-white"><Eye size={13} />{p.visualizacoes != null ? fmtShort(p.visualizacoes) : '—'}</p>
                      </div>
                      {interno && (
                        <button onClick={ev => { ev.preventDefault(); marcar(p, null) }} title="Desmarcar"
                          className="absolute right-2 top-2 rounded-full bg-black/70 p-1 text-zinc-300 opacity-0 transition group-hover:opacity-100 hover:text-white"><X size={13} /></button>
                      )}
                    </a>
                  )
                })}
              </div>
            </div>

            {interno && picking && (
              <div className="border-t border-white/10 p-5">
                <p className="mb-3 text-xs text-zinc-400">Posts de {MESES_LONGO[mesIdx]} ainda sem dono — clique para marcar como da {e.nome}:</p>
                {candidatos.length === 0 ? <p className="text-sm text-zinc-500">Nenhum post sem marcação neste mês.</p> : (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {candidatos.map(p => (
                      <button key={p.post_id} onClick={() => marcar(p, e.nome)} className="group relative w-28 shrink-0 overflow-hidden rounded-xl border border-white/10 text-left">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={foto(p)} alt="" loading="lazy" className="aspect-[4/5] w-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition group-hover:opacity-100">
                          <span className="flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[11px] font-black text-black"><Plus size={12} />{e.nome}</span>
                        </div>
                        <p className="px-2 py-1 text-[10px] text-zinc-400">{fmtData(p.data)} · {p.plataforma === 'instagram' ? 'IG' : 'FB'}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        )
      })}
    </>
  )
}

function PostCard({ p, rank, sort, color, soft, foto, delay, entregas, onTag }: {
  p: Post; rank: number; sort: SortKey; color: string; soft: string; foto: string; delay: number
  entregas: { nome: string }[]; onTag: (autor: string | null) => void
}) {
  const tipo = TIPOS[p.tipo || 'post'] || TIPOS.post
  const main = SORTS.find(s => s.key === sort)!
  const stats = [
    { Icon: Eye, v: p.visualizacoes, t: 'Visualizações' },
    { Icon: Users, v: p.alcance, t: 'Alcance' },
    { Icon: Heart, v: p.curtidas, t: 'Curtidas' },
    { Icon: MessageCircle, v: p.comentarios, t: 'Comentários' },
    { Icon: Bookmark, v: p.salvos, t: 'Salvos' },
    { Icon: Share2, v: p.compart, t: 'Compartilhamentos' },
  ].filter(s => s.v != null)
  const first = rank === 1
  return (
    <article className="sd-in group flex flex-col overflow-hidden rounded-2xl border bg-white/[0.02] transition-all duration-300 hover:-translate-y-1"
      style={{ animationDelay: `${delay}ms`, borderColor: first ? color : 'rgba(255,255,255,0.10)', boxShadow: first ? `0 18px 50px -24px ${color}` : undefined }}>
      <a href={p.permalink || undefined} target="_blank" rel="noreferrer" className="relative block aspect-[4/5] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={foto} alt={p.legenda?.slice(0, 80) || 'Conteúdo'} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/5 to-black/30" />
        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black text-white"
          style={{ background: first ? 'var(--grad)' : 'rgba(0,0,0,0.6)' }}>
          {first && <Trophy size={12} />}#{rank}
        </span>
        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
          <tipo.Icon size={12} />{tipo.label}
        </span>
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300">{main.label}</p>
          <p className="text-3xl font-black leading-none text-white"><CountUp value={p[sort]} /></p>
          <p className="mt-1 text-xs text-zinc-300">Publicado em {fmtData(p.data)}</p>
        </div>
      </a>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="grid grid-cols-3 gap-2">
          {stats.filter(s => s.t !== main.label).slice(0, 3).map(s => (
            <div key={s.t} className="rounded-lg bg-white/[0.04] px-2 py-1.5" title={s.t}>
              <p className="flex items-center gap-1 text-[10px] text-zinc-400"><s.Icon size={11} />{s.t}</p>
              <p className="text-sm font-bold text-white">{fmt(s.v!)}</p>
            </div>
          ))}
        </div>
        {p.legenda && <p className="line-clamp-2 text-xs leading-relaxed text-zinc-300">{p.legenda}</p>}
        <div className="mt-auto flex items-center justify-between gap-2">
          {p.permalink ? (
            <a href={p.permalink} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-bold transition hover:opacity-80" style={{ color }}>
              Ver post <ExternalLink size={12} />
            </a>
          ) : <span />}
          {p.autor && <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ background: soft, color }}><UserCheck size={11} />{p.autor}</span>}
          {!p.autor && entregas.map(e => (
            <button key={e.nome} onClick={() => onTag(e.nome)} className="flex items-center gap-1 rounded-full border border-white/10 px-2 py-0.5 text-[11px] font-bold text-zinc-400 hover:border-white/30 hover:text-white">
              <Plus size={11} />{e.nome}
            </button>
          ))}
        </div>
      </div>
    </article>
  )
}
