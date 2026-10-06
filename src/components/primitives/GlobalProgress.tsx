import type { ProgressState } from '../../hooks/useProgress'
import { roadmap } from '../../data/roadmap'

export function GlobalProgress({ state }: { state: ProgressState }) {
  const flat: { id: string }[] = []
  for (const phase of roadmap.phases) {
    for (const w of phase.weeksData) flat.push(...w.items)
  }
  for (const p of roadmap.projects) flat.push(...p.checklist)
  const total = flat.length
  const done = flat.filter(i => state.checked[i.id]).length
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)

  return (
    <div className="fixed top-0 left-0 right-0 z-40 h-1 bg-gray-100" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Overall progress">
      <div
        className="h-full bg-coral transition-all duration-700 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
