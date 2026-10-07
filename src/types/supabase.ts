import type { ColumnId, Priority, SubTask } from './learning'

export interface ProfileRow {
  id: string
  name: string
  email: string
  avatar: string
  role: string
  target_role: string
  start_date: string
  bio?: string
  created_at: string
  updated_at: string
}

export interface KanbanCardRow {
  id: string
  user_id: string
  title: string
  description: string | null
  column: ColumnId
  priority: Priority
  phase_id: string | null
  week_num: number | null
  project_id: string | null
  is_custom: boolean
  checklist: SubTask[]
  deliverables: string[]
  tags: string[]
  due_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface RoadmapProgressRow {
  user_id: string
  item_id: string
  completed: boolean
  updated_at: string
}

export interface CertificationRow {
  user_id: string
  cert_id: string
  status: string
  target_date: string | null
  updated_at: string
}

export interface DailyNoteRow {
  id: string
  user_id: string
  date: string
  title: string
  content: string
  tags: string[]
  created_at: string
  updated_at: string
}
