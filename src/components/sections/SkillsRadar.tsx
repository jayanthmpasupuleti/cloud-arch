import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import { Card } from '../primitives'
import { roadmap } from '../../data/roadmap'
import type { ProgressState } from '../../hooks/useProgress'
import { LIGHT_THEME } from '../../theme/colors'

export default function SkillsRadar({ state }: { state: ProgressState }) {
  const data = useMemo(() => {
    return roadmap.skillRadar.categories.map((cat) => {
      const total = cat.checklistIds.length
      if (total === 0) return { category: cat.label, value: 0, fullMark: 100 }
      const done = cat.checklistIds.filter((id) => state.checked[id]).length
      return { category: cat.label, value: Math.round((done / total) * 100), fullMark: 100 }
    })
  }, [state.checked])

  return (
    <section id="skills" className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10">
        <h2 className="text-3xl font-bold md:text-4xl" style={{ color: LIGHT_THEME.textPrimary }}>Skills Radar</h2>
        <p className="mt-3" style={{ color: LIGHT_THEME.textSecondary }}>Your skill levels update as you complete checklist items across the roadmap.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="flex items-center justify-center p-4">
          <ResponsiveContainer width="100%" height={360}>
            <RadarChart data={data}>
              <PolarGrid stroke={LIGHT_THEME.border} />
              <PolarAngleAxis dataKey="category" tick={{ fill: '#6B6B6B', fontSize: 11, fontWeight: 500 }} />
              <Radar name="Skill" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        <div className="space-y-3">
          {data.map((d, i) => (
            <motion.div
              key={d.category}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4"
            >
              <span className="w-32 shrink-0 text-sm" style={{ color: LIGHT_THEME.textSecondary }}>{d.category}</span>
              <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: LIGHT_THEME.bgSubtle }}>
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${d.value}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.05 }}
                />
              </div>
              <span className="w-10 text-right text-sm font-medium text-violet-500 tabular-nums">{d.value}%</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
