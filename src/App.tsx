import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { Member } from './types'
import SelectMember from './components/SelectMember'
import Dashboard from './components/Dashboard'

export default function App() {
  const [members, setMembers] = useState<Member[]>([])
  const [currentMember, setCurrentMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('members').select('*').order('name').then(({ data }) => {
      setMembers(data ?? [])
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <p className="text-amber-500 text-lg">Laden…</p>
      </div>
    )
  }

  if (!currentMember) {
    return <SelectMember members={members} onSelect={setCurrentMember} />
  }

  return (
    <Dashboard
      member={currentMember}
      members={members}
      onLogout={() => setCurrentMember(null)}
    />
  )
}
