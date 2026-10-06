import { useState, useCallback } from 'react'
import { Download, Upload, RotateCcw, Trash2, FileJson } from 'lucide-react'
import { Card, CardBody } from '../primitives'
import { saveState, exportProgress, importProgress, resetProgress } from '../../hooks/useProgress'
import type { ProgressState } from '../../hooks/useProgress'

export default function Footer({ state, setState }: { state: ProgressState; setState: React.Dispatch<React.SetStateAction<ProgressState>> }) {
  const [showReset, setShowReset] = useState(false)
  const [resetConfirmed, setResetConfirmed] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState('')

  const handleReset = useCallback(() => {
    const fresh = resetProgress()
    saveState(fresh)
    setState(fresh)
    setShowReset(false)
    setResetConfirmed(true)
  }, [setState])

  const handleExport = useCallback(() => {
    const json = exportProgress(state)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cloud-arch-progress.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [state])

  const handleImport = useCallback(() => {
    try {
      const fresh = importProgress(importText)
      saveState(fresh)
      setState(fresh)
      setShowImport(false)
      setImportText('')
      setImportError('')
    } catch {
      setImportError('Invalid JSON. Please check your file.')
    }
  }, [importText, setState])

  return (
    <footer className="border-t border-white/[0.06] bg-white/[0.01]">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {/* About */}
          <Card>
            <CardBody>
              <h3 className="text-sm font-semibold text-white">Cloud Architect Roadmap</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                An interactive dashboard for your 16-week journey from data engineer to cloud architect.
                Built with Vite, React, TypeScript, Tailwind CSS, and Framer Motion.
              </p>
            </CardBody>
          </Card>

          {/* Actions */}
          <Card>
            <CardBody>
              <h3 className="text-sm font-semibold text-white mb-3">Actions</h3>
              <div className="space-y-2">
                <button onClick={handleExport} className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-300 transition hover:bg-white/[0.06] hover:text-white">
                  <Download className="h-4 w-4" /> Export Progress (JSON)
                </button>
                <button onClick={() => setShowImport(true)} className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-300 transition hover:bg-white/[0.06] hover:text-white">
                  <Upload className="h-4 w-4" /> Import Progress (JSON)
                </button>
                <button onClick={() => setShowReset(true)} className="flex w-full items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/[0.06] px-3 py-2 text-xs text-red-400 transition hover:bg-red-500/15">
                  <RotateCcw className="h-4 w-4" /> Reset All Progress
                </button>
              </div>
            </CardBody>
          </Card>

          {/* Shortcuts */}
          <Card>
            <CardBody>
              <h3 className="text-sm font-semibold text-white mb-3">Keyboard Shortcuts</h3>
              <div className="space-y-2">
                {[
                  ['Cmd/Ctrl + K', 'Command Palette'],
                  ['ESC', 'Close dialogs'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">{v}</span>
                    <kbd className="rounded border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[10px] text-slate-400">{k}</kbd>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-white/[0.04] pt-6">
          <p className="text-xs text-slate-600"> Built with Claude Code</p>
          <p className="text-xs text-slate-600">No backend · Progress stored in your browser</p>
        </div>
      </div>

      {/* Modals */}
      {showReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowReset(false); setResetConfirmed(false) }} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0d1117] p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Trash2 className="h-5 w-5 text-red-400" />
              <h3 className="text-lg font-semibold text-white">Reset All Progress?</h3>
            </div>
            <p className="text-sm text-slate-400 mb-4">This will permanently delete all your progress, certifications, and settings. This cannot be undone.</p>
            {!resetConfirmed ? (
              <div className="flex gap-3">
                <button onClick={() => setShowReset(false)} className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm text-slate-300 hover:bg-white/[0.04]">Cancel</button>
                <button onClick={handleReset} className="flex-1 rounded-xl border border-red-500/30 bg-red-500/15 py-2.5 text-sm text-red-400 hover:bg-red-500/25">Reset Everything</button>
              </div>
            ) : (
              <p className="text-sm text-emerald-400">All progress has been reset.</p>
            )}
          </div>
        </div>
      )}

      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowImport(false); setImportText(''); setImportError('') }} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#0d1117] p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <FileJson className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Import Progress</h3>
            </div>
            <p className="text-sm text-slate-400 mb-3">Paste a previously exported JSON file:</p>
            <textarea
              value={importText}
              onChange={e => { setImportText(e.target.value); setImportError('') }}
              className="h-40 w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-300 font-mono placeholder:text-slate-600 focus:border-blue-500/50 focus:outline-none"
              placeholder='{"checked": {...}, ...}'
            />
            {importError && <p className="mt-2 text-xs text-red-400">{importError}</p>}
            <div className="mt-4 flex gap-3">
              <button onClick={() => { setShowImport(false); setImportText(''); setImportError('') }} className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm text-slate-300 hover:bg-white/[0.04]">Cancel</button>
              <button onClick={handleImport} className="flex-1 rounded-xl border border-blue-500/30 bg-blue-500/15 py-2.5 text-sm text-blue-400 hover:bg-blue-500/25">Import</button>
            </div>
          </div>
        </div>
      )}
    </footer>
  )
}
