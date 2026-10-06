import { motion } from 'framer-motion'
import { BookOpen, ExternalLink, Globe, BookMarked, Terminal, GitBranch } from 'lucide-react'
import { Card, CardBody } from '../primitives'
import { roadmap } from '../../data/roadmap'

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
    <section id="resources" className="relative border-y border-white/[0.06] bg-white/[0.01]">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-white md:text-4xl">Resources</h2>
          <p className="mt-3 text-slate-400">The docs, books, and references that shaped this roadmap.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(grouped).map(([cat, links], gi) => {
            const Icon = RESOURCE_ICONS[cat] || Terminal
            return (
              <motion.div key={cat} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: gi * 0.1 }}>
                <Card className="h-full">
                  <CardBody>
                    <div className="flex items-center gap-2 mb-4">
                      <Icon className="h-4 w-4 text-slate-400" />
                      <h3 className="text-sm font-semibold text-white">{cat}</h3>
                    </div>
                    <ul className="space-y-2.5">
                      {links.map(link => (
                        <li key={link.title}>
                          <a href={link.url} target="_blank" rel="noopener noreferrer"
                            className="group flex items-center gap-2 text-sm text-slate-300 transition hover:text-blue-400">
                            <GitBranch className="h-3.5 w-3.5 shrink-0 text-slate-500 group-hover:text-blue-400" />
                            <span className="flex-1">{link.title}</span>
                            <ExternalLink className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
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
