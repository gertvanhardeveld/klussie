import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import type { Chore, ChoreAssignment, Member } from '../types'
import { currentPeriod } from '../lib/week'

type Props = {
  member: Member
  onBack: () => void
}

export default function AvailableChores({ member, onBack }: Props) {
  const [chores, setChores] = useState<Chore[]>([])
  const [claimCounts, setClaimCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  async function load() {
    const [{ data: allChores }, { data: assignments }] = await Promise.all([
      supabase.from('chores').select('*').order('name'),
      supabase.from('chore_assignments').select('chore_id').eq('week', currentPeriod()),
    ])
    setChores(allChores ?? [])
    const counts: Record<string, number> = {}
    for (const a of (assignments as ChoreAssignment[] ?? [])) {
      if (a.chore_id) counts[a.chore_id] = (counts[a.chore_id] ?? 0) + 1
    }
    setClaimCounts(counts)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function claim(chore: Chore) {
    await supabase.from('chore_assignments').insert({
      chore_id: chore.id,
      member_id: member.id,
      assigned_by: null,
      completed: false,
      week: currentPeriod(),
    })
    load()
  }

  return (
    <div className="min-h-screen bg-amber-50 p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-amber-600 text-2xl">←</button>
        <div>
          <h1 className="text-xl font-bold text-amber-800">Beschikbare klussen</h1>
          <p className="text-sm text-amber-600">Claim een klusje om te doen</p>
        </div>
      </div>

      {loading && <p className="text-center text-amber-600">Laden…</p>}

      {['vast', 'extra'].map(cat => {
        const items = chores.filter(c => c.category === cat)
        if (items.length === 0) return null
        return (
          <section key={cat} className="mb-6">
            <h2 className="text-sm font-semibold text-amber-700 uppercase tracking-wide mb-3">
              {cat === 'vast' ? '🔄 Vaste klussen' : '⭐ Extra klussen'}
            </h2>
            <ul className="space-y-2">
              {items.map(c => {
                const count = claimCounts[c.id] ?? 0
                return (
                  <li key={c.id} className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm">
                    <div>
                      <p className="font-medium text-gray-800">{c.name}</p>
                      <p className="text-xs text-gray-400">
                        {c.duration_minutes} min
                        {count > 0 && <span className="ml-2 text-amber-500">{count}× geclaimd</span>}
                      </p>
                    </div>
                    <button
                      onClick={() => claim(c)}
                      className="bg-amber-400 text-white rounded-full px-4 py-1 text-sm font-medium active:scale-95 transition-transform"
                    >
                      Claim
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
