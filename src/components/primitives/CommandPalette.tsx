import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ArrowRight } from 'lucide-react'
import { roadmap } from '../../data/roadmap'
import { cn } from '../../lib/utils'
import type { DashboardTab } from '../../types/learning'

type Item = { type: string; label: string; id: string; tab?: DashboardTab; href?: string }

function buildIndex(): Item[] {
  const items: Item[] = [
    { type: 'Workspace', label: 'Kanban Studio (Daily Task Board)', id: 'tab-kanban', tab: 'kanban' },
    { type: 'Workspace', label: '16-Week Curriculum & Roadmap', id: 'tab-curriculum', tab: 'curriculum' },
    { type: 'Workspace', label: 'Projects & Golden Rule Deliverables', id: 'tab-projects', tab: 'projects' },
    { type: 'Workspace', label: 'Competency Skills Radar', id: 'tab-skills', tab: 'skills' },
    { type: 'Workspace', label: 'Certifications Tracker', id: 'tab-certs', tab: 'certs' },
    { type: 'Workspace', label: 'Daily Architecture Journal', id: 'tab-journal', tab: 'journal' },
    { type: 'Workspace', label: 'Job Search Kit', id: 'tab-job-search', tab: 'jobSearch' },
    { type: 'Workspace', label: 'Curated Documentation & Books', id: 'tab-resources', tab: 'resources' },
  ]

  for (const phase of roadmap.phases) {
    items.push({ type: 'Phase', label: `Phase ${phase.number}: ${phase.title}`, id: phase.id, tab: 'curriculum' })
    for (const w of phase.weeksData) {
      items.push({ type: 'Week', label: `Week ${w.number}: ${w.title}`, id: `${phase.id}-w${w.number}`, tab: 'curriculum' })
    }
  }

  for (const proj of roadmap.projects) {
    items.push({ type: 'Project', label: proj.title, id: proj.id, tab: 'projects' })
  }

  return items
}

const INDEX = buildIndex()

interface Props {
  onSelectTab?: (tab: DashboardTab) => void
}

export function CommandPalette({ onSelectTab }: Props) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      const ke = e as unknown as KeyboardEvent
      if ((ke.metaKey || ke.ctrlKey) && ke.key === 'k') {
        ke.preventDefault()
        setOpen(o => !o)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) {
      setQ('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const filtered = INDEX.filter(i => {
    if (!q.trim()) return true
    return i.label.toLowerCase().includes(q.toLowerCase())
  }).slice(0, 10)

  const handleSelect = (item: Item) => {
    setOpen(false)
    if (item.tab && onSelectTab) {
      onSelectTab(item.tab)
    } else if (item.href) {
      const el = document.querySelector(item.href)
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const typeColor: Record<string, string> = {
    Workspace: 'text-coral font-bold',
    Phase: 'text-blue-500',
    Project: 'text-violet-500',
    Week: 'text-slate-400',
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center pt-[15vh] p-4" role="dialog" aria-modal="true" aria-label="Command palette">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                ref={inputRef}
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Jump to any workspace view, phase, or project..."
                className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 focus:outline-none"
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Escape') setOpen(false)
                }}
              />
              <kbd className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-400 dark:border-slate-700 dark:bg-slate-800">ESC</kbd>
            </div>
            <ul className="max-h-80 overflow-y-auto p-2">
              {filtered.map(item => (
                <li key={item.id}>
                  <button
                    onClick={() => handleSelect(item)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs transition-colors',
                      'hover:bg-slate-50 dark:hover:bg-slate-800/60 focus-visible:bg-slate-50 focus-visible:outline-none'
                    )}
                  >
                    <span className={cn('text-[10px] font-semibold uppercase tracking-wider', typeColor[item.type] || 'text-slate-400')}>
                      {item.type}
                    </span>
                    <span className="flex-1 truncate font-medium text-slate-800 dark:text-slate-200">
                      {item.label}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="px-3 py-8 text-center text-xs text-slate-400">
                  No matching lessons or views found.
                </li>
              )}
            </ul>
            <div className="border-t border-slate-100 px-4 py-2 text-[11px] text-slate-400 dark:border-slate-800">
              <span className="mr-4"><kbd className="rounded border border-slate-200 px-1 py-0.5 text-[9px] mr-1 dark:border-slate-700">↑↓</kbd> Navigate</span>
              <span className="mr-4"><kbd className="rounded border border-slate-200 px-1 py-0.5 text-[9px] mr-1 dark:border-slate-700">↵</kbd> Select</span>
              <span><kbd className="rounded border border-slate-200 px-1 py-0.5 text-[9px] mr-1 dark:border-slate-700">esc</kbd> Dismiss</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}