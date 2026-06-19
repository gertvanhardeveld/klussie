export type Member = {
  id: string
  name: string
  is_admin: boolean
  admin_pin?: string
}

export type Chore = {
  id: string
  name: string
  duration_minutes: number
  category: 'vast' | 'extra'
  frequency?: string
  created_at: string
}

export type ChoreAssignment = {
  id: string
  chore_id: string
  member_id: string | null
  assigned_by: string | null
  completed: boolean
  completed_at: string | null
  week: string
  chore?: Chore
  member?: Member
}
