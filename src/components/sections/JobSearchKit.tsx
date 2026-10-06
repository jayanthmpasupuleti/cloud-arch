import { motion } from 'framer-motion'
import { Briefcase, FileText, MessageSquare, Flame, CheckCircle2, Circle } from 'lucide-react'
import { Card, CardBody } from '../primitives'
import { roadmap } from '../../data/roadmap'
import type { ProgressState } from '../../hooks/useProgress'

const CATEGORY_META: Record<string, { icon: any; color: string; label: string }> = {
  github: { icon: (_p: any) => null, color: 'from-slate-600 to-slate-500', label: 'GitHub' },
  resume: { icon: FileText, color: 'from-blue-600 to-blue-500', label: 'Resume' },
  linkedin: { icon: (_p: any) => null, color: 'from-sky-600 to-sky-500', label: 'LinkedIn' },
  interview: { icon: MessageSquare, color: 'from-violet-600 to-violet-500', label: 'Interview' },
}

export default function JobSearchKit({ state }: { state: ProgressState }) {
  const categories = Array.from(new Set(roadmap.jobKit.map(j => j.category))) as string[]

  return (
    <section id="job-search">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-lg">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white md:text-4xl">Job Search Kit</h2>
              <p className="mt-1 text-slate-400">Start packaging in Month 3 — not after.</p>
            </div>
          </div>
        </div>

        {/* Tip highlight */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5 md:p-6">
            <div className="flex items-start gap-4">
              <div className="shrink-0 rounded-full bg-emerald-500/20 p-2">
                <Flame className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-emerald-300">Start in Month 3, Not After</h3>
                <p className="mt-1.5 text-sm text-slate-400">
                  Job search takes longer than you think. Start building your portfolio and applying in Month 3 while you're still learning.
                  By the time you finish, you'll have 20+ applications in flight, not starting from zero.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {categories.map(cat => {
            const meta = CATEGORY_META[cat]
            const items = roadmap.jobKit.filter(j => j.category === cat)
            return (
              <Card key={cat} className="h-full">
                <div className={`mx-6 mt-6 flex items-center gap-2.5`}>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${meta.color} text-white shadow`}>
                    <meta.icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">{meta.label}</h3>
                </div>
                <CardBody>
                  <ul className="space-y-2">
                    {items.map(item => {
                      const checked = state.checked[item.id]
                      return (
                        <li key={item.id}>
                          <label className={`flex items-start gap-2.5 rounded-lg px-3 py-2.5 cursor-pointer transition-all ${checked ? 'bg-white/[0.01]' : 'bg-white/[0.03] hover:bg-white/[0.05]'}`}>
                            {checked ? <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-400" /> : <Circle className="h-4 w-4 mt-0.5 shrink-0 text-slate-600" />}
                            <span className={`text-sm ${checked ? 'text-slate-500 line-through' : 'text-slate-300'}`}>{item.label}</span>
                          </label>
                        </li>
                      )
                    })}
                  </ul>
                </CardBody>
              </Card>
            )
          })}
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-8">
          <Card>
            <CardBody>
              <h3 className="text-sm font-semibold text-white mb-3">Target Roles</h3>
              <div className="flex flex-wrap gap-2">
                {['Cloud Engineer', 'Platform Engineer', 'Cloud Data Architect', 'Solutions Architect', 'DevOps Engineer'].map(role => (
                  <span key={role} className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-slate-300">{role}</span>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-500">at product companies, GCCs, and cloud partners/consultancies.</p>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
