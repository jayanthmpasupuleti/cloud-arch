import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Sun, Menu, X, Command, CalendarDays } from 'lucide-react'
import Hero from './components/sections/Hero'
import StrategyStrip from './components/sections/StrategyStrip'
import Timeline from './components/sections/Timeline'
import ProjectGrid from './components/sections/ProjectGrid'
import SkillsRadar from './components/sections/SkillsRadar'
import WeeklyRhythm from './components/sections/WeeklyRhythm'
import CertTracker from './components/sections/CertTracker'
import JobSearchKit from './components/sections/JobSearchKit'
import Resources from './components/sections/Resources'
import Footer from './components/sections/Footer'
import { GlobalProgress } from './components/primitives/GlobalProgress'
import { CommandPalette } from './components/primitives/CommandPalette'
import { loadState, saveState, getTodayTasks, type ProgressState } from './hooks/useProgress'
import { useScrollSpy } from './hooks/useScrollSpy'
import { cn } from './lib/utils'
import './index.css'

const SECTIONS = [
  { id: 'hero', label: 'Home' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'rhythm', label: 'Rhythm' },
  { id: 'certifications', label: 'Certs' },
  { id: 'job-search', label: 'Job Hunt' },
  { id: 'resources', label: 'Resources' },
]

export default function App() {
  const [state, setState] = useState<ProgressState>(() => loadState())
  const [lightMode, setLightMode] = useState(() => state.lightMode)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showStartModal, setShowStartModal] = useState(false)
  const [startInput, setStartInput] = useState('')

  useScrollSpy(SECTIONS.map(s => s.id))

  useEffect(() => {
    const root = document.documentElement
    if (lightMode) { root.classList.add('light') } else { root.classList.remove('light') }
    setState(prev => { const next = { ...prev, lightMode }; saveState(next); return next })
  }, [lightMode])

  const handleToggle = useCallback((id: string) => {
    setState(prev => {
      const next = { ...prev, checked: { ...prev.checked, [id]: !prev.checked[id] } }
      saveState(next)
      return next
    })
  }, [])

  const handleUpdateCert = useCallback((id: string, field: string, value: string) => {
    setState(prev => {
      const key = field === 'status' ? 'certStatuses' : 'certTargets'
      const next = { ...prev, [key]: { ...prev[key as 'certStatuses' | 'certTargets'], [id]: value } }
      saveState(next)
      return next
    })
  }, [])

  const handleSetStartDate = useCallback(() => {
    setShowStartModal(true)
    const today = new Date().toISOString().split('T')[0]
    setStartInput(today)
  }, [])

  const confirmStartDate = useCallback(() => {
    if (!startInput) return
    setState(prev => {
      const next = { ...prev, startDate: startInput }
      saveState(next)
      return next
    })
    setShowStartModal(false)
  }, [startInput])

  const todayTasks = getTodayTasks(state)

  return (
    <div className={cn('min-h-screen bg-[#060918] text-slate-200 antialiased transition-colors duration-300', lightMode && 'bg-slate-50 text-slate-900')}>
      <GlobalProgress state={state} />

      {/* Skip link */}
      <a href="#hero" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>

      {/* Navigation */}
      <nav className={cn('sticky top-0 z-30 border-b transition-colors duration-300', lightMode ? 'border-slate-200 bg-slate-50/90 backdrop-blur' : 'border-white/[0.06] bg-[#060918]/90 backdrop-blur')} aria-label="Main">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 text-white text-xs font-bold shadow">
                CA
              </div>
              <span className={cn('hidden text-sm font-semibold', lightMode ? 'text-slate-900' : 'text-white')}>Cloud Architect Roadmap</span>
            </div>

            <div className="hidden md:flex items-center gap-1">
              {SECTIONS.map(s => (
                <a key={s.id} href={`#${s.id}`} className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition',
                  lightMode ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                )}>{s.label}</a>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setLightMode(l => !l)}
                className={cn('rounded-lg p-2 transition', lightMode ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-white/[0.06] hover:text-white')}
                aria-label={lightMode ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {lightMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>
              <button
                onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true }))}
                className={cn('hidden sm:flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition', lightMode ? 'border-slate-200 text-slate-500' : 'border-white/10 text-slate-400')}
              >
                <Command className="h-3.5 w-3.5" /> Cmd+K
              </button>
              <button onClick={() => setMobileOpen(!mobileOpen)} className={cn('md:hidden rounded-lg p-2', lightMode ? 'text-slate-600' : 'text-slate-400')} aria-label="Toggle menu">
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={cn('md:hidden overflow-hidden border-t', lightMode ? 'border-slate-200' : 'border-white/[0.06]')}
            >
              <div className="space-y-1 px-4 py-2">
                {SECTIONS.map(s => (
                  <a key={s.id} href={`#${s.id}`} onClick={() => setMobileOpen(false)} className={cn('block rounded-lg px-3 py-2 text-sm', lightMode ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-white/[0.06]')}>{s.label}</a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Today card */}
      {todayTasks && (
        <div className={cn('mx-auto max-w-6xl px-4 pt-6', lightMode ? '' : '')}>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('rounded-2xl border p-4 md:p-5', lightMode ? 'border-blue-200 bg-blue-50' : 'border-blue-500/15 bg-blue-500/[0.04]')}
          >
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className={cn('h-4 w-4', lightMode ? 'text-blue-600' : 'text-blue-400')} />
              <span className={cn('text-sm font-semibold', lightMode ? 'text-blue-900' : 'text-blue-300')}>
                Today: Week {todayTasks.weekNum} — {todayTasks.title}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {todayTasks.tasks.map(task => (
                <span key={task.id} className={cn('rounded-lg border px-3 py-1.5 text-xs transition', lightMode ? 'border-blue-200 bg-white text-slate-700' : 'border-blue-500/10 bg-blue-500/[0.06] text-slate-300')}>{task.label}</span>
              ))}
              {todayTasks.tasks.length === 0 && <span className={cn('text-xs', lightMode ? 'text-slate-500' : 'text-slate-500')}>All caught up!</span>}
            </div>
          </motion.div>
        </div>
      )}

      <main>
        <Hero state={state} onSetStartDate={handleSetStartDate} />
        <StrategyStrip />
        <Timeline state={state} onToggle={handleToggle} />
        <ProjectGrid state={state} onToggle={handleToggle} />
        <SkillsRadar state={state} />
        <WeeklyRhythm />
        <CertTracker state={state} onUpdateCert={handleUpdateCert} />
        <JobSearchKit state={state} />
        <Resources />
      </main>

      <Footer state={state} setState={setState} />
      <CommandPalette />

      {/* Start date modal */}
      {showStartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowStartModal(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0d1117] p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-2">Set Your Start Date</h3>
            <p className="text-sm text-slate-400 mb-4">We'll use this to calculate your Day X of 112 and show the current week's focus.</p>
            <input type="date" value={startInput} onChange={e => setStartInput(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-slate-200 focus:border-blue-500/50 focus:outline-none" />
            <div className="mt-4 flex gap-3">
              <button onClick={() => setShowStartModal(false)} className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm text-slate-300 hover:bg-white/[0.04]">Cancel</button>
              <button onClick={confirmStartDate} className="flex-1 rounded-xl border border-blue-500/30 bg-blue-500/15 py-2.5 text-sm text-blue-400 hover:bg-blue-500/25">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
