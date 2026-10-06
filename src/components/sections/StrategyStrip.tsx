import { motion } from 'framer-motion'
import { Target, Globe, Rocket, CheckCircle2, Crown } from 'lucide-react'
import { Card, CardBody, Badge } from '../primitives'

export default function StrategyStrip() {
  return (
    <section id="strategy" className="relative border-y border-white/[0.06] bg-white/[0.01]">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">Strategy</h2>
          <p className="mt-3 text-slate-400">A clear 4-month plan to go from where you are to where you want to be.</p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: Target, title: 'Months 1–2: Core on GCP', desc: 'Master Terraform, VPC, IAM, GKE, and observability on GCP. Build 4 projects with production polish.', color: 'from-blue-500 to-sky-400', badge: 'Solid Foundation' },
            { icon: Globe, title: 'Month 3: Add AWS', desc: 'Rebuild a core project on AWS. Understand IAM, networking, and pricing differences. Most Indian postings require AWS.', color: 'from-amber-500 to-orange-400', badge: 'Multi-Cloud' },
            { icon: Rocket, title: 'Month 4: Capstone & Job Hunt', desc: 'Build a multi-region capstone. Earn 3+ certs. Polish portfolio and start applying.', color: 'from-emerald-500 to-teal-400', badge: 'Go Time' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Card className="h-full group relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-0 transition-opacity duration-500 group-hover:opacity-5`} />
                <CardBody>
                  <div className={`inline-flex rounded-xl bg-gradient-to-br ${s.color} p-2.5 text-white shadow-lg`}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.desc}</p>
                  <Badge variant="slate" className="mt-4">{s.badge}</Badge>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Golden Rule */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="mt-10">
          <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-6 md:p-8">
            <div className="absolute top-0 right-0 opacity-10" aria-hidden="true">
              <Crown className="h-32 w-32 text-amber-400" />
            </div>
            <div className="relative flex items-start gap-4">
              <div className="shrink-0 rounded-full bg-amber-500/20 p-3">
                <Crown className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-amber-300">The Golden Rule</h3>
                <p className="mt-2 text-slate-300">
                  Every project ships with four deliverables — no exceptions:
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {['Terraform code in GitHub', 'Architecture diagram', 'README with trade-offs', 'Cost analysis + write-up'].map((r, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-xl border border-amber-500/15 bg-amber-500/[0.04] px-3 py-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-400" />
                      <span className="text-xs font-medium text-amber-200/80">{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
