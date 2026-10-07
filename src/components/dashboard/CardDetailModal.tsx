import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Trash2,
  Calendar,
  Tag,
  CheckSquare,
  Plus,
  Layers,
  FileText,
  AlertCircle,
} from 'lucide-react'
import type { KanbanCard, ColumnId, Priority } from '../../types/learning'
import { COLUMN_DEFINITIONS } from '../../hooks/useLearningStore'
import { cn } from '../../lib/utils'

interface Props {
  card: KanbanCard | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (cardId: string, updates: Partial<KanbanCard>) => void
  onDelete: (cardId: string) => void
  onToggleSubTask: (cardId: string, subtaskId: string) => void
  onAddSubTask: (cardId: string, label: string) => void
  onRemoveSubTask: (cardId: string, subtaskId: string) => void
}

export default function CardDetailModal({
  card,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onToggleSubTask,
  onAddSubTask,
  onRemoveSubTask,
}: Props) {
  const [newSubTask, setNewSubTask] = useState('')
  const [newTag, setNewTag] = useState('')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleInput, setTitleInput] = useState('')

  if (!isOpen || !card) return null

  const handleTitleSubmit = () => {
    if (titleInput.trim()) {
      onUpdate(card.id, { title: titleInput.trim() })
    }
    setIsEditingTitle(false)
  }

  const handleAddSubTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubTask.trim()) return
    onAddSubTask(card.id, newSubTask.trim())
    setNewSubTask('')
  }

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTag.trim() || card.tags.includes(newTag.trim())) return
    onUpdate(card.id, { tags: [...card.tags, newTag.trim()] })
    setNewTag('')
  }

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdate(card.id, { tags: card.tags.filter(t => t !== tagToRemove) })
  }

  const completedSubtasks = card.checklist.filter(s => s.done).length
  const totalSubtasks = card.checklist.length

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-100 p-6 dark:border-slate-800">
            <div className="flex-1 pr-6">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={cn(
                  'rounded-md px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider',
                  card.priority === 'high' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                  card.priority === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                  'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                )}>
                  {card.priority} Priority
                </span>

                {card.phaseId && (
                  <span className="rounded-md bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                    {card.phaseId === 'custom' ? 'Custom Topic' : card.phaseId.replace('-', ' ').toUpperCase()}
                  </span>
                )}

                {card.weekNum && (
                  <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    Week {card.weekNum}
                  </span>
                )}
              </div>

              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={titleInput}
                    onChange={e => setTitleInput(e.target.value)}
                    autoFocus
                    className="flex-1 rounded-lg border border-coral px-3 py-1.5 text-lg font-bold text-slate-900 dark:text-white dark:bg-slate-800 focus:outline-none"
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleTitleSubmit()
                      if (e.key === 'Escape') setIsEditingTitle(false)
                    }}
                  />
                  <button
                    onClick={handleTitleSubmit}
                    className="rounded-lg bg-coral px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <h2
                  onClick={() => {
                    setTitleInput(card.title)
                    setIsEditingTitle(true)
                  }}
                  className="cursor-pointer text-xl font-bold text-slate-900 transition hover:text-coral dark:text-white dark:hover:text-coral"
                  title="Click to edit title"
                >
                  {card.title}
                </h2>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this learning item?')) {
                    onDelete(card.id)
                    onClose()
                  }
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                title="Delete Card"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Quick Status Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              {/* Column Status */}
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Current Stage</label>
                <select
                  value={card.column}
                  onChange={e => onUpdate(card.id, { column: e.target.value as ColumnId })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  {COLUMN_DEFINITIONS.map(col => (
                    <option key={col.id} value={col.id}>{col.title}</option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Priority Level</label>
                <select
                  value={card.priority}
                  onChange={e => onUpdate(card.id, { priority: e.target.value as Priority })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              {/* Target Due Date */}
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Target Date</label>
                <div className="mt-1 flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="date"
                    value={card.dueDate || ''}
                    onChange={e => onUpdate(card.id, { dueDate: e.target.value })}
                    className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                <FileText className="h-4 w-4 text-coral" /> Overview & Objective
              </label>
              <textarea
                value={card.description || ''}
                onChange={e => onUpdate(card.id, { description: e.target.value })}
                placeholder="What is the architectural objective, what problem does this solve?"
                rows={3}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-200 focus:border-coral focus:outline-none"
              />
            </div>

            {/* Subtasks / Checklist */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-coral" />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">Subtasks & Hands-on Steps</span>
                  {totalSubtasks > 0 && (
                    <span className="text-xs text-slate-400">({completedSubtasks}/{totalSubtasks})</span>
                  )}
                </div>
                {totalSubtasks > 0 && (
                  <div className="w-28 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${Math.round((completedSubtasks / totalSubtasks) * 100)}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Subtask list */}
              <div className="space-y-2">
                {card.checklist.map(st => (
                  <div
                    key={st.id}
                    className="group flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2 text-sm transition hover:bg-slate-100/50 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800"
                  >
                    <label className="flex items-center gap-3 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={st.done}
                        onChange={() => onToggleSubTask(card.id, st.id)}
                        className="h-4 w-4 rounded border-slate-300 text-coral focus:ring-coral"
                      />
                      <span className={cn('text-sm', st.done ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200')}>
                        {st.label}
                      </span>
                    </label>
                    <button
                      onClick={() => onRemoveSubTask(card.id, st.id)}
                      className="text-slate-300 opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-opacity p-1"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add subtask input */}
              <form onSubmit={handleAddSubTask} className="mt-2.5 flex gap-2">
                <input
                  type="text"
                  value={newSubTask}
                  onChange={e => setNewSubTask(e.target.value)}
                  placeholder="Add a concrete step or verification check..."
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 focus:border-coral focus:outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-coral dark:bg-slate-700 dark:hover:bg-coral"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Step
                </button>
              </form>
            </div>

            {/* Deliverables Checklist (The Golden Rule) */}
            {card.deliverables && card.deliverables.length > 0 && (
              <div className="rounded-xl border border-amber-200/50 bg-amber-50/30 p-4 dark:border-amber-900/30 dark:bg-amber-950/20">
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wide">
                    Golden Rule Deliverables
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {card.deliverables.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg bg-white/80 dark:bg-slate-900/80 p-2 text-xs text-slate-700 dark:text-slate-300 border border-amber-100 dark:border-amber-900/20">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                        {i + 1}
                      </span>
                      <span className="truncate">{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Architecture Notes & Decisions */}
            <div>
              <label className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-coral" /> Architecture Decisions & Notes (ADR)
              </label>
              <textarea
                value={card.notes || ''}
                onChange={e => onUpdate(card.id, { notes: e.target.value })}
                placeholder="Log why you chose this design, failure scenarios handled, cost notes, or trade-offs..."
                rows={3}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 font-mono text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-200 focus:border-coral focus:outline-none"
              />
            </div>

            {/* Tags */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tags & Skills</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {card.tags.map(tag => (
                  <span
                    key={tag}
                    className="group inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    #{tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <form onSubmit={handleAddTag} className="inline-flex">
                  <input
                    type="text"
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    placeholder="+ Add tag"
                    className="w-24 rounded-lg border border-dashed border-slate-300 bg-transparent px-2 py-0.5 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300 focus:outline-none focus:border-coral"
                  />
                </form>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs text-slate-400">
              Updated: {new Date(card.updatedAt).toLocaleDateString()}
            </span>
            <button
              onClick={onClose}
              className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
