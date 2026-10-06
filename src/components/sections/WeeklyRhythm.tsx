import { motion } from 'framer-motion'
import { Sun, BookOpen, PenTool, Lightbulb } from 'lucide-react'
import { Card, CardBody } from '../primitives'
import { roadmap } from '../../data/roadmap'
import { LIGHT_THEME } from '../../theme/colors'

const rhythmIcons: Record<string, typeof Sun> = { Build: Sun, Study: BookOpen, 'Write-up': PenTool, 'Design Drills': Lightbulb }
const COLOR_MAP: Record<string, string> = { 'bg-blue-500': '#3B82F6', 'bg-violet-500': '#8B5CF6', 'bg-amber-500': '#F59E0B', 'bg-emerald-500': '#10B981' }

export default function WeeklyRhythm() {
  return (
    <section id="rhythm">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-10">
          <h2 className="text-3xl font-bold md:text-4xl" style={{ color: LIGHT_THEME.textPrimary }}>Weekly Rhythm</h2>
          <p className="mt-3" style={{ color: LIGHT_THEME.textSecondary }}>A repeatable cadence that balances building, studying, writing, and design practice.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {roadmap.weeklyRhythm.map((r, i) => {
            const Icon = rhythmIcons[r.label] || Sun
            const bgColor = COLOR_MAP[r.color] || '#888'
            return (
              <motion.div
                key={r.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full group relative overflow-hidden">
                  <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-[0.06]" style={{ backgroundColor: bgColor }} />
                  <CardBody>
                    <div className="inline-flex rounded-xl p-2.5 text-white shadow-md" style={{ backgroundColor: bgColor }}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-base font-semibold" style={{ color: LIGHT_THEME.textPrimary }}>{r.label}</h3>
                    <p className="mt-1 text-xs" style={{ color: LIGHT_THEME.textMuted }}>{r.days}</p>
                    <p className="mt-3 text-sm leading-relaxed" style={{ color: LIGHT_THEME.textSecondary }}>{r.description}</p>
                  </CardBody>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
