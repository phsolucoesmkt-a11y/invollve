'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Eye, Users, Heart, MousePointerClick, UserRound, UserPlus, ChevronLeft, ChevronRight,
  Copy, Check, RefreshCw, Download, Trophy, CalendarDays, TrendingUp, TrendingDown,
} from 'lucide-react'

// ── Tipos e definições ─────────────────────────────────────────────────────────
type Row = { plataforma: string; metrica: string; granularidade: string; inicio: string; valor: number }
type Plat = 'instagram' | 'facebook'
type Mode = 'semana' | 'mes' | 'ano'

const PLATS: Record<Plat, { nome: string; cor: string; corSoft: string }> = {
  // cores validadas para o fundo escuro (separação para daltonismo e contraste ≥ 3:1)
  instagram: { nome: 'Instagram', cor: '#d55181', corSoft: 'rgba(213,81,129,0.16)' },
  facebook: { nome: 'Facebook', cor: '#3987e5', corSoft: 'rgba(57,135,229,0.16)' },
}

const METRICS: Record<Plat, { key: string; label: string; desc: string; Icon: any }[]> = {
  instagram: [
    { key: 'visualizacoes', label: 'Visualizações', desc: 'vezes que os conteúdos foram vistos', Icon: Eye },
    { key: 'alcance', label: 'Alcance', desc: 'pessoas diferentes alcançadas', Icon: Users },
    { key: 'interacoes', label: 'Interações', desc: 'curtidas, comentários, salvos e compart.', Icon: Heart },
    { key: 'cliques_link', label: 'Cliques no link', desc: 'cliques no link do perfil', Icon: MousePointerClick },
    { key: 'visitas_perfil', label: 'Visitas ao perfil', desc: 'pessoas que abriram o perfil', Icon: UserRound },
    { key: 'novos_seguidores', label: 'Novos seguidores', desc: 'pessoas que começaram a seguir', Icon: UserPlus },
  ],
  facebook: [
    { key: 'visualizacoes', label: 'Visualizações', desc: 'vezes que os conteúdos foram vistos', Icon: Eye },
    { key: 'visualizadores', label: 'Visualizadores', desc: 'pessoas diferentes que viram', Icon: Users },
    { key: 'interacoes', label: 'Interações', desc: 'reações, comentários e compartilhamentos', Icon: Heart },
    { key: 'cliques_link', label: 'Cliques na página', desc: 'cliques em botões e contatos', Icon: MousePointerClick },
    { key: 'visitas_pagina', label: 'Visitas à página', desc: 'pessoas que abriram a página', Icon: UserRound },
    { key: 'novos_seguidores', label: 'Novos seguidores', desc: 'pessoas que começaram a seguir', Icon: UserPlus },
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
const diffDays = (a: string, b: string) => Math.round((new Date(b + 'T12:00:00Z').getTime() - new Date(a + 'T12:00:00Z').getTime()) / 86400_000)
const ddmm = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`
const yesterdayBR = () => addDays(new Date(Date.now() - 3 * 3600_000).toISOString().slice(0, 10), -1)

function periodOf(mode: Mode, anchor: string) {
  if (mode === 'semana') { const s = weekStart(anchor); return { start: s, end: addDays(s, 6) } }
  if (mode === 'mes') { const m = anchor.slice(0, 7); return { start: `${m}-01`, end: monthEnd(m) } }
  const y = anchor.slice(0, 4); return { start: `${y}-01-01`, end: `${y}-12-31` }
}
function shiftAnchor(mode: Mode, anchor: string, dir: number) {
  if (mode === 'semana') return addDays(anchor, 7 * dir)
  if (mode === 'mes') {
    const y = Number(anchor.slice(0, 4)), m = Number(anchor.slice(5, 7)) - 1 + dir
    const d = new Date(Date.UTC(y, m, 1)); return d.toISOString().slice(0, 10)
  }
  return `${Number(anchor.slice(0, 4)) + dir}-01-01`
}
function periodLabel(mode: Mode, start: string, end: string) {
  if (mode === 'semana') return `Semana de ${ddmm(start)} a ${ddmm(end)}`
  if (mode === 'mes') { const m = Number(start.slice(5, 7)) - 1; return `${MESES_LONGO[m][0].toUpperCase()}${MESES_LONGO[m].slice(1)} de ${start.slice(0, 4)}` }
  return `Ano de ${start.slice(0, 4)}`
}

// ── Números ────────────────────────────────────────────────────────────────────
const fmt = (v: number) => Math.round(v).toLocaleString('pt-BR')
const fmtShort = (v: number) => new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(v)
const fmtPct = (v: number) => `${v > 0 ? '+' : ''}${(v * 100).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}%`

// ── Gráfico de barras (SVG próprio, com tooltip) ───────────────────────────────
type Bar = { label: string; value: number | null; tip: string; highlight?: boolean; dim?: boolean }

function BarChart({ bars, color, height = 220, showAvg = true }: { bars: Bar[]; color: string; height?: number; showAvg?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(600)
  const [hover, setHover] = useState<number | null>(null)
  useEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(e => setW(e[0].contentRect.width))
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])

  const padL = 44, padR = 8, padT = 12, padB = 26
  const iw = Math.max(10, w - padL - padR), ih = height - padT - padB
  const vals = bars.map(b => b.value ?? 0)
  const max = Math.max(1, ...vals)
  const nice = (() => { const p = Math.pow(10, Math.floor(Math.log10(max))); const n = max / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p })()
  const withData = bars.filter(b => b.value != null && !b.dim)
  const anyHighlight = bars.some(b => b.highlight)
  const avg = withData.length ? withData.reduce((s, b) => s + (b.value || 0), 0) / withData.length : 0
  const slot = iw / Math.max(1, bars.length)
  const bw = Math.max(2, Math.min(42, slot - 2))
  const y = (v: number) => padT + ih - (v / nice) * ih
  const labelEvery = Math.ceil(bars.length / Math.max(1, Math.floor(iw / 38)))

  return (
    <div ref={ref} className="relative w-full min-w-0 overflow-hidden select-none" onMouseLeave={() => setHover(null)}>
      <svg width={w} height={height} role="img" aria-label="Gráfico de barras">
        {[0, 0.5, 1].map(f => (
          <g key={f}>
            <line x1={padL} x2={w - padR} y1={y(nice * f)} y2={y(nice * f)} stroke="rgba(255,255,255,0.07)" />
            <text x={padL - 8} y={y(nice * f) + 4} textAnchor="end" fontSize="11" fill="#9a8fb1">{fmtShort(nice * f)}</text>
          </g>
        ))}
        {bars.map((b, i) => {
          const x = padL + i * slot + (slot - bw) / 2
          const v = b.value ?? 0
          const top = y(v), h = Math.max(0, padT + ih - top)
          const r = Math.min(4, bw / 2, h)
          const active = hover === i
          return (
            <g key={i}>
              {b.value != null && h > 0 && (
                <path
                  d={`M${x},${padT + ih} V${top + r} Q${x},${top} ${x + r},${top} H${x + bw - r} Q${x + bw},${top} ${x + bw},${top + r} V${padT + ih} Z`}
                  fill={color}
                  opacity={active ? 1 : b.dim && !b.highlight ? 0.25 : hover == null && (b.highlight || !anyHighlight) ? 1 : 0.45}
                />
              )}
              {i % labelEvery === 0 && (
                <text x={x + bw / 2} y={height - 8} textAnchor="middle" fontSize="11" fill={b.highlight ? '#f3f0f8' : '#9a8fb1'} fontWeight={b.highlight ? 700 : 400}>{b.label}</text>
              )}
              {/* área de hover maior que a barra */}
              <rect x={padL + i * slot} y={padT} width={slot} height={ih} fill="transparent" onMouseEnter={() => setHover(i)} onClick={() => setHover(i)} />
            </g>
          )
        })}
        {showAvg && avg > 0 && (
          <g pointerEvents="none">
            <line x1={padL} x2={w - padR} y1={y(avg)} y2={y(avg)} stroke="#f3f0f8" strokeOpacity="0.55" strokeDasharray="4 4" />
            <text x={w - padR} y={y(avg) - 5} textAnchor="end" fontSize="11" fill="#c9c1d9">média {fmtShort(avg)}</text>
          </g>
        )}
      </svg>
      {hover != null && bars[hover] && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg px-3 py-2 text-xs text-white shadow-xl"
          style={{
            background: '#1b1426', border: '1px solid rgba(255,255,255,0.12)',
            left: Math.min(Math.max(0, padL + hover * slot + slot / 2 - 80), w - 160), top: 0, width: 160,
          }}>
          <div className="text-zinc-400">{bars[hover].tip}</div>
          <div className="mt-0.5 flex items-center gap-1.5 text-sm font-bold">
            <span className="inline-block h-2 w-2 rounded-sm" style={{ background: color }} />
            {bars[hover].value == null ? 'sem dados' : fmt(bars[hover].value!)}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Componente principal ───────────────────────────────────────────────────────
export default function SocialDashboard({ cliente, token, interno }: { cliente: string; token?: string; interno?: boolean }) {
  const ontem = yesterdayBR()
  const [mode, setMode] = useState<Mode>('semana')
  // Semana padrão = última semana fechada (seg–dom); se hoje é segunda, é a que acabou ontem
  const [anchor, setAnchor] = useState(() => addDays(weekStart(yesterdayBR()), dow(yesterdayBR()) === 0 ? 0 : -7))
  const [plat, setPlat] = useState<Plat>('instagram')
  const [metric, setMetric] = useState('visualizacoes')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState('')

  const year = Number(anchor.slice(0, 4))
  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/social/${cliente}?ano=${year}${token ? `&t=${token}` : ''}`, { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro ao carregar')
      setData(json)
    } catch (e: any) { setError(e.message) }
    setLoading(false)
  }, [cliente, token, year])
  useEffect(() => { load() }, [load])

  // índice: idx[plat][metrica][gran][inicio] = valor
  const idx = useMemo(() => {
    const m: Record<string, Record<string, Record<string, Record<string, number>>>> = {}
    for (const r of (data?.rows || []) as Row[]) {
      ((m[r.plataforma] ??= {})[r.metrica] ??= {})[r.granularidade] ??= {}
      m[r.plataforma][r.metrica][r.granularidade][r.inicio] = r.valor
    }
    return m
  }, [data])

  const day = (p: Plat, k: string, d: string): number | null => idx[p]?.[k]?.dia?.[d] ?? null
  const sumDays = (p: Plat, k: string, s: string, e: string) => {
    let t = 0, n = 0
    for (let d = s; d <= e; d = addDays(d, 1)) { const v = day(p, k, d); if (v != null) { t += v; n++ } }
    return n ? t : null
  }
  // Valor de um período: alcance do Instagram usa o número único da Meta quando o período está completo
  const value = (p: Plat, k: string, s: string, e: string, gran?: 'semana' | 'mes'): number | null => {
    if (k === 'seguidores_total') {
      for (let d = e; d >= s; d = addDays(d, -1)) { const v = day(p, k, d); if (v != null) return v }
      return null
    }
    if (gran && p === 'instagram' && k === 'alcance') {
      const u = idx[p]?.[k]?.[gran]?.[s]
      if (u != null) return u
    }
    return sumDays(p, k, s, e)
  }

  const { start, end } = periodOf(mode, anchor)
  const effEnd = end > ontem ? ontem : end // período em andamento vai até ontem
  const ndays = diffDays(start, effEnd) + 1
  const partial = effEnd < end
  // Comparação justa: mesmo nº de dias no período anterior
  const prevStart = periodOf(mode, shiftAnchor(mode, anchor, -1)).start
  const prevEnd = addDays(prevStart, ndays - 1)
  const gran = mode === 'ano' ? undefined : mode
  const cur = (k: string) => (ndays > 0 ? value(plat, k, start, effEnd, partial ? undefined : gran) : null)
  const prev = (k: string) => (ndays > 0 ? value(plat, k, prevStart, prevEnd, partial ? undefined : gran) : null)

  const metas = METRICS[plat]
  const sel = metas.find(m => m.key === metric) || metas[0]
  const color = PLATS[plat].cor
  const hasAny = (data?.rows || []).length > 0

  // Barras do período
  const periodBars: Bar[] = useMemo(() => {
    if (mode === 'ano') {
      return MESES.map((lbl, i) => {
        const m = `${year}-${String(i + 1).padStart(2, '0')}`
        const s = `${m}-01`, e = monthEnd(m)
        const future = s > ontem
        const v = future ? null : value(plat, sel.key, s, e > ontem ? ontem : e, e > ontem ? undefined : 'mes')
        return { label: lbl, value: v, tip: `${MESES_LONGO[i]} de ${year}`, dim: e > ontem }
      })
    }
    const out: Bar[] = []
    for (let d = start; d <= end; d = addDays(d, 1)) {
      out.push({
        label: mode === 'semana' ? DIAS[dow(d)] : String(Number(d.slice(8, 10))),
        value: d > ontem ? null : day(plat, sel.key, d),
        tip: `${DIAS[dow(d)]}, ${ddmm(d)}`,
      })
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, start, end, plat, sel.key, idx, year])

  // Barras do ano inteiro (comparação): por mês, ou por semana quando a visão já é anual
  const yearBars: Bar[] = useMemo(() => {
    if (mode === 'ano') {
      const out: Bar[] = []
      for (let s = weekStart(`${year}-01-01`); s <= `${year}-12-31`; s = addDays(s, 7)) {
        const e = addDays(s, 6)
        out.push({
          label: ddmm(s), value: s > ontem ? null : value(plat, sel.key, s, e > ontem ? ontem : e, e > ontem ? undefined : 'semana'),
          tip: `Semana ${ddmm(s)}–${ddmm(e)}`, dim: e > ontem,
        })
      }
      return out
    }
    return MESES.map((lbl, i) => {
      const m = `${year}-${String(i + 1).padStart(2, '0')}`
      const s = `${m}-01`, e = monthEnd(m)
      return {
        label: lbl,
        value: s > ontem ? null : value(plat, sel.key, s, e > ontem ? ontem : e, e > ontem ? undefined : 'mes'),
        tip: `${MESES_LONGO[i]} de ${year}${e > ontem && s <= ontem ? ' (até ontem)' : ''}`,
        highlight: start.slice(0, 7) === m || (mode === 'semana' && end.slice(0, 7) === m),
        dim: e > ontem, // mês em andamento: fica apagado e fora da média
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, year, plat, sel.key, idx, start, end])

  const best = periodBars.reduce<Bar | null>((b, x) => (x.value != null && (!b || x.value > (b.value ?? 0)) ? x : b), null)
  const totalAno = value(plat, sel.key, `${year}-01-01`, `${year}-12-31` > ontem ? ontem : `${year}-12-31`)
  const segTotal = value(plat, 'seguidores_total', start, effEnd)

  const curSel = cur(sel.key), prevSel = prev(sel.key)
  const deltaSel = curSel != null && prevSel ? (curSel - prevSel) / prevSel : null
  const prevLabel = mode === 'semana' ? 'semana anterior' : mode === 'mes' ? 'mês anterior' : 'ano anterior'

  async function coletar(body: any) {
    const res = await fetch(`/api/social/${cliente}/coletar`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const json = await res.json()
    if (!res.ok || !json.ok) throw new Error(json.error || 'Falha na coleta')
    return json
  }
  async function atualizarAgora() {
    setBusy('Atualizando…')
    try { await coletar({}); await load() } catch (e: any) { setError(e.message) }
    setBusy('')
  }
  async function importarAno() {
    try {
      for (let s = `${year}-01-01`; s <= ontem; s = addDays(s, 14)) {
        const e = addDays(s, 13) < ontem ? addDays(s, 13) : ontem
        setBusy(`Importando ${ddmm(s)} a ${ddmm(e)}…`)
        await coletar({ from: s, to: e })
      }
      await coletar({})
      await load()
    } catch (e: any) { setError(e.message) }
    setBusy('')
  }
  const shareUrl = data?.share_token && typeof window !== 'undefined' ? `${window.location.origin}/r/${data.share_token}` : ''

  return (
    <div className="mx-auto max-w-6xl">
      {/* Cabeçalho */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Redes sociais · orgânico</p>
          <h1 className="text-2xl font-black text-white">{data?.cliente || 'Real Equipamentos'}</h1>
          <p className="mt-1 text-xs text-zinc-400">
            {data?.ultima_coleta
              ? `Atualizado em ${new Date(data.ultima_coleta.replace(' ', 'T') + 'Z').toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })} · números até ontem`
              : 'Aguardando a primeira atualização'}
          </p>
        </div>
        <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
          {(Object.keys(PLATS) as Plat[]).map(p => (
            <button key={p} onClick={() => { setPlat(p); if (!METRICS[p].some(m => m.key === metric)) setMetric('visualizacoes') }}
              className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-semibold transition ${plat === p ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
              style={plat === p ? { background: PLATS[p].corSoft, boxShadow: `inset 0 0 0 1px ${PLATS[p].cor}` } : {}}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: PLATS[p].cor }} />
              {PLATS[p].nome}
            </button>
          ))}
        </div>
      </div>

      {/* Ferramentas internas (só equipe Invollve) */}
      {interno && (
        <div className="glass mb-5 flex flex-wrap items-center gap-3 rounded-2xl p-4 text-sm">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-zinc-400">Link para o cliente (sem login)</p>
            <p className="truncate font-mono text-xs text-white">{shareUrl || '—'}</p>
          </div>
          <button disabled={!shareUrl} onClick={() => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white" style={{ background: 'var(--grad)' }}>
            {copied ? <Check size={14} /> : <Copy size={14} />}{copied ? 'Copiado!' : 'Copiar link'}
          </button>
          <button disabled={!!busy} onClick={atualizarAgora} className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/5 disabled:opacity-50">
            <RefreshCw size={14} className={busy ? 'animate-spin' : ''} />Atualizar agora
          </button>
          <button disabled={!!busy} onClick={importarAno} className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/5 disabled:opacity-50">
            <Download size={14} />Importar histórico de {year}
          </button>
          {busy && <p className="w-full text-xs text-zinc-300">{busy}</p>}
          {data && !data.token_ok && <p className="w-full text-xs text-yellow-300">⚠️ Falta configurar o META_ACCESS_TOKEN no servidor — sem ele a coleta não roda.</p>}
          {data?.ultimo_erro && <p className="w-full text-xs text-yellow-300">⚠️ Última coleta: {data.ultimo_erro}</p>}
        </div>
      )}

      {/* Seletor de período */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
          {(['semana', 'mes', 'ano'] as Mode[]).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${mode === m ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
              style={mode === m ? { background: 'var(--grad)' } : {}}>
              {m === 'semana' ? 'Semanal' : m === 'mes' ? 'Mensal' : 'Anual'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button aria-label="Período anterior" onClick={() => setAnchor(shiftAnchor(mode, anchor, -1))} className="rounded-lg p-2 text-zinc-300 hover:bg-white/5"><ChevronLeft size={18} /></button>
          <div className="flex min-w-[220px] items-center justify-center gap-2 text-sm font-semibold text-white">
            <CalendarDays size={16} className="text-zinc-400" />{periodLabel(mode, start, end)}
          </div>
          <button aria-label="Próximo período" disabled={periodOf(mode, shiftAnchor(mode, anchor, 1)).start > ontem}
            onClick={() => setAnchor(shiftAnchor(mode, anchor, 1))} className="rounded-lg p-2 text-zinc-300 hover:bg-white/5 disabled:opacity-30"><ChevronRight size={18} /></button>
        </div>
        {partial && ndays > 0 && <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-300">em andamento · até {ddmm(effEnd)}</span>}
      </div>

      {loading && !data && <div className="glass rounded-2xl p-10 text-center text-sm text-zinc-400">Carregando números…</div>}
      {error && <div className="glass mb-5 rounded-2xl p-4 text-sm text-red-300">{error}</div>}

      {data && !hasAny && (
        <div className="glass rounded-2xl p-10 text-center">
          <p className="text-3xl">📊</p>
          <p className="mt-2 font-semibold text-white">Ainda não há números por aqui</p>
          <p className="mt-1 text-sm text-zinc-400">
            {interno ? 'Clique em “Importar histórico” para trazer o ano da Meta.' : 'Os números aparecem assim que a primeira atualização rodar.'}
          </p>
        </div>
      )}

      {data && hasAny && (
        <>
          {/* Resumo em uma frase */}
          <div className="glass mb-5 flex items-center gap-4 rounded-2xl p-5" style={{ background: `linear-gradient(100deg, ${PLATS[plat].corSoft}, transparent 70%)` }}>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ background: PLATS[plat].corSoft, color }}>
              <sel.Icon size={24} />
            </div>
            <p className="text-sm text-zinc-200">
              {curSel == null ? (
                <>Sem dados de <b>{sel.label.toLowerCase()}</b> neste período.</>
              ) : (
                <>
                  {mode === 'semana' ? 'Nesta semana' : mode === 'mes' ? 'Neste mês' : 'Neste ano'}, o {PLATS[plat].nome} da Real teve{' '}
                  <b className="text-white">{fmt(curSel)} {sel.label.toLowerCase()}</b>
                  {deltaSel != null && (
                    <> — <b className={deltaSel >= 0 ? 'text-green-400' : 'text-red-400'}>{fmtPct(deltaSel)}</b> em relação {mode === 'semana' ? 'à' : 'ao'} {prevLabel}</>
                  )}.
                  {best?.value != null && mode !== 'ano' && <> O melhor dia foi <b className="text-white">{best.tip}</b>, com {fmt(best.value)}.</>}
                </>
              )}
            </p>
          </div>

          {/* Cartões de métricas (clique para ver no gráfico) */}
          <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {metas.map(m => {
              const c = cur(m.key), p = prev(m.key)
              const d = c != null && p ? (c - p) / p : null
              const active = m.key === sel.key
              return (
                <button key={m.key} onClick={() => setMetric(m.key)}
                  className="glass rounded-2xl p-4 text-left transition hover:bg-white/5"
                  style={active ? { boxShadow: `inset 0 0 0 1.5px ${color}` } : {}}>
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: PLATS[plat].corSoft, color }}>
                    <m.Icon size={18} />
                  </div>
                  <p className="text-xs text-zinc-400">{m.label}</p>
                  <p className="text-2xl font-black text-white">{c == null ? '—' : fmtShort(c)}</p>
                  {d != null ? (
                    <p className={`mt-1 flex items-center gap-1 text-xs font-semibold ${d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {d >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}{fmtPct(d)}
                      <span className="font-normal text-zinc-500">vs {prevLabel.split(' ')[0]} ant.</span>
                    </p>
                  ) : <p className="mt-1 text-xs text-zinc-500">sem comparação</p>}
                </button>
              )
            })}
          </div>

          {/* Gráficos */}
          <div className="grid gap-5 lg:grid-cols-5">
            <div className="glass min-w-0 rounded-2xl p-5 lg:col-span-3">
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-sm font-bold text-white">{sel.label} · {mode === 'ano' ? 'mês a mês' : 'dia a dia'}</h2>
                <p className="text-xs text-zinc-400">{sel.desc}</p>
              </div>
              <BarChart bars={periodBars} color={color} />
            </div>
            <div className="glass min-w-0 rounded-2xl p-5 lg:col-span-2">
              <div className="mb-3 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-bold text-white">{mode === 'ano' ? 'Semana a semana' : `O ano de ${year}`}</h2>
                <p className="text-xs text-zinc-400">{mode === 'ano' ? sel.label : 'mês destacado = período atual'}</p>
              </div>
              <BarChart bars={yearBars} color={color} />
            </div>
          </div>

          {/* Destaques */}
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="glass flex items-center gap-3 rounded-2xl p-4">
              <Trophy size={22} className="text-yellow-300" />
              <div>
                <p className="text-xs text-zinc-400">{mode === 'ano' ? 'Melhor mês' : 'Melhor dia'} do período</p>
                <p className="font-bold text-white">{best?.value != null ? `${best.tip} · ${fmt(best.value)}` : '—'}</p>
              </div>
            </div>
            <div className="glass flex items-center gap-3 rounded-2xl p-4">
              <sel.Icon size={22} style={{ color }} />
              <div>
                <p className="text-xs text-zinc-400">{sel.label} no ano (até ontem)</p>
                <p className="font-bold text-white">{totalAno != null ? fmt(totalAno) : '—'}</p>
              </div>
            </div>
            <div className="glass flex items-center gap-3 rounded-2xl p-4">
              <Users size={22} style={{ color }} />
              <div>
                <p className="text-xs text-zinc-400">Seguidores no total</p>
                <p className="font-bold text-white">{segTotal != null ? fmt(segTotal) : '—'}</p>
              </div>
            </div>
          </div>

          {/* Tabela (mesmos números do gráfico, para quem prefere ler) */}
          <details className="glass mt-5 rounded-2xl p-5">
            <summary className="cursor-pointer text-sm font-semibold text-white">Ver números em tabela</summary>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-zinc-400">
                    <th className="py-2 pr-3 text-left">{mode === 'ano' ? 'Mês' : 'Dia'}</th>
                    {metas.map(m => <th key={m.key} className="px-2 py-2 text-right">{m.label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {(mode === 'ano'
                    ? MESES.map((lbl, i) => { const mm = `${year}-${String(i + 1).padStart(2, '0')}`; return { lbl, s: `${mm}-01`, e: monthEnd(mm), g: 'mes' as const } })
                    : Array.from({ length: diffDays(start, end) + 1 }, (_, i) => { const d = addDays(start, i); return { lbl: `${DIAS[dow(d)]} ${ddmm(d)}`, s: d, e: d, g: undefined } })
                  ).filter(r => r.s <= ontem).map(r => (
                    <tr key={r.s} className="border-b border-white/5">
                      <td className="py-1.5 pr-3 text-zinc-300">{r.lbl}</td>
                      {metas.map(m => {
                        const e = r.e > ontem ? ontem : r.e
                        const v = value(plat, m.key, r.s, e, r.e > ontem ? undefined : r.g)
                        return <td key={m.key} className="px-2 py-1.5 text-right text-white">{v == null ? '—' : fmt(v)}</td>
                      })}
                    </tr>
                  ))}
                  <tr className="font-bold">
                    <td className="py-2 pr-3 text-zinc-300">Total</td>
                    {metas.map(m => { const v = cur(m.key); return <td key={m.key} className="px-2 py-2 text-right text-white">{v == null ? '—' : fmt(v)}</td> })}
                  </tr>
                </tbody>
              </table>
            </div>
          </details>

          <p className="mt-4 text-center text-xs text-zinc-500">
            Dados do Meta Business (Instagram e Facebook), atualizados automaticamente todo dia. A comparação usa o mesmo número de dias do período anterior.
          </p>
        </>
      )}
    </div>
  )
}
