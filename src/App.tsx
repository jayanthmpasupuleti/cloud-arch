import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Moon, Sun, Menu, X, Command } from 'lucide-react'
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
import TodayFocusCard from './components/sections/TodayFocusCard'
import KanbanBoard from './components/sections/KanbanBoard'
import { GlobalProgress } from './components/primitives/GlobalProgress'
import { CommandPalette } from './components/primitives/CommandPalette'
import { loadState, saveState, type ProgressState } from './hooks/useProgress'
import { useScrollSpy } from './hooks/useScrollSpy'
import { roadmap } from './data/roadmap'
import { cn } from './lib/utils'
import { LIGHT_THEME } from './theme/colors'
import './index.css'

// ── Stats Row ──
function StatsRow({ state, darkMode }: { state: ProgressState; darkMode: boolean }) {
  const dayOf112 = state.startDate
    ? Math.min(112, Math.max(1, Math.floor((Date.now() - new Date(state.startDate).getTime()) / (24 * 60 * 60 * 1000)) + 1))
    : null

  return (
    <div className="mx-auto max-w-6xl px-4 pb-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Day', value: dayOf112 ?? '—', suffix: dayOf112 ? '/112' : '' },
          { label: 'Progress', value: useProgressPercentage(state), suffix: '%' },
          { label: 'Projects', value: roadmap.projects.length, suffix: ' total' },
          { label: 'Certs', value: roadmap.certs.length, suffix: ' target' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border bg-white p-4 shadow-sm"
            style={{ borderColor: darkMode ? '#334155' : LIGHT_THEME.borderLight }}
          >
            <p className="text-xs font-medium" style={{ color: LIGHT_THEME.textMuted }}>{stat.label}</p>
            <p className="mt-1 text-xl font-bold" style={{ color: LIGHT_THEME.textPrimary }}>
              {stat.value}{stat.suffix}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function useProgressPercentage(state: ProgressState): number {
  let total = 0, done = 0
  for (const phase of roadmap.phases) {
    for (const w of phase.weeksData) {
      total += w.items.length
      done += w.items.filter(i => state.checked[i.id]).length
    }
  }
  for (const p of roadmap.projects) {
    total += p.checklist.length
    done += p.checklist.filter(i => state.checked[i.id]).length
  }
  return total === 0 ? 0 : Math.round((done / total) * 100)
}

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
  const [darkMode, setDarkMode] = useState(() => !state.lightMode)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showStartModal, setShowStartModal] = useState(false)
  const [startInput, setStartInput] = useState('')

  useScrollSpy(SECTIONS.map(s => s.id))

  useEffect(() => {
    const root = document.documentElement
    if (darkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    setState(prev => {
      const next = { ...prev, lightMode: !darkMode }
      saveState(next)
      return next
    })
  }, [darkMode])

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

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: darkMode ? '#0F172A' : LIGHT_THEME.bgPrimary, color: darkMode ? '#F1F5F9' : LIGHT_THEME.textPrimary }}>
      <GlobalProgress state={state} />

      {/* Skip link */}
      <a href="#hero" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-coral focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>

      {/* Navigation */}
      <nav className={cn('sticky top-0 z-30 border-b transition-colors duration-300', darkMode ? 'border-white/[0.06] bg-[#0F172A]/90 backdrop-blur' : 'border-gray-200/60 bg-white/90 backdrop-blur')} aria-label="Main">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-coral text-white text-xs font-bold shadow-sm">
                CA
              </div>
              <span className="hidden text-sm font-semibold" style={{ color: darkMode ? '#F1F5F9' : LIGHT_THEME.textPrimary }}>Cloud Architect Roadmap</span>
            </div>

            <div className="hidden md:flex items-center gap-1">
              {SECTIONS.map(s => (
                <a key={s.id} href={`#${s.id}`} className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition',
                  darkMode ? 'text-slate-400 hover:text-white hover:bg-white/[0.06]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                )}>{s.label}</a>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setDarkMode(l => !l)}
                className={cn('rounded-lg p-2 transition', darkMode ? 'text-slate-400 hover:bg-white/[0.06] hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700')}
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>
              <button
                onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true }))}
                className={cn('hidden sm:flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition', darkMode ? 'border-white/10 text-slate-400' : 'border-gray-200 text-gray-500')}
              >
                <Command className="h-3.5 w-3.5" /> Cmd+K
              </button>
              <button onClick={() => setMobileOpen(!mobileOpen)} className={cn('md:hidden rounded-lg p-2', darkMode ? 'text-slate-400' : 'text-gray-500')} aria-label="Toggle menu">
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className={cn('md:hidden overflow-hidden border-t', darkMode ? 'border-white/[0.06]' : 'border-gray-200')}
          >
            <div className="space-y-1 px-4 py-2">
              {SECTIONS.map(s => (
                <a key={s.id} href={`#${s.id}`} onClick={() => setMobileOpen(false)} className={cn('block rounded-lg px-3 py-2 text-sm', darkMode ? 'text-slate-400 hover:bg-white/[0.06]' : 'text-gray-600 hover:bg-gray-100')}>{s.label}</a>
              ))}
            </div>
          </motion.div>
        )}
      </nav>

      {/* Today's Focus Card */}
      <TodayFocusCard state={state} onToggle={handleToggle} />

      {/* Task Board */}
      <KanbanBoard state={state} onToggle={handleToggle} setState={setState} />

      {/* Stats Row */}
      <StatsRow state={state} darkMode={darkMode} />

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
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowStartModal(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border bg-white p-6 shadow-2xl" style={{ borderColor: LIGHT_THEME.borderLight }}>
            <h3 className="text-lg font-semibold" style={{ color: LIGHT_THEME.textPrimary }}>Set Your Start Date</h3>
            <p className="text-sm mt-2 mb-4" style={{ color: LIGHT_THEME.textSecondary }}>We'll use this to calculate your Day X of 112 and show the current week's focus.</p>
            <input type="date" value={startInput} onChange={e => setStartInput(e.target.value)} className="w-full rounded-xl border bg-white px-4 py-2.5 text-sm focus:border-coral/50 focus:outline-none" style={{ borderColor: LIGHT_THEME.border, color: LIGHT_THEME.textPrimary }} />
            <div className="mt-4 flex gap-3">
              <button onClick={() => setShowStartModal(false)} className="flex-1 rounded-xl border py-2.5 text-sm transition hover:bg-gray-50" style={{ borderColor: LIGHT_THEME.border, color: LIGHT_THEME.textSecondary }}>Cancel</button>
              <button onClick={confirmStartDate} className="flex-1 rounded-xl border py-2.5 text-sm text-coral transition hover:bg-coral/5" style={{ borderColor: 'rgba(255,107,107,0.3)', backgroundColor: 'rgba(255,107,107,0.04)' }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
