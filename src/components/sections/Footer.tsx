import { useState, useCallback } from 'react'
import { Download, Upload, RotateCcw, Trash2, FileJson } from 'lucide-react'
import { Card, CardBody } from '../primitives'
import { saveState, exportProgress, importProgress, resetProgress } from '../../hooks/useProgress'
import type { ProgressState } from '../../hooks/useProgress'
import { LIGHT_THEME } from '../../theme/colors'

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
    <footer className="border-t" style={{ borderColor: LIGHT_THEME.border }}>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardBody>
              <h3 className="text-sm font-semibold" style={{ color: LIGHT_THEME.textPrimary }}>Cloud Architect Roadmap</h3>
              <p className="mt-2 text-xs leading-relaxed" style={{ color: LIGHT_THEME.textSecondary }}>
                An interactive dashboard for your 16-week journey from data engineer to cloud architect.
                Built with React, TypeScript, Tailwind CSS, and Framer Motion.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h3 className="text-sm font-semibold mb-3" style={{ color: LIGHT_THEME.textPrimary }}>Actions</h3>
              <div className="space-y-2">
                <button onClick={handleExport} className="flex w-full items-center gap-2 rounded-lg border bg-white px-3 py-2 text-xs text-gray-600 transition hover:bg-gray-50" style={{ borderColor: LIGHT_THEME.border }}>
                  <Download className="h-4 w-4" /> Export Progress (JSON)
                </button>
                <button onClick={() => setShowImport(true)} className="flex w-full items-center gap-2 rounded-lg border bg-white px-3 py-2 text-xs text-gray-600 transition hover:bg-gray-50" style={{ borderColor: LIGHT_THEME.border }}>
                  <Upload className="h-4 w-4" /> Import Progress (JSON)
                </button>
                <button onClick={() => setShowReset(true)} className="flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-xs transition" style={{ borderColor: 'rgba(239,68,68,0.2)', color: '#EF4444', backgroundColor: 'rgba(239,68,68,0.04)' }}>
                  <RotateCcw className="h-4 w-4" /> Reset All Progress
                </button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h3 className="text-sm font-semibold mb-3" style={{ color: LIGHT_THEME.textPrimary }}>Keyboard Shortcuts</h3>
              <div className="space-y-2">
                {[
                  ['Cmd/Ctrl + K', 'Command Palette'],
                  ['ESC', 'Close dialogs'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: LIGHT_THEME.textSecondary }}>{v}</span>
                    <kbd className="rounded border px-2 py-0.5 text-[10px]" style={{ borderColor: LIGHT_THEME.border, color: LIGHT_THEME.textMuted }}>{k}</kbd>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="mt-8 flex items-center justify-between border-t pt-6" style={{ borderColor: LIGHT_THEME.border }}>
          <p className="text-xs" style={{ color: LIGHT_THEME.textMuted }}>Built with Claude Code</p>
          <p className="text-xs" style={{ color: LIGHT_THEME.textMuted }}>No backend · Progress stored in your browser</p>
        </div>
      </div>

      {showReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => { setShowReset(false); setResetConfirmed(false) }} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border bg-white p-6 shadow-2xl" style={{ borderColor: LIGHT_THEME.borderLight }}>
            <div className="flex items-center gap-3 mb-4">
              <Trash2 className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-semibold" style={{ color: LIGHT_THEME.textPrimary }}>Reset All Progress?</h3>
            </div>
            <p className="text-sm mb-4" style={{ color: LIGHT_THEME.textSecondary }}>This will permanently delete all your progress, certifications, and settings. This cannot be undone.</p>
            {!resetConfirmed ? (
              <div className="flex gap-3">
                <button onClick={() => setShowReset(false)} className="flex-1 rounded-xl border py-2.5 text-sm transition hover:bg-gray-50" style={{ borderColor: LIGHT_THEME.border, color: LIGHT_THEME.textSecondary }}>Cancel</button>
                <button onClick={handleReset} className="flex-1 rounded-xl border py-2.5 text-sm text-red-500 transition hover:bg-red-50" style={{ borderColor: 'rgba(239,68,68,0.3)', backgroundColor: 'rgba(239,68,68,0.05)' }}>Reset Everything</button>
              </div>
            ) : (
              <p className="text-sm text-emerald-600">All progress has been reset.</p>
            )}
          </div>
        </div>
      )}

      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => { setShowImport(false); setImportText(''); setImportError('') }} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border bg-white p-6 shadow-2xl" style={{ borderColor: LIGHT_THEME.borderLight }}>
            <div className="flex items-center gap-3 mb-4">
              <FileJson className="h-5 w-5 text-coral" />
              <h3 className="text-lg font-semibold" style={{ color: LIGHT_THEME.textPrimary }}>Import Progress</h3>
            </div>
            <p className="text-sm mb-3" style={{ color: LIGHT_THEME.textSecondary }}>Paste a previously exported JSON file:</p>
            <textarea
              value={importText}
              onChange={e => { setImportText(e.target.value); setImportError('') }}
              className="h-40 w-full rounded-xl border bg-gray-50 p-3 text-xs font-mono focus:border-coral/50 focus:outline-none"
              style={{ borderColor: LIGHT_THEME.border, color: LIGHT_THEME.textPrimary }}
              placeholder='{"checked": {...}, ...}'
            />
            {importError && <p className="mt-2 text-xs text-red-500">{importError}</p>}
            <div className="mt-4 flex gap-3">
              <button onClick={() => { setShowImport(false); setImportText(''); setImportError('') }} className="flex-1 rounded-xl border py-2.5 text-sm transition hover:bg-gray-50" style={{ borderColor: LIGHT_THEME.border, color: LIGHT_THEME.textSecondary }}>Cancel</button>
              <button onClick={handleImport} className="flex-1 rounded-xl border py-2.5 text-sm text-coral transition hover:bg-coral/5" style={{ borderColor: 'rgba(255,107,107,0.3)', backgroundColor: 'rgba(255,107,107,0.04)' }}>Import</button>
            </div>
          </div>
        </div>
      )}
    </footer>
  )
}
