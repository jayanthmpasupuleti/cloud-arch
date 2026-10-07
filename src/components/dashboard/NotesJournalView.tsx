import { useState } from 'react'
import { motion } from 'framer-motion'
import { PenTool, Plus, Trash2, Calendar, FileText } from 'lucide-react'
import type { DailyNote } from '../../types/learning'

interface Props {
  notes: DailyNote[]
  onAddNote: (note: Omit<DailyNote, 'id'>) => void
  onDeleteNote: (id: string) => void
}

export default function NotesJournalView({
  notes,
  onAddNote,
  onDeleteNote,
}: Props) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tagsInput, setTagsInput] = useState('')

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    onAddNote({
      date: new Date().toISOString().split('T')[0],
      title: title.trim(),
      content: content.trim(),
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
    })

    setTitle('')
    setContent('')
    setTagsInput('')
    setShowAddForm(false)
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-coral/10 p-2 text-coral">
              <PenTool className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
                Daily Architectural Journal & Decision Log
              </h1>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Log your daily learnings, architectural trade-offs (ADRs), and failure modes handled.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-coral px-4 py-2 text-xs font-semibold text-white shadow-md shadow-coral/20 hover:bg-coral/90"
          >
            <Plus className="h-4 w-4" />
            {showAddForm ? 'Cancel Entry' : 'New Journal Entry'}
          </button>
        </div>
      </div>

      {/* New Note Form */}
      {showAddForm && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleCreate}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/70 space-y-4"
        >
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Log Today's Work & Architecture Insights
          </h3>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Entry Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Day 15: Configured Cloud NAT with Private Google Access"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:border-coral focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Notes, Trade-offs & What You Discovered
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Document the architectural nuances, debugging steps, or code decisions..."
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:border-coral focus:outline-none font-mono text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="Terraform, VPC, Cloud NAT, Day Log"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:border-coral focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-coral px-5 py-2 text-xs font-semibold text-white shadow-md shadow-coral/20 hover:bg-coral/90"
            >
              Save Entry
            </button>
          </div>
        </motion.form>
      )}

      {/* Notes Stream */}
      <div className="space-y-4">
        {notes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center dark:border-slate-800">
            <FileText className="mx-auto h-8 w-8 text-slate-400" />
            <h3 className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-300">
              No entries logged yet
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Document your daily wins, debugging hurdles, and architecture decisions here.
            </p>
          </div>
        ) : (
          notes.map(note => (
            <div
              key={note.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                      <Calendar className="h-3 w-3" /> {note.date}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {note.title}
                  </h3>
                </div>

                <button
                  onClick={() => onDeleteNote(note.id)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                  title="Delete entry"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-mono bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                {note.content}
              </p>

              {note.tags && note.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {note.tags.map(t => (
                    <span
                      key={t}
                      className="rounded-md border border-slate-100 bg-slate-100/70 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
