export type ColumnId = 'backlog' | 'todo' | 'inProgress' | 'review' | 'done'

export type Priority = 'low' | 'medium' | 'high'

export interface SubTask {
  id: string
  label: string
  done: boolean
}

export interface KanbanCard {
  id: string
  title: string
  description?: string
  column: ColumnId
  priority: Priority
  phaseId?: string // 'phase-1', 'phase-2', 'phase-3', 'phase-4', 'custom'
  weekNum?: number // 1..16 or undefined for custom/projects
  projectId?: string
  isCustom?: boolean
  checklist: SubTask[]
  deliverables?: string[]
  tags: string[]
  dueDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface KanbanColumnDef {
  id: ColumnId
  title: string
  description: string
  color: string
  badgeBg: string
  badgeText: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar: string
  role: string
  startDate: string
  journeyStartDate?: string | null
  targetRole: string
  bio?: string
  createdAt: string
}

export interface DailyNote {
  id: string
  date: string
  title: string
  content: string
  tags: string[]
}

export interface UserDataStore {
  user: UserProfile
  cards: KanbanCard[]
  checkedItems: Record<string, boolean>
  certStatuses: Record<string, string>
  certTargets: Record<string, string>
  notes: DailyNote[]
  theme: 'dark' | 'light'
}

export type DashboardTab =
  | 'kanban'
  | 'curriculum'
  | 'projects'
  | 'skills'
  | 'certs'
  | 'jobSearch'
  | 'resources'
  | 'journal'
