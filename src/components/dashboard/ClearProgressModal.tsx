import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, Trash2, RotateCcw, Clock, CheckSquare } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirmReset: () => void
  cardsCount: number
  checkedCount: number
  elapsedDays: number
}

export default function ClearProgressModal({
  isOpen,
  onClose,
  onConfirmReset,
  cardsCount,
  checkedCount,
  elapsedDays,
}: Props) {
  if (!isOpen) return null

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
          className="relative z-10 flex w-full max-w-md flex-col rounded-2xl border border-rose-200 bg-white p-6 shadow-2xl dark:border-rose-900/60 dark:bg-slate-900 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Warning Icon & Header */}
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Reset All Progress to Blank Slate?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                This will scrap your current learning journey and reset your dashboard back to Day 0.
              </p>
            </div>
          </div>

          {/* Details Box */}
          <div className="mt-5 space-y-2.5 rounded-xl border border-rose-100 bg-rose-50/50 p-3.5 text-xs dark:border-rose-900/30 dark:bg-rose-950/20">
            <div className="font-semibold text-rose-900 dark:text-rose-300">
              The following data will be permanently cleared:
            </div>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Trash2 className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                <span>
                  <strong>{cardsCount} Kanban cards</strong> will be deleted from your board
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckSquare className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                <span>
                  <strong>{checkedCount} roadmap & project tasks</strong> will be unchecked
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                <span>
                  Journey timer (Day {elapsedDays} of 112) will reset back to <strong>Day 0</strong>
                </span>
              </li>
              <li className="flex items-center gap-2">
                <RotateCcw className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                <span>
                  Certifications and daily notes will be reset to fresh default states
                </span>
              </li>
            </ul>
          </div>

          <p className="mt-3 text-[11px] text-slate-400 dark:text-slate-500 italic">
            Note: You will keep the 16-week curriculum materials and can restart your journey anytime by moving cards to "In Progress".
          </p>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-2.5">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel, Keep Progress
            </button>
            <button
              onClick={() => {
                onConfirmReset()
                onClose()
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-rose-600/25 hover:bg-rose-700 transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Yes, Wipe & Reset to Day 0
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
