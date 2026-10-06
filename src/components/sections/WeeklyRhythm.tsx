import { motion } from 'framer-motion'
import { Sun, BookOpen, PenTool, Lightbulb } from 'lucide-react'
import { Card, CardBody } from '../primitives'
import { roadmap } from '../../data/roadmap'

const rhythmIcons: Record<string, typeof Sun> = { Build: Sun, Study: BookOpen, 'Write-up': PenTool, 'Design Drills': Lightbulb }

export default function WeeklyRhythm() {
  return (
    <section id="rhythm">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-white md:text-4xl">Weekly Rhythm</h2>
          <p className="mt-3 text-slate-400">A repeatable cadence that balances building, studying, writing, and design practice.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {roadmap.weeklyRhythm.map((r, i) => {
            const Icon = rhythmIcons[r.label] || Sun
            return (
              <motion.div
                key={r.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full group relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${r.color} opacity-0 transition-opacity duration-500 group-hover:opacity-10`} />
                  <CardBody>
                    <div className={`inline-flex rounded-xl bg-gradient-to-br ${r.color} p-2.5 text-white shadow-lg`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-white">{r.label}</h3>
                    <p className="mt-1 text-xs text-slate-500">{r.days}</p>
                    <p className="mt-3 text-sm text-slate-400 leading-relaxed">{r.description}</p>
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
