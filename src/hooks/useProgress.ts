import { roadmap } from '../data/roadmap'
import type { CheckItem } from '../data/roadmap'

const STORAGE_KEY = 'cloud-arch-progress-v1'

export interface ProgressState {
  checked: Record<string, boolean>
  certStatuses: Record<string, string>
  certTargets: Record<string, string>
  projectStatuses: Record<string, string>
  startDate: string | null
  lightMode: boolean
}

function defaultState(): ProgressState {
  return {
    checked: {},
    certStatuses: {},
    certTargets: {},
    projectStatuses: {},
    startDate: null,
    lightMode: false,
  }
}

export function loadState(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw) as ProgressState
    return { ...defaultState(), ...parsed }
  } catch {
    return defaultState()
  }
}

export function saveState(state: ProgressState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // storage full or unavailable — silent fail
  }
}

export function getAllCheckItems(): CheckItem[] {
  const items: CheckItem[] = []
  for (const phase of roadmap.phases) {
    for (const week of phase.weeksData) {
      items.push(...week.items)
    }
  }
  for (const project of roadmap.projects) {
    items.push(...project.checklist)
  }
  return items
}

export function getProgressPercentage(state: ProgressState): number {
  const all = getAllCheckItems()
  if (all.length === 0) return 0
  const done = all.filter(i => state.checked[i.id]).length
  return Math.round((done / all.length) * 100)
}

export function getPhaseProgress(phaseId: string, state: ProgressState): number {
  const phase = roadmap.phases.find(p => p.id === phaseId)
  if (!phase) return 0
  const items: CheckItem[] = [...phase.weeksData.flatMap(w => w.items)]
  const project = roadmap.projects.find(p => p.phaseId === phaseId)
  if (project) items.push(...project.checklist)
  if (items.length === 0) return 0
  const done = items.filter(i => state.checked[i.id]).length
  return Math.round((done / items.length) * 100)
}

export function getProjectProgress(projectId: string, state: ProgressState): number {
  const project = roadmap.projects.find(p => p.id === projectId)
  if (!project) return 0
  if (project.checklist.length === 0) return 0
  const done = project.checklist.filter(i => state.checked[i.id]).length
  return Math.round((done / project.checklist.length) * 100)
}

export function getSkillRadarValues(state: ProgressState): { category: string; value: number }[] {
  const { categories } = roadmap.skillRadar
  return categories.map(cat => {
    const total = cat.checklistIds.length
    if (total === 0) return { category: cat.label, value: 0 }
    const done = cat.checklistIds.filter(id => state.checked[id]).length
    return { category: cat.label, value: Math.round((done / total) * 100) }
  })
}

export function getStartDate(state: ProgressState): Date | null {
  if (!state.startDate) return null
  return new Date(state.startDate)
}

export function getCurrentWeek(state: ProgressState): number {
  const start = getStartDate(state)
  if (!start) return 1
  const diff = Math.floor((Date.now() - start.getTime()) / (7 * 24 * 60 * 60 * 1000))
  return Math.max(1, Math.min(16, diff + 1))
}

export function getTodayTasks(state: ProgressState): { weekNum: number; title: string; tasks: CheckItem[] } | null {
  const weekNum = getCurrentWeek(state)
  for (const phase of roadmap.phases) {
    for (const week of phase.weeksData) {
      if (week.number === weekNum) {
        const tasks = week.items.filter(i => !state.checked[i.id]).slice(0, 3)
        return { weekNum, title: week.title, tasks }
      }
    }
  }
  return null
}

export function exportProgress(state: ProgressState): string {
  return JSON.stringify(state, null, 2)
}

export function importProgress(json: string): ProgressState {
  try {
    const parsed = JSON.parse(json) as ProgressState
    return { ...defaultState(), ...parsed }
  } catch {
    return defaultState()
  }
}

export function resetProgress(): ProgressState {
  return defaultState()
}
