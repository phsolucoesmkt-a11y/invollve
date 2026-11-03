'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Eye, Users, Heart, MousePointerClick, UserRound, UserPlus, ChevronLeft, ChevronRight,
  Copy, Check, RefreshCw, Download, Trophy, CalendarDays, TrendingUp, TrendingDown,
  Activity, Target, BarChart3, Table2, Zap, Snail, Camera,
} from 'lucide-react'
import { BarChart, CountUp, LineChart, PREV_COLOR, Radar, Sparkline, fmt, type Bar, type LinePoint, type RadarAxis } from './charts'
import PostsSections from './PostsSections'

// ── Tipos e definições ─────────────────────────────────────────────────────────
type Row = { plataforma: string; metrica: string; granularidade: string; inicio: string; valor: number }
type Plat = 'instagram' | 'facebook'
type Mode = 'semana' | 'mes' | 'ano' | 'custom'
type Range = { start: string; end: string }

const PLATS: Record<Plat, { nome: string; cor: string; soft: string }> = {
  // cores validadas para o fundo escuro (separação para daltonismo e contraste ≥ 3:1)
  instagram: { nome: 'Instagram', cor: '#d55181', soft: 'rgba(213,81,129,0.14)' },
  facebook: { nome: 'Facebook', cor: '#3987e5', soft: 'rgba(57,135,229,0.14)' },
}

type MetricDef = { key: string; label: string; curto: string; desc: string; Icon: typeof Eye }
const METRICS: Record<Plat, MetricDef[]> = {
  instagram: [
    { key: 'visualizacoes', label: 'Visualizações', curto: 'Visualizações', desc: 'vezes que os conteúdos foram vistos', Icon: Eye },
    { key: 'alcance', label: 'Alcance', curto: 'Alcance', desc: 'pessoas diferentes alcançadas', Icon: Users },
    { key: 'interacoes', label: 'Interações', curto: 'Interações', desc: 'curtidas, comentários, salvos e compart.', Icon: Heart },
    { key: 'cliques_link', label: 'Cliques no link', curto: 'Cliques', desc: 'cliques no link do perfil', Icon: MousePointerClick },
    { key: 'visitas_perfil', label: 'Visitas ao perfil', curto: 'Visitas', desc: 'pessoas que abriram o perfil', Icon: UserRound },
    { key: 'novos_seguidores', label: 'Novos seguidores', curto: 'Seguidores', desc: 'pessoas que começaram a seguir', Icon: UserPlus },
  ],
  facebook: [
    { key: 'visualizacoes', label: 'Visualizações', curto: 'Visualizações', desc: 'vezes que os conteúdos foram vistos', Icon: Eye },
    { key: 'visualizadores', label: 'Visualizadores', curto: 'Visualizadores', desc: 'pessoas diferentes que viram', Icon: Users },
    { key: 'interacoes', label: 'Interações', curto: 'Interações', desc: 'reações, comentários e compartilhamentos', Icon: Heart },
    { key: 'cliques_link', label: 'Cliques na página', curto: 'Cliques', desc: 'cliques em botões e contatos', Icon: MousePointerClick },
    { key: 'visitas_pagina', label: 'Visitas à página', curto: 'Visitas', desc: 'pessoas que abriram a página', Icon: UserRound },
    { key: 'novos_seguidores', label: 'Novos seguidores', curto: 'Seguidores', desc: 'pessoas que começaram a seguir', Icon: UserPlus },
  ],
}

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const MESES_LONGO = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

// ── Datas (strings YYYY-MM-DD) ─────────────────────────────────────────────────
const addDays = (d: string, n: number) => {
  const t = new Date(d + 'T12:00:00Z'); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10)
}
const dow = (d: string) => new Date(d + 'T12:00:00Z').getUTCDay()
const weekStart = (d: string) => addDays(d, -((dow(d) + 6) % 7))
const monthEnd = (m: string) => `${m}-${String(new Date(Number(m.slice(0, 4)), Number(m.slice(5, 7)), 0).getDate()).padStart(2, '0')}`
const addMonths = (d: string, n: number) => {
  const y = Number(d.slice(0, 4)), m = Number(d.slice(5, 7)) - 1 + n
  return new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10)
}
const diffDays = (a: string, b: string) => Math.round((new Date(b + 'T12:00:00Z').getTime() - new Date(a + 'T12:00:00Z').getTime()) / 86400_000)
const ddmm = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`
const ddmmyy = (d: string) => `${ddmm(d)}/${d.slice(2, 4)}`
const minD = (a: string, b: string) => (a < b ? a : b)
const yesterdayBR = () => addDays(new Date(Date.now() - 3 * 3600_000).toISOString().slice(0, 10), -1)

function rangeFor(mode: Exclude<Mode, 'custom'>, anchor: string): Range {
  if (mode === 'semana') { const s = weekStart(anchor); return { start: s, end: addDays(s, 6) } }
  if (mode === 'mes') { const m = anchor.slice(0, 7); return { start: `${m}-01`, end: monthEnd(m) } }
  const y = anchor.slice(0, 4); return { start: `${y}-01-01`, end: `${y}-12-31` }
}
function shiftRange(mode: Mode, r: Range, dir: number): Range {
  if (mode === 'semana') return rangeFor('semana', addDays(r.start, 7 * dir))
  if (mode === 'mes') return rangeFor('mes', addMonths(r.start, dir))
  if (mode === 'ano') return rangeFor('ano', `${Number(r.start.slice(0, 4)) + dir}-01-01`)
  const len = diffDays(r.start, r.end) + 1
  return { start: addDays(r.start, len * dir), end: addDays(r.end, len * dir) }
}
function rangeLabel(mode: Mode, r: Range) {
  if (mode === 'semana') return `${ddmm(r.start)} – ${ddmm(r.end)}`
  if (mode === 'mes') { const m = Number(r.start.slice(5, 7)) - 1; return `${MESES_LONGO[m][0].toUpperCase()}${MESES_LONGO[m].slice(1)} ${r.start.slice(0, 4)}` }
  if (mode === 'ano') return r.start.slice(0, 4)
  return `${ddmmyy(r.start)} – ${ddmmyy(r.end)}`
}

const fmtPct = (v: number) => `${v > 0 ? '+' : ''}${(v * 100).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}%`

// Animações (respeitam "reduzir movimento" do sistema)
const CSS = `
.sd-draw{stroke-dasharray:1;stroke-dashoffset:1;animation:sd-draw 1.1s cubic-bezier(.3,.7,.2,1) forwards}
.sd-fade{animation:sd-fade .9s ease-out both}
.sd-grow{transform-box:fill-box;transform-origin:50% 100%;animation:sd-grow .7s cubic-bezier(.2,.8,.2,1) both}
.sd-in{animation:sd-in .55s cubic-bezier(.2,.8,.2,1) both}
@keyframes sd-draw{to{stroke-dashoffset:0}}
@keyframes sd-fade{from{opacity:0}}
@keyframes sd-grow{from{transform:scaleY(0)}}
@keyframes sd-in{from{opacity:0;transform:translateY(10px)}}
.sd-card{background:#0d0a14;border:1px solid rgba(255,255,255,0.10);border-radius:18px}
.sd-card:hover{border-color:rgba(255,255,255,0.16)}
.sd-date{color-scheme:dark}
/* modo foto: tudo parado no estado final */
.sd-capture *,.sd-capture{animation:none!important;transition:none!important}
.sd-capture .sd-draw{stroke-dashoffset:0!important}
@media (prefers-reduced-motion: reduce){.sd-draw,.sd-fade,.sd-grow,.sd-in{animation:none;stroke-dashoffset:0}}
`

function Card({ title, icon: Icon, right, children, className = '', delay = 0 }: {
  title: string; icon?: typeof Eye; right?: React.ReactNode; children: React.ReactNode; className?: string; delay?: number
}) {
  return (
    <section className={`sd-card sd-in min-w-0 transition-colors ${className}`} style={{ animationDelay: `${delay}ms` }}>
      <header className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
        <h2 className="text-[15px] font-black text-white">{title}</h2>
        <div className="flex items-center gap-3 text-zinc-400">{right}{Icon && <Icon size={17} />}</div>
      </header>
      <div className="p-5">{children}</div>
    </section>
  )
}

// ── Componente principal ───────────────────────────────────────────────────────
export default function SocialDashboard({ cliente, token, interno }: { cliente: string; token?: string; interno?: boolean }) {
  const ontem = yesterdayBR()
  const [mode, setModeState] = useState<Mode>('semana')
  // Padrão: última semana fechada (seg–dom)
  const [range, setRange] = useState<Range>(() => rangeFor('semana', dow(yesterdayBR()) === 0 ? yesterdayBR() : addDays(yesterdayBR(), -7)))
  const [plat, setPlat] = useState<Plat>('instagram')
  const [metric, setMetric] = useState('visualizacoes')
  const [data, setData] = useState<{ rows: Row[]; cliente?: string; ultima_coleta?: string; ultimo_erro?: string; token_ok?: boolean; share_token?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState('')
  const [showTable, setShowTable] = useState(false)
  const [shooting, setShooting] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  function setMode(m: Mode) {
    setModeState(m)
    if (m !== 'custom') setRange(rangeFor(m, minD(range.end, ontem)))
    else setRange({ start: addDays(ontem, -29), end: ontem })
  }

  // ── Períodos ──
  const { start, end } = range
  const effEnd = minD(end, ontem) // período em andamento vai até ontem
  const ndays = Math.max(0, diffDays(start, effEnd) + 1)
  const partial = effEnd < end
  // comparação justa: mesmo nº de dias imediatamente antes (ou no período equivalente anterior)
  const prevStart = shiftRange(mode, range, -1).start
  const prevEnd = addDays(prevStart, Math.max(0, ndays - 1))
  const year = Number(end.slice(0, 4))

  // ── Dados: carrega do início do ano anterior necessário até o fim do ano do período ──
  const fetchDe = `${minD(addDays(prevStart, -120), `${start.slice(0, 4)}-01-01`).slice(0, 4)}-01-01`
  const fetchAte = `${year}-12-31`
  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const qs = new URLSearchParams({ de: fetchDe, ate: fetchAte })
      if (token) qs.set('t', token)
      const res = await fetch(`/api/social/${cliente}?${qs}`, { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro ao carregar')
      setData(json)
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Erro ao carregar') }
    setLoading(false)
  }, [cliente, token, fetchDe, fetchAte])
  useEffect(() => { load() }, [load])

  // índice: idx[plat][metrica][gran][inicio] = valor
  const idx = useMemo(() => {
    const m: Record<string, Record<string, Record<string, Record<string, number>>>> = {}
    for (const r of data?.rows || []) {
      ((m[r.plataforma] ??= {})[r.metrica] ??= {})[r.granularidade] ??= {}
      m[r.plataforma][r.metrica][r.granularidade][r.inicio] = r.valor
    }
    return m
  }, [data])

  const day = useCallback((p: Plat, k: string, d: string): number | null => idx[p]?.[k]?.dia?.[d] ?? null, [idx])
  const sumDays = useCallback((p: Plat, k: string, s: string, e: string) => {
    let t = 0, n = 0
    for (let d = s; d <= e; d = addDays(d, 1)) { const v = day(p, k, d); if (v != null) { t += v; n++ } }
    return n ? t : null
  }, [day])
  // Valor de um período. Alcance do IG usa o número único da Meta quando o período é uma semana/mês completo.
  const value = useCallback((p: Plat, k: string, s: string, e: string, gran?: 'semana' | 'mes'): number | null => {
    if (k === 'seguidores_total') {
      for (let d = e; d >= s; d = addDays(d, -1)) { const v = day(p, k, d); if (v != null) return v }
      return null
    }
    if (gran && p === 'instagram' && k === 'alcance') {
      const u = idx[p]?.[k]?.[gran]?.[s]
      if (u != null) return u
    }
    return sumDays(p, k, s, e)
  }, [day, idx, sumDays])

  const gran = mode === 'semana' || mode === 'mes' ? mode : undefined
  const cur = (k: string) => (ndays > 0 ? value(plat, k, start, effEnd, partial ? undefined : gran) : null)
  const prev = (k: string) => (ndays > 0 ? value(plat, k, prevStart, prevEnd, partial ? undefined : gran) : null)

  const metas = METRICS[plat]
  const sel = metas.find(m => m.key === metric) || metas[0]
  const color = PLATS[plat].cor
  const hasAny = (data?.rows || []).length > 0
  const animKey = `${plat}-${sel.key}-${start}-${end}`

  // ── Série do gráfico de linha: por dia (até ~3 meses) ou por semana ──
  const daily = diffDays(start, end) + 1 <= 92
  const buckets = useMemo(() => {
    const out: { s: string; e: string; label: string; tip: string }[] = []
    if (daily) {
      for (let d = start; d <= end; d = addDays(d, 1)) {
        const short = diffDays(start, end) < 8
        out.push({ s: d, e: d, label: short ? DIAS[dow(d)] : ddmm(d), tip: `${DIAS[dow(d)]}, ${ddmmyy(d)}` })
      }
    } else {
      for (let s = start; s <= end; s = addDays(s, 7)) {
        const e = minD(addDays(s, 6), end)
        out.push({ s, e, label: ddmm(s), tip: `${ddmm(s)} a ${ddmm(e)}` })
      }
    }
    return out
  }, [start, end, daily])

  const linePoints: LinePoint[] = buckets.map(b => {
    const off = diffDays(start, b.s), len = diffDays(b.s, b.e)
    const ps = addDays(prevStart, off), pe = addDays(ps, len)
    return {
      label: b.label, tip: b.tip,
      value: b.s > ontem ? null : sumDays(plat, sel.key, b.s, minD(b.e, ontem)),
      prev: ps > prevEnd ? null : sumDays(plat, sel.key, ps, minD(pe, prevEnd)),
      prevTip: daily ? `${DIAS[dow(ps)]} ${ddmm(ps)}` : `${ddmm(ps)}–${ddmm(pe)}`,
    }
  })
  const sparkFor = (k: string) => buckets.map(b => (b.s > ontem ? null : sumDays(plat, k, b.s, minD(b.e, ontem))))

  // ── Ano mês a mês ──
  const yearBars: Bar[] = MESES.map((lbl, i) => {
    const m = `${year}-${String(i + 1).padStart(2, '0')}`
    const s = `${m}-01`, e = monthEnd(m)
    return {
      label: lbl,
      value: s > ontem ? null : value(plat, sel.key, s, minD(e, ontem), e > ontem ? undefined : 'mes'),
      tip: `${MESES_LONGO[i]} de ${year}${e > ontem && s <= ontem ? ' (até ontem)' : ''}`,
      highlight: s <= end && e >= start,
      dim: e > ontem,
    }
  })

  // ── Radar de equilíbrio: período × média diária dos 90 dias anteriores ──
  const radar = useMemo(() => {
    const axes: (RadarAxis & { key: string })[] = metas.map(m => {
      let t = 0, n = 0
      for (let d = addDays(start, -90); d < start; d = addDays(d, 1)) { const v = day(plat, m.key, d); if (v != null) { t += v; n++ } }
      const avgDay = n >= 7 ? t / n : null
      const expected = avgDay != null ? avgDay * ndays : null
      const c = ndays > 0 ? sumDays(plat, m.key, start, effEnd) : null
      const p = ndays > 0 ? sumDays(plat, m.key, prevStart, prevEnd) : null
      const score = c != null && expected ? c / expected : null
      const prevScore = p != null && expected ? p / expected : null
      return {
        key: m.key, label: m.curto, score, prevScore,
        detail: score == null ? 'sem histórico suficiente' : `${fmt(c!)} no período · o normal seria ~${fmt(expected!)}`,
      }
    })
    const scored = axes.filter(a => a.score != null)
    const strongest = scored.length ? scored.reduce((a, b) => (b.score! > a.score! ? b : a)) : null
    const weakest = scored.length ? scored.reduce((a, b) => (b.score! < a.score! ? b : a)) : null
    return { axes, strongest, weakest }
  }, [metas, start, effEnd, prevStart, prevEnd, ndays, plat, day, sumDays])

  const curSel = cur(sel.key), prevSel = prev(sel.key)
  const deltaSel = curSel != null && prevSel ? (curSel - prevSel) / prevSel : null
  const prevLabel = mode === 'semana' ? 'semana anterior' : mode === 'mes' ? 'mês anterior' : mode === 'ano' ? 'ano anterior' : 'período anterior'
  const prevShort = mode === 'semana' ? 'sem. anterior' : mode === 'mes' ? 'mês anterior' : mode === 'ano' ? 'ano anterior' : 'antes'
  const best = linePoints.reduce<LinePoint | null>((b, x) => (x.value != null && (!b || x.value > (b.value ?? 0)) ? x : b), null)
  const segTotal = value(plat, 'seguidores_total', start, effEnd)
  const totalAno = value(plat, sel.key, `${year}-01-01`, minD(`${year}-12-31`, ontem))
  const metaLabel = (k?: string) => metas.find(m => m.key === k)?.label || ''

  // ── Ações internas ──
  async function coletar(body: object) {
    const res = await fetch(`/api/social/${cliente}/coletar`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const json = await res.json()
    if (!res.ok || !json.ok) throw new Error(json.error || 'Falha na coleta')
    return json
  }
  async function atualizarAgora() {
    setBusy('Atualizando…')
    try { await coletar({}); await load() } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Falha') }
    setBusy('')
  }
  async function importarAno() {
    try {
      for (let s = `${year}-01-01`; s <= ontem; s = addDays(s, 14)) {
        const e = minD(addDays(s, 13), ontem)
        setBusy(`Importando ${ddmm(s)} a ${ddmm(e)}…`)
        await coletar({ from: s, to: e })
      }
      await coletar({})
      await load()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Falha') }
    setBusy('')
  }
  // Foto da página inteira (um PNG só) para mandar o resultado completo
  async function baixarImagem() {
    const el = rootRef.current
    if (!el || shooting) return
    setShooting(true)
    el.classList.add('sd-capture')
    try {
      await new Promise(r => setTimeout(r, 120))
      const { toPng } = await import('html-to-image')
      const url = await toPng(el, {
        pixelRatio: 2, backgroundColor: '#0a0613', cacheBust: true,
        style: { margin: '0', padding: '24px' },
        width: el.offsetWidth + 48, height: el.offsetHeight + 48,
        filter: n => !(n instanceof HTMLElement && n.dataset.noprint !== undefined),
      })
      const nome = `${(data?.cliente || 'Real').replace(/\s+/g, '-')}_${PLATS[plat].nome}_${rangeLabel(mode, { start, end }).replace(/[\s/–]+/g, '-')}.png`
      const a = document.createElement('a')
      a.href = url; a.download = nome; a.click()
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Não foi possível gerar a imagem') }
    el.classList.remove('sd-capture')
    setShooting(false)
  }
  const shareUrl = data?.share_token && typeof window !== 'undefined' ? `${window.location.origin}/r/${data.share_token}` : ''

  const presets: { label: string; r: () => Range }[] = [
    { label: 'Últimos 7 dias', r: () => ({ start: addDays(ontem, -6), end: ontem }) },
    { label: 'Últimos 15 dias', r: () => ({ start: addDays(ontem, -14), end: ontem }) },
    { label: 'Últimos 30 dias', r: () => ({ start: addDays(ontem, -29), end: ontem }) },
    { label: 'Últimos 90 dias', r: () => ({ start: addDays(ontem, -89), end: ontem }) },
    { label: 'Mês passado', r: () => rangeFor('mes', addMonths(ontem, -1)) },
  ]

  return (
    <div ref={rootRef} className="mx-auto max-w-[1240px]">
      <style>{CSS}</style>

      {/* Cabeçalho */}
      <div className="sd-in mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">Relatório de redes · orgânico</p>
          <h1 className="text-3xl font-black tracking-tight text-white">{data?.cliente || 'Real Equipamentos'}</h1>
          <p className="mt-1 flex items-center gap-2 text-xs text-zinc-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
            </span>
            {data?.ultima_coleta
              ? `Atualizado em ${new Date(data.ultima_coleta.replace(' ', 'T') + 'Z').toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })} · números até ontem`
              : 'Aguardando a primeira atualização'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
        <button onClick={baixarImagem} disabled={shooting} data-noprint title="Baixa a página inteira como uma imagem"
          className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0d0a14] px-4 py-3 text-sm font-bold text-white transition hover:bg-white/5 active:scale-95 disabled:opacity-60">
          <Camera size={16} className={shooting ? 'animate-pulse' : ''} />{shooting ? 'Gerando imagem…' : 'Baixar imagem'}
        </button>
        <div className="flex rounded-2xl border border-white/10 bg-[#0d0a14] p-1">
          {(Object.keys(PLATS) as Plat[]).map(p => (
            <button key={p} onClick={() => { setPlat(p); if (!METRICS[p].some(m => m.key === metric)) setMetric('visualizacoes') }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-300 ${plat === p ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
              style={plat === p ? { background: PLATS[p].soft, boxShadow: `inset 0 0 0 1px ${PLATS[p].cor}` } : {}}>
              <span className="h-2.5 w-2.5 rounded-full transition-transform duration-300" style={{ background: PLATS[p].cor, transform: plat === p ? 'scale(1.25)' : 'scale(1)' }} />
              {PLATS[p].nome}
            </button>
          ))}
        </div>
        </div>
      </div>

      {/* Ferramentas internas (só equipe Invollve) */}
      {interno && (
        <div data-noprint className="sd-card mb-5 flex flex-wrap items-center gap-3 p-4 text-sm">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-zinc-400">Link para o cliente (abre sem login)</p>
            <p className="truncate font-mono text-xs text-white">{shareUrl || '—'}</p>
          </div>
          <button disabled={!shareUrl} onClick={() => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white transition active:scale-95" style={{ background: 'var(--grad)' }}>
            {copied ? <Check size={14} /> : <Copy size={14} />}{copied ? 'Copiado!' : 'Copiar link'}
          </button>
          <button disabled={!!busy} onClick={atualizarAgora} className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/5 active:scale-95 disabled:opacity-50">
            <RefreshCw size={14} className={busy ? 'animate-spin' : ''} />Atualizar agora
          </button>
          <button disabled={!!busy} onClick={importarAno} className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/5 active:scale-95 disabled:opacity-50">
            <Download size={14} />Importar histórico de {year}
          </button>
          {busy && <p className="w-full text-xs text-zinc-300">{busy}</p>}
          {data && !data.token_ok && <p className="w-full text-xs text-yellow-300">⚠️ Falta configurar o META_ACCESS_TOKEN no servidor — sem ele a coleta não roda.</p>}
          {data?.ultimo_erro && <p className="w-full text-xs text-yellow-300">⚠️ Última coleta: {data.ultimo_erro}</p>}
        </div>
      )}

      {/* Filtros de período — uma linha */}
      <div className="sd-in mb-6 flex flex-wrap items-center gap-3" style={{ animationDelay: '60ms' }}>
        <div className="flex rounded-2xl border border-white/10 bg-[#0d0a14] p-1">
          {(['semana', 'mes', 'ano', 'custom'] as Mode[]).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`rounded-xl px-3 py-2 text-sm font-bold transition-all duration-300 sm:px-4 ${mode === m ? 'text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
              style={mode === m ? { background: 'var(--grad)' } : {}}>
              {m === 'semana' ? 'Semanal' : m === 'mes' ? 'Mensal' : m === 'ano' ? 'Anual' : 'Personalizado'}
            </button>
          ))}
        </div>

        {mode === 'custom' ? (
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0d0a14] px-3 py-1.5 text-xs text-zinc-400">
              De
              <input type="date" className="sd-date bg-transparent text-sm font-bold text-white outline-none" value={start} max={minD(end, ontem)}
                onChange={e => e.target.value && setRange(r => ({ ...r, start: e.target.value }))} />
            </label>
            <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0d0a14] px-3 py-1.5 text-xs text-zinc-400">
              Até
              <input type="date" className="sd-date bg-transparent text-sm font-bold text-white outline-none" value={end} min={start} max={ontem}
                onChange={e => e.target.value && setRange(r => ({ ...r, end: e.target.value }))} />
            </label>
            {presets.map(p => {
              const r = p.r(), on = r.start === start && r.end === end
              return (
                <button key={p.label} onClick={() => setRange(r)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${on ? 'border-white/40 bg-white/10 text-white' : 'border-white/10 text-zinc-400 hover:border-white/25 hover:text-white'}`}>
                  {p.label}
                </button>
              )
            })}
          </div>
        ) : (
          <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-[#0d0a14] p-1">
            <button aria-label="Período anterior" onClick={() => setRange(shiftRange(mode, range, -1))} className="rounded-xl p-2 text-zinc-300 transition hover:bg-white/5 active:scale-90"><ChevronLeft size={18} /></button>
            <div className="flex min-w-[170px] items-center justify-center gap-2 px-1 text-sm font-bold text-white">
              <CalendarDays size={16} className="text-zinc-500" />{rangeLabel(mode, range)}
            </div>
            <button aria-label="Próximo período" disabled={shiftRange(mode, range, 1).start > ontem}
              onClick={() => setRange(shiftRange(mode, range, 1))} className="rounded-xl p-2 text-zinc-300 transition hover:bg-white/5 active:scale-90 disabled:opacity-25"><ChevronRight size={18} /></button>
          </div>
        )}
        {partial && ndays > 0 && <span className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-400">em andamento · até {ddmm(effEnd)}</span>}
        {loading && data && <RefreshCw size={15} className="animate-spin text-zinc-500" />}
      </div>

      {loading && !data && (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="sd-card h-[120px] animate-pulse" />)}
        </div>
      )}
      {error && <div className="sd-card mb-5 p-4 text-sm text-red-300">{error}</div>}

      {data && !hasAny && (
        <div className="sd-card sd-in p-12 text-center">
          <BarChart3 size={36} className="mx-auto text-zinc-500" />
          <p className="mt-3 font-bold text-white">Ainda não há números por aqui</p>
          <p className="mt-1 text-sm text-zinc-400">
            {interno ? 'Clique em “Importar histórico” para trazer o ano da Meta.' : 'Os números aparecem assim que a primeira atualização rodar.'}
          </p>
        </div>
      )}

      {data && hasAny && (
        <>
          {/* Cartões de métricas: número + variação + minigráfico. Clique escolhe o gráfico. */}
          <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {metas.map((m, i) => {
              const c = cur(m.key), p = prev(m.key)
              const d = c != null && p ? (c - p) / p : null
              const active = m.key === sel.key
              return (
                <button key={m.key} onClick={() => setMetric(m.key)}
                  className="sd-card sd-in group flex items-center gap-4 p-4 text-left transition-all duration-300 hover:-translate-y-0.5"
                  style={{ animationDelay: `${100 + i * 55}ms`, ...(active ? { borderColor: color, boxShadow: `0 0 0 1px ${color}, 0 12px 40px -18px ${color}` } : {}) }}>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-colors duration-300"
                    style={{ borderColor: active ? color : 'rgba(255,255,255,0.14)', color: active ? color : '#d9d2e6', background: active ? PLATS[plat].soft : 'transparent' }}>
                    <m.Icon size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-2xl font-black leading-tight text-white"><CountUp value={c} short /></p>
                    <p className="truncate text-sm text-zinc-400">{m.label}</p>
                    {d != null ? (
                      <p className={`mt-0.5 flex items-center gap-1 text-xs font-bold ${d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {d >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}{fmtPct(d)}
                        <span className="truncate font-medium text-zinc-500">vs {prevShort}</span>
                      </p>
                    ) : <p className="mt-0.5 text-xs text-zinc-600">sem comparação</p>}
                  </div>
                  <Sparkline key={animKey + m.key} values={sparkFor(m.key)} color={color} id={`${plat}-${m.key}`} />
                </button>
              )
            })}
          </div>

          {/* Linha do período + radar de equilíbrio */}
          <div className="mb-5 grid gap-5 lg:grid-cols-5">
            <Card className="lg:col-span-3" title={`${sel.label} · ${daily ? 'dia a dia' : 'semana a semana'}`} icon={Activity} delay={420}
              right={
                <div className="hidden items-center gap-3 text-[11px] sm:flex">
                  <span className="flex items-center gap-1.5 text-zinc-300"><span className="h-2 w-2 rounded-full" style={{ background: color }} />Período</span>
                  <span className="flex items-center gap-1.5 text-zinc-400"><span className="w-3 border-t-2 border-dashed" style={{ borderColor: PREV_COLOR }} />{prevLabel[0].toUpperCase() + prevLabel.slice(1)}</span>
                </div>
              }>
              <p className="-mt-1 mb-3 text-sm text-zinc-300">
                {curSel == null ? 'Sem dados neste período.' : (
                  <>
                    <b className="text-white"><CountUp value={curSel} /></b> {sel.desc}
                    {deltaSel != null && <> · <b className={deltaSel >= 0 ? 'text-green-400' : 'text-red-400'}>{fmtPct(deltaSel)}</b> vs {prevLabel}</>}
                  </>
                )}
              </p>
              <LineChart points={linePoints} color={color} animKey={animKey} height={330} />
            </Card>

            <Card className="lg:col-span-2" title="Equilíbrio dos indicadores" icon={Target} delay={480}>
              <p className="-mt-1 mb-2 text-xs text-zinc-400">Cada ponta compara o período com a média dos 90 dias anteriores. Pra fora = mais forte; pra dentro = mais fraco.</p>
              <Radar axes={radar.axes} color={color} />
              <div className="mt-2 flex items-center justify-center gap-4 text-[11px]">
                <span className="flex items-center gap-1.5 text-zinc-300"><span className="h-2 w-2 rounded-full" style={{ background: color }} />Este período</span>
                <span className="flex items-center gap-1.5 text-zinc-400"><span className="w-3 border-t-2 border-dashed" style={{ borderColor: PREV_COLOR }} />Anterior</span>
                <span className="flex items-center gap-1.5 text-zinc-400"><span className="h-2.5 w-2.5 rounded-full border border-dashed border-white/50" />Média</span>
              </div>
              {(radar.strongest || radar.weakest) && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[
                    { a: radar.strongest, t: 'Mais forte', Icon: Zap },
                    { a: radar.weakest, t: 'Mais fraco', Icon: Snail },
                  ].map(({ a, t, Icon }) => {
                    const up = (a?.score ?? 1) >= 1
                    return (
                      <div key={t} className={`rounded-xl border p-3 ${up ? 'border-green-400/20 bg-green-400/5' : 'border-red-400/20 bg-red-400/5'}`}>
                        <p className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${up ? 'text-green-400' : 'text-red-400'}`}><Icon size={13} />{t}</p>
                        <p className="mt-1 text-sm font-bold text-white">{metaLabel(a?.key)}</p>
                        <p className="text-xs text-zinc-400">{a?.score != null && `${Math.round(Math.abs(a.score - 1) * 100)}% ${up ? 'acima' : 'abaixo'} da média`}</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Ano + destaques */}
          <div className="mb-5 grid gap-5 lg:grid-cols-5">
            <Card className="lg:col-span-3" title={`${sel.label} em ${year}`} icon={BarChart3} delay={540}
              right={<span className="hidden text-[11px] sm:inline">meses do período em destaque</span>}>
              <BarChart bars={yearBars} color={color} animKey={animKey} />
            </Card>
            <Card className="lg:col-span-2" title="Destaques" icon={Trophy} delay={600}>
              <ul className="space-y-3">
                {[
                  { Icon: Trophy, cor: '#facc15', t: daily ? 'Melhor dia do período' : 'Melhor semana do período', v: best?.value != null ? `${best.tip} · ${fmt(best.value)}` : '—' },
                  { Icon: sel.Icon, cor: color, t: `${sel.label} em ${year} (até ontem)`, v: totalAno != null ? fmt(totalAno) : '—' },
                  { Icon: Users, cor: color, t: 'Seguidores no total', v: segTotal != null ? fmt(segTotal) : '—' },
                  { Icon: CalendarDays, cor: '#c9c1d9', t: 'Período analisado', v: `${ddmmyy(start)} a ${ddmmyy(effEnd)} · ${ndays} dia${ndays === 1 ? '' : 's'}` },
                ].map((h, i) => (
                  <li key={i} className="sd-in flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3" style={{ animationDelay: `${650 + i * 60}ms` }}>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10" style={{ color: h.cor }}><h.Icon size={17} /></div>
                    <div className="min-w-0">
                      <p className="text-xs text-zinc-400">{h.t}</p>
                      <p className="truncate text-sm font-bold text-white">{h.v}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Melhores conteúdos do período + entregas mensais */}
          <PostsSections cliente={cliente} token={token} interno={interno} plat={plat} start={start} end={effEnd}
            color={color} soft={PLATS[plat].soft} platNome={PLATS[plat].nome} />

          {/* Tabela (mesmos números, para quem prefere ler) */}
          <section className="sd-card">
            <button onClick={() => setShowTable(s => !s)} className="flex w-full items-center justify-between px-5 py-4 text-left">
              <span className="flex items-center gap-2 text-[15px] font-black text-white"><Table2 size={17} className="text-zinc-400" />Números em tabela</span>
              <ChevronRight size={18} className={`text-zinc-400 transition-transform duration-300 ${showTable ? 'rotate-90' : ''}`} />
            </button>
            {showTable && (
              <div className="sd-in overflow-x-auto border-t border-white/10 p-5">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs text-zinc-400">
                      <th className="py-2 pr-3 text-left">{daily ? 'Dia' : 'Semana'}</th>
                      {metas.map(m => <th key={m.key} className="px-2 py-2 text-right">{m.label}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {buckets.filter(b => b.s <= ontem).map(b => (
                      <tr key={b.s} className="border-b border-white/5 hover:bg-white/[0.03]">
                        <td className="py-1.5 pr-3 text-zinc-300">{b.tip}</td>
                        {metas.map(m => { const v = sumDays(plat, m.key, b.s, minD(b.e, ontem)); return <td key={m.key} className="px-2 py-1.5 text-right text-white">{v == null ? '—' : fmt(v)}</td> })}
                      </tr>
                    ))}
                    <tr className="font-bold">
                      <td className="py-2 pr-3 text-zinc-300">Total</td>
                      {metas.map(m => { const v = cur(m.key); return <td key={m.key} className="px-2 py-2 text-right text-white">{v == null ? '—' : fmt(v)}</td> })}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <p className="mt-5 text-center text-xs text-zinc-500">
            Dados do Meta Business (Instagram e Facebook), atualizados automaticamente todo dia. A comparação usa o mesmo número de dias do período anterior.
          </p>
        </>
      )}
    </div>
  )
}
