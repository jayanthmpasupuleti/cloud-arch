import { motion } from 'framer-motion'
import { LIGHT_THEME } from '../../theme/colors'

export default function StrategyStrip() {
  const months = [
    { label: 'Month 1-2', title: 'GCP Foundations', color: '#3B82F6', desc: 'Terraform, VPC, IAM, Landing Zone' },
    { label: 'Month 3', title: 'Kubernetes & DevOps', color: '#8B5CF6', desc: 'GKE, ArgoCD, GitOps, SRE' },
    { label: 'Month 4', title: 'Multi-Cloud & Capstone', color: '#10B981', desc: 'AWS, Data Platform, DR Architecture' },
  ]

  return (
    <section id="strategy" className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-4 md:grid-cols-3">
        {months.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl border bg-white p-5 transition hover:shadow-md"
            style={{ borderColor: LIGHT_THEME.borderLight }}
          >
            <span className="text-xs font-medium" style={{ color: LIGHT_THEME.textMuted }}>{m.label}</span>
            <h3 className="mt-1 text-sm font-semibold" style={{ color: LIGHT_THEME.textPrimary }}>{m.title}</h3>
            <p className="mt-1 text-xs" style={{ color: LIGHT_THEME.textSecondary }}>{m.desc}</p>
            <div className="mt-3 h-1 w-12 rounded-full" style={{ backgroundColor: m.color }} />
          </motion.div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border bg-coral/[0.03] p-5" style={{ borderColor: 'rgba(255,107,107,0.15)' }}>
        <p className="text-sm font-medium text-coral">Golden Rule</p>
        <p className="mt-1 text-xs" style={{ color: LIGHT_THEME.textSecondary }}>
          Every week ships 4 deliverables: Terraform code, architecture diagram, README, and cost analysis.
          This is what separates engineers from architects.
        </p>
      </div>
    </section>
  )
}
