import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import type { ChoreAssignment, Member } from '../types'
import { currentPeriod } from '../lib/week'

type Props = {
  member: Member
  onBack: () => void
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function MyChores({ member, onBack }: Props) {
  const [assignments, setAssignments] = useState<ChoreAssignment[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const { data } = await supabase
      .from('chore_assignments')
      .select('*, chore:chores(*)')
      .eq('member_id', member.id)
      .eq('week', currentPeriod())
      .order('completed', { ascending: true })
    setAssignments(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function markDone(a: ChoreAssignment, dateStr: string) {
    const completed_at = new Date(dateStr).toISOString()
    await supabase
      .from('chore_assignments')
      .update({ completed: true, completed_at })
      .eq('id', a.id)
    load()
  }

  async function markUndone(a: ChoreAssignment) {
    await supabase
      .from('chore_assignments')
      .update({ completed: false, completed_at: null })
      .eq('id', a.id)
    load()
  }

  const done = assignments.filter(a => a.completed)
  const todo = assignments.filter(a => !a.completed)
  const totalMin = done.reduce((s, a) => s + (a.chore?.duration_minutes ?? 0), 0)

  const todayValue = new Date().toISOString().slice(0, 16)

  return (
    <div className="min-h-screen bg-amber-50 p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-amber-600 text-2xl">←</button>
        <div>
          <h1 className="text-xl font-bold text-amber-800">Mijn klussen</h1>
          <p className="text-sm text-amber-600">{member.name} · {totalMin} min gedaan deze maand</p>
        </div>
      </div>

      {loading && <p className="text-center text-amber-600">Laden…</p>}

      {!loading && todo.length === 0 && done.length === 0 && (
        <div className="text-center py-16 text-amber-500">
          <div className="text-5xl mb-3">🎉</div>
          <p>Geen klussen toegewezen</p>
        </div>
      )}

      {todo.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-amber-700 uppercase tracking-wide mb-3">Te doen</h2>
          <ul className="space-y-3">
            {todo.map(a => (
              <li key={a.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="mb-3">
                  <p className="font-medium text-gray-800">{a.chore?.name}</p>
                  <p className="text-xs text-gray-400">{a.chore?.duration_minutes} min · {a.chore?.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="datetime-local"
                    defaultValue={todayValue}
                    id={`date-${a.id}`}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-gray-50"
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById(`date-${a.id}`) as HTMLInputElement
                      if (input?.value) markDone(a, input.value)
                    }}
                    className="bg-amber-400 text-white rounded-lg px-4 py-2 text-sm font-medium active:scale-95 transition-transform whitespace-nowrap"
                  >
                    Gedaan ✓
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {done.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-green-600 uppercase tracking-wide mb-3">Gedaan ✓</h2>
          <ul className="space-y-2">
            {done.map(a => (
              <li key={a.id} className="bg-green-50 rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-500 line-through">{a.chore?.name}</p>
                    <p className="text-xs text-green-600 mt-1">
                      ✓ {a.completed_at ? formatDate(a.completed_at) : 'Gedaan'}
                    </p>
                  </div>
                  <button
                    onClick={() => markUndone(a)}
                    className="text-xs text-gray-400 underline ml-4 mt-1"
                  >
                    Ongedaan
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
