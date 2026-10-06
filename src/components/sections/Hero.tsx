import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Play, GitBranch, Layers } from 'lucide-react'
import { ProgressRing } from '../primitives/ProgressRing'
import type { ProgressState } from '../../hooks/useProgress'
import { roadmap } from '../../data/roadmap'

const bgParticles = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  delay: Math.random() * 4,
  duration: 3 + Math.random() * 3,
}))

export default function Hero({ state, onSetStartDate }: { state: ProgressState; onSetStartDate: () => void }) {
  const totalItems = useMemo(() => {
    return roadmap.phases.reduce((s, p) => s + p.weeksData.reduce((s2, w) => s2 + w.items.length, 0), 0)
      + roadmap.projects.reduce((s, p) => s + p.checklist.length, 0)
  }, [])
  const done = useMemo(() => {
    return roadmap.phases.reduce((s, p) => s + p.weeksData.reduce((s2, w) => s2 + w.items.filter(i => state.checked[i.id]).length, 0), 0)
      + roadmap.projects.reduce((s, p) => s + p.checklist.filter(i => state.checked[i.id]).length, 0)
  }, [state.checked])
  const pct = totalItems > 0 ? Math.round((done / totalItems) * 100) : 0

  const start = state.startDate ? new Date(state.startDate) : null
  const today = new Date()
  const dayOf112 = start
    ? Math.min(112, Math.max(1, Math.floor((today.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1))
    : null

  return (
    <section id="hero" className="relative overflow-hidden px-4 pt-16 pb-24 md:pt-24 md:pb-32">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.12),transparent_60%)]" aria-hidden="true" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.1),transparent_55%)]" aria-hidden="true" />
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '32px 32px' }} aria-hidden="true" />

      {/* Floating nodes */}
      {bgParticles.map(p => (
        <motion.div
          key={p.id}
          className="absolute h-1 w-1 rounded-full bg-blue-400/20"
          style={{ top: p.top, left: p.left }}
          animate={{ y: [0, -20, 0], opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
          aria-hidden="true"
        />
      ))}

      <div className="relative mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="flex flex-col items-center text-center">
          <div className="mb-4 flex items-center gap-2">
            {['#3b82f6', '#8b5cf6', '#10b981'].map((c, i) => (
              <motion.div
                key={i}
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: c }}
                animate={{ scale: [1, 1.6, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                aria-hidden="true"
              />
            ))}
          </div>

          <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
            From Data Engineer to{' '}
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
              Cloud Architect
            </span>{' '}
            in 16 Weeks
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-slate-400 md:text-xl">
            Master GCP, AWS, Kubernetes, Terraform, and data platforms by building 6 kickass projects.
            Track your progress daily. Land the role.
          </p>

          {/* Stats */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
            <ProgressRing value={pct} size={88} strokeWidth={7} label={`${pct}%`} sublabel="complete" colorClass="text-blue-400" />
            <div className="flex flex-col gap-3">
              {dayOf112 ? (
                <div className="text-left">
                  <span className="text-3xl font-bold text-white">Day {dayOf112}</span>
                  <span className="text-sm text-slate-400"> of 112</span>
                </div>
              ) : (
                <button
                  onClick={onSetStartDate}
                  className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2.5 text-sm font-medium text-blue-400 transition hover:bg-blue-500/20"
                >
                  Set Start Date
                </button>
              )}
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1.5"><Layers className="h-4 w-4 text-blue-400" /> 6 Projects</span>
                <span className="flex items-center gap-1.5"><GitBranch className="h-4 w-4 text-violet-400" /> 4 Certs</span>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="#phase-1"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:shadow-blue-500/40"
            >
              <Play className="h-4 w-4" /> Start Week 1
            </a>
            <a
              href="#projects"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              <Layers className="h-4 w-4" /> View Projects
            </a>
          </div>
        </motion.div>

        {/* Architecture-style decoration */}
        <motion.div
          className="mt-16 hidden items-center justify-center gap-4 md:flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 0.8, duration: 1 }}
          aria-hidden="true"
        >
          {['VPC', 'GKE', 'Pub/Sub', 'BigQuery', 'Cloud Armor', 'Terraform'].map((name, i) => (
            <>
              {i > 0 && <div className="h-px w-8 bg-gradient-to-r from-transparent to-blue-400/40" />}
              <motion.span
                className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-1.5 text-xs font-mono text-blue-300/80"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
              >
                {name}
              </motion.span>
            </>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
