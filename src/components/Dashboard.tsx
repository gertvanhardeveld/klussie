import { useState } from 'react'
import type { Member } from '../types'
import MyChores from './MyChores'
import AvailableChores from './AvailableChores'
import Scoreboard from './Scoreboard'
import AdminPanel from './AdminPanel'
import AdminPin from './AdminPin'

type Props = {
  member: Member
  members: Member[]
  onLogout: () => void
}

type Screen = 'home' | 'my' | 'available' | 'score' | 'adminPin' | 'admin'

export default function Dashboard({ member, members, onLogout }: Props) {
  const [screen, setScreen] = useState<Screen>('home')

  if (screen === 'my') return <MyChores member={member} onBack={() => setScreen('home')} />
  if (screen === 'available') return <AvailableChores member={member} onBack={() => setScreen('home')} />
  if (screen === 'score') return <Scoreboard members={members} onBack={() => setScreen('home')} />
  if (screen === 'adminPin') return <AdminPin onSuccess={() => setScreen('admin')} onBack={() => setScreen('home')} />
  if (screen === 'admin') return <AdminPanel members={members} onBack={() => setScreen('home')} />

  return (
    <div className="min-h-screen bg-amber-50 p-4 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-8 pt-2">
        <div>
          <h1 className="text-2xl font-bold text-amber-800">🧹 Klussie</h1>
          <p className="text-amber-600 text-sm">Hoi, {member.name}!</p>
        </div>
        <button onClick={onLogout} className="text-sm text-amber-500 underline">Wissel</button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <NavCard
          icon="📋"
          title="Mijn klussen"
          subtitle="Jouw toegewezen taken"
          color="bg-white"
          onClick={() => setScreen('my')}
        />
        <NavCard
          icon="🙋"
          title="Beschikbaar"
          subtitle="Claim een klusje"
          color="bg-white"
          onClick={() => setScreen('available')}
        />
        <NavCard
          icon="🏆"
          title="Scoreboard"
          subtitle="Wie doet het meest?"
          color="bg-white"
          onClick={() => setScreen('score')}
        />
        {member.is_admin && (
          <NavCard
            icon="⚙️"
            title="Beheer"
            subtitle="Klussen en verdeling"
            color="bg-purple-50"
            onClick={() => setScreen('adminPin')}
          />
        )}
      </div>
    </div>
  )
}

function NavCard({ icon, title, subtitle, color, onClick }: {
  icon: string; title: string; subtitle: string; color: string; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`${color} rounded-2xl p-5 text-left shadow-sm active:scale-95 transition-transform`}
    >
      <div className="text-3xl mb-2">{icon}</div>
      <p className="font-semibold text-gray-800">{title}</p>
      <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
    </button>
  )
}
