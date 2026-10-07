import { motion } from 'framer-motion'
import {
  Rocket,
  LayoutDashboard,
  Layers,
  TrendingUp,
  ArrowRight,
  LogIn,
  Sparkles,
} from 'lucide-react'
import type { UserProfile } from '../../types/learning'
import { roadmap } from '../../data/roadmap'

interface Props {
  currentUser: UserProfile
  onEnterDashboard: () => void
  onOpenAuth: () => void
  darkMode: boolean
  onToggleTheme: () => void
}

export default function LandingPage({
  currentUser,
  onEnterDashboard,
  onOpenAuth,
  darkMode,
  onToggleTheme,
}: Props) {
  return (
    <div className="min-h-screen bg-[#FFF5ED] text-slate-900 transition-colors duration-300 dark:bg-[#0B1120] dark:text-slate-100 selection:bg-coral/20">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-[#0B1120]/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-coral text-white font-extrabold shadow-md shadow-coral/30 text-sm">
              CA
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                Cloud Architect OS
              </span>
              <span className="hidden sm:inline-block ml-2 rounded-md bg-coral/10 px-2 py-0.5 text-[10px] font-bold text-coral">
                16-Week Studio
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onToggleTheme}
              className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:text-slate-800 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white text-xs"
              title="Toggle Theme"
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>

            <button
              onClick={onOpenAuth}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-coral hover:text-coral dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-coral"
            >
              <LogIn className="h-3.5 w-3.5" />
              {currentUser.name.split(' ')[0]} (Switch)
            </button>

            <button
              onClick={onEnterDashboard}
              className="inline-flex items-center gap-2 rounded-xl bg-coral px-5 py-2 text-xs font-bold text-white shadow-md shadow-coral/25 transition hover:bg-coral/90 hover:shadow-lg"
            >
              <LayoutDashboard className="h-4 w-4" />
              Go to Learning Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-16 pb-20 lg:pt-24 lg:pb-32">
        <div className="mx-auto max-w-6xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-coral/20 bg-coral/10 px-4 py-1.5 text-xs font-semibold text-coral">
              <Sparkles className="h-3.5 w-3.5" />
              Active Learning Operating System for Cloud Aspirants
            </div>

            {/* Headline */}
            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
              From Data Engineer to{' '}
              <span className="bg-gradient-to-r from-coral via-amber-500 to-rose-500 bg-clip-text text-transparent">
                Cloud Architect
              </span>{' '}
              in 16 Weeks
            </h1>

            {/* Subtitle */}
            <p className="mx-auto max-w-2xl text-base text-slate-600 sm:text-lg dark:text-slate-400">
              Stop passively watching endless tutorial videos. Track daily progress, drag-and-drop tasks in your
              personal Kanban studio, and ship 6 production architectures across GCP, AWS, and Kubernetes.
            </p>

            {/* Primary CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={onEnterDashboard}
                className="group inline-flex items-center gap-2 rounded-2xl bg-coral px-7 py-4 text-sm font-bold text-white shadow-xl shadow-coral/30 transition-all hover:bg-coral/90 hover:scale-[1.02]"
              >
                <Rocket className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
                Launch Learning Dashboard
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white/90 px-6 py-4 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur transition hover:border-coral hover:text-coral dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200"
              >
                <LogIn className="h-4 w-4" />
                Sign In as {currentUser.name}
              </button>
            </div>

            {/* Quick Stats Badges */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-6 border-t border-slate-200/80 dark:border-slate-800">
              {[
                { label: 'Curriculum', value: '16 Weeks' },
                { label: 'Real Projects', value: '6 + Capstone' },
                { label: 'Golden Deliverables', value: '4 Per Project' },
                { label: 'Daily Tracking', value: 'Kanban Studio' },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {stat.value}
                  </div>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Kanban Teaser Section */}
      <section className="px-6 py-16 border-y border-slate-200 bg-white/50 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              An Everyday Learning OS Designed for Engineers
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Move tasks from Backlog → To Do → In Progress → Review → Done. Add your own research topics, attach architectural decision records (ADRs), and never lose your momentum.
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-850">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 mb-4">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Personal Kanban Studio
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Drag-and-drop workflow with five distinct delivery stages. Subtasks, due dates, priority labels, and instant curriculum imports.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-850">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400 mb-4">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                The Golden Rule Deliverables
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Every project enforces 4 tangible outputs: Terraform in GitHub, high-level diagrams, architectural trade-offs, and FinOps cost models.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-850">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400 mb-4">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Live Competency Radar
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                9 architecture domains dynamically computed as you check off tasks. Real-time visual feedback of your engineering growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 16-Week Roadmap Curriculum Overview */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-coral">
            Structured 4-Phase Curriculum
          </span>
          <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
            The 16-Week Roadmap at a Glance
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {roadmap.phases.map(p => (
            <div
              key={p.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-850"
            >
              <div>
                <span className="rounded-md bg-coral/10 px-2 py-0.5 text-xs font-bold text-coral">
                  Phase {p.number}
                </span>
                <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                  {p.title}
                </h3>
                <p className="mt-1 text-xs text-slate-400 font-medium">
                  {p.weeks}
                </p>
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {p.description}
                </p>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-3 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  {p.weeksData.length} Weeks · {p.projectIds.length} Projects
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Final CTA Banner */}
        <div className="mt-16 rounded-3xl border border-coral/30 bg-gradient-to-r from-coral/10 via-amber-500/10 to-rose-500/10 p-8 text-center sm:p-12">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            Ready to track your cloud architect journey?
          </h3>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600 dark:text-slate-300">
            Open your dashboard now. Work in your Kanban board, pull lessons from the roadmap, and maintain your streak.
          </p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={onEnterDashboard}
              className="inline-flex items-center gap-2 rounded-2xl bg-coral px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-coral/30 transition hover:bg-coral/90 hover:scale-105"
            >
              <LayoutDashboard className="h-4 w-4" />
              Launch Learning Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 px-6 text-center text-xs text-slate-400 dark:border-slate-800">
        <p>Cloud Architect Learning OS · Zero Backend · All Data Persisted Locally in Your Browser</p>
      </footer>
    </div>
  )
}
