'use client'
import { useEffect, useRef, useState } from 'react'

// Gráficos do dashboard de redes — SVG próprio, animados, com tooltip.

export const fmt = (v: number) => Math.round(v).toLocaleString('pt-BR')
export const fmtShort = (v: number) => new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(v)

const INK = '#f3f0f8'
const MUTED = '#9a8fb1'
const GRID = 'rgba(255,255,255,0.08)'
export const PREV_COLOR = '#8f88a3' // período anterior: neutro, sempre tracejado

const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
const ease = (t: number) => 1 - Math.pow(1 - t, 3)

function useWidth<T extends HTMLElement>(initial = 600) {
  const ref = useRef<T>(null)
  const [w, setW] = useState(initial)
  useEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(e => setW(e[0].contentRect.width))
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])
  return [ref, w] as const
}

// Anima de um array de números para outro (radar, contadores)
function useTween(target: number[], ms = 700) {
  const [val, setVal] = useState(target)
  const from = useRef(target)
  const key = target.map(v => v.toFixed(4)).join('|')
  useEffect(() => {
    const start = from.current.length === target.length ? from.current : target.map(() => 0)
    if (reduceMotion()) { from.current = target; setVal(target); return }
    let raf = 0
    const t0 = performance.now()
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / ms)
      const cur = target.map((v, i) => start[i] + (v - start[i]) * ease(p))
      from.current = cur
      setVal(cur)
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ms])
  return val
}

export function CountUp({ value, short }: { value: number | null; short?: boolean }) {
  const [v] = useTween([value ?? 0], 800)
  if (value == null) return <>—</>
  return <>{short ? fmtShort(v) : fmt(v)}</>
}

function niceMax(max: number) {
  if (max <= 0) return 1
  const p = Math.pow(10, Math.floor(Math.log10(max)))
  const n = max / p
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p
}

// Curva suave (Catmull-Rom → Bézier) por trechos com dados
function smooth(pts: [number, number][]) {
  if (pts.length < 2) return pts.length ? `M${pts[0][0]},${pts[0][1]}` : ''
  let d = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2
    const t = 0.18
    d += ` C${p1[0] + (p2[0] - p0[0]) * t},${p1[1] + (p2[1] - p0[1]) * t} ${p2[0] - (p3[0] - p1[0]) * t},${p2[1] - (p3[1] - p1[1]) * t} ${p2[0]},${p2[1]}`
  }
  return d
}
function segments(vals: (number | null)[], x: (i: number) => number, y: (v: number) => number) {
  const out: [number, number][][] = []
  let cur: [number, number][] = []
  vals.forEach((v, i) => {
    if (v == null) { if (cur.length) out.push(cur); cur = [] } else cur.push([x(i), y(v)])
  })
  if (cur.length) out.push(cur)
  return out
}

// ── Minigráfico dos cartões ────────────────────────────────────────────────────
export function Sparkline({ values, color, id }: { values: (number | null)[]; color: string; id: string }) {
  const w = 96, h = 36
  const nums = values.filter((v): v is number => v != null)
  if (nums.length < 2) return <div style={{ width: w, height: h }} />
  const max = Math.max(...nums), min = Math.min(...nums)
  const x = (i: number) => (i / (values.length - 1)) * w
  const y = (v: number) => h - 3 - ((v - min) / (max - min || 1)) * (h - 6)
  const segs = segments(values, x, y)
  return (
    <svg width={w} height={h} className="shrink-0 overflow-visible" aria-hidden>
      <defs>
        <linearGradient id={`sp-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {segs.map((s, i) => (
        <g key={i}>
          <path d={`${smooth(s)} L${s[s.length - 1][0]},${h} L${s[0][0]},${h} Z`} fill={`url(#sp-${id})`} className="sd-fade" />
          <path d={smooth(s)} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" pathLength={1} className="sd-draw" />
        </g>
      ))}
    </svg>
  )
}

// ── Gráfico de linha (período atual × anterior) ────────────────────────────────
export type LinePoint = { label: string; tip: string; value: number | null; prev: number | null; prevTip?: string }

export function LineChart({ points, color, height = 260, animKey }: { points: LinePoint[]; color: string; height?: number; animKey: string }) {
  const [ref, w] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const padL = 44, padR = 14, padT = 16, padB = 28
  const iw = Math.max(10, w - padL - padR), ih = height - padT - padB
  const all = points.flatMap(p => [p.value, p.prev]).filter((v): v is number => v != null)
  const top = niceMax(Math.max(1, ...all))
  const n = points.length
  const x = (i: number) => padL + (n <= 1 ? iw / 2 : (i / (n - 1)) * iw)
  const y = (v: number) => padT + ih - (v / top) * ih
  const cur = segments(points.map(p => p.value), x, y)
  const prev = segments(points.map(p => p.prev), x, y)
  const every = Math.ceil(n / Math.max(1, Math.floor(iw / 46)))
  const gid = `lc-${animKey.replace(/[^a-z0-9]/gi, '')}`

  function onMove(e: React.MouseEvent | React.TouchEvent) {
    const r = (e.currentTarget as SVGElement).getBoundingClientRect()
    const cx = 'touches' in e ? e.touches[0].clientX : e.clientX
    const i = Math.round(((cx - r.left - padL) / iw) * (n - 1))
    setHover(Math.max(0, Math.min(n - 1, i)))
  }
  const hp = hover != null ? points[hover] : null

  return (
    <div ref={ref} className="relative w-full min-w-0 overflow-hidden">
      <svg width={w} height={height} role="img" aria-label="Gráfico de linha do período" onMouseMove={onMove} onTouchMove={onMove} onMouseLeave={() => setHover(null)} className="touch-pan-y">
        <defs>
          <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity="0.28" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map(f => (
          <g key={f}>
            <line x1={padL} x2={w - padR} y1={y(top * f)} y2={y(top * f)} stroke={GRID} strokeDasharray={f ? '2 4' : undefined} />
            <text x={padL - 8} y={y(top * f) + 4} textAnchor="end" fontSize="11" fill={MUTED}>{fmtShort(top * f)}</text>
          </g>
        ))}
        {points.map((p, i) => i % every === 0 && (
          <text key={i} x={x(i)} y={height - 8} textAnchor="middle" fontSize="11" fontWeight={600} fill={hover === i ? INK : MUTED}>{p.label}</text>
        ))}
        <g key={animKey}>
          {prev.map((s, i) => <path key={'p' + i} d={smooth(s)} fill="none" stroke={PREV_COLOR} strokeWidth="1.5" strokeDasharray="5 5" className="sd-fade" />)}
          {cur.map((s, i) => (
            <g key={'c' + i}>
              <path d={`${smooth(s)} L${s[s.length - 1][0]},${padT + ih} L${s[0][0]},${padT + ih} Z`} fill={`url(#${gid})`} className="sd-fade" />
              <path d={smooth(s)} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" pathLength={1} className="sd-draw" />
            </g>
          ))}
        </g>
        {hp && hover != null && (
          <g pointerEvents="none">
            <line x1={x(hover)} x2={x(hover)} y1={padT} y2={padT + ih} stroke="rgba(255,255,255,0.25)" />
            {hp.prev != null && <circle cx={x(hover)} cy={y(hp.prev)} r={4.5} fill={PREV_COLOR} stroke="#0d0a14" strokeWidth="2" />}
            {hp.value != null && <circle cx={x(hover)} cy={y(hp.value)} r={6} fill={color} stroke="#0d0a14" strokeWidth="2.5" />}
          </g>
        )}
      </svg>
      {hp && hover != null && (
        <div className="pointer-events-none absolute z-10 w-48 rounded-xl border border-white/15 bg-[#17111f]/95 px-3 py-2 text-xs shadow-2xl backdrop-blur"
          style={{ left: Math.min(Math.max(0, x(hover) - 96), w - 192), top: 4 }}>
          <p className="text-zinc-400">{hp.tip}</p>
          <p className="mt-1 flex items-center justify-between gap-2 font-bold text-white">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: color }} />Período</span>
            {hp.value == null ? '—' : fmt(hp.value)}
          </p>
          {hp.prev != null && (
            <p className="mt-0.5 flex items-center justify-between gap-2 text-zinc-300">
              <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 border-t-2 border-dashed" style={{ borderColor: PREV_COLOR }} />{hp.prevTip || 'Anterior'}</span>
              {fmt(hp.prev)}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Barras (ano mês a mês) ─────────────────────────────────────────────────────
export type Bar = { label: string; value: number | null; tip: string; highlight?: boolean; dim?: boolean }

export function BarChart({ bars, color, height = 230, animKey }: { bars: Bar[]; color: string; height?: number; animKey: string }) {
  const [ref, w] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const padL = 44, padR = 8, padT = 14, padB = 26
  const iw = Math.max(10, w - padL - padR), ih = height - padT - padB
  const top = niceMax(Math.max(1, ...bars.map(b => b.value ?? 0)))
  const full = bars.filter(b => b.value != null && !b.dim)
  const avg = full.length ? full.reduce((s, b) => s + (b.value || 0), 0) / full.length : 0
  const slot = iw / Math.max(1, bars.length)
  const bw = Math.max(3, Math.min(34, slot - 6))
  const y = (v: number) => padT + ih - (v / top) * ih
  const anyHi = bars.some(b => b.highlight)

  return (
    <div ref={ref} className="relative w-full min-w-0 overflow-hidden" onMouseLeave={() => setHover(null)}>
      <svg width={w} height={height} role="img" aria-label="Gráfico de barras do ano">
        {[0, 0.5, 1].map(f => (
          <g key={f}>
            <line x1={padL} x2={w - padR} y1={y(top * f)} y2={y(top * f)} stroke={GRID} strokeDasharray={f ? '2 4' : undefined} />
            <text x={padL - 8} y={y(top * f) + 4} textAnchor="end" fontSize="11" fill={MUTED}>{fmtShort(top * f)}</text>
          </g>
        ))}
        <g key={animKey}>
          {bars.map((b, i) => {
            const x = padL + i * slot + (slot - bw) / 2
            const v = b.value ?? 0
            const h = Math.max(0, padT + ih - y(v))
            const r = Math.min(4, bw / 2, h)
            const t = padT + ih - h
            const active = hover === i
            const op = active ? 1 : b.dim && !b.highlight ? 0.28 : hover == null && (b.highlight || !anyHi) ? 1 : 0.42
            return (
              <g key={i}>
                {b.value != null && h > 0 && (
                  <path className="sd-grow" style={{ animationDelay: `${i * 40}ms`, transition: 'opacity .2s' }} opacity={op} fill={color}
                    d={`M${x},${padT + ih} V${t + r} Q${x},${t} ${x + r},${t} H${x + bw - r} Q${x + bw},${t} ${x + bw},${t + r} V${padT + ih} Z`} />
                )}
                <text x={x + bw / 2} y={height - 8} textAnchor="middle" fontSize="11" fontWeight={b.highlight ? 700 : 500} fill={b.highlight || active ? INK : MUTED}>{b.label}</text>
                <rect x={padL + i * slot} y={padT} width={slot} height={ih} fill="transparent" onMouseEnter={() => setHover(i)} onClick={() => setHover(i)} />
              </g>
            )
          })}
        </g>
        {avg > 0 && (
          <g pointerEvents="none">
            <line x1={padL} x2={w - padR} y1={y(avg)} y2={y(avg)} stroke={INK} strokeOpacity="0.5" strokeDasharray="4 4" />
            <text x={w - padR} y={y(avg) - 6} textAnchor="end" fontSize="11" fill="#c9c1d9">média {fmtShort(avg)}</text>
          </g>
        )}
      </svg>
      {hover != null && bars[hover] && (
        <div className="pointer-events-none absolute z-10 w-40 rounded-xl border border-white/15 bg-[#17111f]/95 px-3 py-2 text-xs shadow-2xl"
          style={{ left: Math.min(Math.max(0, padL + hover * slot + slot / 2 - 80), w - 160), top: 0 }}>
          <p className="text-zinc-400">{bars[hover].tip}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm font-bold text-white">
            <span className="h-2 w-2 rounded-sm" style={{ background: color }} />
            {bars[hover].value == null ? 'sem dados' : fmt(bars[hover].value!)}
          </p>
        </div>
      )}
    </div>
  )
}

// ── Radar de equilíbrio: cada indicador comparado com a própria média ────────────
// 1,0 = igual à média (anel do meio). Mais forte → mais pra fora; mais fraco → mais pra dentro.
export type RadarAxis = { label: string; score: number | null; prevScore: number | null; detail: string }

export function Radar({ axes, color, size = 360 }: { axes: RadarAxis[]; color: string; size?: number }) {
  const [ref, w] = useWidth<HTMLDivElement>(size)
  const [hover, setHover] = useState<number | null>(null)
  const S = Math.min(size, w)
  const cx = S / 2, cy = S / 2
  const R = S / 2 - 84
  const MAX = 2 // 200% da média na borda
  const cur = useTween(axes.map(a => Math.min(MAX, a.score ?? 0)), 900)
  const prev = useTween(axes.map(a => Math.min(MAX, a.prevScore ?? 0)), 900)
  const n = axes.length
  const ang = (i: number) => -Math.PI / 2 + (i / n) * Math.PI * 2
  const pt = (i: number, s: number) => [cx + Math.cos(ang(i)) * R * (s / MAX), cy + Math.sin(ang(i)) * R * (s / MAX)] as const
  const poly = (vals: number[]) => vals.map((s, i) => pt(i, s).join(',')).join(' ')
  const hasPrev = axes.some(a => a.prevScore != null)

  return (
    <div ref={ref} className="relative mx-auto w-full" style={{ maxWidth: size }}>
      <svg width={S} height={S} role="img" aria-label="Radar de equilíbrio dos indicadores" className="mx-auto block overflow-visible">
        {[0.5, 1, 1.5, 2].map(s => (
          <circle key={s} cx={cx} cy={cy} r={R * (s / MAX)} fill={s === 1 ? 'rgba(255,255,255,0.025)' : 'none'}
            stroke={s === 1 ? 'rgba(255,255,255,0.35)' : GRID} strokeDasharray={s === 1 ? '3 4' : undefined} />
        ))}
        <text x={cx + 4} y={cy - R / 2 - 4} fontSize="10" fill="#c9c1d9">média</text>
        <text x={cx + 4} y={cy - R - 4} fontSize="10" fill={MUTED}>2×</text>
        {axes.map((_, i) => {
          const [x2, y2] = pt(i, MAX)
          return <line key={i} x1={cx} y1={cy} x2={x2} y2={y2} stroke={GRID} strokeDasharray="2 4" />
        })}
        {hasPrev && <polygon points={poly(prev)} fill="none" stroke={PREV_COLOR} strokeWidth="1.5" strokeDasharray="5 4" />}
        <polygon points={poly(cur)} fill={color} fillOpacity="0.28" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        {cur.map((s, i) => {
          const [x, y] = pt(i, s)
          return <circle key={i} cx={x} cy={y} r={hover === i ? 7 : 5} fill={color} stroke="#0d0a14" strokeWidth="2.5" style={{ transition: 'r .15s' }} />
        })}
        {axes.map((a, i) => {
          const [lx, ly] = pt(i, (MAX * (R + 14)) / R)
          const anchor = Math.abs(lx - cx) < 8 ? 'middle' : lx > cx ? 'start' : 'end'
          return (
            <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onClick={() => setHover(i)} className="cursor-default">
              <circle cx={pt(i, cur[i])[0]} cy={pt(i, cur[i])[1]} r={16} fill="transparent" />
              <text x={lx} y={ly - 3} textAnchor={anchor} fontSize="11.5" fontWeight={700} fill={hover === i ? INK : '#d9d2e6'}>{a.label}</text>
              <text x={lx} y={ly + 11} textAnchor={anchor} fontSize="11" fontWeight={600}
                fill={a.score == null ? MUTED : a.score >= 1 ? '#4ade80' : '#f87171'}>
                {a.score == null ? '—' : `${a.score >= 1 ? '▲' : '▼'} ${Math.round(a.score * 100)}%`}
              </text>
            </g>
          )
        })}
      </svg>
      {hover != null && axes[hover] && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 w-52 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/15 bg-[#17111f]/95 px-3 py-2 text-center text-xs shadow-2xl">
          <p className="font-bold text-white">{axes[hover].label}</p>
          <p className="mt-0.5 text-zinc-300">{axes[hover].detail}</p>
        </div>
      )}
    </div>
  )
}
