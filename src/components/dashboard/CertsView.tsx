import { Award, Calendar, ExternalLink } from 'lucide-react'
import { roadmap } from '../../data/roadmap'
import { cn } from '../../lib/utils'

interface Props {
  certStatuses: Record<string, string>
  certTargets: Record<string, string>
  onUpdateCert: (id: string, field: 'status' | 'targetDate', value: string) => void
}

const STATUS_MAP: Record<string, { label: string; badge: string }> = {
  planned: { label: 'Planned', badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  'in-progress': { label: 'In Progress', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
  done: { label: 'Certified', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
}

export default function CertsView({
  certStatuses,
  certTargets,
  onUpdateCert,
}: Props) {
  return (
    <div className="flex h-full flex-col overflow-y-auto p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-amber-500/10 p-2 text-amber-500">
            <Award className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
              Target Certifications Sprint
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Validate your hands-on project experience with top cloud credentials to pass recruiter filters.
            </p>
          </div>
        </div>
      </div>

      {/* Certs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {roadmap.certs.map(cert => {
          const status = certStatuses[cert.id] || cert.status
          const target = certTargets[cert.id] || cert.targetDate
          const statusInfo = STATUS_MAP[status] || STATUS_MAP.planned

          return (
            <div
              key={cert.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {cert.issuer}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {cert.title}
                    </h3>
                  </div>
                  <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', statusInfo.badge)}>
                    {statusInfo.label}
                  </span>
                </div>

                {/* Target Date */}
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Target Exam Date:</span>
                  <input
                    type="date"
                    value={target}
                    onChange={e => onUpdateCert(cert.id, 'targetDate', e.target.value)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>

                <a
                  href={cert.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-coral hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> View Official Blueprint & Guide
                </a>
              </div>

              {/* Status Selector Buttons */}
              <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Update Status
                </span>
                <div className="flex gap-2">
                  {(['planned', 'in-progress', 'done'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => onUpdateCert(cert.id, 'status', s)}
                      className={cn(
                        'flex-1 rounded-xl border py-1.5 text-xs font-semibold transition',
                        status === s
                          ? 'border-coral bg-coral/10 text-coral'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      )}
                    >
                      {s === 'done' ? 'Certified' : s === 'in-progress' ? 'In Progress' : 'Planned'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
