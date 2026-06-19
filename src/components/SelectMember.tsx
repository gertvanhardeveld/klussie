import type { Member } from '../types'

type Props = {
  members: Member[]
  onSelect: (member: Member) => void
}

const COLORS = [
  'bg-pink-100 border-pink-300 text-pink-700',
  'bg-purple-100 border-purple-300 text-purple-700',
  'bg-blue-100 border-blue-300 text-blue-700',
  'bg-green-100 border-green-300 text-green-700',
  'bg-yellow-100 border-yellow-300 text-yellow-700',
]

export default function SelectMember({ members, onSelect }: Props) {
  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-6">
      <div className="text-6xl mb-4">🧹</div>
      <h1 className="text-3xl font-bold text-amber-800 mb-2">Klussie</h1>
      <p className="text-amber-600 mb-10">Wie ben jij?</p>
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {members.map((m, i) => (
          <button
            key={m.id}
            onClick={() => onSelect(m)}
            className={`border-2 rounded-2xl p-5 text-lg font-semibold flex flex-col items-center gap-2 transition-transform active:scale-95 ${COLORS[i % COLORS.length]}`}
          >
            <span className="text-3xl">{m.is_admin ? '👩' : '👧'}</span>
            {m.name}
          </button>
        ))}
      </div>
    </div>
  )
}
