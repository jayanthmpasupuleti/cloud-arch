import { motion } from 'framer-motion'
import { BookOpen, ExternalLink, Globe, BookMarked, Terminal, GitBranch } from 'lucide-react'
import { Card, CardBody } from '../primitives'
import { roadmap } from '../../data/roadmap'
import { LIGHT_THEME } from '../../theme/colors'

const RESOURCE_ICONS: Record<string, typeof BookOpen> = {
  Documentation: Globe,
  Book: BookMarked,
}

export default function Resources() {
  const grouped = roadmap.resources.reduce<Record<string, typeof roadmap.resources>>((acc, r) => {
    (acc[r.category] ||= []).push(r)
    return acc
  }, {})

  return (
    <section id="resources" className="border-y" style={{ borderColor: LIGHT_THEME.border }}>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-10">
          <h2 className="text-3xl font-bold md:text-4xl" style={{ color: LIGHT_THEME.textPrimary }}>Resources</h2>
          <p className="mt-3" style={{ color: LIGHT_THEME.textSecondary }}>The docs, books, and references that shaped this roadmap.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(grouped).map(([cat, links], gi) => {
            const Icon = RESOURCE_ICONS[cat] || Terminal
            return (
              <motion.div key={cat} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: gi * 0.1 }}>
                <Card className="h-full">
                  <CardBody>
                    <div className="flex items-center gap-2 mb-4">
                      <Icon className="h-4 w-4" style={{ color: LIGHT_THEME.textMuted }} />
                      <h3 className="text-sm font-semibold" style={{ color: LIGHT_THEME.textPrimary }}>{cat}</h3>
                    </div>
                    <ul className="space-y-2.5">
                      {links.map(link => (
                        <li key={link.title}>
                          <a href={link.url} target="_blank" rel="noopener noreferrer"
                            className="group flex items-center gap-2 text-sm text-gray-600 transition hover:text-coral">
                            <GitBranch className="h-3.5 w-3.5 shrink-0 text-gray-400 group-hover:text-coral" />
                            <span className="flex-1">{link.title}</span>
                            <ExternalLink className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100 text-coral" />
                          </a>
                        </li>
                      ))}
                    </ul>
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
