import { useState } from 'react'
import { motion } from 'framer-motion'
import { Award, Calendar, ExternalLink } from 'lucide-react'
import { Card, CardBody, Badge } from '../primitives'
import { roadmap } from '../../data/roadmap'
import type { ProgressState } from '../../hooks/useProgress'
import { LIGHT_THEME } from '../../theme/colors'

const STATUS_CONFIG: Record<string, { label: string; variant: string }> = {
  planned: { label: 'Planned', variant: 'slate' },
  'in-progress': { label: 'In Progress', variant: 'amber' },
  done: { label: 'Done', variant: 'emerald' },
}

export default function CertTracker({ state, onUpdateCert }: { state: ProgressState; onUpdateCert: (id: string, field: string, value: string) => void }) {
  const [showAll, setShowAll] = useState(false)
  const displayed = showAll ? roadmap.certs : roadmap.certs.slice(0, 2)

  return (
    <section id="certifications" className="border-y" style={{ borderColor: LIGHT_THEME.border }}>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-10">
          <h2 className="text-3xl font-bold md:text-4xl" style={{ color: LIGHT_THEME.textPrimary }}>Certifications</h2>
          <p className="mt-3" style={{ color: LIGHT_THEME.textSecondary }}>Earn these to validate your skills and get past resume screens.</p>
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
                          <h3 className="text-sm font-semibold" style={{ color: LIGHT_THEME.textPrimary }}>{cert.title}</h3>
                          <p className="text-xs" style={{ color: LIGHT_THEME.textMuted }}>{cert.issuer}</p>
                        </div>
                      </div>
                      <Badge variant={cfg.variant as any}>{cfg.label}</Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs" style={{ color: LIGHT_THEME.textMuted }}>
                      <Calendar className="h-3.5 w-3.5" />
                      <input
                        type="date"
                        value={target}
                        onChange={e => onUpdateCert(cert.id, 'targetDate', e.target.value)}
                        className="rounded border bg-white px-2 py-1 text-xs focus:border-coral/50 focus:outline-none"
                        style={{ borderColor: LIGHT_THEME.border, color: LIGHT_THEME.textPrimary }}
                        aria-label={`Target date for ${cert.title}`}
                      />
                    </div>
                    <a href={cert.link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs text-coral hover:text-coral-dark">
                      <ExternalLink className="h-3 w-3" /> Certification page
                    </a>
                    <div className="mt-3 flex gap-2">
                      {(['planned', 'in-progress', 'done'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => onUpdateCert(cert.id, 'status', s)}
                          className={`rounded-lg border px-2.5 py-1 text-xs transition ${status === s ? 'bg-coral/10 text-coral border-coral/20' : 'border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
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
            <button onClick={() => setShowAll(!showAll)} className="text-sm text-coral hover:text-coral-dark">
              {showAll ? 'Show Less' : `Show All (${roadmap.certs.length})`}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
