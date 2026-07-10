'use client'
import { useEffect, useState, useCallback } from 'react'

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function fmtBRL(v: number | null | undefined) {
  if (v == null || isNaN(v)) return '—'
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function fmtNum(v: number | null | undefined) {
  if (v == null || isNaN(v)) return '—'
  return v.toLocaleString('pt-BR')
}
function fmtPct(v: number | null | undefined) {
  if (v == null || isNaN(v)) return '—'
  const val = v > 1 ? v : v * 100
  return val.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'
}
function fmtX(v: number | null | undefined) {
  if (v == null || isNaN(v)) return '—'
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + 'x'
}
function getStatus(pct: number) {
  if (pct >= 1)    return { label: '🎉 Parabéns',   color: 'text-green-400 bg-green-400/10' }
  if (pct >= 0.75) return { label: '💪 Falta Pouco', color: 'text-blue-400 bg-blue-400/10' }
  if (pct >= 0.5)  return { label: '🚀 Bora',        color: 'text-yellow-400 bg-yellow-400/10' }
  return                  { label: '⚠️ Alerta',      color: 'text-red-400 bg-red-400/10' }
}
function pctColor(pct: number) {
  if (pct >= 1)    return 'text-green-400'
  if (pct >= 0.75) return 'text-blue-400'
  if (pct >= 0.5)  return 'text-yellow-400'
  return 'text-red-400'
}

const TABS = ['Resultado Geral', 'OKRs do Mês', 'Orgânico', 'Tráfego Lojas', 'Contact Center'] as const
type Tab = typeof TABS[number]

// ── Resultado Geral histórico (fixo da planilha) ──────────────────────────────
const HISTORICO_GERAL = [
  { mes: 'Janeiro',   fatLojas: 89968.65,  resultCC: 86289.5,   resultGeral: 176258.15, invLojas: 2390.18,  invCC: 6307.68,  invTotal: 8697.86,  roasLojas: 37.64, roasCC: 13.68, roasGeral: 20.26, vendLojas: 18, vendCC: 19 },
  { mes: 'Fevereiro', fatLojas: 153453.7,  resultCC: 86140.07,  resultGeral: 239593.77, invLojas: 2715.12,  invCC: 4506.84,  invTotal: 7221.96,  roasLojas: 56.52, roasCC: 19.11, roasGeral: 33.18, vendLojas: 26, vendCC: 18 },
  { mes: 'Março',     fatLojas: 172864.41, resultCC: 129429.76, resultGeral: 302294.17, invLojas: 2750.41,  invCC: 6823.95,  invTotal: 9574.36,  roasLojas: 62.85, roasCC: 18.97, roasGeral: 31.57, vendLojas: 33, vendCC: 11 },
  { mes: 'Abril',     fatLojas: 130329,    resultCC: 196405.64, resultGeral: 326734.64, invLojas: 2578.66,  invCC: 5167.49,  invTotal: 7746.15,  roasLojas: 50.54, roasCC: 38.01, roasGeral: 42.18, vendLojas: 30, vendCC: 28 },
  { mes: 'Maio',      fatLojas: 147268.56, resultCC: 161844.89, resultGeral: 309113.45, invLojas: 5440.14,  invCC: 6823.06,  invTotal: 12263.2,  roasLojas: 27.07, roasCC: 23.72, roasGeral: 25.21, vendLojas: 54, vendCC: 29 },
  { mes: 'Junho',     fatLojas: 147601.62, resultCC: 163638.96, resultGeral: 311240.58, invLojas: 2114.97,  invCC: 5251.61,  invTotal: 7366.58,  roasLojas: 69.79, roasCC: 31.16, roasGeral: 42.25, vendLojas: 42, vendCC: 27 },
  { mes: 'Meta Julho',fatLojas: 158700,    resultCC: 192550,    resultGeral: 351250,    invLojas: 3300,     invCC: 6700,     invTotal: 10000,    roasLojas: 48.09, roasCC: 28.74, roasGeral: 35.13, vendLojas: 46, vendCC: 31, isMeta: true },
]

// ── OKRs do Mês ──────────────────────────────────────────────────────────────
const OKRS_INSTAGRAM = [
  { indicador: 'Visualizações',        junRealizado: 386300, mediaJanJun: 555700, melhorMes: 754300, metaMin: 496410,  metaIdeal: 600156,  metaAgr: 678870,  metaSem: 124102, dono: 'Maessa' },
  { indicador: 'Alcance',              junRealizado: 119600, mediaJanJun: 137367, melhorMes: 186200, metaMin: 131560,  metaIdeal: 148356,  metaAgr: 167580,  metaSem: 32890,  dono: 'Maessa' },
  { indicador: 'Interações c/ Conteúdo', junRealizado: 4317, mediaJanJun: 4571,  melhorMes: 10094,  metaMin: 4749,   metaIdeal: 4937,   metaAgr: 9085,   metaSem: 1187,   dono: 'Maessa' },
  { indicador: 'Cliques no Link',      junRealizado: 1807,  mediaJanJun: 2198,   melhorMes: 3457,   metaMin: 2061,   metaIdeal: 2374,   metaAgr: 3111,   metaSem: 515,    dono: 'Maessa' },
  { indicador: 'Visitas ao Perfil',    junRealizado: 4279,  mediaJanJun: 5444,   melhorMes: 7800,   metaMin: 5036,   metaIdeal: 5880,   metaAgr: 7020,   metaSem: 1259,   dono: 'Maessa' },
  { indicador: 'Seguidores',           junRealizado: 866,   mediaJanJun: 1079,   melhorMes: 1704,   metaMin: 1004,   metaIdeal: 1165,   metaAgr: 1534,   metaSem: 251,    dono: 'Maessa' },
]
const OKRS_FACEBOOK = [
  { indicador: 'Visualizações',        junRealizado: 510400, mediaJanJun: 624783, melhorMes: 816500, metaMin: 584749, metaIdeal: 674766, metaAgr: 734850, metaSem: 146187, dono: 'Maessa' },
  { indicador: 'Visualizadores',       junRealizado: 213800, mediaJanJun: 244950, melhorMes: 312200, metaMin: 235180, metaIdeal: 264546, metaAgr: 280980, metaSem: 58795,  dono: 'Maessa' },
  { indicador: 'Interações c/ Conteúdo', junRealizado: 1447, mediaJanJun: 1297,  melhorMes: 2142,   metaMin: 1592,  metaIdeal: 1401,  metaAgr: 1928,  metaSem: 398,    dono: 'Maessa' },
  { indicador: 'Cliques no Link',      junRealizado: 1846,  mediaJanJun: 3042,   melhorMes: 4536,   metaMin: 2623,  metaIdeal: 3285,  metaAgr: 4082,  metaSem: 656,    dono: 'Maessa' },
  { indicador: 'Visitas à Página',     junRealizado: 2060,  mediaJanJun: 2356,   melhorMes: 3101,   metaMin: 2266,  metaIdeal: 2544,  metaAgr: 2791,  metaSem: 566,    dono: 'Maessa' },
  { indicador: 'Seguidores',           junRealizado: 83,    mediaJanJun: 93,     melhorMes: 130,    metaMin: 91,    metaIdeal: 100,   metaAgr: 117,   metaSem: 23,     dono: 'Maessa' },
]
const OKRS_LOJAS = [
  { indicador: 'Investimento',       junRealizado: 2114.97, mediaJanJun: 2998.25, metaMin: 2720,    metaIdeal: 2720,    metaAgr: 2720,   metaSem: 680,    obs: 'Verba prevista para julho.' },
  { indicador: 'Faturamento',        junRealizado: 147601.62,mediaJanJun: 140247.66,metaMin: 136000, metaIdeal: 149600, metaAgr: 163200, metaSem: 34000,  obs: 'Meta mínima considera ROAS 50.' },
  { indicador: 'ROAS',               junRealizado: 69.79,  mediaJanJun: 50.74,  metaMin: 50,      metaIdeal: 55,      metaAgr: 60,     metaSem: 50,     obs: 'Cobrar consistência, não repetir pico sem contexto.' },
  { indicador: 'Fluxo',              junRealizado: 621,    mediaJanJun: 677.33, metaMin: 700,     metaIdeal: 800,     metaAgr: 900,    metaSem: 175,    obs: 'Recuperar volume acima de junho.' },
  { indicador: 'Vendas',             junRealizado: 42,     mediaJanJun: 33.83,  metaMin: 42,      metaIdeal: 46,      metaAgr: 50,     metaSem: 11,     obs: 'No mínimo manter junho.' },
  { indicador: 'Ticket Médio',       junRealizado: 3514.32,mediaJanJun: 4133.26,metaMin: 3500,    metaIdeal: 3800,    metaAgr: 4200,   metaSem: 3500,   obs: 'Proteger ticket de junho.' },
  { indicador: 'Taxa de Conversão',  junRealizado: 0.0676, mediaJanJun: 0.0577, metaMin: 0.06,    metaIdeal: 0.065,   metaAgr: 0.07,   metaSem: 0.06,   obs: 'Manter acima de 6%.', isPct: true },
]
const OKRS_CC = [
  { indicador: 'Influenciado Contact Center', metaMin: 200000, metaIdeal: 210000, metaAgr: 195000, obs: '' },
  { indicador: 'Investimento Meta',           metaMin: 4000,   metaIdeal: 4300,   metaAgr: 3600,   obs: '' },
  { indicador: 'Investimento Google Ads',     metaMin: 3300,   metaIdeal: 3600,   metaAgr: 3000,   obs: '' },
  { indicador: 'Leads Gerados',               metaMin: 700,    metaIdeal: 800,    metaAgr: 900,    obs: '' },
  { indicador: 'Custo por Lead',              metaMin: 5,      metaIdeal: 4.5,    metaAgr: 4,      obs: 'Menor é melhor.' },
  { indicador: 'WhatsApp - Valor',            metaMin: 60000,  metaIdeal: 70000,  metaAgr: 80000,  obs: '' },
  { indicador: 'WhatsApp - Ticket Médio',     metaMin: 2500,   metaIdeal: 2800,   metaAgr: 3200,   obs: '' },
  { indicador: 'WhatsApp - Vendas',           metaMin: 28,     metaIdeal: 30,     metaAgr: 34,     obs: '' },
  { indicador: 'Conversão Comercial',         metaMin: 0.052,  metaIdeal: 0.057,  metaAgr: 0.062,  obs: 'Manter acima de 5,2%.', isPct: true },
]

// ── Campos de preenchimento semanal ──────────────────────────────────────────
const ORGANICO_CAMPOS = {
  instagram: ['Visualizações','Alcance','Interações c/ Conteúdo','Cliques no Link','Visitas ao Perfil','Seguidores'],
  facebook: ['Visualizações','Visualizadores','Interações c/ Conteúdo','Cliques no Link','Visitas à Página','Seguidores'],
}
const TRAFEGO_CAMPOS = ['Investimento','Faturamento','ROAS','Fluxo','Vendas','Ticket Médio','Taxa de conversão']
const CC_CAMPOS = ['Influenciado Contact Center','Investimento Meta','Investimento Google Ads','Leads Gerados','Custo por Lead','WhatsApp - Valor','WhatsApp - Ticket Médio','WhatsApp - Alcance','WhatsApp - Vendas','Conversão Comercial']
const SEMANAS = ['Semana 1 (01-08)','Semana 2 (09-15)','Semana 3 (16-22)','Semana 4 (23-31)']

type Semanas = Record<string, Record<string, string>>

function NumInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="number"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-sm text-right focus:outline-none focus:border-purple-500 focus:bg-white/10"
      placeholder="—"
    />
  )
}

function SemaналTable({ campos, metas, metasSem, dados, onChange }: {
  campos: string[]
  metas: Record<string, number>
  metasSem: Record<string, number>
  dados: Semanas
  onChange: (campo: string, sem: string, val: string) => void
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[800px]">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left text-zinc-400 font-medium py-2 pr-4 w-44">Indicador</th>
            <th className="text-right text-zinc-400 font-medium py-2 px-2">Meta Mês</th>
            <th className="text-right text-zinc-400 font-medium py-2 px-2">Meta Sem.</th>
            {SEMANAS.map(s => <th key={s} className="text-right text-zinc-400 font-medium py-2 px-2 min-w-[100px]">{s}</th>)}
            <th className="text-right text-zinc-400 font-medium py-2 px-2">Realizado</th>
            <th className="text-right text-zinc-400 font-medium py-2 px-2">%</th>
            <th className="text-right text-zinc-400 font-medium py-2 pl-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {campos.map(campo => {
            const meta = metas[campo] ?? 0
            const metaSem = metasSem[campo] ?? 0
            const realizado = SEMANAS.reduce((sum, s) => sum + (parseFloat(dados[campo]?.[s] || '0') || 0), 0)
            const pct = meta > 0 ? realizado / meta : 0
            const st = getStatus(pct)
            return (
              <tr key={campo} className="border-b border-white/5 hover:bg-white/2">
                <td className="py-2 pr-4 text-zinc-300 font-medium">{campo}</td>
                <td className="py-2 px-2 text-right text-zinc-400">{fmtNum(meta)}</td>
                <td className="py-2 px-2 text-right text-blue-300 font-medium">{metaSem ? fmtNum(metaSem) : '—'}</td>
                {SEMANAS.map(s => (
                  <td key={s} className="py-1 px-1">
                    <NumInput
                      value={dados[campo]?.[s] || ''}
                      onChange={v => onChange(campo, s, v)}
                    />
                  </td>
                ))}
                <td className="py-2 px-2 text-right text-white font-semibold">{fmtNum(realizado)}</td>
                <td className={`py-2 px-2 text-right font-bold ${pctColor(pct)}`}>{fmtPct(pct)}</td>
                <td className="py-2 pl-2 text-right">
                  {meta > 0 && <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function PerformanceRealPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [monthIdx, setMonthIdx] = useState(now.getMonth())
  const [tab, setTab] = useState<Tab>('Resultado Geral')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [organicoIg, setOrganicoIg] = useState<Semanas>({})
  const [organicoFb, setOrganicoFb] = useState<Semanas>({})
  const [trafegoLojas, setTrafegoLojas] = useState<Semanas>({})
  const [contactCenter, setContactCenter] = useState<Semanas>({})
  const [loadingData, setLoadingData] = useState(false)

  const mes = `${year}-${String(monthIdx + 1).padStart(2, '0')}`

  const load = useCallback(async () => {
    setLoadingData(true)
    try {
      const res = await fetch(`/api/performance/real-manual?mes=${mes}`)
      const json = await res.json()
      if (json.organico_ig?.dados) setOrganicoIg(json.organico_ig.dados)
      else setOrganicoIg({})
      if (json.organico_fb?.dados) setOrganicoFb(json.organico_fb.dados)
      else setOrganicoFb({})
      if (json.trafego_lojas?.dados) setTrafegoLojas(json.trafego_lojas.dados)
      else setTrafegoLojas({})
      if (json.contact_center?.dados) setContactCenter(json.contact_center.dados)
      else setContactCenter({})
    } finally {
      setLoadingData(false)
    }
  }, [mes])

  useEffect(() => { load() }, [load])

  async function save(tipo: string, dados: Semanas) {
    setSaving(true)
    await fetch('/api/performance/real-manual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mes, tipo, dados }),
    })
    setSaving(false)
    setSaved(s => ({ ...s, [tipo]: true }))
    setTimeout(() => setSaved(s => ({ ...s, [tipo]: false })), 2500)
  }

  function updateSemana(setter: React.Dispatch<React.SetStateAction<Semanas>>, campo: string, sem: string, val: string) {
    setter(prev => ({ ...prev, [campo]: { ...(prev[campo] || {}), [sem]: val } }))
  }

  const METAS_ORGANICO_IG: Record<string, number> = { 'Visualizações': 496410, 'Alcance': 131560, 'Interações c/ Conteúdo': 4749, 'Cliques no Link': 2061, 'Visitas ao Perfil': 5036, 'Seguidores': 1004 }
  const METAS_SEM_IG: Record<string, number>     = { 'Visualizações': 124102, 'Alcance': 32890, 'Interações c/ Conteúdo': 1187, 'Cliques no Link': 515, 'Visitas ao Perfil': 1259, 'Seguidores': 251 }
  const METAS_ORGANICO_FB: Record<string, number> = { 'Visualizações': 584749, 'Visualizadores': 235180, 'Interações c/ Conteúdo': 1592, 'Cliques no Link': 2623, 'Visitas à Página': 2266, 'Seguidores': 91 }
  const METAS_SEM_FB: Record<string, number>      = { 'Visualizações': 146187, 'Visualizadores': 58795, 'Interações c/ Conteúdo': 398, 'Cliques no Link': 656, 'Visitas à Página': 566, 'Seguidores': 23 }
  const METAS_TRAFEGO: Record<string, number> = { 'Investimento': 3300, 'Faturamento': 158700, 'ROAS': 50, 'Fluxo': 700, 'Vendas': 42, 'Ticket Médio': 3500, 'Taxa de conversão': 0.06 }
  const METAS_SEM_TRAFEGO: Record<string, number> = { 'Investimento': 680, 'Faturamento': 34000, 'ROAS': 50, 'Fluxo': 175, 'Vendas': 11, 'Ticket Médio': 3500, 'Taxa de conversão': 0.06 }
  const METAS_CC: Record<string, number> = { 'Influenciado Contact Center': 192550, 'Investimento Meta': 3000, 'Investimento Google Ads': 2500, 'Leads Gerados': 700, 'Custo por Lead': 5, 'WhatsApp - Valor': 60000, 'WhatsApp - Ticket Médio': 2500, 'WhatsApp - Alcance': 300000, 'WhatsApp - Vendas': 28, 'Conversão Comercial': 0.052 }
  const METAS_SEM_CC: Record<string, number>  = { 'Influenciado Contact Center': 48137, 'Investimento Meta': 750, 'Investimento Google Ads': 625, 'Leads Gerados': 175, 'Custo por Lead': 5, 'WhatsApp - Valor': 15000, 'WhatsApp - Ticket Médio': 2500, 'WhatsApp - Alcance': 75000, 'WhatsApp - Vendas': 7, 'Conversão Comercial': 0.052 }

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏭</span>
          <div>
            <h1 className="text-2xl font-black text-white">Real Equipamentos</h1>
            <p className="text-xs text-zinc-400">OKRs, Metas e Acompanhamento</p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <select value={monthIdx} onChange={e => setMonthIdx(Number(e.target.value))}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm">
            {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm">
            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${tab === t ? 'text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
            style={tab === t ? { background: 'linear-gradient(135deg,#6c3de8,#ec4899)' } : {}}>
            {t}
          </button>
        ))}
      </div>

      {/* ── Tab: Resultado Geral ─────────────────────────────────────────────── */}
      {tab === 'Resultado Geral' && (
        <div className="space-y-6">
          <div className="glass rounded-2xl p-5">
            <h2 className="text-sm font-bold text-white mb-4">📊 Resultado Geral — Lojas + Contact Center</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 text-xs">
                    <th className="text-left py-2 pr-3">Mês</th>
                    <th className="text-right py-2 px-2">Fat. Lojas</th>
                    <th className="text-right py-2 px-2">Result. Contact</th>
                    <th className="text-right py-2 px-2">Result. Geral</th>
                    <th className="text-right py-2 px-2">Inv. Lojas</th>
                    <th className="text-right py-2 px-2">Inv. Contact</th>
                    <th className="text-right py-2 px-2">Inv. Total</th>
                    <th className="text-right py-2 px-2">ROAS Lojas</th>
                    <th className="text-right py-2 px-2">ROAS Contact</th>
                    <th className="text-right py-2 px-2">ROAS Geral</th>
                    <th className="text-right py-2 px-2">Vend. Lojas</th>
                    <th className="text-right py-2 pl-2">Vend. Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {HISTORICO_GERAL.map((row, i) => (
                    <tr key={i} className={`border-b border-white/5 ${(row as any).isMeta ? 'bg-purple-500/10 font-bold' : 'hover:bg-white/2'}`}>
                      <td className={`py-2 pr-3 ${(row as any).isMeta ? 'text-purple-300' : 'text-zinc-300'}`}>{row.mes}</td>
                      <td className="py-2 px-2 text-right text-white">{fmtBRL(row.fatLojas)}</td>
                      <td className="py-2 px-2 text-right text-white">{fmtBRL(row.resultCC)}</td>
                      <td className={`py-2 px-2 text-right font-bold ${(row as any).isMeta ? 'text-purple-300' : 'text-green-400'}`}>{fmtBRL(row.resultGeral)}</td>
                      <td className="py-2 px-2 text-right text-zinc-300">{fmtBRL(row.invLojas)}</td>
                      <td className="py-2 px-2 text-right text-zinc-300">{fmtBRL(row.invCC)}</td>
                      <td className="py-2 px-2 text-right text-blue-300">{fmtBRL(row.invTotal)}</td>
                      <td className="py-2 px-2 text-right text-yellow-300">{fmtX(row.roasLojas)}</td>
                      <td className="py-2 px-2 text-right text-yellow-300">{fmtX(row.roasCC)}</td>
                      <td className="py-2 px-2 text-right text-yellow-300 font-bold">{fmtX(row.roasGeral)}</td>
                      <td className="py-2 px-2 text-right text-zinc-300">{row.vendLojas}</td>
                      <td className="py-2 pl-2 text-right text-zinc-300">{row.vendCC}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Leitura executiva */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-sm font-bold text-white mb-3">📋 Leitura Executiva — Julho 2026</h2>
            <div className="space-y-2 text-sm text-zinc-300">
              <p>🎯 <span className="text-white font-semibold">Meta geral de julho:</span> R$ 351.250,00 com R$ 10.000,00 de investimento e ROAS histórico de 35,1x.</p>
              <p>🏪 <span className="text-white font-semibold">Meta de lojas:</span> R$ 158.700,00 como alvo operacional proporcional dentro do consolidado.</p>
              <p>📞 <span className="text-white font-semibold">Meta de Contact Center:</span> R$ 192.550,00 influenciados como alvo operacional proporcional dentro do consolidado.</p>
              <p>📅 <span className="text-white font-semibold">Cobrança semanal:</span> Resultado geral precisa andar pelo menos R$ 87.812,50 por semana.</p>
            </div>
          </div>

          {/* Simulação de investimento */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-sm font-bold text-white mb-4">📈 Simulação de Investimento — Julho 2026</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Investimento Atual', value: 'R$ 8.000', color: 'text-zinc-300' },
                { label: 'Novo Investimento', value: 'R$ 10.000', color: 'text-blue-300' },
                { label: 'ROAS Histórico', value: '35,1x', color: 'text-yellow-300' },
                { label: 'Fat. Projetado', value: 'R$ 351.250', color: 'text-green-400' },
              ].map(c => (
                <div key={c.label} className="bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-zinc-400">{c.label}</p>
                  <p className={`text-lg font-bold ${c.color}`}>{c.value}</p>
                </div>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 text-xs">
                    <th className="text-right py-2 pr-4">Investimento</th>
                    <th className="text-right py-2 px-3">ROAS</th>
                    <th className="text-right py-2 px-3">Fat. Projetado</th>
                    <th className="text-right py-2 px-3">Fat. Incremental</th>
                    <th className="text-right py-2 px-3">Ating. Meta</th>
                    <th className="text-right py-2 pl-3">Crescimento</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    [6000,35.125,210750,-70250,51.6,-25],
                    [8000,35.125,281000,0,68.9,0],
                    [10000,35.125,351250,70250,86.1,25],
                    [12000,35.125,421500,140500,103.3,50],
                    [14400,35.125,505800,224800,124.0,80],
                    [16000,35.125,562000,281000,137.7,100],
                    [18000,35.125,632250,351250,154.9,125],
                    [20000,35.125,702500,421500,172.2,150],
                  ].map(([inv,roas,fat,inc,ating,cresc], i) => (
                    <tr key={i} className={`border-b border-white/5 ${inv === 10000 ? 'bg-purple-500/10 font-semibold' : 'hover:bg-white/2'}`}>
                      <td className="py-2 pr-4 text-right text-zinc-300">{fmtBRL(inv as number)}</td>
                      <td className="py-2 px-3 text-right text-yellow-300">{(roas as number).toFixed(3)}x</td>
                      <td className="py-2 px-3 text-right text-white">{fmtBRL(fat as number)}</td>
                      <td className={`py-2 px-3 text-right ${(inc as number) >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmtBRL(inc as number)}</td>
                      <td className={`py-2 px-3 text-right ${(ating as number) >= 100 ? 'text-green-400' : 'text-zinc-300'}`}>{(ating as number).toFixed(1)}%</td>
                      <td className={`py-2 pl-3 text-right ${(cresc as number) > 0 ? 'text-green-400' : (cresc as number) < 0 ? 'text-red-400' : 'text-zinc-400'}`}>{(cresc as number) >= 0 ? '+' : ''}{cresc}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: OKRs do Mês ─────────────────────────────────────────────────── */}
      {tab === 'OKRs do Mês' && (
        <div className="space-y-6">
          {/* Instagram */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-sm font-bold text-pink-400 mb-4">📸 Instagram — OKRs Julho 2026</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[750px]">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 text-xs">
                    <th className="text-left py-2 pr-4">Indicador</th>
                    <th className="text-right py-2 px-2">Jun Realizado</th>
                    <th className="text-right py-2 px-2">Média Jan-Jun</th>
                    <th className="text-right py-2 px-2">Melhor Mês</th>
                    <th className="text-right py-2 px-2">Meta Mínima</th>
                    <th className="text-right py-2 px-2">Meta Ideal</th>
                    <th className="text-right py-2 px-2">Meta Agressiva</th>
                    <th className="text-right py-2 pl-2">Meta Semanal</th>
                  </tr>
                </thead>
                <tbody>
                  {OKRS_INSTAGRAM.map((row, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/2">
                      <td className="py-2 pr-4 text-zinc-300 font-medium">{row.indicador}</td>
                      <td className="py-2 px-2 text-right text-zinc-400">{fmtNum(row.junRealizado)}</td>
                      <td className="py-2 px-2 text-right text-zinc-400">{fmtNum(row.mediaJanJun)}</td>
                      <td className="py-2 px-2 text-right text-zinc-400">{fmtNum(row.melhorMes)}</td>
                      <td className="py-2 px-2 text-right text-yellow-300">{fmtNum(row.metaMin)}</td>
                      <td className="py-2 px-2 text-right text-green-400 font-semibold">{fmtNum(row.metaIdeal)}</td>
                      <td className="py-2 px-2 text-right text-purple-300">{fmtNum(row.metaAgr)}</td>
                      <td className="py-2 pl-2 text-right text-blue-300">{fmtNum(row.metaSem)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Facebook */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-sm font-bold text-blue-400 mb-4">👤 Facebook — OKRs Julho 2026</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[750px]">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 text-xs">
                    <th className="text-left py-2 pr-4">Indicador</th>
                    <th className="text-right py-2 px-2">Jun Realizado</th>
                    <th className="text-right py-2 px-2">Média Jan-Jun</th>
                    <th className="text-right py-2 px-2">Melhor Mês</th>
                    <th className="text-right py-2 px-2">Meta Mínima</th>
                    <th className="text-right py-2 px-2">Meta Ideal</th>
                    <th className="text-right py-2 px-2">Meta Agressiva</th>
                    <th className="text-right py-2 pl-2">Meta Semanal</th>
                  </tr>
                </thead>
                <tbody>
                  {OKRS_FACEBOOK.map((row, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/2">
                      <td className="py-2 pr-4 text-zinc-300 font-medium">{row.indicador}</td>
                      <td className="py-2 px-2 text-right text-zinc-400">{fmtNum(row.junRealizado)}</td>
                      <td className="py-2 px-2 text-right text-zinc-400">{fmtNum(row.mediaJanJun)}</td>
                      <td className="py-2 px-2 text-right text-zinc-400">{fmtNum(row.melhorMes)}</td>
                      <td className="py-2 px-2 text-right text-yellow-300">{fmtNum(row.metaMin)}</td>
                      <td className="py-2 px-2 text-right text-green-400 font-semibold">{fmtNum(row.metaIdeal)}</td>
                      <td className="py-2 px-2 text-right text-purple-300">{fmtNum(row.metaAgr)}</td>
                      <td className="py-2 pl-2 text-right text-blue-300">{fmtNum(row.metaSem)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tráfego Lojas OKRs */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-sm font-bold text-orange-400 mb-4">🏪 Tráfego Lojas — OKRs Julho 2026</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[750px]">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 text-xs">
                    <th className="text-left py-2 pr-4">Indicador</th>
                    <th className="text-right py-2 px-2">Jun Realizado</th>
                    <th className="text-right py-2 px-2">Média Jan-Jun</th>
                    <th className="text-right py-2 px-2">Meta Mínima</th>
                    <th className="text-right py-2 px-2">Meta Ideal</th>
                    <th className="text-right py-2 px-2">Meta Agressiva</th>
                    <th className="text-right py-2 px-2">Meta Semanal</th>
                    <th className="text-left py-2 pl-2">Observação</th>
                  </tr>
                </thead>
                <tbody>
                  {OKRS_LOJAS.map((row, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/2">
                      <td className="py-2 pr-4 text-zinc-300 font-medium">{row.indicador}</td>
                      <td className="py-2 px-2 text-right text-zinc-400">{row.isPct ? fmtPct(row.junRealizado) : fmtNum(row.junRealizado)}</td>
                      <td className="py-2 px-2 text-right text-zinc-400">{row.isPct ? fmtPct(row.mediaJanJun) : fmtNum(row.mediaJanJun)}</td>
                      <td className="py-2 px-2 text-right text-yellow-300">{row.isPct ? fmtPct(row.metaMin) : fmtNum(row.metaMin)}</td>
                      <td className="py-2 px-2 text-right text-green-400 font-semibold">{row.isPct ? fmtPct(row.metaIdeal) : fmtNum(row.metaIdeal)}</td>
                      <td className="py-2 px-2 text-right text-purple-300">{row.isPct ? fmtPct(row.metaAgr) : fmtNum(row.metaAgr)}</td>
                      <td className="py-2 px-2 text-right text-blue-300">{row.isPct ? fmtPct(row.metaSem) : fmtNum(row.metaSem)}</td>
                      <td className="py-2 pl-2 text-zinc-500 text-xs">{row.obs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Contact Center OKRs */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-sm font-bold text-cyan-400 mb-4">📞 Contact Center — Metas Julho 2026</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 text-xs">
                    <th className="text-left py-2 pr-4">Indicador</th>
                    <th className="text-right py-2 px-3">Meta Mínima</th>
                    <th className="text-right py-2 px-3">Meta Ideal</th>
                    <th className="text-right py-2 px-3">Meta Agressiva</th>
                    <th className="text-left py-2 pl-3">Observação</th>
                  </tr>
                </thead>
                <tbody>
                  {OKRS_CC.map((row, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/2">
                      <td className="py-2 pr-4 text-zinc-300 font-medium">{row.indicador}</td>
                      <td className="py-2 px-3 text-right text-yellow-300">{row.isPct ? fmtPct(row.metaMin) : fmtNum(row.metaMin)}</td>
                      <td className="py-2 px-3 text-right text-green-400 font-semibold">{row.isPct ? fmtPct(row.metaIdeal) : fmtNum(row.metaIdeal)}</td>
                      <td className="py-2 px-3 text-right text-purple-300">{row.isPct ? fmtPct(row.metaAgr) : fmtNum(row.metaAgr)}</td>
                      <td className="py-2 pl-3 text-zinc-500 text-xs">{row.obs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Orgânico (Maessa) ────────────────────────────────────────────── */}
      {tab === 'Orgânico' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-1 rounded-full bg-pink-500/20 text-pink-300">✏️ Preenchido por: Maessa</span>
            {loadingData && <span className="text-xs text-zinc-500">Carregando...</span>}
          </div>

          {/* Instagram */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-sm font-bold text-pink-400 mb-4">📸 Instagram — Acompanhamento Semanal</h2>
            <SemaналTable
              campos={ORGANICO_CAMPOS.instagram}
              metas={METAS_ORGANICO_IG}
              metasSem={METAS_SEM_IG}
              dados={organicoIg}
              onChange={(campo, sem, val) => updateSemana(setOrganicoIg, campo, sem, val)}
            />
            <div className="mt-4 flex justify-end">
              <button onClick={() => save('organico_ig', organicoIg)} disabled={saving}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#6c3de8,#ec4899)' }}>
                {saving ? 'Salvando...' : saved['organico_ig'] ? '✓ Salvo!' : 'Salvar Instagram'}
              </button>
            </div>
          </div>

          {/* Facebook */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-sm font-bold text-blue-400 mb-4">👤 Facebook — Acompanhamento Semanal</h2>
            <SemaналTable
              campos={ORGANICO_CAMPOS.facebook}
              metas={METAS_ORGANICO_FB}
              metasSem={METAS_SEM_FB}
              dados={organicoFb}
              onChange={(campo, sem, val) => updateSemana(setOrganicoFb, campo, sem, val)}
            />
            <div className="mt-4 flex justify-end">
              <button onClick={() => save('organico_fb', organicoFb)} disabled={saving}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#6c3de8,#ec4899)' }}>
                {saving ? 'Salvando...' : saved['organico_fb'] ? '✓ Salvo!' : 'Salvar Facebook'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Tráfego Lojas (João Paulo) ─────────────────────────────────── */}
      {tab === 'Tráfego Lojas' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-1 rounded-full bg-orange-500/20 text-orange-300">✏️ Preenchido por: João Paulo</span>
            {loadingData && <span className="text-xs text-zinc-500">Carregando...</span>}
          </div>
          <div className="glass rounded-2xl p-5">
            <h2 className="text-sm font-bold text-orange-400 mb-4">🏪 Tráfego Lojas — Acompanhamento Semanal</h2>
            <SemaналTable
              campos={TRAFEGO_CAMPOS}
              metas={METAS_TRAFEGO}
              metasSem={METAS_SEM_TRAFEGO}
              dados={trafegoLojas}
              onChange={(campo, sem, val) => updateSemana(setTrafegoLojas, campo, sem, val)}
            />
            <div className="mt-4 flex justify-end">
              <button onClick={() => save('trafego_lojas', trafegoLojas)} disabled={saving}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#6c3de8,#ec4899)' }}>
                {saving ? 'Salvando...' : saved['trafego_lojas'] ? '✓ Salvo!' : 'Salvar Tráfego Lojas'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Contact Center (João Paulo) ─────────────────────────────────── */}
      {tab === 'Contact Center' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300">✏️ Preenchido por: João Paulo</span>
            {loadingData && <span className="text-xs text-zinc-500">Carregando...</span>}
          </div>
          <div className="glass rounded-2xl p-5">
            <h2 className="text-sm font-bold text-cyan-400 mb-4">📞 Contact Center — Acompanhamento Semanal</h2>
            <SemaналTable
              campos={CC_CAMPOS}
              metas={METAS_CC}
              metasSem={METAS_SEM_CC}
              dados={contactCenter}
              onChange={(campo, sem, val) => updateSemana(setContactCenter, campo, sem, val)}
            />
            <div className="mt-4 flex justify-end">
              <button onClick={() => save('contact_center', contactCenter)} disabled={saving}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#6c3de8,#ec4899)' }}>
                {saving ? 'Salvando...' : saved['contact_center'] ? '✓ Salvo!' : 'Salvar Contact Center'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
