import { getSupabaseClient } from './supabase'
import type { KanbanCard, SubTask, DailyNote, UserProfile } from '../types/learning'
import type {
  KanbanCardRow,
  RoadmapProgressRow,
  CertificationRow,
  DailyNoteRow,
  ProfileRow,
} from '../types/supabase'

// ============================================================================
// PROFILE
// ============================================================================

export async function fetchSupabaseProfile(userId: string): Promise<UserProfile | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.warn('Error fetching Supabase profile:', error.message)
      return null
    }

    if (!data) return null

    const row = data as ProfileRow
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      avatar: row.avatar,
      role: row.role,
      targetRole: row.target_role,
      startDate: row.start_date,
      bio: row.bio || '',
      createdAt: row.created_at,
    }
  } catch (e) {
    console.warn('Exception fetching profile:', e)
    return null
  }
}

export async function upsertSupabaseProfile(profile: UserProfile): Promise<boolean> {
  const supabase = getSupabaseClient()
  if (!supabase) return false

  try {
    const { error } = await supabase.from('profiles').upsert({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar,
      role: profile.role,
      target_role: profile.targetRole,
      start_date: profile.startDate,
      bio: profile.bio || '',
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.warn('Error upserting Supabase profile:', error.message)
      return false
    }
    return true
  } catch (e) {
    console.warn('Exception updating profile:', e)
    return false
  }
}

// ============================================================================
// KANBAN CARDS
// ============================================================================

export function mapRowToCard(row: KanbanCardRow): KanbanCard {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    column: row.column,
    priority: row.priority,
    phaseId: row.phase_id || undefined,
    weekNum: row.week_num ?? undefined,
    projectId: row.project_id || undefined,
    isCustom: row.is_custom,
    checklist: Array.isArray(row.checklist) ? (row.checklist as SubTask[]) : [],
    deliverables: Array.isArray(row.deliverables) ? (row.deliverables as string[]) : [],
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    dueDate: row.due_date || undefined,
    notes: row.notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapCardToRow(card: KanbanCard, userId: string): Omit<KanbanCardRow, 'created_at' | 'updated_at'> & { updated_at: string } {
  return {
    id: card.id,
    user_id: userId,
    title: card.title,
    description: card.description || null,
    column: card.column,
    priority: card.priority,
    phase_id: card.phaseId || null,
    week_num: card.weekNum ?? null,
    project_id: card.projectId || null,
    is_custom: card.isCustom ?? true,
    checklist: card.checklist || [],
    deliverables: card.deliverables || [],
    tags: card.tags || [],
    due_date: card.dueDate || null,
    notes: card.notes || null,
    updated_at: card.updatedAt || new Date().toISOString(),
  }
}

export async function fetchSupabaseCards(userId: string): Promise<KanbanCard[] | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  try {
    const { data, error } = await supabase
      .from('kanban_cards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Error fetching Supabase cards:', error.message)
      return null
    }

    return (data as KanbanCardRow[]).map(mapRowToCard)
  } catch (e) {
    console.warn('Exception fetching cards:', e)
    return null
  }
}

export async function upsertSupabaseCard(card: KanbanCard, userId: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  if (!supabase) return false

  try {
    const row = mapCardToRow(card, userId)
    const { error } = await supabase.from('kanban_cards').upsert(row)
    if (error) {
      console.warn('Error saving card to Supabase:', error.message)
      return false
    }
    return true
  } catch (e) {
    console.warn('Exception saving card:', e)
    return false
  }
}

export async function bulkUpsertSupabaseCards(cards: KanbanCard[], userId: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  if (!supabase || cards.length === 0) return false

  try {
    const rows = cards.map(c => mapCardToRow(c, userId))
    const { error } = await supabase.from('kanban_cards').upsert(rows)
    if (error) {
      console.warn('Error bulk upserting cards:', error.message)
      return false
    }
    return true
  } catch (e) {
    console.warn('Exception bulk saving cards:', e)
    return false
  }
}

export async function deleteSupabaseCard(cardId: string, userId: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  if (!supabase) return false

  try {
    const { error } = await supabase
      .from('kanban_cards')
      .delete()
      .eq('id', cardId)
      .eq('user_id', userId)

    if (error) {
      console.warn('Error deleting card in Supabase:', error.message)
      return false
    }
    return true
  } catch (e) {
    console.warn('Exception deleting card:', e)
    return false
  }
}

export async function clearAllSupabaseCards(userId: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  if (!supabase) return false

  try {
    const { error } = await supabase
      .from('kanban_cards')
      .delete()
      .eq('user_id', userId)

    if (error) {
      console.warn('Error clearing cards in Supabase:', error.message)
      return false
    }
    return true
  } catch (e) {
    console.warn('Exception clearing cards:', e)
    return false
  }
}

// ============================================================================
// ROADMAP PROGRESS
// ============================================================================

export async function fetchSupabaseRoadmapProgress(userId: string): Promise<Record<string, boolean> | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  try {
    const { data, error } = await supabase
      .from('roadmap_progress')
      .select('item_id, completed')
      .eq('user_id', userId)

    if (error) {
      console.warn('Error fetching roadmap progress:', error.message)
      return null
    }

    const map: Record<string, boolean> = {}
    for (const row of (data as RoadmapProgressRow[])) {
      map[row.item_id] = row.completed
    }
    return map
  } catch (e) {
    console.warn('Exception fetching roadmap progress:', e)
    return null
  }
}

export async function setSupabaseRoadmapItem(userId: string, itemId: string, completed: boolean): Promise<boolean> {
  const supabase = getSupabaseClient()
  if (!supabase) return false

  try {
    const { error } = await supabase.from('roadmap_progress').upsert({
      user_id: userId,
      item_id: itemId,
      completed,
      updated_at: new Date().toISOString(),
    })
    return !error
  } catch (e) {
    console.warn('Exception saving roadmap item:', e)
    return false
  }
}

// ============================================================================
// CERTIFICATIONS
// ============================================================================

export async function fetchSupabaseCertifications(
  userId: string
): Promise<{ statuses: Record<string, string>; targets: Record<string, string> } | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  try {
    const { data, error } = await supabase
      .from('certifications')
      .select('cert_id, status, target_date')
      .eq('user_id', userId)

    if (error) {
      console.warn('Error fetching certifications:', error.message)
      return null
    }

    const statuses: Record<string, string> = {}
    const targets: Record<string, string> = {}

    for (const row of (data as CertificationRow[])) {
      statuses[row.cert_id] = row.status
      if (row.target_date) targets[row.cert_id] = row.target_date
    }
    return { statuses, targets }
  } catch (e) {
    console.warn('Exception fetching certifications:', e)
    return null
  }
}

export async function upsertSupabaseCert(
  userId: string,
  certId: string,
  updates: { status?: string; targetDate?: string }
): Promise<boolean> {
  const supabase = getSupabaseClient()
  if (!supabase) return false

  try {
    const payload: any = {
      user_id: userId,
      cert_id: certId,
      updated_at: new Date().toISOString(),
    }
    if (updates.status !== undefined) payload.status = updates.status
    if (updates.targetDate !== undefined) payload.target_date = updates.targetDate

    const { error } = await supabase.from('certifications').upsert(payload)
    return !error
  } catch (e) {
    console.warn('Exception updating cert:', e)
    return false
  }
}

// ============================================================================
// DAILY NOTES
// ============================================================================

export async function fetchSupabaseNotes(userId: string): Promise<DailyNote[] | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  try {
    const { data, error } = await supabase
      .from('daily_notes')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) {
      console.warn('Error fetching daily notes:', error.message)
      return null
    }

    return (data as DailyNoteRow[]).map(r => ({
      id: r.id,
      date: r.date,
      title: r.title,
      content: r.content,
      tags: Array.isArray(r.tags) ? r.tags : [],
    }))
  } catch (e) {
    console.warn('Exception fetching notes:', e)
    return null
  }
}

export async function upsertSupabaseNote(note: DailyNote, userId: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  if (!supabase) return false

  try {
    const { error } = await supabase.from('daily_notes').upsert({
      id: note.id,
      user_id: userId,
      date: note.date,
      title: note.title,
      content: note.content,
      tags: note.tags,
      updated_at: new Date().toISOString(),
    })
    return !error
  } catch (e) {
    console.warn('Exception saving note:', e)
    return false
  }
}

export async function deleteSupabaseNote(noteId: string, userId: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  if (!supabase) return false

  try {
    const { error } = await supabase
      .from('daily_notes')
      .delete()
      .eq('id', noteId)
      .eq('user_id', userId)
    return !error
  } catch (e) {
    console.warn('Exception deleting note:', e)
    return false
  }
}
