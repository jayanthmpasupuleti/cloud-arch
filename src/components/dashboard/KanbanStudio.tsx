import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  pointerWithin,
  DragOverlay,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import {
  Plus,
  GripVertical,
  Search,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  BookOpen,
  Trash2,
} from 'lucide-react'
import type { KanbanCard, ColumnId } from '../../types/learning'
import { COLUMN_DEFINITIONS } from '../../hooks/useLearningStore'
import CardDetailModal from './CardDetailModal'
import NewCardModal from './NewCardModal'
import { roadmap } from '../../data/roadmap'
import { cn } from '../../lib/utils'

interface Props {
  cards: KanbanCard[]
  onMoveCard: (cardId: string, toColumn: ColumnId, targetIndex?: number) => void
  onAddCard: (card: Partial<KanbanCard>) => KanbanCard
  onUpdateCard: (cardId: string, updates: Partial<KanbanCard>) => void
  onDeleteCard: (cardId: string) => void
  onClearAllCards: () => void
  onToggleSubTask: (cardId: string, subtaskId: string) => void
  onAddSubTask: (cardId: string, label: string) => void
  onRemoveSubTask: (cardId: string, subtaskId: string) => void
  onImportRoadmapTask: (itemId: string, targetCol?: ColumnId) => void
  onImportProject: (projectId: string, targetCol?: ColumnId) => void
}

export default function KanbanStudio({
  cards,
  onMoveCard,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onClearAllCards,
  onToggleSubTask,
  onAddSubTask,
  onRemoveSubTask,
  onImportRoadmapTask,
  onImportProject,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [phaseFilter, setPhaseFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [activeCardId, setActiveCardId] = useState<string | null>(null)
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null)
  const [newCardColumn, setNewCardColumn] = useState<ColumnId | null>(null)
  const [showRoadmapCatalog, setShowRoadmapCatalog] = useState(false)
  const [catalogSearch, setCatalogSearch] = useState('')

  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  )

  // Filter cards
  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesTitle = card.title.toLowerCase().includes(q)
        const matchesDesc = (card.description || '').toLowerCase().includes(q)
        const matchesTag = card.tags.some(t => t.toLowerCase().includes(q))
        if (!matchesTitle && !matchesDesc && !matchesTag) return false
      }

      if (phaseFilter !== 'all') {
        if (phaseFilter === 'custom' && !card.isCustom) return false
        if (phaseFilter !== 'custom' && card.phaseId !== phaseFilter) return false
      }

      if (priorityFilter !== 'all' && card.priority !== priorityFilter) {
        return false
      }

      return true
    })
  }, [cards, searchQuery, phaseFilter, priorityFilter])

  // Group cards by column
  const columnCardsMap = useMemo(() => {
    const map: Record<ColumnId, KanbanCard[]> = {
      backlog: [],
      todo: [],
      inProgress: [],
      review: [],
      done: [],
    }

    for (const card of filteredCards) {
      if (map[card.column]) {
        map[card.column].push(card)
      } else {
        map.todo.push(card)
      }
    }

    return map
  }, [filteredCards])

  // Drag Handlers
  const handleDragStart = (e: DragStartEvent) => {
    setActiveCardId(e.active.id as string)
  }

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    setActiveCardId(null)
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeCard = cards.find(c => c.id === activeId)
    if (!activeCard) return

    // Case 1: Dropped onto a column container
    const isOverColumn = COLUMN_DEFINITIONS.some(c => c.id === overId)
    if (isOverColumn) {
      const targetCol = overId as ColumnId
      if (activeCard.column !== targetCol) {
        onMoveCard(activeId, targetCol)
      }
      return
    }

    // Case 2: Dropped onto another card
    const overCard = cards.find(c => c.id === overId)
    if (overCard) {
      if (activeCard.column !== overCard.column) {
        // Move from source column to overCard's column at that card's index
        const targetColCards = columnCardsMap[overCard.column]
        const targetIndex = targetColCards.findIndex(c => c.id === overId)
        onMoveCard(activeId, overCard.column, targetIndex >= 0 ? targetIndex : undefined)
      } else if (activeId !== overId) {
        // Reordering within the same column
        const colCards = columnCardsMap[activeCard.column]
        const oldIndex = colCards.findIndex(c => c.id === activeId)
        const newIndex = colCards.findIndex(c => c.id === overId)
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          onMoveCard(activeId, activeCard.column, newIndex)
        }
      }
    }
  }

  // Custom collision detection: prioritize pointerWithin, fallback to closestCorners
  const collisionDetectionStrategy = useMemo(() => {
    return (args: any) => {
      const pointerCollisions = pointerWithin(args)
      if (pointerCollisions.length > 0) {
        return pointerCollisions
      }
      return closestCorners(args)
    }
  }, [])

  const activeDraggedCard = useMemo(() => {
    return activeCardId ? cards.find(c => c.id === activeCardId) : null
  }, [activeCardId, cards])

  // Roadmap tasks not yet on the board
  const availableRoadmapTasks = useMemo(() => {
    const existingTitles = new Set(cards.map(c => c.title.toLowerCase()))
    const existingIds = new Set(cards.map(c => c.id))

    const list: {
      id: string
      label: string
      phaseId: string
      phaseNumber: number
      phaseTitle: string
      weekNum: number
      weekTitle: string
    }[] = []

    for (const phase of roadmap.phases) {
      for (const week of phase.weeksData) {
        for (const item of week.items) {
          if (!existingIds.has(item.id) && !existingTitles.has(item.label.toLowerCase())) {
            list.push({
              id: item.id,
              label: item.label,
              phaseId: phase.id,
              phaseNumber: phase.number,
              phaseTitle: phase.title,
              weekNum: week.number,
              weekTitle: week.title,
            })
          }
        }
      }
    }

    if (catalogSearch.trim()) {
      const q = catalogSearch.toLowerCase()
      return list.filter(t => t.label.toLowerCase().includes(q) || t.phaseTitle.toLowerCase().includes(q) || t.weekTitle.toLowerCase().includes(q))
    }

    return list
  }, [cards, catalogSearch])

  return (
    <div className="flex h-full flex-col">
      {/* Studio Header & Filter Controls */}
      <div className="flex flex-col gap-4 border-b border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              Learning Kanban Board
            </h1>
            <span className="rounded-full bg-coral/10 px-2.5 py-0.5 text-xs font-semibold text-coral">
              {filteredCards.length} Tasks Active
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Drag items across stages as you code, verify deliverables, and ship projects.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Clear All Cards Button */}
          {cards.length > 0 && (
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete all ${cards.length} cards from your Kanban board? You can always restore roadmap items from the curriculum catalog.`)) {
                  onClearAllCards()
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/50 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-950/60"
              title="Delete all cards currently on the board"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear All Cards
            </button>
          )}

          <button
            onClick={() => setShowRoadmapCatalog(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-coral hover:text-coral dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-coral"
          >
            <BookOpen className="h-3.5 w-3.5 text-coral" />
            Pull from 16-Wk Curriculum
          </button>

          <button
            onClick={() => setNewCardColumn('todo')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-coral px-4 py-2 text-xs font-semibold text-white shadow-md shadow-coral/20 transition hover:bg-coral/90"
          >
            <Plus className="h-4 w-4" />
            New Learning Card
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-3 dark:border-slate-800/80 dark:bg-slate-900/40">
        <div className="flex flex-1 flex-wrap items-center gap-2 min-w-[280px]">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by topic, tag, or skill..."
              className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:border-coral focus:outline-none"
            />
          </div>

          {/* Phase Filter */}
          <select
            value={phaseFilter}
            onChange={e => setPhaseFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Phases</option>
            <option value="phase-1">Phase 1: Foundations & IaC</option>
            <option value="phase-2">Phase 2: Kubernetes & SRE</option>
            <option value="phase-3">Phase 3: Multi-Cloud & Data</option>
            <option value="phase-4">Phase 4: Capstone & Certs</option>
            <option value="custom">Custom Topics</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="hidden sm:inline">Drag cards to anywhere from anywhere</span>
        </div>
      </div>

      {/* Kanban Board Drag-and-Drop Columns */}
      <div className="flex-1 overflow-x-auto p-5">
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetectionStrategy}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex items-start gap-4 min-w-[1250px] pb-4">
            {COLUMN_DEFINITIONS.map(col => {
              const colCards = columnCardsMap[col.id] || []
              return (
                <DroppableColumn
                  key={col.id}
                  col={col}
                  cards={colCards}
                  onNewCard={colId => setNewCardColumn(colId)}
                  onCardClick={card => setSelectedCard(card)}
                  onCardDelete={cardId => onDeleteCard(cardId)}
                  onCardAdvance={card => {
                    const nextCol: Record<ColumnId, ColumnId> = {
                      backlog: 'todo',
                      todo: 'inProgress',
                      inProgress: 'review',
                      review: 'done',
                      done: 'done',
                    }
                    onMoveCard(card.id, nextCol[card.column])
                  }}
                />
              )
            })}
          </div>

          {/* Drag Overlay for smooth preview */}
          <DragOverlay>
            {activeDraggedCard ? (
              <div className="rotate-2 opacity-95 shadow-2xl">
                <SortableCard
                  card={activeDraggedCard}
                  onClick={() => {}}
                  onDelete={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Card Detail Modal */}
      {selectedCard && (
        <CardDetailModal
          card={cards.find(c => c.id === selectedCard.id) || selectedCard}
          isOpen={!!selectedCard}
          onClose={() => setSelectedCard(null)}
          onUpdate={onUpdateCard}
          onDelete={onDeleteCard}
          onToggleSubTask={onToggleSubTask}
          onAddSubTask={onAddSubTask}
          onRemoveSubTask={onRemoveSubTask}
        />
      )}

      {/* New Card Modal */}
      {newCardColumn && (
        <NewCardModal
          isOpen={!!newCardColumn}
          onClose={() => setNewCardColumn(null)}
          onAddCard={onAddCard}
          initialColumn={newCardColumn}
        />
      )}

      {/* Curriculum Catalog Drawer */}
      <AnimatePresence>
        {showRoadmapCatalog && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setShowRoadmapCatalog(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    16-Week Curriculum Catalog
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add curated roadmap tasks directly to your board.
                  </p>
                </div>
                <button
                  onClick={() => setShowRoadmapCatalog(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>

              {/* Drawer Search */}
              <div className="border-b border-slate-100 p-4 dark:border-slate-800">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={catalogSearch}
                    onChange={e => setCatalogSearch(e.target.value)}
                    placeholder="Search curriculum topics..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:border-coral focus:outline-none"
                  />
                </div>
              </div>

              {/* Projects Quick Pull */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Featured Projects
                </span>
                <div className="mt-2 space-y-1.5">
                  {roadmap.projects.slice(0, 4).map(p => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800/40"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                          {p.title}
                        </span>
                        <span className="text-[10px] text-slate-400">{p.weeks} · {p.difficulty}</span>
                      </div>
                      <button
                        onClick={() => {
                          onImportProject(p.id, 'todo')
                          setShowRoadmapCatalog(false)
                        }}
                        className="rounded-lg bg-coral/10 px-2.5 py-1 text-[11px] font-semibold text-coral transition hover:bg-coral hover:text-white"
                      >
                        + Add to Board
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Drawer Tasks List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Weekly Lessons ({availableRoadmapTasks.length})
                </span>
                {availableRoadmapTasks.map(t => (
                  <div
                    key={t.id}
                    className="group flex items-start justify-between rounded-xl border border-slate-100 bg-white p-3 shadow-xs transition hover:border-coral/30 hover:bg-coral/[0.02] dark:border-slate-800 dark:bg-slate-800/70"
                  >
                    <div className="flex-1 pr-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-semibold text-coral">
                          P{t.phaseNumber} · W{t.weekNum}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {t.weekTitle}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-snug">
                        {t.label}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        onImportRoadmapTask(t.id, 'todo')
                        setShowRoadmapCatalog(false)
                      }}
                      className="shrink-0 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-coral hover:bg-coral hover:text-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      + To Do
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Droppable Column Component
function DroppableColumn({
  col,
  cards,
  onNewCard,
  onCardClick,
  onCardDelete,
  onCardAdvance,
}: {
  col: (typeof COLUMN_DEFINITIONS)[0]
  cards: KanbanCard[]
  onNewCard: (colId: ColumnId) => void
  onCardClick: (card: KanbanCard) => void
  onCardDelete: (cardId: string) => void
  onCardAdvance: (card: KanbanCard) => void
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: col.id,
  })

  return (
    <div
      ref={setNodeRef}
      id={col.id}
      className={cn(
        'flex w-72 flex-col rounded-2xl border transition-colors shadow-xs',
        isOver
          ? 'border-coral/60 bg-coral/[0.05] dark:border-coral/50 dark:bg-coral/[0.08]'
          : 'border-slate-200/90 bg-slate-100/70 dark:border-slate-800 dark:bg-slate-900/60'
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between border-b border-slate-200/70 p-3.5 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: col.color }}
          />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            {col.title}
          </h3>
          <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', col.badgeBg, col.badgeText)}>
            {cards.length}
          </span>
        </div>

        <button
          onClick={() => onNewCard(col.id)}
          className="rounded-lg p-1 text-slate-400 transition hover:bg-white hover:text-coral dark:hover:bg-slate-800"
          title={`Add card to ${col.title}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Droppable Card Stack */}
      <SortableContext
        id={col.id}
        items={cards.map(c => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 space-y-3 p-3 min-h-[380px]">
          {cards.length === 0 ? (
            <div className="flex h-36 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300/80 p-4 text-center dark:border-slate-800">
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                Drop cards here
              </p>
              <button
                onClick={() => onNewCard(col.id)}
                className="mt-2 text-[11px] font-semibold text-coral hover:underline"
              >
                + Add Item
              </button>
            </div>
          ) : (
            cards.map(card => (
              <SortableCard
                key={card.id}
                card={card}
                onClick={() => onCardClick(card)}
                onDelete={onCardDelete}
                onAdvance={() => onCardAdvance(card)}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  )
}

// Single Sortable Card Component with High-Contrast Dark & Light Mode
function SortableCard({
  card,
  onClick,
  onDelete,
  onAdvance,
}: {
  card: KanbanCard
  onClick: () => void
  onDelete: (cardId: string) => void
  onAdvance?: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id })

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 50 : 'auto',
  }

  const completedSubtasks = card.checklist.filter(s => s.done).length
  const totalSubtasks = card.checklist.length

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative cursor-pointer rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition-all hover:border-coral/50 hover:shadow-md dark:border-slate-700/80 dark:bg-slate-800 dark:hover:border-coral/50"
      onClick={onClick}
    >
      {/* Top Meta Line: Priority, Phase, Delete button & Drag Handle */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              'h-2 w-2 rounded-full',
              card.priority === 'high' ? 'bg-rose-500' :
              card.priority === 'medium' ? 'bg-amber-500' :
              'bg-blue-500'
            )}
          />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">
            {card.priority}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {card.weekNum ? (
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
              W{card.weekNum}
            </span>
          ) : card.isCustom ? (
            <span className="rounded-md bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
              Custom
            </span>
          ) : null}

          {/* Individual Card Delete Option */}
          <button
            onClick={e => {
              e.stopPropagation()
              if (confirm(`Delete card "${card.title}"?`)) {
                onDelete(card.id)
              }
            }}
            className="rounded p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition opacity-0 group-hover:opacity-100"
            title="Delete this card"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>

          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            onClick={e => e.stopPropagation()}
            className="cursor-grab text-slate-400 transition hover:text-slate-600 active:cursor-grabbing dark:text-slate-400 dark:hover:text-slate-200 p-0.5"
            title="Drag card"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>

      {/* Card Title - High Contrast */}
      <h4 className="text-xs font-bold leading-snug text-slate-900 dark:text-slate-100 line-clamp-2">
        {card.title}
      </h4>

      {/* Description Preview - High Contrast */}
      {card.description && (
        <p className="mt-1.5 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
          {card.description}
        </p>
      )}

      {/* Checklist / Subtask Progress */}
      {totalSubtasks > 0 && (
        <div className="mt-2.5">
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-300 mb-1">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              {completedSubtasks}/{totalSubtasks} steps
            </span>
            <span>{Math.round((completedSubtasks / totalSubtasks) * 100)}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${Math.round((completedSubtasks / totalSubtasks) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Bottom Footer Meta */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-700/60 pt-2 text-[10px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          {card.deliverables && card.deliverables.length > 0 && (
            <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-semibold" title="Golden Rule Deliverables">
              <Layers className="h-3 w-3" />
              {card.deliverables.length} deliv.
            </span>
          )}

          {card.dueDate && (
            <span className="flex items-center gap-0.5 text-slate-500 dark:text-slate-400 font-medium">
              <Calendar className="h-3 w-3" />
              {new Date(card.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>

        {/* Quick Advance Button */}
        {card.column !== 'done' && onAdvance && (
          <button
            onClick={e => {
              e.stopPropagation()
              onAdvance()
            }}
            className="flex items-center gap-1 text-[10px] font-bold text-coral opacity-0 transition group-hover:opacity-100 hover:underline"
            title="Advance to next column"
          >
            Advance <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  )
}
