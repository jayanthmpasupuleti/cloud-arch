import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Clock, Star, CheckCircle2 } from 'lucide-react'
import { Card, CardBody, Badge } from '../primitives'
import { Drawer } from '../primitives/Drawer'
import { Checklist } from '../primitives/Checklist'
import { roadmap, PHASE_COLORS } from '../../data/roadmap'
import type { ProgressState } from '../../hooks/useProgress'
import { LIGHT_THEME } from '../../theme/colors'

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
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-10">
          <h2 className="text-3xl font-bold md:text-4xl" style={{ color: LIGHT_THEME.textPrimary }}>Projects</h2>
          <p className="mt-3" style={{ color: LIGHT_THEME.textSecondary }}>6 hands-on projects + capstone. Each ships with Terraform, diagrams, and trade-off docs.</p>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <select
            value={filter} onChange={e => setFilter(e.target.value)}
            className="rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none"
            style={{ borderColor: LIGHT_THEME.border, color: LIGHT_THEME.textPrimary }}
            aria-label="Filter by phase"
          >
            <option value="all">All Phases</option>
            {phaseIds.map(pid => <option key={pid} value={pid}>{roadmap.phases.find(p => p.id === pid)?.title}</option>)}
          </select>
          {(['all', 'not-started', 'in-progress', 'done'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`rounded-lg border px-3 py-2 text-sm transition ${statusFilter === s ? 'bg-coral/10 text-coral border-coral/20' : 'border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
              {s === 'all' ? 'All' : s === 'not-started' ? 'Not Started' : s === 'in-progress' ? 'In Progress' : 'Done'}
            </button>
          ))}
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..."
            className="rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none"
            style={{ borderColor: LIGHT_THEME.border, color: LIGHT_THEME.textPrimary }}
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
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white text-sm font-bold shadow-md bg-gradient-to-br ${colors.gradient}`}>
                          {roadmap.phases.find(p => p.id === project.phaseId)?.number}
                        </div>
                        <div>
                          <h3 className="text-base font-semibold" style={{ color: LIGHT_THEME.textPrimary }}>{project.title}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant={DIFFICULTY_COLORS[project.difficulty]}>{project.difficulty}</Badge>
                            <span className="flex items-center gap-1 text-xs" style={{ color: LIGHT_THEME.textMuted }}><Clock className="h-3 w-3" /> {project.weeks}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs tabular-nums" style={{ color: LIGHT_THEME.textMuted }}>{pct}%</span>
                    </div>
                    <p className="mt-3 text-sm line-clamp-2" style={{ color: LIGHT_THEME.textSecondary }}>{project.description}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {project.techStack.slice(0, 5).map(t => (
                        <span key={t} className="rounded-md border bg-white px-2 py-0.5 text-xs font-mono" style={{ borderColor: LIGHT_THEME.border, color: LIGHT_THEME.textMuted }}>{t}</span>
                      ))}
                      {project.techStack.length > 5 && <span className="text-xs" style={{ color: LIGHT_THEME.textMuted }}>+{project.techStack.length - 5}</span>}
                    </div>
                    <div className="mt-4 flex items-start gap-2 rounded-lg border p-3" style={{ borderColor: 'rgba(16,185,129,0.15)', backgroundColor: 'rgba(16,185,129,0.03)' }}>
                      <Star className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                      <p className="text-xs text-emerald-600/80 italic">{project.proves}</p>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs transition-colors group-hover:text-coral" style={{ color: LIGHT_THEME.textMuted }}>
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
            <p className="text-sm mb-4" style={{ color: LIGHT_THEME.textSecondary }}>{openProjectData.description}</p>
            <div className="mb-4 flex flex-wrap gap-1.5">
              {openProjectData.techStack.map(t => (
                <span key={t} className="rounded-md border bg-white px-2 py-0.5 text-xs font-mono" style={{ borderColor: LIGHT_THEME.border, color: LIGHT_THEME.textMuted }}>{t}</span>
              ))}
            </div>
            <div className="mb-6 rounded-lg border p-4" style={{ borderColor: 'rgba(16,185,129,0.15)', backgroundColor: 'rgba(16,185,129,0.03)' }}>
              <p className="text-sm text-emerald-600/80 italic">{openProjectData.proves}</p>
            </div>
            <h4 className="text-sm font-semibold mb-2" style={{ color: LIGHT_THEME.textPrimary }}>Checklist</h4>
            <Checklist items={openProjectData.checklist} checked={state.checked} onToggle={onToggle} accentColor="text-coral" />
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3" style={{ color: LIGHT_THEME.textPrimary }}>Deliverables</h4>
              <div className="grid gap-2">
                {openProjectData.deliverables.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm" style={{ borderColor: LIGHT_THEME.borderLight, color: LIGHT_THEME.textPrimary }}>
                    <CheckCircle2 className="h-4 w-4 text-coral/50" />
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
