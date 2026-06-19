import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import type { Member } from '../types'
import { currentPeriod, formatPeriod } from '../lib/week'

type Props = {
  members: Member[]
  onBack: () => void
}

type ChoreEntry = {
  name: string
  duration_minutes: number
  completed_at: string | null
}

type MemberScore = {
  member: Member
  minutes: number
  chores: ChoreEntry[]
  expanded: boolean
}

const COLORS = ['bg-pink-300', 'bg-purple-300', 'bg-blue-300', 'bg-green-300', 'bg-yellow-300']

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
}

export default function Scoreboard({ members, onBack }: Props) {
  const [scores, setScores] = useState<MemberScore[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState(currentPeriod())
  const [tab, setTab] = useState<'tijd' | 'aantal'>('tijd')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('chore_assignments')
        .select('member_id, completed, completed_at, chore:chores(name, duration_minutes)')
        .eq('week', period)
        .eq('completed', true)

      const map: Record<string, ChoreEntry[]> = {}
      for (const a of data ?? []) {
        if (!a.member_id) continue
        const chore = (a.chore as unknown) as { name: string; duration_minutes: number } | null
        if (!map[a.member_id]) map[a.member_id] = []
        map[a.member_id].push({
          name: chore?.name ?? '?',
          duration_minutes: chore?.duration_minutes ?? 0,
          completed_at: a.completed_at,
        })
      }

      const result: MemberScore[] = members.map(m => ({
        member: m,
        minutes: (map[m.id] ?? []).reduce((s, c) => s + c.duration_minutes, 0),
        chores: (map[m.id] ?? []).sort((a, b) =>
          (a.completed_at ?? '').localeCompare(b.completed_at ?? '')
        ),
        expanded: false,
      }))
      result.sort((a, b) => b.minutes - a.minutes)
      setScores(result)
      setLoading(false)
    }
    load()
  }, [members, period])

  function toggle(id: string) {
    setScores(s => s.map(m => m.member.id === id ? { ...m, expanded: !m.expanded } : m))
  }

  const sorted = [...scores].sort((a, b) =>
    tab === 'tijd' ? b.minutes - a.minutes : b.chores.length - a.chores.length
  )
  const maxMin = Math.max(...scores.map(s => s.minutes), 1)
  const maxCount = Math.max(...scores.map(s => s.chores.length), 1)

  // build list of past 12 months for selector
  const months: string[] = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  return (
    <div className="min-h-screen bg-amber-50 p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-amber-600 text-2xl">←</button>
        <h1 className="text-xl font-bold text-amber-800">Scoreboard</h1>
      </div>

      <select
        value={period}
        onChange={e => setPeriod(e.target.value)}
        className="w-full border border-amber-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white mb-4"
      >
        {months.map(m => (
          <option key={m} value={m}>{formatPeriod(m)}</option>
        ))}
      </select>

      <div className="flex bg-white rounded-xl p-1 mb-5 shadow-sm">
        {(['tijd', 'aantal'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? 'bg-amber-400 text-white' : 'text-gray-500'
            }`}
          >
            {t === 'tijd' ? '⏱ Tijd (min)' : '📋 Aantal klussen'}
          </button>
        ))}
      </div>

      {loading && <p className="text-center text-amber-600">Laden…</p>}

      <ul className="space-y-3">
        {sorted.map((s, i) => (
          <li key={s.member.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <button
              className="w-full p-4 text-left"
              onClick={() => toggle(s.member.id)}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-800">
                  {i === 0 && (tab === 'tijd' ? s.minutes > 0 : s.chores.length > 0) ? '🏆 ' : ''}{s.member.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">
                    {tab === 'tijd' ? `${s.minutes} min` : `${s.chores.length} klussen`}
                  </span>
                  <span className="text-gray-400 text-xs">{s.expanded ? '▲' : '▼'}</span>
                </div>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${COLORS[i % COLORS.length]}`}
                  style={{ width: `${tab === 'tijd' ? (s.minutes / maxMin) * 100 : (s.chores.length / maxCount) * 100}%` }}
                />
              </div>
            </button>

            {s.expanded && (
              <div className="px-4 pb-4 border-t border-gray-50">
                {s.chores.length === 0 ? (
                  <p className="text-sm text-gray-400 py-2">Nog geen klussen gedaan</p>
                ) : (
                  <ul className="space-y-1 pt-2">
                    {s.chores.map((c, j) => (
                      <li key={j} className="flex justify-between text-sm">
                        <span className="text-gray-700">{c.name}</span>
                        <span className="text-gray-400 ml-4 whitespace-nowrap">
                          {c.duration_minutes} min
                          {c.completed_at ? ` · ${formatDate(c.completed_at)}` : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
