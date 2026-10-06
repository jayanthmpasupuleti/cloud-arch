import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { Plus, GripVertical, Search, X, CheckCircle2 } from 'lucide-react'
import { roadmap, PHASE_COLORS } from '../../data/roadmap'
import type { ProgressState } from '../../hooks/useProgress'
import type { DragEndEvent, DragOverEvent, DragStartEvent, PointerActivationConstraint } from '@dnd-kit/core'
import { cn } from '../../lib/utils'
import { LIGHT_THEME } from '../../theme/colors'

type ColumnKey = 'todo' | 'inProgress' | 'done'

interface KanbanColumns {
  todo: string[]
  inProgress: string[]
  done: string[]
}

interface Props {
  state: ProgressState
  onToggle: (id: string) => void
  setState: React.Dispatch<React.SetStateAction<ProgressState>>
}

const COLUMNS: { key: ColumnKey; label: string; color: string; iconBg: string }[] = [
  { key: 'todo', label: 'To Do', color: '#FF6B6B', iconBg: 'bg-red-100 text-red-500' },
  { key: 'inProgress', label: 'In Progress', color: '#F59E0B', iconBg: 'bg-amber-100 text-amber-500' },
  { key: 'done', label: 'Done', color: '#10B981', iconBg: 'bg-emerald-100 text-emerald-500' },
]

// Build task lookup from roadmap
const TASK_MAP = new Map<string, { label: string; phaseId: string; weekNum: number }>()
for (const phase of roadmap.phases) {
  for (const week of phase.weeksData) {
    for (const item of week.items) {
      TASK_MAP.set(item.id, { label: item.label, phaseId: phase.id, weekNum: week.number })
    }
  }
  for (const pid of phase.projectIds) {
    const proj = roadmap.projects.find(p => p.id === pid)
    if (proj) {
      for (const item of proj.checklist) {
        TASK_MAP.set(item.id, { label: item.label, phaseId: proj.phaseId, weekNum: 0 })
      }
    }
  }
}

function getDefaultColumns(): KanbanColumns {
  return { todo: [], inProgress: [], done: [] }
}

export default function KanbanBoard({ state, onToggle, setState }: Props) {
  const [phaseFilter, setPhaseFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState<ColumnKey | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)

  const columns: KanbanColumns = state.kanbanColumns ?? getDefaultColumns()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } as PointerActivationConstraint }),
    useSensor(KeyboardSensor)
  )

  // Get tasks in a specific column
  const getColumnTasks = useCallback((col: ColumnKey) => {
    return columns[col].filter(id => TASK_MAP.has(id))
  }, [columns])

  // Get all tasks currently on the board
  const onBoardIds = useMemo(() => {
    const ids: string[] = []
    for (const col of COLUMNS) ids.push(...columns[col.key])
    return ids
  }, [columns])

  // Available tasks (not yet on any column)
  const availableTasks = useMemo(() => {
    let items = Array.from(TASK_MAP.entries())
    if (phaseFilter !== 'all') {
      items = items.filter(([, t]) => t.phaseId === phaseFilter)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      items = items.filter(([, t]) => t.label.toLowerCase().includes(q))
    }
    return items.filter(([id]) => !onBoardIds.includes(id))
  }, [onBoardIds, phaseFilter, searchQuery])

  const addTask = useCallback((taskId: string, column: ColumnKey) => {
    setState(prev => {
      const cols = { ...(prev.kanbanColumns ?? getDefaultColumns()) }
      if (!cols[column].includes(taskId)) {
        cols[column] = [...cols[column], taskId]
      }
      return { ...prev, kanbanColumns: cols }
    })
    setShowAddModal(null)
    setSearchQuery('')
  }, [setState])

  const handleDragStart = (_event: DragStartEvent) => {
    setActiveId(_event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeCol = COLUMNS.find(c => columns[c.key].includes(activeId))
    if (!activeCol) return

    let targetCol: ColumnKey | undefined
    const overCol = COLUMNS.find(c => columns[c.key].includes(overId))
    if (overCol) {
      targetCol = overCol.key
    } else if (COLUMNS.some(c => c.key === overId)) {
      targetCol = overId as ColumnKey
    }

    if (!targetCol || activeCol.key === targetCol) return

    setState(prev => {
      const cols = { ...(prev.kanbanColumns ?? getDefaultColumns()) }
      cols[activeCol.key] = cols[activeCol.key].filter(id => id !== activeId)
      if (!cols[targetCol!].includes(activeId)) {
        cols[targetCol!] = [...cols[targetCol!], activeId]
      }
      return { ...prev, kanbanColumns: cols }
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string
    if (activeId === overId) return

    setState(prev => {
      const cols = { ...(prev.kanbanColumns ?? getDefaultColumns()) }
      for (const col of COLUMNS) {
        const idx = cols[col.key].indexOf(activeId)
        const overIdx = cols[col.key].indexOf(overId)
        if (idx !== -1 && overIdx !== -1) {
          cols[col.key] = arrayMove(cols[col.key], idx, overIdx)
          return { ...prev, kanbanColumns: cols }
        }
      }
      return prev
    })
  }

  return (
    <section id="kanban" className="mx-auto max-w-7xl px-4 py-16">
      <div className="mb-8">
        <h2 className={cn('text-2xl font-bold md:text-3xl', LIGHT_THEME.textPrimary)}>
          Task Board
        </h2>
        <p className="mt-2 text-sm" style={{ color: LIGHT_THEME.textSecondary }}>
          Drag tasks between columns to track your daily progress. Add tasks from your roadmap.
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid gap-5 md:grid-cols-3">
          {COLUMNS.map((col, colIdx) => {
            const colTasks = getColumnTasks(col.key)
            return (
              <motion.div
                key={col.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: colIdx * 0.1 }}
                className="flex flex-col rounded-2xl border bg-white shadow-sm"
                style={{ borderColor: LIGHT_THEME.borderLight }}
              >
                <div className="flex items-center justify-between px-4 pt-4 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className={cn('flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold', col.iconBg)}>
                      {colTasks.length}
                    </span>
                    <h3 className={cn('text-sm font-semibold', LIGHT_THEME.textPrimary)}>{col.label}</h3>
                  </div>
                  <button
                    onClick={() => setShowAddModal(col.key)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-dashed border-gray-300 text-gray-400 transition hover:border-coral hover:text-coral"
                    aria-label={`Add task to ${col.label}`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <SortableContext items={colTasks.map(t => t)} strategy={horizontalListSortingStrategy}>
                  <div className="flex-1 space-y-2 px-3 pb-3 min-h-[120px]">
                    <AnimatePresence>
                      {colTasks.length === 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex h-24 items-center justify-center rounded-xl border border-dashed"
                          style={{ borderColor: LIGHT_THEME.border }}
                        >
                          <p className="text-xs" style={{ color: LIGHT_THEME.textMuted }}>Drop tasks here</p>
                        </motion.div>
                      )}
                      {colTasks.map((taskId) => {
                        const task = TASK_MAP.get(taskId)
                        if (!task) return null
                        const phaseColor = PHASE_COLORS[task.phaseId as keyof typeof PHASE_COLORS]?.text || '#888'
                        const isDone = col.key === 'done'
                        const isDragging = activeId === taskId

                        return (
                          <SortableCard
                            key={taskId}
                            id={taskId}
                            label={task.label}
                            phaseColor={phaseColor}
                            weekNum={task.weekNum}
                            isDone={isDone}
                            isDragging={isDragging}
                            onToggle={() => onToggle(taskId)}
                          />
                        )
                      })}
                    </AnimatePresence>
                  </div>
                </SortableContext>
              </motion.div>
            )
          })}
        </div>
      </DndContext>

      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => { setShowAddModal(null); setSearchQuery('') }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-lg rounded-2xl border bg-white shadow-xl overflow-hidden"
              style={{ borderColor: LIGHT_THEME.borderLight }}
            >
              <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: LIGHT_THEME.border }}>
                <h3 className={cn('text-base font-semibold', LIGHT_THEME.textPrimary)}>
                  Add to {COLUMNS.find(c => c.key === showAddModal)?.label}
                </h3>
                <button onClick={() => { setShowAddModal(null); setSearchQuery('') }} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="px-5 pt-3 pb-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search roadmap tasks..."
                    autoFocus
                    className="w-full rounded-xl border bg-gray-50 pl-9 pr-4 py-2.5 text-sm focus:border-coral/30 focus:outline-none focus:ring-2 focus:ring-coral/10"
                    style={{ borderColor: LIGHT_THEME.border, color: LIGHT_THEME.textPrimary }}
                  />
                </div>
                <div className="flex gap-1.5 mt-2">
                  <button onClick={() => setPhaseFilter('all')}
                    className={cn('rounded-lg px-2.5 py-1 text-xs transition', phaseFilter === 'all' ? 'bg-coral/10 text-coral font-medium' : 'text-gray-500 hover:bg-gray-100')}>
                    All
                  </button>
                  {roadmap.phases.map(p => (
                    <button key={p.id} onClick={() => setPhaseFilter(p.id)}
                      className={cn('rounded-lg px-2.5 py-1 text-xs transition', phaseFilter === p.id ? 'bg-coral/10 text-coral font-medium' : 'text-gray-500 hover:bg-gray-100')}>
                      P{p.number}
                    </button>
                  ))}
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto px-3 py-2">
                {availableTasks.length === 0 && (
                  <p className="py-8 text-center text-sm text-gray-400">
                    {searchQuery ? 'No matching tasks found.' : 'All roadmap tasks are on the board!'}
                  </p>
                )}
                <AnimatePresence>
                  {availableTasks.map(([id, task]) => {
                    const phaseColor = PHASE_COLORS[task.phaseId as keyof typeof PHASE_COLORS]?.text || '#888'
                    return (
                      <motion.button
                        key={id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        onClick={() => addTask(id, showAddModal)}
                        className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-coral/5 group"
                      >
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: phaseColor }} />
                        <span className="flex-1 text-gray-700 group-hover:text-coral transition-colors">{task.label}</span>
                        <span className="text-[10px] text-gray-400">
                          {task.weekNum > 0 ? `W${task.weekNum}` : 'Proj'}
                        </span>
                      </motion.button>
                    )
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

function SortableCard({ id, label, phaseColor, weekNum, isDone, isDragging, onToggle }: {
  id: string
  label: string
  phaseColor: string
  weekNum: number
  isDone: boolean
  isDragging: boolean
  onToggle: () => void
}) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isSorting,
  } = useSortable({ id })

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isSorting ? 50 : 'auto',
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
    >
      <div
        {...attributes}
        {...listeners}
        className={cn(
          'group flex items-start gap-2 rounded-xl border px-3 py-2.5 cursor-grab active:cursor-grabbing',
          'transition-all duration-200',
          isDone
            ? 'border-emerald-100 bg-emerald-50/50'
            : 'border-gray-100 bg-white hover:border-coral/15 hover:shadow-sm hover:shadow-coral/5'
        )}
      >
        <div className="mt-0.5 text-gray-300 group-hover:text-coral transition-colors">
          <GripVertical className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('text-xs leading-relaxed', isDone ? 'text-gray-400 line-through' : 'text-gray-700')}>
            {label}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: phaseColor }} />
            <span className="text-[10px] text-gray-400">
              {weekNum > 0 ? `Week ${weekNum}` : 'Project'}
            </span>
          </div>
        </div>
        {!isDone && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggle() }}
            className="shrink-0 rounded-lg p-1 text-gray-300 opacity-0 group-hover:opacity-100 hover:text-coral transition-all"
            aria-label="Mark as done"
          >
            <CheckCircle2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.div>
  )
}
