import { Globe, BookMarked, Terminal, GitBranch, ExternalLink } from 'lucide-react'
import { roadmap } from '../../data/roadmap'

const RESOURCE_ICONS: Record<string, any> = {
  Documentation: Globe,
  Book: BookMarked,
}

export default function Resources() {
  const grouped = roadmap.resources.reduce<Record<string, typeof roadmap.resources>>((acc, r) => {
    (acc[r.category] ||= []).push(r)
    return acc
  }, {})

  return (
    <div className="flex h-full flex-col overflow-y-auto p-6 max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 shadow-sm">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
              Curated Documentation & Literature
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              The essential cloud frameworks, architecture whitepapers, and books for this 16-week journey.
            </p>
          </div>
        </div>
      </div>

      {/* Category Resource Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(grouped).map(([cat, links]) => {
          const Icon = RESOURCE_ICONS[cat] || Terminal
          return (
            <div
              key={cat}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60"
            >
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {cat}
                </h3>
              </div>

              <ul className="space-y-3 flex-1">
                {links.map(link => (
                  <li key={link.title}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs font-semibold text-slate-700 transition hover:border-coral/40 hover:bg-coral/[0.03] hover:text-coral dark:border-slate-800/80 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:border-coral/40 dark:hover:bg-coral/[0.05] dark:hover:text-coral"
                    >
                      <GitBranch className="h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-coral transition-colors" />
                      <span className="flex-1 leading-snug">{link.title}</span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400 opacity-60 group-hover:opacity-100 group-hover:text-coral transition-all" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
