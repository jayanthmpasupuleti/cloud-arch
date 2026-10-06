import { useState, useEffect, useRef, useMemo, type KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ArrowRight } from 'lucide-react'
import { roadmap } from '../../data/roadmap'
import { cn } from '../../lib/utils'

type Item = { type: string; label: string; id: string; href: string }

function buildIndex(): Item[] {
  const items: Item[] = []
  for (const phase of roadmap.phases) {
    items.push({ type: 'Phase', label: `${phase.number}. ${phase.title}`, id: phase.id, href: `#${phase.id}` })
    for (const w of phase.weeksData) {
      items.push({ type: 'Week', label: `Week ${w.number}: ${w.title}`, id: `${phase.id}-w${w.number}`, href: `#${phase.id}` })
    }
    for (const pid of phase.projectIds) {
      const proj = roadmap.projects.find(p => p.id === pid)
      if (proj) items.push({ type: 'Project', label: proj.title, id: proj.id, href: `#project-${proj.id}` })
    }
  }
  for (const proj of roadmap.projects) {
    items.push({ type: 'Project', label: proj.title, id: proj.id, href: `#project-${proj.id}` })
  }
  const sections = [
    { type: 'Section', label: 'Strategy', id: 'strategy', href: '#strategy' },
    { type: 'Section', label: 'Projects', id: 'projects', href: '#projects' },
    { type: 'Section', label: 'Skills Radar', id: 'skills', href: '#skills' },
    { type: 'Section', label: 'Weekly Rhythm', id: 'rhythm', href: '#rhythm' },
    { type: 'Section', label: 'Certifications', id: 'certifications', href: '#certifications' },
    { type: 'Section', label: 'Job Search', id: 'job-search', href: '#job-search' },
    { type: 'Section', label: 'Resources', id: 'resources', href: '#resources' },
  ]
  items.push(...sections)
  return items
}

const INDEX = buildIndex()

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      const ke = e as unknown as KeyboardEvent
      if ((ke.metaKey || ke.ctrlKey) && ke.key === 'k') { ke.preventDefault(); setOpen(o => !o) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) { setQ(''); setTimeout(() => inputRef.current?.focus(), 50) }
  }, [open])

  const filtered = useMemo(() => {
    if (!q.trim()) return INDEX.slice(0, 12)
    const lower = q.toLowerCase()
    return INDEX.filter(i => i.label.toLowerCase().includes(lower)).slice(0, 12)
  }, [q])

  const navigate = (href: string) => {
    setOpen(false)
    const el = document.querySelector(href)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const typeColor: Record<string, string> = {
    Phase: 'text-blue-400',
    Project: 'text-violet-400',
    Week: 'text-slate-400',
    Section: 'text-emerald-400',
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh]" role="dialog" aria-modal="true" aria-label="Command palette">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1117] shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                ref={inputRef}
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Jump to phase, project, or section..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Escape') setOpen(false)
                }}
              />
              <kbd className="rounded border border-white/10 bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-slate-400">ESC</kbd>
            </div>
            <ul className="max-h-72 overflow-y-auto p-2">
              {filtered.map(item => (
                <li key={item.id + item.href}>
                  <button
                    onClick={() => navigate(item.href)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                      'hover:bg-white/[0.06] focus-visible:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-blue-400/60 focus-visible:outline-none'
                    )}
                  >
                    <span className={cn('text-xs font-medium uppercase tracking-wider', typeColor[item.type])}>{item.type}</span>
                    <span className="flex-1 truncate text-slate-200">{item.label}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                  </button>
                </li>
              ))}
              {filtered.length === 0 && <li className="px-3 py-6 text-center text-sm text-slate-500">No results found.</li>}
            </ul>
            <div className="border-t border-white/[0.06] px-4 py-2 text-xs text-slate-500">
              <span className="mr-4"><kbd className="rounded border border-white/10 bg-white/[0.06] px-1 py-0.5">↑↓</kbd> Navigate</span>
              <span className="mr-4"><kbd className="rounded border border-white/10 bg-white/[0.06] px-1 py-0.5">↵</kbd> Go</span>
              <span><kbd className="rounded border border-white/10 bg-white/[0.06] px-1 py-0.5">esc</kbd> Close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
