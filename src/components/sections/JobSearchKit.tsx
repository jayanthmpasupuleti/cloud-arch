import { motion } from 'framer-motion'
import { Briefcase, FileText, MessageSquare, Flame, CheckCircle2, Circle } from 'lucide-react'
import { Card, CardBody } from '../primitives'
import { roadmap } from '../../data/roadmap'
import type { ProgressState } from '../../hooks/useProgress'
import { LIGHT_THEME } from '../../theme/colors'

const CATEGORY_META: Record<string, { Icon: any; color: string; label: string }> = {
  github: { Icon: Briefcase, color: '#64748B', label: 'GitHub' },
  resume: { Icon: FileText, color: '#3B82F6', label: 'Resume' },
  linkedin: { Icon: MessageSquare, color: '#0EA5E9', label: 'LinkedIn' },
  interview: { Icon: Flame, color: '#8B5CF6', label: 'Interview' },
}

export default function JobSearchKit({ state }: { state: ProgressState }) {
  const categories = Array.from(new Set(roadmap.jobKit.map(j => j.category))) as string[]

  return (
    <section id="job-search">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-lg">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-3xl font-bold md:text-4xl" style={{ color: LIGHT_THEME.textPrimary }}>Job Search Kit</h2>
              <p className="mt-1" style={{ color: LIGHT_THEME.textMuted }}>Start packaging in Month 3 — not after.</p>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <div className="rounded-2xl border p-5 md:p-6" style={{ borderColor: 'rgba(16,185,129,0.2)', backgroundColor: 'rgba(16,185,129,0.04)' }}>
            <div className="flex items-start gap-4">
              <div className="shrink-0 rounded-full p-2" style={{ backgroundColor: 'rgba(16,185,129,0.12)' }}>
                <Flame className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-emerald-600">Start in Month 3, Not After</h3>
                <p className="mt-1.5 text-sm" style={{ color: LIGHT_THEME.textSecondary }}>
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
                <div className="mx-6 mt-5 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg text-white shadow" style={{ backgroundColor: meta.color }}>
                    <meta.Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-semibold" style={{ color: LIGHT_THEME.textPrimary }}>{meta.label}</h3>
                </div>
                <CardBody>
                  <ul className="space-y-2">
                    {items.map(item => {
                      const checked = state.checked[item.id]
                      return (
                        <li key={item.id}>
                          <label className={`flex items-start gap-2.5 rounded-lg px-3 py-2.5 cursor-pointer transition-all ${checked ? '' : 'hover:bg-gray-50'}`}
                            style={{ backgroundColor: checked ? LIGHT_THEME.bgSubtle : 'transparent' }}>
                            {checked ? <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-coral" /> : <Circle className="h-4 w-4 mt-0.5 shrink-0 text-gray-300" />}
                            <span className={`text-sm ${checked ? 'line-through' : ''}`} style={{ color: checked ? LIGHT_THEME.textMuted : LIGHT_THEME.textPrimary }}>{item.label}</span>
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
              <h3 className="text-sm font-semibold mb-3" style={{ color: LIGHT_THEME.textPrimary }}>Target Roles</h3>
              <div className="flex flex-wrap gap-2">
                {['Cloud Engineer', 'Platform Engineer', 'Cloud Data Architect', 'Solutions Architect', 'DevOps Engineer'].map(role => (
                  <span key={role} className="rounded-lg border bg-white px-3 py-1.5 text-xs" style={{ borderColor: LIGHT_THEME.borderLight, color: LIGHT_THEME.textSecondary }}>{role}</span>
                ))}
              </div>
              <p className="mt-3 text-xs" style={{ color: LIGHT_THEME.textMuted }}>at product companies, GCCs, and cloud partners/consultancies.</p>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
