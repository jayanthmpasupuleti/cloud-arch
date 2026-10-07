import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  User,
  UserPlus,
  LogIn,
  CheckCircle2,
  Target,
} from 'lucide-react'
import type { UserProfile } from '../../types/learning'
import { cn } from '../../lib/utils'

interface Props {
  isOpen: boolean
  onClose: () => void
  users: UserProfile[]
  currentUser: UserProfile
  onSwitchUser: (userId: string) => void
  onLogin: (email: string, name?: string) => void
  onRegister: (name: string, email: string, role: string, targetRole: string) => void
  onUpdateProfile: (updates: Partial<UserProfile>) => void
}

export default function AuthModal({
  isOpen,
  onClose,
  users,
  currentUser,
  onSwitchUser,
  onLogin,
  onRegister,
  onUpdateProfile,
}: Props) {
  const [tab, setTab] = useState<'switch' | 'login' | 'register' | 'edit'>('switch')

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginName, setLoginName] = useState('')

  // Register form state
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regRole, setRegRole] = useState('Senior Data Engineer')
  const [regTarget, setRegTarget] = useState('Cloud Solutions Architect')

  // Edit form state
  const [editName, setEditName] = useState(currentUser.name)
  const [editRole, setEditRole] = useState(currentUser.role)
  const [editTarget, setEditTarget] = useState(currentUser.targetRole)
  const [editStartDate, setEditStartDate] = useState(currentUser.startDate)

  if (!isOpen) return null

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail.trim()) return
    onLogin(loginEmail.trim(), loginName.trim() || undefined)
    onClose()
  }

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!regName.trim() || !regEmail.trim()) return
    onRegister(regName.trim(), regEmail.trim(), regRole.trim(), regTarget.trim())
    onClose()
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdateProfile({
      name: editName.trim(),
      role: editRole.trim(),
      targetRole: editTarget.trim(),
      startDate: editStartDate,
    })
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
          className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Learner Profile & Accounts
              </h2>
              <p className="text-xs text-slate-500">
                Track personal progress, custom learning materials, and Kanban states.
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-100 bg-slate-50/70 p-2 dark:border-slate-800 dark:bg-slate-850">
            {[
              { id: 'switch' as const, label: 'Profiles', icon: User },
              { id: 'edit' as const, label: 'Edit Info', icon: Target },
              { id: 'login' as const, label: 'Sign In', icon: LogIn },
              { id: 'register' as const, label: 'New Account', icon: UserPlus },
            ].map(t => {
              const Icon = t.icon
              const isActive = tab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    'flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition',
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              )
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6 overflow-y-auto">
            {/* Profiles Switcher */}
            {tab === 'switch' && (
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Select Active Learner Account
                </span>
                <div className="space-y-2.5">
                  {users.map(u => {
                    const isSelected = u.id === currentUser.id
                    return (
                      <div
                        key={u.id}
                        onClick={() => {
                          onSwitchUser(u.id)
                          onClose()
                        }}
                        className={cn(
                          'flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition-all',
                          isSelected
                            ? 'border-coral bg-coral/[0.04] shadow-xs dark:bg-coral/[0.08]'
                            : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                {u.name}
                              </h4>
                              {isSelected && (
                                <span className="rounded-md bg-coral/10 px-1.5 py-0.5 text-[10px] font-bold text-coral">
                                  Active
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {u.role} → <span className="text-coral font-medium">{u.targetRole}</span>
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <CheckCircle2 className="h-5 w-5 text-coral shrink-0" />
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="pt-2 text-center">
                  <button
                    onClick={() => setTab('register')}
                    className="text-xs font-semibold text-coral hover:underline"
                  >
                    + Create another learner account
                  </button>
                </div>
              </div>
            )}

            {/* Edit Current Profile */}
            {tab === 'edit' && (
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-coral"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Current Experience / Role
                  </label>
                  <input
                    type="text"
                    required
                    value={editRole}
                    onChange={e => setEditRole(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-coral"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Target Role
                  </label>
                  <input
                    type="text"
                    required
                    value={editTarget}
                    onChange={e => setEditTarget(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-coral"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Roadmap Start Date (calculates Day X of 112)
                  </label>
                  <input
                    type="date"
                    required
                    value={editStartDate}
                    onChange={e => setEditStartDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-coral"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="submit"
                    className="rounded-xl bg-coral px-5 py-2 text-xs font-semibold text-white shadow-md shadow-coral/20 hover:bg-coral/90"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {/* Quick Sign In */}
            {tab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="learner@company.com"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-coral"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Your Name (optional if existing)
                  </label>
                  <input
                    type="text"
                    value={loginName}
                    onChange={e => setLoginName(e.target.value)}
                    placeholder="Jayanth"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-coral"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-coral py-2.5 text-xs font-semibold text-white shadow-md shadow-coral/20 hover:bg-coral/90"
                  >
                    Sign In / Access Profile
                  </button>
                </div>
              </form>
            )}

            {/* New Account Registration */}
            {tab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-coral"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="alex@cloudarch.dev"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-coral"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Current Role
                  </label>
                  <input
                    type="text"
                    value={regRole}
                    onChange={e => setRegRole(e.target.value)}
                    placeholder="e.g. Data Engineer, Java Developer"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-coral"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Target Role
                  </label>
                  <input
                    type="text"
                    value={regTarget}
                    onChange={e => setRegTarget(e.target.value)}
                    placeholder="e.g. Lead Cloud Architect"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-coral"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-coral py-2.5 text-xs font-semibold text-white shadow-md shadow-coral/20 hover:bg-coral/90"
                  >
                    Create Learner Profile & Initialize Board
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
