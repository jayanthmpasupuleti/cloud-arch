import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Clock, Star, CheckCircle2 } from 'lucide-react'
import { Card, CardBody, Badge } from '../primitives'
import { Drawer, Checklist } from '../primitives'
import { roadmap, PHASE_COLORS } from '../../data/roadmap'
import type { ProgressState } from '../../hooks/useProgress'

const DIFFICULTY_COLORS: Record<string, string> = { Beginner: 'blue', Intermediate: 'amber', Advanced: 'violet' }

function getProjectProgress(projectId: string, checked: Record<string, boolean>): number {
  const project = roadmap.projects.find(p => p.id === projectId)
  if (!project || project.checklist.length === 0) return 0
  const done = project.checklist.filter(i => checked[i.id]).length
  return Math.round((done / project.checklist.length) * 100)
}

export default function ProjectGrid({ state, onToggle }: { state: ProgressState; onToggle: (id: string) => void }) {
  const [filter, setFilter] = useState<'all' | string>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'not-started' | 'in-progress' | 'done'>('all')
  const [openProject, setOpenProject] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const phaseIds = useMemo(() => Array.from(new Set(roadmap.projects.map(p => p.phaseId))), [])

  let filtered = roadmap.projects
  if (filter !== 'all') filtered = filtered.filter(p => p.phaseId === filter)
  if (statusFilter !== 'all') filtered = filtered.filter(p => {
    const pp = getProjectProgress(p.id, state.checked)
    if (statusFilter === 'done') return pp === 100
    if (statusFilter === 'in-progress') return pp > 0 && pp < 100
    return pp === 0
  })
  if (search.trim()) filtered = filtered.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.proves.toLowerCase().includes(search.toLowerCase()))

  const openProjectData = openProject ? roadmap.projects.find(p => p.id === openProject) : null

  return (
    <section id="projects">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-white md:text-4xl">Projects</h2>
          <p className="mt-3 text-slate-400">6 hands-on projects + capstone. Each ships with Terraform, diagrams, and trade-off docs.</p>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <select
            value={filter} onChange={e => setFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-200 focus:border-blue-500/50 focus:outline-none"
            aria-label="Filter by phase"
          >
            <option value="all">All Phases</option>
            {phaseIds.map(pid => <option key={pid} value={pid}>{roadmap.phases.find(p => p.id === pid)?.title}</option>)}
          </select>
          {(['all', 'not-started', 'in-progress', 'done'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`rounded-lg border px-3 py-2 text-sm transition ${statusFilter === s ? 'border-blue-500/40 bg-blue-500/15 text-blue-300' : 'border-white/10 bg-white/[0.03] text-slate-400 hover:text-white'}`}>
              {s === 'all' ? 'All' : s === 'not-started' ? 'Not Started' : s === 'in-progress' ? 'In Progress' : 'Done'}
            </button>
          ))}
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..."
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-500/50 focus:outline-none"
            aria-label="Search projects" />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {filtered.map((project, i) => {
            const pct = getProjectProgress(project.id, state.checked)
            const colors = PHASE_COLORS[project.phaseId as keyof typeof PHASE_COLORS]
            return (
              <motion.div key={project.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Card className="h-full group cursor-pointer" onClick={() => setOpenProject(project.id)}>
                  <CardBody>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${colors.gradient} text-white text-sm font-bold shadow-lg`}>
                          {roadmap.phases.find(p => p.id === project.phaseId)?.number}
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-white">{project.title}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant={DIFFICULTY_COLORS[project.difficulty]}>{project.difficulty}</Badge>
                            <span className="flex items-center gap-1 text-xs text-slate-500"><Clock className="h-3 w-3" /> {project.weeks}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-slate-500 tabular-nums">{pct}%</span>
                    </div>
                    <p className="mt-3 text-sm text-slate-400 line-clamp-2">{project.description}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {project.techStack.slice(0, 5).map(t => (
                        <span key={t} className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-xs font-mono text-slate-400">{t}</span>
                      ))}
                      {project.techStack.length > 5 && <span className="text-xs text-slate-500">+{project.techStack.length - 5}</span>}
                    </div>
                    <div className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-500/10 bg-emerald-500/[0.03] p-3">
                      <Star className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                      <p className="text-xs text-emerald-200/70 italic">{project.proves}</p>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 group-hover:text-blue-400 transition-colors">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Click for details & checklist
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      <Drawer open={!!openProjectData} onClose={() => setOpenProject(null)} title={openProjectData?.title ?? ''} width="max-w-2xl">
        {openProjectData && (
          <div>
            <p className="text-sm text-slate-400 mb-4">{openProjectData.description}</p>
            <div className="mb-4 flex flex-wrap gap-1.5">
              {openProjectData.techStack.map(t => (
                <span key={t} className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-xs font-mono text-slate-400">{t}</span>
              ))}
            </div>
            <div className="mb-6 rounded-lg border border-emerald-500/10 bg-emerald-500/[0.03] p-4">
              <p className="text-sm text-emerald-200/80 italic">{openProjectData.proves}</p>
            </div>
            <h4 className="text-sm font-semibold text-white mb-2">Checklist</h4>
            <Checklist items={openProjectData.checklist} checked={state.checked} onToggle={onToggle} accentColor="text-blue-400" />
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-white mb-3">Deliverables</h4>
              <div className="grid gap-2">
                {openProjectData.deliverables.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-sm text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-blue-400/50" />
                    {d}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </section>
  )
}
