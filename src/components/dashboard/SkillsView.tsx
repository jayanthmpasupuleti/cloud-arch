import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import { roadmap } from '../../data/roadmap'
import type { KanbanCard } from '../../types/learning'

interface Props {
  checkedItems: Record<string, boolean>
  cards: KanbanCard[]
}

export default function SkillsView({ checkedItems, cards }: Props) {
  const radarData = useMemo(() => {
    return roadmap.skillRadar.categories.map(cat => {
      const totalRoadmapIds = cat.checklistIds.length
      const doneRoadmapCount = cat.checklistIds.filter(id => checkedItems[id]).length

      // Also factor in completed Kanban cards matching tags
      const relevantCards = cards.filter(c =>
        c.tags.some(t => t.toLowerCase() === cat.label.toLowerCase()) ||
        c.title.toLowerCase().includes(cat.label.toLowerCase())
      )
      const doneCards = relevantCards.filter(c => c.column === 'done').length

      const total = totalRoadmapIds + relevantCards.length
      const done = doneRoadmapCount + doneCards
      const value = total === 0 ? 0 : Math.min(100, Math.round((done / total) * 100))

      return {
        category: cat.label,
        value,
        fullMark: 100,
        done,
        total,
      }
    })
  }, [checkedItems, cards])

  const averageProficiency = useMemo(() => {
    if (radarData.length === 0) return 0
    const sum = radarData.reduce((acc, d) => acc + d.value, 0)
    return Math.round(sum / radarData.length)
  }, [radarData])

  return (
    <div className="flex h-full flex-col overflow-y-auto p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-violet-500/10 p-2 text-violet-500">
                <TrendingUp className="h-5 w-5" />
              </span>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
                Cloud Architecture Competency Radar
              </h1>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Live algorithmic skill calculation dynamically updated by completed tasks and projects.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-violet-100 bg-violet-50 px-4 py-2 text-center dark:border-violet-900/40 dark:bg-violet-950/20">
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">
                Average Mastery
              </span>
              <div className="text-xl font-extrabold text-violet-600 dark:text-violet-400">
                {averageProficiency}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart & Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recharts Radar Graphic */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 flex flex-col items-center justify-center min-h-[380px]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 self-start">
            9-Domain Architecture Radar
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#94A3B8" strokeOpacity={0.25} />
              <PolarAngleAxis
                dataKey="category"
                tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
              />
              <Radar
                name="Skill"
                dataKey="value"
                stroke="#8B5CF6"
                fill="#8B5CF6"
                fillOpacity={0.25}
                strokeWidth={2.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Individual Skills Progress Bars */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Competency Breakdown & Proofs
          </h3>

          <div className="space-y-3.5">
            {radarData.map(item => (
              <div key={item.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800 dark:text-slate-200">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-normal text-slate-400">
                      {item.done}/{item.total} objectives
                    </span>
                    <span className="w-9 text-right text-violet-600 dark:text-violet-400">
                      {item.value}%
                    </span>
                  </div>
                </div>

                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
