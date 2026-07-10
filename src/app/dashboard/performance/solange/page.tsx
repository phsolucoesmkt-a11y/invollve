'use client'
import { useEffect, useState } from 'react'

const PRECO_COMUNIDADE = 697

const STATUS_MULHER = [
  { value: 'contato_feito',  label: 'Contato Feito',       color: 'bg-zinc-500/20 text-zinc-300' },
  { value: 'followup',       label: 'Follow-up',            color: 'bg-blue-500/20 text-blue-300' },
  { value: 'teste_14',       label: 'Teste 14 dias',        color: 'bg-yellow-500/20 text-yellow-300' },
  { value: 'comprou',        label: 'Comprou ✅',           color: 'bg-green-500/20 text-green-300' },
  { value: 'perdeu',         label: 'Perdeu ❌',            color: 'bg-red-500/20 text-red-300' },
]

const STATUS_INFLUENCIADOR = [
  { value: 'chamado',        label: 'Chamado',              color: 'bg-zinc-500/20 text-zinc-300' },
  { value: 'respondeu',      label: 'Respondeu',            color: 'bg-blue-500/20 text-blue-300' },
  { value: 'midia_kit',      label: 'Enviou Mídia Kit',     color: 'bg-purple-500/20 text-purple-300' },
  { value: 'proposta',       label: 'Proposta Enviada',     color: 'bg-yellow-500/20 text-yellow-300' },
  { value: 'fechado',        label: 'Fechado ✅',           color: 'bg-green-500/20 text-green-300' },
  { value: 'perdeu',         label: 'Perdeu ❌',            color: 'bg-red-500/20 text-red-300' },
]

const STATUS_STORY = [
  { value: 'planejado',  label: 'Planejado',  color: 'bg-zinc-500/20 text-zinc-300' },
  { value: 'publicado',  label: 'Publicado',  color: 'bg-green-500/20 text-green-300' },
]

const TABS = ['Funil Mulheres', 'Influenciadores', 'Stories'] as const
type Tab = typeof TABS[number]

function StatusBadge({ value, options }: { value: string; options: typeof STATUS_MULHER }) {
  const opt = options.find(o => o.value === value) ?? options[0]
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${opt.color}`}>{opt.label}</span>
}

function FunnelCard({ label, count, total, color, receita }: { label: string; count: number; total: number; color: string; receita?: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="glass rounded-2xl p-4 flex flex-col gap-1">
      <p className="text-xs text-zinc-400">{label}</p>
      <p className={`text-3xl font-black ${color}`}>{count}</p>
      <div className="w-full bg-white/10 rounded-full h-1.5 mt-1">
        <div className={`h-1.5 rounded-full transition-all`} style={{ width: `${pct}%`, background: color.includes('green') ? '#4ade80' : color.includes('yellow') ? '#facc15' : color.includes('blue') ? '#60a5fa' : color.includes('red') ? '#f87171' : '#a1a1aa' }} />
      </div>
      <p className="text-xs text-zinc-500">{pct}% do total</p>
      {receita != null && <p className="text-xs text-green-400 font-semibold mt-1">R$ {receita.toLocaleString('pt-BR')}</p>}
    </div>
  )
}

export default function SolangePage() {
  const [tab, setTab] = useState<Tab>('Funil Mulheres')
  const [mulheres, setMulheres] = useState<any[]>([])
  const [influenciadores, setInfluenciadores] = useState<any[]>([])
  const [stories, setStories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState<number | null>(null)
  const [editData, setEditData] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [showAddMulher, setShowAddMulher] = useState(false)
  const [showAddInflu, setShowAddInflu] = useState(false)
  const [showAddStory, setShowAddStory] = useState(false)
  const [newMulher, setNewMulher] = useState({ nome: '', whatsapp: '', email: '', quem_contatou: '', obs: '' })
  const [newInflu, setNewInflu] = useState({ nome: '', perfil: '', seguidores: '', nicho: '' })
  const [newStory, setNewStory] = useState({ semana: '', acao: '', descricao: '' })

  async function loadAll() {
    setLoading(true)
    const [m, i, s] = await Promise.all([
      fetch('/api/performance/solange/mulheres').then(r => r.json()),
      fetch('/api/performance/solange/influenciadores').then(r => r.json()),
      fetch('/api/performance/solange/stories').then(r => r.json()),
    ])
    setMulheres(Array.isArray(m) ? m : [])
    setInfluenciadores(Array.isArray(i) ? i : [])
    setStories(Array.isArray(s) ? s : [])
    setLoading(false)
  }

  useEffect(() => { loadAll() }, [])

  async function saveEdit(endpoint: string) {
    setSaving(true)
    await fetch(endpoint, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editData) })
    setSaving(false)
    setEditando(null)
    loadAll()
  }

  async function addMulher() {
    if (!newMulher.nome) return
    await fetch('/api/performance/solange/mulheres', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newMulher, status: 'contato_feito' }) })
    setNewMulher({ nome: '', whatsapp: '', email: '', quem_contatou: '', obs: '' })
    setShowAddMulher(false)
    loadAll()
  }

  async function addInflu() {
    if (!newInflu.nome) return
    await fetch('/api/performance/solange/influenciadores', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newInflu, status: 'chamado' }) })
    setNewInflu({ nome: '', perfil: '', seguidores: '', nicho: '' })
    setShowAddInflu(false)
    loadAll()
  }

  async function addStory() {
    if (!newStory.acao || !newStory.semana) return
    await fetch('/api/performance/solange/stories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newStory, status: 'planejado' }) })
    setNewStory({ semana: '', acao: '', descricao: '' })
    setShowAddStory(false)
    loadAll()
  }

  // Funil mulheres
  const total = mulheres.length
  const contatoFeito = mulheres.filter(m => m.status === 'contato_feito').length
  const followup = mulheres.filter(m => m.status === 'followup').length
  const teste14 = mulheres.filter(m => m.status === 'teste_14').length
  const comprou = mulheres.filter(m => m.status === 'comprou').length
  const perdeu = mulheres.filter(m => m.status === 'perdeu').length
  const receitaRealizada = comprou * PRECO_COMUNIDADE
  const receitaPotencial = teste14 * PRECO_COMUNIDADE

  // Funil influenciadores
  const totalInflu = influenciadores.length
  const influFunil = STATUS_INFLUENCIADOR.map(s => ({ ...s, count: influenciadores.filter(i => i.status === s.value).length }))

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">✨</span>
          <div>
            <h1 className="text-2xl font-black text-white">Solange</h1>
            <p className="text-xs text-zinc-400">Projetos em andamento — Maessa</p>
          </div>
        </div>
        <span className="ml-auto text-xs px-2 py-1 rounded-full bg-pink-500/20 text-pink-300">✏️ Maessa</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t ? 'text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
            style={tab === t ? { background: 'linear-gradient(135deg,#6c3de8,#ec4899)' } : {}}>
            {t}
          </button>
        ))}
      </div>

      {loading && <div className="text-zinc-500 text-sm">Carregando...</div>}

      {/* ── Funil Mulheres ───────────────────────────────────────────────────── */}
      {!loading && tab === 'Funil Mulheres' && (
        <div className="space-y-5">
          {/* Funil visual */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <FunnelCard label="Contato Feito" count={contatoFeito} total={total} color="text-zinc-300" />
            <FunnelCard label="Follow-up" count={followup} total={total} color="text-blue-400" />
            <FunnelCard label="Teste 14 dias" count={teste14} total={total} color="text-yellow-400" receita={receitaPotencial} />
            <FunnelCard label="Comprou Comunidade" count={comprou} total={total} color="text-green-400" receita={receitaRealizada} />
            <FunnelCard label="Perdeu" count={perdeu} total={total} color="text-red-400" />
          </div>

          {/* Receita */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="glass rounded-2xl p-4">
              <p className="text-xs text-zinc-400">Total na base</p>
              <p className="text-2xl font-black text-white">{total} mulheres</p>
            </div>
            <div className="glass rounded-2xl p-4">
              <p className="text-xs text-zinc-400">Receita Realizada</p>
              <p className="text-2xl font-black text-green-400">R$ {receitaRealizada.toLocaleString('pt-BR')}</p>
              <p className="text-xs text-zinc-500">{comprou} × R$ 697</p>
            </div>
            <div className="glass rounded-2xl p-4">
              <p className="text-xs text-zinc-400">Receita Potencial (teste)</p>
              <p className="text-2xl font-black text-yellow-400">R$ {receitaPotencial.toLocaleString('pt-BR')}</p>
              <p className="text-xs text-zinc-500">{teste14} em teste × R$ 697</p>
            </div>
          </div>

          {/* Lista */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white">Lista de Mulheres</h2>
              <button onClick={() => setShowAddMulher(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white"
                style={{ background: 'linear-gradient(135deg,#6c3de8,#ec4899)' }}>
                + Adicionar
              </button>
            </div>

            {showAddMulher && (
              <div className="mb-4 p-4 bg-white/5 rounded-xl grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  ['Nome *', 'nome', newMulher.nome],
                  ['WhatsApp', 'whatsapp', newMulher.whatsapp],
                  ['E-mail', 'email', newMulher.email],
                  ['Quem contatou', 'quem_contatou', newMulher.quem_contatou],
                  ['Obs', 'obs', newMulher.obs],
                ].map(([label, key, val]) => (
                  <div key={key as string}>
                    <p className="text-xs text-zinc-400 mb-1">{label}</p>
                    <input value={val as string} onChange={e => setNewMulher(p => ({ ...p, [key as string]: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-purple-500" />
                  </div>
                ))}
                <div className="col-span-full flex gap-2 mt-1">
                  <button onClick={addMulher} className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white" style={{ background: 'linear-gradient(135deg,#6c3de8,#ec4899)' }}>Salvar</button>
                  <button onClick={() => setShowAddMulher(false)} className="px-4 py-1.5 rounded-xl text-xs text-zinc-400 bg-white/5">Cancelar</button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 text-xs">
                    <th className="text-left py-2 pr-3">Nome</th>
                    <th className="text-left py-2 px-2">WhatsApp</th>
                    <th className="text-left py-2 px-2">E-mail</th>
                    <th className="text-left py-2 px-2">Quem contatou</th>
                    <th className="text-left py-2 px-2">Status</th>
                    <th className="text-left py-2 px-2">Follow-up</th>
                    <th className="text-left py-2 pl-2">Obs</th>
                  </tr>
                </thead>
                <tbody>
                  {mulheres.map(m => (
                    <tr key={m.id} className="border-b border-white/5 hover:bg-white/2 cursor-pointer" onClick={() => { setEditando(m.id); setEditData({ id: m.id, status: m.status, followup: m.followup || '', obs: m.obs || '' }) }}>
                      <td className="py-2 pr-3 text-white font-medium">{m.nome}</td>
                      <td className="py-2 px-2 text-zinc-400 text-xs">{m.whatsapp || '—'}</td>
                      <td className="py-2 px-2 text-zinc-400 text-xs">{m.email || '—'}</td>
                      <td className="py-2 px-2 text-zinc-300 text-xs">{m.quem_contatou || '—'}</td>
                      <td className="py-2 px-2">
                        {editando === m.id
                          ? <select value={editData.status} onChange={e => setEditData((p: any) => ({ ...p, status: e.target.value }))}
                              className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-xs" onClick={e => e.stopPropagation()}>
                              {STATUS_MULHER.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                          : <StatusBadge value={m.status} options={STATUS_MULHER} />}
                      </td>
                      <td className="py-2 px-2">
                        {editando === m.id
                          ? <input value={editData.followup} onChange={e => setEditData((p: any) => ({ ...p, followup: e.target.value }))}
                              onClick={e => e.stopPropagation()}
                              className="w-32 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-xs focus:outline-none" placeholder="nota..." />
                          : <span className="text-zinc-400 text-xs">{m.followup || '—'}</span>}
                      </td>
                      <td className="py-2 pl-2">
                        {editando === m.id
                          ? <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                              <input value={editData.obs} onChange={e => setEditData((p: any) => ({ ...p, obs: e.target.value }))}
                                className="w-28 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-xs focus:outline-none" placeholder="obs..." />
                              <button onClick={e => { e.stopPropagation(); saveEdit('/api/performance/solange/mulheres') }}
                                className="px-2 py-1 rounded-lg text-xs text-white bg-purple-600 hover:bg-purple-500" disabled={saving}>
                                {saving ? '...' : '✓'}
                              </button>
                              <button onClick={e => { e.stopPropagation(); setEditando(null) }}
                                className="px-2 py-1 rounded-lg text-xs text-zinc-400 bg-white/5">✕</button>
                            </div>
                          : <span className="text-zinc-500 text-xs">{m.obs || '—'}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Influenciadores ──────────────────────────────────────────────────── */}
      {!loading && tab === 'Influenciadores' && (
        <div className="space-y-5">
          {/* Funil */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {influFunil.map(s => (
              <div key={s.value} className="glass rounded-2xl p-4">
                <p className="text-xs text-zinc-400 mb-1">{s.label}</p>
                <p className="text-2xl font-black text-white">{s.count}</p>
                <p className="text-xs text-zinc-500">{totalInflu > 0 ? Math.round((s.count / totalInflu) * 100) : 0}%</p>
              </div>
            ))}
          </div>

          {/* Lista */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white">Influenciadores</h2>
              <button onClick={() => setShowAddInflu(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white"
                style={{ background: 'linear-gradient(135deg,#6c3de8,#ec4899)' }}>
                + Adicionar
              </button>
            </div>

            {showAddInflu && (
              <div className="mb-4 p-4 bg-white/5 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  ['Nome *', 'nome', newInflu.nome],
                  ['@ Perfil', 'perfil', newInflu.perfil],
                  ['Seguidores', 'seguidores', newInflu.seguidores],
                  ['Nicho', 'nicho', newInflu.nicho],
                ].map(([label, key, val]) => (
                  <div key={key as string}>
                    <p className="text-xs text-zinc-400 mb-1">{label}</p>
                    <input value={val as string} onChange={e => setNewInflu(p => ({ ...p, [key as string]: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-purple-500" />
                  </div>
                ))}
                <div className="col-span-full flex gap-2 mt-1">
                  <button onClick={addInflu} className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white" style={{ background: 'linear-gradient(135deg,#6c3de8,#ec4899)' }}>Salvar</button>
                  <button onClick={() => setShowAddInflu(false)} className="px-4 py-1.5 rounded-xl text-xs text-zinc-400 bg-white/5">Cancelar</button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 text-xs">
                    <th className="text-left py-2 pr-3">Nome</th>
                    <th className="text-left py-2 px-2">@ Perfil</th>
                    <th className="text-left py-2 px-2">Seguidores</th>
                    <th className="text-left py-2 px-2">Nicho</th>
                    <th className="text-left py-2 px-2">Status</th>
                    <th className="text-left py-2 pl-2">Obs</th>
                  </tr>
                </thead>
                <tbody>
                  {influenciadores.length === 0 && (
                    <tr><td colSpan={6} className="py-8 text-center text-zinc-500 text-sm">Nenhum influenciador cadastrado ainda.</td></tr>
                  )}
                  {influenciadores.map(inf => (
                    <tr key={inf.id} className="border-b border-white/5 hover:bg-white/2 cursor-pointer"
                      onClick={() => { setEditando(inf.id); setEditData({ id: inf.id, status: inf.status, obs: inf.obs || '', perfil: inf.perfil || '', seguidores: inf.seguidores || '', nicho: inf.nicho || '' }) }}>
                      <td className="py-2 pr-3 text-white font-medium">{inf.nome}</td>
                      <td className="py-2 px-2 text-zinc-400 text-xs">{inf.perfil || '—'}</td>
                      <td className="py-2 px-2 text-zinc-300 text-xs">{inf.seguidores || '—'}</td>
                      <td className="py-2 px-2 text-zinc-400 text-xs">{inf.nicho || '—'}</td>
                      <td className="py-2 px-2">
                        {editando === inf.id
                          ? <select value={editData.status} onChange={e => setEditData((p: any) => ({ ...p, status: e.target.value }))}
                              className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-xs" onClick={e => e.stopPropagation()}>
                              {STATUS_INFLUENCIADOR.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                          : <StatusBadge value={inf.status} options={STATUS_INFLUENCIADOR} />}
                      </td>
                      <td className="py-2 pl-2">
                        {editando === inf.id
                          ? <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                              <input value={editData.obs} onChange={e => setEditData((p: any) => ({ ...p, obs: e.target.value }))}
                                className="w-28 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-xs focus:outline-none" placeholder="obs..." />
                              <button onClick={e => { e.stopPropagation(); saveEdit('/api/performance/solange/influenciadores') }}
                                className="px-2 py-1 rounded-lg text-xs text-white bg-purple-600 hover:bg-purple-500" disabled={saving}>
                                {saving ? '...' : '✓'}
                              </button>
                              <button onClick={e => { e.stopPropagation(); setEditando(null) }}
                                className="px-2 py-1 rounded-lg text-xs text-zinc-400 bg-white/5">✕</button>
                            </div>
                          : <span className="text-zinc-500 text-xs">{inf.obs || '—'}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Stories ──────────────────────────────────────────────────────────── */}
      {!loading && tab === 'Stories' && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <div className="glass rounded-2xl p-4">
              <p className="text-xs text-zinc-400">Total de ações</p>
              <p className="text-2xl font-black text-white">{stories.length}</p>
            </div>
            <div className="glass rounded-2xl p-4">
              <p className="text-xs text-zinc-400">Publicadas</p>
              <p className="text-2xl font-black text-green-400">{stories.filter(s => s.status === 'publicado').length}</p>
            </div>
            <div className="glass rounded-2xl p-4">
              <p className="text-xs text-zinc-400">Alcance Total</p>
              <p className="text-2xl font-black text-purple-400">{stories.reduce((a, s) => a + (s.alcance || 0), 0).toLocaleString('pt-BR')}</p>
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white">Ações nos Stories</h2>
              <button onClick={() => setShowAddStory(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white"
                style={{ background: 'linear-gradient(135deg,#6c3de8,#ec4899)' }}>
                + Adicionar
              </button>
            </div>

            {showAddStory && (
              <div className="mb-4 p-4 bg-white/5 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-2">
                {[
                  ['Semana (ex: 07/07-13/07) *', 'semana', newStory.semana],
                  ['Ação *', 'acao', newStory.acao],
                  ['Descrição', 'descricao', newStory.descricao],
                ].map(([label, key, val]) => (
                  <div key={key as string}>
                    <p className="text-xs text-zinc-400 mb-1">{label}</p>
                    <input value={val as string} onChange={e => setNewStory(p => ({ ...p, [key as string]: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-purple-500" />
                  </div>
                ))}
                <div className="col-span-full flex gap-2 mt-1">
                  <button onClick={addStory} className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white" style={{ background: 'linear-gradient(135deg,#6c3de8,#ec4899)' }}>Salvar</button>
                  <button onClick={() => setShowAddStory(false)} className="px-4 py-1.5 rounded-xl text-xs text-zinc-400 bg-white/5">Cancelar</button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[650px]">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 text-xs">
                    <th className="text-left py-2 pr-3">Semana</th>
                    <th className="text-left py-2 px-2">Ação</th>
                    <th className="text-left py-2 px-2">Descrição</th>
                    <th className="text-right py-2 px-2">Alcance</th>
                    <th className="text-right py-2 px-2">Cliques</th>
                    <th className="text-right py-2 px-2">Respostas</th>
                    <th className="text-left py-2 pl-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stories.length === 0 && (
                    <tr><td colSpan={7} className="py-8 text-center text-zinc-500 text-sm">Nenhuma ação registrada ainda.</td></tr>
                  )}
                  {stories.map(s => (
                    <tr key={s.id} className="border-b border-white/5 hover:bg-white/2 cursor-pointer"
                      onClick={() => { setEditando(s.id); setEditData({ id: s.id, status: s.status, alcance: s.alcance || 0, cliques: s.cliques || 0, respostas: s.respostas || 0, descricao: s.descricao || '' }) }}>
                      <td className="py-2 pr-3 text-zinc-300 text-xs">{s.semana}</td>
                      <td className="py-2 px-2 text-white font-medium">{s.acao}</td>
                      <td className="py-2 px-2 text-zinc-400 text-xs">{s.descricao || '—'}</td>
                      <td className="py-2 px-2 text-right">
                        {editando === s.id
                          ? <input type="number" value={editData.alcance} onChange={e => setEditData((p: any) => ({ ...p, alcance: e.target.value }))}
                              onClick={e => e.stopPropagation()}
                              className="w-20 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-xs text-right focus:outline-none" />
                          : <span className="text-purple-300 font-semibold">{(s.alcance || 0).toLocaleString('pt-BR')}</span>}
                      </td>
                      <td className="py-2 px-2 text-right">
                        {editando === s.id
                          ? <input type="number" value={editData.cliques} onChange={e => setEditData((p: any) => ({ ...p, cliques: e.target.value }))}
                              onClick={e => e.stopPropagation()}
                              className="w-20 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-xs text-right focus:outline-none" />
                          : <span className="text-blue-300">{(s.cliques || 0).toLocaleString('pt-BR')}</span>}
                      </td>
                      <td className="py-2 px-2 text-right">
                        {editando === s.id
                          ? <input type="number" value={editData.respostas} onChange={e => setEditData((p: any) => ({ ...p, respostas: e.target.value }))}
                              onClick={e => e.stopPropagation()}
                              className="w-20 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-xs text-right focus:outline-none" />
                          : <span className="text-green-300">{(s.respostas || 0).toLocaleString('pt-BR')}</span>}
                      </td>
                      <td className="py-2 pl-2">
                        {editando === s.id
                          ? <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                              <select value={editData.status} onChange={e => setEditData((p: any) => ({ ...p, status: e.target.value }))}
                                className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-xs">
                                {STATUS_STORY.map(st => <option key={st.value} value={st.value}>{st.label}</option>)}
                              </select>
                              <button onClick={e => { e.stopPropagation(); saveEdit('/api/performance/solange/stories') }}
                                className="px-2 py-1 rounded-lg text-xs text-white bg-purple-600 hover:bg-purple-500" disabled={saving}>
                                {saving ? '...' : '✓'}
                              </button>
                              <button onClick={e => { e.stopPropagation(); setEditando(null) }}
                                className="px-2 py-1 rounded-lg text-xs text-zinc-400 bg-white/5">✕</button>
                            </div>
                          : <StatusBadge value={s.status} options={STATUS_STORY} />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
