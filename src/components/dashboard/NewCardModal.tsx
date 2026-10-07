import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Plus, Calendar } from 'lucide-react'
import type { KanbanCard, ColumnId, Priority } from '../../types/learning'
import { COLUMN_DEFINITIONS } from '../../hooks/useLearningStore'
import { roadmap } from '../../data/roadmap'

interface Props {
  isOpen: boolean
  onClose: () => void
  onAddCard: (card: Partial<KanbanCard>) => void
  initialColumn?: ColumnId
}

export default function NewCardModal({
  isOpen,
  onClose,
  onAddCard,
  initialColumn = 'todo',
}: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [column, setColumn] = useState<ColumnId>(initialColumn)
  const [priority, setPriority] = useState<Priority>('medium')
  const [phaseId, setPhaseId] = useState<string>('custom')
  const [dueDate, setDueDate] = useState<string>('')
  const [tags, setTags] = useState<string[]>(['Hands-on', 'Architecture'])
  const [subtasksInput, setSubtasksInput] = useState('')
  const [includeDeliverables, setIncludeDeliverables] = useState(true)

  if (!isOpen) return null

  const handleApplyPreset = (type: 'drill' | 'poc' | 'deepdive' | 'cert') => {
    if (type === 'drill') {
      setTitle('Architectural Drill: 10M DAU Resilient API')
      setDescription('Design multi-region active-active backend with Cloud Spanner / DynamoDB global tables, Cloud Armor DDoS mitigation, and 99.999% SLA.')
      setPriority('high')
      setTags(['Design Drill', 'Multi-Region', 'Scalability'])
      setSubtasksInput('1. Calculate peak QPS, bandwidth, and storage capacity\n2. Design data replication & conflict resolution strategy\n3. Calculate monthly infrastructure cost in AWS vs GCP')
    } else if (type === 'poc') {
      setTitle('Terraform PoC: Zero-Trust IAM & OPA Policies')
      setDescription('Enforce security policy as code using Checkov and Open Policy Agent (OPA) directly in CI pipeline.')
      setPriority('medium')
      setTags(['Terraform', 'Security', 'OPA'])
      setSubtasksInput('1. Write rego policy denying public IP on compute\n2. Hook policy check into local pre-commit hook\n3. Write failure test cases')
    } else if (type === 'deepdive') {
      setTitle('Whitepaper Study: Google Cloud BeyondCorp & Zero-Trust')
      setDescription('Examine Google\'s implementation of context-aware access, identity-aware proxy (IAP), and device-level verification.')
      setPriority('medium')
      setTags(['Study', 'Security', 'Zero-Trust'])
      setSubtasksInput('1. Read BeyondCorp whitepaper\n2. Compare with AWS Verified Access\n3. Write 1-page summary of operational tradeoffs')
    } else if (type === 'cert') {
      setTitle('Exam Practice Drill: GCP PCA Whiteboard Scenarios')
      setDescription('Work through the 4 official case studies (EHR Healthcare, Mountkirk Games, TerramEarth, Helicopter Racing).')
      setPriority('high')
      setTags(['Certification', 'GCP', 'Case Studies'])
      setSubtasksInput('1. Dissect business vs technical requirements for Mountkirk Games\n2. Sketch hybrid connectivity and database migration plan\n3. Review answer key and refine trade-offs')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const parsedSubtasks = subtasksInput
      .split('\n')
      .map(line => line.replace(/^[\d.-]+\s*/, '').trim())
      .filter(Boolean)
      .map((label, idx) => ({
        id: `st-new-${Date.now()}-${idx}`,
        label,
        done: false,
      }))

    const deliverables = includeDeliverables
      ? ['Terraform code in GitHub', 'Architecture diagram', 'README with trade-offs', 'Cost analysis note']
      : []

    onAddCard({
      title: title.trim(),
      description: description.trim(),
      column,
      priority,
      phaseId,
      dueDate: dueDate || undefined,
      tags,
      checklist: parsedSubtasks,
      deliverables,
      isCustom: true,
    })

    // Reset form
    setTitle('')
    setDescription('')
    setSubtasksInput('')
    onClose()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Add New Learning Material
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Create a customized project, research topic, or architectural drill.
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Quick Templates */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-coral" /> Quick Template Presets
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {[
                  { label: '📐 Architectural Drill', key: 'drill' as const },
                  { label: '🏗️ Terraform PoC', key: 'poc' as const },
                  { label: '📚 Whitepaper Study', key: 'deepdive' as const },
                  { label: '🎯 Exam Case Study', key: 'cert' as const },
                ].map(p => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => handleApplyPreset(p.key)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-coral hover:bg-coral/5 hover:text-coral dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Material / Task Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Design Event-Driven Streaming with Apache Kafka on GKE"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 focus:border-coral focus:outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Description & Learning Goal
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                placeholder="What architectural problem does this solve? What are you proving?"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 focus:border-coral focus:outline-none"
              />
            </div>

            {/* Stage, Priority & Phase */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Initial Stage
                </label>
                <select
                  value={column}
                  onChange={e => setColumn(e.target.value as ColumnId)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
                >
                  {COLUMN_DEFINITIONS.map(col => (
                    <option key={col.id} value={col.id}>{col.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as Priority)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Curriculum Phase
                </label>
                <select
                  value={phaseId}
                  onChange={e => setPhaseId(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="custom">Custom Specialization</option>
                  {roadmap.phases.map(p => (
                    <option key={p.id} value={p.id}>Phase {p.number}: {p.title.split(' ')[0]}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Hands-on Steps Checklist */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Subtasks / Steps (one per line)</span>
                <span className="text-slate-400 font-normal">Optional</span>
              </label>
              <textarea
                value={subtasksInput}
                onChange={e => setSubtasksInput(e.target.value)}
                rows={3}
                placeholder="1. Write Terraform configuration&#10;2. Verify security groups&#10;3. Conduct failover drill"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 font-mono text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 focus:border-coral focus:outline-none"
              />
            </div>

            {/* Target Date & Golden Rule toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Target Completion:</span>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeDeliverables}
                  onChange={e => setIncludeDeliverables(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-coral focus:ring-coral"
                />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Attach 4 Golden Rule Deliverables
                </span>
              </label>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-coral px-5 py-2 text-xs font-semibold text-white shadow-md shadow-coral/20 transition hover:bg-coral/90"
              >
                <Plus className="h-4 w-4" /> Create Learning Card
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
