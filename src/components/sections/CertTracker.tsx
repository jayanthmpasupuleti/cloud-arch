import { useState } from 'react'
import { motion } from 'framer-motion'
import { Award, Calendar, ExternalLink } from 'lucide-react'
import { Card, CardBody, Badge } from '../primitives'
import { roadmap } from '../../data/roadmap'
import type { ProgressState } from '../../hooks/useProgress'

const STATUS_CONFIG: Record<string, { label: string; variant: string }> = {
  planned: { label: 'Planned', variant: 'slate' },
  'in-progress': { label: 'In Progress', variant: 'amber' },
  done: { label: 'Done', variant: 'emerald' },
}

export default function CertTracker({ state, onUpdateCert }: { state: ProgressState; onUpdateCert: (id: string, field: string, value: string) => void }) {
  const [showAll, setShowAll] = useState(false)
  const displayed = showAll ? roadmap.certs : roadmap.certs.slice(0, 2)

  return (
    <section id="certifications" className="relative border-y border-white/[0.06] bg-white/[0.01]">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-white md:text-4xl">Certifications</h2>
          <p className="mt-3 text-slate-400">Earn these to validate your skills and get past resume screens.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {displayed.map((cert, i) => {
            const status = state.certStatuses[cert.id] || cert.status
            const target = state.certTargets[cert.id] || cert.targetDate
            const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.planned
            return (
              <motion.div key={cert.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Card className="group">
                  <CardBody>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-400 text-white shadow-lg">
                          <Award className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-white">{cert.title}</h3>
                          <p className="text-xs text-slate-500">{cert.issuer}</p>
                        </div>
                      </div>
                      <Badge variant={cfg.variant as any}>{cfg.label}</Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="h-3.5 w-3.5" />
                      <input
                        type="date"
                        value={target}
                        onChange={e => onUpdateCert(cert.id, 'targetDate', e.target.value)}
                        className="rounded border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-slate-400 focus:border-blue-500/50 focus:outline-none"
                        aria-label={`Target date for ${cert.title}`}
                      />
                    </div>
                    <a href={cert.link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
                      <ExternalLink className="h-3 w-3" /> Certification page
                    </a>
                    <div className="mt-3 flex gap-2">
                      {(['planned', 'in-progress', 'done'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => onUpdateCert(cert.id, 'status', s)}
                          className={`rounded-lg border px-2.5 py-1 text-xs transition ${status === s ? 'border-blue-500/40 bg-blue-500/15 text-blue-300' : 'border-white/10 text-slate-400 hover:text-white'}`}
                        >
                          {s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {roadmap.certs.length > 2 && (
          <div className="mt-6 text-center">
            <button onClick={() => setShowAll(!showAll)} className="text-sm text-blue-400 hover:text-blue-300">
              {showAll ? 'Show Less' : `Show All (${roadmap.certs.length})`}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
