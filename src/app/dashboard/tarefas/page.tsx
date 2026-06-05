'use client'
import { useEffect, useState } from 'react'

const COLUMNS = [
  { id: 'todo', label: 'A Fazer', color: 'text-zinc-400' },
  { id: 'in_progress', label: 'Em Andamento', color: 'text-blue-400' },
  { id: 'review', label: 'Em Revisão', color: 'text-yellow-400' },
  { id: 'done', label: 'Concluído', color: 'text-green-400' },
]

const emptyForm = { title: '', description: '', status: 'todo', priority: 'media', assigned_to: '', client_id: '', due_date: '' }

export default function TarefasPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [form, setForm] = useState({ ...emptyForm })
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)

  async function load() {
    const [t, u, c] = await Promise.all([
      fetch('/api/tasks').then(r => r.json()),
      fetch('/api/users/list').then(r => r.json()),
      fetch('/api/clients').then(r => r.json()),
    ])
    setTasks(Array.isArray(t) ? t : [])
    setUsers(Array.isArray(u) ? u : [])
    setClients(Array.isArray(c) ? c : [])
  }
  useEffect(() => { load() }, [])

  async function save() {
    const method = editId ? 'PUT' : 'POST'
    const body = editId ? { ...form, id: editId } : form
    await fetch('/api/tasks', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setForm({ ...emptyForm }); setShowForm(false); setEditId(null); load()
  }

  async function moveTask(id: number, status: string) {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    await fetch('/api/tasks', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...task, id, status }) })
    load()
  }

  async function remove(id: number) {
    if (!confirm('Excluir tarefa?')) return
    await fetch('/api/tasks', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    load()
  }

  const priorityColor = (p: string) => p === 'alta' ? 'text-red-400 bg-red-500/10' : p === 'media' ? 'text-yellow-400 bg-yellow-500/10' : 'text-green-400 bg-green-500/10'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white">✅ Tarefas</h1>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ ...emptyForm }) }}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #6c3de8, #ec4899)' }}>
          + Nova Tarefa
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="glass rounded-2xl p-6 w-full max-w-lg">
            <h2 className="font-bold text-white mb-4">{editId ? 'Editar' : 'Nova'} Tarefa</h2>
            <div className="space-y-3">
              <input placeholder="Título *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm" />
              <textarea placeholder="Descrição" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm" rows={2} />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm">
                  {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
                <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm">
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
              <select value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm">
                <option value="">Sem responsável</option>
                {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              <select value={form.client_id} onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm">
                <option value="">Sem cliente</option>
                {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm" />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={save} className="flex-1 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #6c3de8, #ec4899)' }}>Salvar</button>
              <button onClick={() => { setShowForm(false); setEditId(null) }} className="px-4 py-2 rounded-xl text-sm text-zinc-400 hover:text-white bg-white/5">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        {COLUMNS.map(col => (
          <div key={col.id} className="glass rounded-2xl p-4">
            <h2 className={`font-bold text-sm mb-4 ${col.color}`}>{col.label} ({tasks.filter(t => t.status === col.id).length})</h2>
            <div className="space-y-3">
              {tasks.filter(t => t.status === col.id).map(task => (
                <div key={task.id} className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <p className="text-white text-sm font-medium mb-1">{task.title}</p>
                  {task.client_name && <p className="text-xs text-zinc-500 mb-1">👥 {task.client_name}</p>}
                  {task.assigned_name && <p className="text-xs text-zinc-500 mb-1">👤 {task.assigned_name}</p>}
                  {task.due_date && <p className="text-xs text-zinc-500 mb-2">📅 {new Date(task.due_date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${priorityColor(task.priority)}`}>{task.priority}</span>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditId(task.id); setForm({ title: task.title, description: task.description || '', status: task.status, priority: task.priority, assigned_to: task.assigned_to || '', client_id: task.client_id || '', due_date: task.due_date || '' }); setShowForm(true) }} className="text-xs text-zinc-500 hover:text-white">✏️</button>
                      <button onClick={() => remove(task.id)} className="text-xs text-zinc-500 hover:text-red-400">🗑️</button>
                    </div>
                  </div>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {COLUMNS.filter(c => c.id !== col.id).map(c => (
                      <button key={c.id} onClick={() => moveTask(task.id, c.id)} className={`text-xs px-2 py-0.5 rounded bg-white/5 ${c.color} hover:bg-white/10`}>→ {c.label}</button>
                    ))}
                  </div>
                </div>
              ))}
              {tasks.filter(t => t.status === col.id).length === 0 && <p className="text-zinc-600 text-xs text-center py-4">Vazio</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
