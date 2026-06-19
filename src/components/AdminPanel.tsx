import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import type { Chore, ChoreAssignment, Member } from '../types'
import { currentPeriod } from '../lib/week'

type Props = {
  members: Member[]
  onBack: () => void
}

type Screen = 'menu' | 'chores' | 'assign' | 'addChore'

export default function AdminPanel({ members, onBack }: Props) {
  const [screen, setScreen] = useState<Screen>('menu')
  const [chores, setChores] = useState<Chore[]>([])
  const [assignments, setAssignments] = useState<ChoreAssignment[]>([])

  // new chore form
  const [name, setName] = useState('')
  const [duration, setDuration] = useState('15')
  const [category, setCategory] = useState<'vast' | 'extra'>('vast')

  async function loadChores() {
    const { data } = await supabase.from('chores').select('*').order('name')
    setChores(data ?? [])
  }

  async function loadAssignments() {
    const { data } = await supabase
      .from('chore_assignments')
      .select('*, chore:chores(*), member:members(*)')
      .eq('week', currentPeriod())
    setAssignments(data ?? [])
  }

  useEffect(() => {
    loadChores()
    loadAssignments()
  }, [])

  async function addChore() {
    if (!name.trim()) return
    await supabase.from('chores').insert({ name: name.trim(), duration_minutes: parseInt(duration), category })
    setName(''); setDuration('15'); setCategory('vast')
    loadChores()
    setScreen('chores')
  }

  async function deleteChore(id: string) {
    await supabase.from('chores').delete().eq('id', id)
    loadChores()
  }

  async function assign(choreId: string, memberId: string) {
    const existing = assignments.find(a => a.chore_id === choreId)
    if (existing) {
      await supabase.from('chore_assignments').update({ member_id: memberId }).eq('id', existing.id)
    } else {
      await supabase.from('chore_assignments').insert({
        chore_id: choreId,
        member_id: memberId,
        assigned_by: 'admin',
        completed: false,
        week: currentPeriod(),
      })
    }
    loadAssignments()
  }

  async function resetWeek() {
    if (!confirm('Weet je zeker dat je alle klussen van deze maand wilt resetten? Dit kan niet ongedaan worden gemaakt.')) return
    await supabase.from('chore_assignments').delete().eq('week', currentPeriod())
    loadAssignments()
  }

  return (
    <div className="min-h-screen bg-purple-50 p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={screen === 'menu' ? onBack : () => setScreen('menu')} className="text-purple-600 text-2xl">←</button>
        <h1 className="text-xl font-bold text-purple-800">
          {screen === 'menu' && 'Beheer'}
          {screen === 'chores' && 'Klusjes beheren'}
          {screen === 'assign' && 'Toewijzen'}
          {screen === 'addChore' && 'Nieuw klusje'}
        </h1>
      </div>

      {screen === 'menu' && (
        <div className="space-y-3">
          <MenuBtn icon="📋" label="Klusjes beheren" onClick={() => setScreen('chores')} />
          <MenuBtn icon="👤" label="Klussen toewijzen" onClick={() => setScreen('assign')} />
          <MenuBtn icon="🗑️" label="Maand resetten" onClick={resetWeek} danger />
        </div>
      )}

      {screen === 'chores' && (
        <div>
          <button
            onClick={() => setScreen('addChore')}
            className="w-full bg-purple-500 text-white rounded-xl p-3 font-semibold mb-4"
          >
            + Nieuw klusje
          </button>
          <ul className="space-y-2">
            {chores.map(c => (
              <li key={c.id} className="bg-white rounded-xl p-4 flex justify-between items-center shadow-sm">
                <div>
                  <p className="font-medium text-gray-800">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.duration_minutes} min · {c.category}</p>
                </div>
                <button onClick={() => deleteChore(c.id)} className="text-red-400 text-xl">✕</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {screen === 'addChore' && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-purple-700 block mb-1">Naam</label>
            <input
              className="w-full border rounded-xl p-3 text-gray-800"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="bijv. Stofzuigen"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-purple-700 block mb-1">Tijdsduur (minuten)</label>
            <input
              type="number"
              className="w-full border rounded-xl p-3 text-gray-800"
              value={duration}
              onChange={e => setDuration(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-purple-700 block mb-1">Categorie</label>
            <select
              className="w-full border rounded-xl p-3 text-gray-800"
              value={category}
              onChange={e => setCategory(e.target.value as 'vast' | 'extra')}
            >
              <option value="vast">Vast (wekelijks)</option>
              <option value="extra">Extra (eenmalig)</option>
            </select>
          </div>
          <button
            onClick={addChore}
            className="w-full bg-purple-500 text-white rounded-xl p-3 font-semibold"
          >
            Opslaan
          </button>
        </div>
      )}

      {screen === 'assign' && (
        <div className="space-y-4">
          {chores.map(c => {
            const current = assignments.find(a => a.chore_id === c.id)
            return (
              <div key={c.id} className="bg-white rounded-xl p-4 shadow-sm">
                <p className="font-medium text-gray-800 mb-2">{c.name} <span className="text-xs text-gray-400">({c.duration_minutes} min)</span></p>
                <div className="flex flex-wrap gap-2">
                  {members.map(m => (
                    <button
                      key={m.id}
                      onClick={() => assign(c.id, m.id)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        current?.member_id === m.id
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-purple-100'
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function MenuBtn({ icon, label, onClick, danger }: { icon: string; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 rounded-xl p-4 font-medium shadow-sm ${
        danger ? 'bg-red-50 text-red-600' : 'bg-white text-gray-800'
      }`}
    >
      <span className="text-2xl">{icon}</span>
      {label}
    </button>
  )
}
