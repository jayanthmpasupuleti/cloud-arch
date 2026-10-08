import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  User,
  LogIn,
  CheckCircle2,
  Target,
  AlertCircle,
  Loader2,
  LogOut,
  Mail,
  Lock,
} from 'lucide-react'
import type { UserProfile } from '../../types/learning'
import { cn } from '../../lib/utils'
import { isSupabaseConfigured } from '../../lib/supabase'
import {
  signInWithGoogle,
  signUpWithEmail,
  signInWithEmail,
  signOutUser,
  getSession,
} from '../../lib/supabaseAuth'

interface Props {
  isOpen: boolean
  onClose: () => void
  users: UserProfile[]
  currentUser: UserProfile
  onSwitchUser: (userId: string) => void
  onLogin: (email: string, name?: string) => void
  onRegister: (name: string, email: string, role: string, targetRole: string) => void
  onUpdateProfile: (updates: Partial<UserProfile>) => void
  isCloudActive?: boolean
  syncStatus?: string
  onRefreshCloud?: () => void
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
  onRefreshCloud,
}: Props) {
  const [tab, setTab] = useState<'auth' | 'edit' | 'demo'>('auth')

  // Auth Mode: 'signin' | 'signup'
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authName, setAuthName] = useState('')
  const [authRole, setAuthRole] = useState('Senior Data Engineer')
  const [authTargetRole, setAuthTargetRole] = useState('Lead Cloud Solutions Architect')
  const [authLoading, setAuthLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [authSuccess, setAuthSuccess] = useState<string | null>(null)
  const [loggedInSupabaseEmail, setLoggedInSupabaseEmail] = useState<string | null>(null)

  // Edit profile state
  const [editName, setEditName] = useState(currentUser.name)
  const [editRole, setEditRole] = useState(currentUser.role)
  const [editTarget, setEditTarget] = useState(currentUser.targetRole)
  const [editStartDate, setEditStartDate] = useState(currentUser.startDate)

  // Load existing credentials on mount
  useEffect(() => {
    if (isOpen) {
      getSession().then(s => {
        setLoggedInSupabaseEmail(s?.user?.email || null)
      })
      setEditName(currentUser.name)
      setEditRole(currentUser.role)
      setEditTarget(currentUser.targetRole)
      setEditStartDate(currentUser.startDate)
      setAuthError(null)
      setAuthSuccess(null)
    }
  }, [isOpen, currentUser])

  if (!isOpen) return null

  // 1. Google OAuth Authentication
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setAuthError(null)
    setAuthSuccess(null)

    const { error } = await signInWithGoogle()
    if (error) {
      setGoogleLoading(false)
      setAuthError(error)
    }
    // On success, Supabase initiates an OAuth redirect to Google
  }

  // 2. Email & Password Auth Fallback
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError(null)
    setAuthSuccess(null)

    if (!isSupabaseConfigured()) {
      // Local mode fallback
      if (authMode === 'signup') {
        onRegister(authName || authEmail.split('@')[0], authEmail, authRole, authTargetRole)
      } else {
        onLogin(authEmail, authName || undefined)
      }
      setAuthSuccess('Logged in via Local Storage.')
      setAuthLoading(false)
      setTimeout(() => onClose(), 1000)
      return
    }

    if (authMode === 'signin') {
      const { user, error } = await signInWithEmail(authEmail.trim(), authPassword)
      setAuthLoading(false)
      if (error) {
        setAuthError(error)
      } else if (user) {
        setAuthSuccess(`Welcome back, ${user.email}! Cloud data synced.`)
        setLoggedInSupabaseEmail(user.email || null)
        if (onRefreshCloud) onRefreshCloud()
        setTimeout(() => onClose(), 1000)
      }
    } else {
      const { user, error } = await signUpWithEmail({
        email: authEmail.trim(),
        password: authPassword,
        name: authName.trim() || authEmail.split('@')[0],
        role: authRole.trim(),
        targetRole: authTargetRole.trim(),
      })
      setAuthLoading(false)
      if (error) {
        setAuthError(error)
      } else if (user) {
        setAuthSuccess('Account created! Your personal Kanban board is ready.')
        setLoggedInSupabaseEmail(user.email || null)
        if (onRefreshCloud) onRefreshCloud()
        setTimeout(() => onClose(), 1200)
      }
    }
  }

  const handleSignOut = async () => {
    setAuthLoading(true)
    await signOutUser()
    setLoggedInSupabaseEmail(null)
    setAuthLoading(false)
    setAuthSuccess('Signed out successfully.')
  }

  // Handle Edit Profile Submit
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

  const isConfigured = isSupabaseConfigured()

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
          className="relative z-10 flex max-h-[92vh] w-full max-w-md flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Learner Account
                </h2>
                {isConfigured ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Supabase Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                    Local Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Sign in to track and sync your 16-week cloud learning journey.
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-100 bg-slate-50/70 p-2 dark:border-slate-800 dark:bg-slate-800/40">
            {[
              { id: 'auth' as const, label: 'Sign In / Register', icon: LogIn },
              { id: 'edit' as const, label: 'Edit Profile', icon: Target },
              { id: 'demo' as const, label: 'Demo Switcher', icon: User },
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
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
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
          <div className="p-6 overflow-y-auto space-y-4">
            {/* ----------------- TAB: AUTH (GOOGLE FIRST) ----------------- */}
            {tab === 'auth' && (
              <div className="space-y-4">
                {loggedInSupabaseEmail ? (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 dark:border-emerald-500/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={currentUser.avatar}
                          alt="avatar"
                          className="h-10 w-10 rounded-full object-cover border border-emerald-500/30"
                        />
                        <div>
                          <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            Signed in as
                          </div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                            {loggedInSupabaseEmail}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleSignOut}
                        disabled={authLoading}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {authError && (
                      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{authError}</span>
                      </div>
                    )}

                    {authSuccess && (
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>{authSuccess}</span>
                      </div>
                    )}

                    {/* DIRECT GOOGLE AUTH BUTTON */}
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={googleLoading}
                        className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-300/80 bg-white px-4 py-3 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-750 disabled:opacity-60"
                      >
                        {googleLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin text-coral" />
                        ) : (
                          <svg className="h-4 w-4" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                            />
                          </svg>
                        )}
                        <span>Continue with Google</span>
                      </button>
                      <p className="text-[11px] text-center text-slate-400">
                        One-click login with your Google account.
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="relative my-4 flex items-center justify-center">
                      <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                      <span className="absolute bg-white px-3 text-[10px] font-semibold text-slate-400 dark:bg-slate-900">
                        or email options
                      </span>
                    </div>

                    {/* Email Option Toggle */}
                    {!showEmailForm ? (
                      <button
                        type="button"
                        onClick={() => setShowEmailForm(true)}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        Sign in or register with Email
                      </button>
                    ) : (
                      <div className="space-y-3 pt-1">
                        <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                          <button
                            type="button"
                            onClick={() => {
                              setAuthMode('signin')
                              setAuthError(null)
                            }}
                            className={cn(
                              'flex-1 rounded-lg py-1.5 text-xs font-semibold transition',
                              authMode === 'signin'
                                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                            )}
                          >
                            Sign In
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAuthMode('signup')
                              setAuthError(null)
                            }}
                            className={cn(
                              'flex-1 rounded-lg py-1.5 text-xs font-semibold transition',
                              authMode === 'signup'
                                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                            )}
                          >
                            New Account
                          </button>
                        </div>

                        <form onSubmit={handleEmailAuth} className="space-y-3">
                          {authMode === 'signup' && (
                            <div>
                              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Full Name
                              </label>
                              <input
                                type="text"
                                required
                                value={authName}
                                onChange={e => setAuthName(e.target.value)}
                                placeholder="Jayanth Pasupuleti"
                                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-coral"
                              />
                            </div>
                          )}

                          <div>
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              Email Address
                            </label>
                            <input
                              type="email"
                              required
                              value={authEmail}
                              onChange={e => setAuthEmail(e.target.value)}
                              placeholder="learner@company.com"
                              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-coral"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                              <span>Password</span>
                              <Lock className="h-3 w-3 text-slate-400" />
                            </label>
                            <input
                              type="password"
                              required
                              value={authPassword}
                              onChange={e => setAuthPassword(e.target.value)}
                              placeholder="••••••••••••"
                              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-coral"
                            />
                          </div>

                          {authMode === 'signup' && (
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                  Current Role
                                </label>
                                <input
                                  type="text"
                                  value={authRole}
                                  onChange={e => setAuthRole(e.target.value)}
                                  placeholder="Data Engineer"
                                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-coral"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                  Target Role
                                </label>
                                <input
                                  type="text"
                                  value={authTargetRole}
                                  onChange={e => setAuthTargetRole(e.target.value)}
                                  placeholder="Cloud Architect"
                                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-coral"
                                />
                              </div>
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={authLoading}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-coral py-2 text-xs font-semibold text-white shadow-sm hover:bg-coral/90 disabled:opacity-50"
                          >
                            {authLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            {authMode === 'signin' ? 'Sign In with Email' : 'Create Account'}
                          </button>
                        </form>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ----------------- TAB: EDIT PROFILE ----------------- */}
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
                    Roadmap Target Start Date
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

            {/* ----------------- TAB: DEMO SWITCHER ----------------- */}
            {tab === 'demo' && (
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Select Local Demo Profile
                </span>
                <div className="space-y-2.5">
                  {users.map(u => {
                    const isSelected = u.id === currentUser.id && !loggedInSupabaseEmail
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
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
