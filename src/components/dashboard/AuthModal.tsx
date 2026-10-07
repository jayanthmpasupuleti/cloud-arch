import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  User,
  LogIn,
  CheckCircle2,
  Target,
  Database,
  Cloud,
  Lock,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  LogOut,
  RefreshCw,
  Code2,
} from 'lucide-react'
import type { UserProfile } from '../../types/learning'
import { cn } from '../../lib/utils'
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  clearCustomSupabaseCredentials,
  testSupabaseConnection,
  isSupabaseConfigured,
} from '../../lib/supabase'
import {
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

const SQL_SCHEMA_SNIPPET = `-- Cloud Architect OS - Supabase Schema
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null default 'Cloud Architect Aspirant',
  email text not null,
  avatar text,
  role text default 'Senior Data / Software Engineer',
  target_role text default 'Lead Cloud Solutions Architect',
  start_date text default to_char(current_date, 'YYYY-MM-DD'),
  bio text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.kanban_cards (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text default '',
  column text not null default 'todo',
  priority text not null default 'medium',
  phase_id text default 'custom',
  week_num integer,
  project_id text,
  is_custom boolean default true,
  checklist jsonb default '[]'::jsonb,
  deliverables jsonb default '[]'::jsonb,
  tags jsonb default '[]'::jsonb,
  due_date text,
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.kanban_cards enable row level security;

create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can manage cards" on public.kanban_cards for all using (auth.uid() = user_id);`

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
  const [tab, setTab] = useState<'auth' | 'cloud' | 'edit' | 'demo'>('auth')

  // Auth Mode: 'signin' | 'signup'
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authName, setAuthName] = useState('')
  const [authRole, setAuthRole] = useState('Senior Data Engineer')
  const [authTargetRole, setAuthTargetRole] = useState('Lead Cloud Solutions Architect')
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [authSuccess, setAuthSuccess] = useState<string | null>(null)
  const [loggedInSupabaseEmail, setLoggedInSupabaseEmail] = useState<string | null>(null)

  // Cloud Config State
  const [cloudUrl, setCloudUrl] = useState('')
  const [cloudKey, setCloudKey] = useState('')
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [testingConnection, setTestingConnection] = useState(false)
  const [copiedSql, setCopiedSql] = useState(false)
  const [showSqlPreview, setShowSqlPreview] = useState(false)

  // Edit profile state
  const [editName, setEditName] = useState(currentUser.name)
  const [editRole, setEditRole] = useState(currentUser.role)
  const [editTarget, setEditTarget] = useState(currentUser.targetRole)
  const [editStartDate, setEditStartDate] = useState(currentUser.startDate)

  // Load existing credentials on mount
  useEffect(() => {
    if (isOpen) {
      const creds = getSupabaseCredentials()
      setCloudUrl(creds.url)
      setCloudKey(creds.anonKey)
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

  // Handle Supabase Auth (Sign In / Sign Up)
  const handleSupabaseAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError(null)
    setAuthSuccess(null)

    if (!isSupabaseConfigured()) {
      // Fallback: If Supabase credentials are not set, perform local login/register
      if (authMode === 'signup') {
        onRegister(authName || authEmail.split('@')[0], authEmail, authRole, authTargetRole)
      } else {
        onLogin(authEmail, authName || undefined)
      }
      setAuthSuccess('Logged in via Local Storage (Configure Supabase in Cloud tab to enable cloud DB).')
      setAuthLoading(false)
      setTimeout(() => onClose(), 1200)
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
        setTimeout(() => onClose(), 1200)
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
        setAuthSuccess('Account created! Your personal Kanban board and roadmap are synced.')
        setLoggedInSupabaseEmail(user.email || null)
        if (onRefreshCloud) onRefreshCloud()
        setTimeout(() => onClose(), 1500)
      }
    }
  }

  const handleSignOut = async () => {
    setAuthLoading(true)
    await signOutUser()
    setLoggedInSupabaseEmail(null)
    setAuthLoading(false)
    setAuthSuccess('Signed out of Supabase successfully.')
  }

  // Handle Cloud Config Test & Save
  const handleSaveCredentials = () => {
    if (!cloudUrl.trim() || !cloudKey.trim()) {
      setTestResult({ success: false, message: 'Please enter both URL and Anon Key.' })
      return
    }
    saveSupabaseCredentials(cloudUrl.trim(), cloudKey.trim())
    setTestResult({ success: true, message: 'Supabase credentials saved successfully!' })
  }

  const handleTestConnection = async () => {
    setTestingConnection(true)
    setTestResult(null)
    const res = await testSupabaseConnection(cloudUrl, cloudKey)
    setTestResult(res)
    setTestingConnection(false)
  }

  const handleClearCredentials = () => {
    clearCustomSupabaseCredentials()
    const creds = getSupabaseCredentials()
    setCloudUrl(creds.url)
    setCloudKey(creds.anonKey)
    setTestResult({ success: true, message: 'Custom credentials cleared.' })
  }

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_SNIPPET)
    setCopiedSql(true)
    setTimeout(() => setCopiedSql(false), 2000)
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
          className="relative z-10 flex max-h-[92vh] w-full max-w-xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Authentication & Supabase Cloud
                </h2>
                {isConfigured ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Supabase Ready
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                    Local Storage
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sign in to persist your personal Kanban board, notes, and cert milestones to PostgreSQL.
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
          <div className="flex border-b border-slate-100 bg-slate-50/70 p-2 dark:border-slate-800 dark:bg-slate-800/40">
            {[
              { id: 'auth' as const, label: 'Sign In / Register', icon: LogIn },
              { id: 'cloud' as const, label: 'Supabase Config', icon: Database },
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
            {/* ----------------- TAB: SUPABASE AUTH ----------------- */}
            {tab === 'auth' && (
              <div className="space-y-4">
                {loggedInSupabaseEmail ? (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 dark:border-emerald-500/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold">
                          ✓
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            Authenticated with Supabase
                          </div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">
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
                    {/* Toggle Mode */}
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
                        Sign In Existing Account
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
                        Create New Account
                      </button>
                    </div>

                    {!isConfigured && (
                      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <div>
                          <span>Supabase credentials not yet configured. Signing in now will save locally. Configure your Supabase project in the </span>
                          <button
                            onClick={() => setTab('cloud')}
                            className="font-bold underline hover:opacity-80"
                          >
                            Supabase Config tab
                          </button>
                          <span> to sync to the cloud.</span>
                        </div>
                      </div>
                    )}

                    {authError && (
                      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {authError}
                      </div>
                    )}

                    {authSuccess && (
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        {authSuccess}
                      </div>
                    )}

                    <form onSubmit={handleSupabaseAuth} className="space-y-3.5">
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
                            placeholder="e.g. Jayanth Pasupuleti"
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
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Password
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
                        <>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Current Role
                              </label>
                              <input
                                type="text"
                                value={authRole}
                                onChange={e => setAuthRole(e.target.value)}
                                placeholder="Data / Backend Engineer"
                                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-coral"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Target Role
                              </label>
                              <input
                                type="text"
                                value={authTargetRole}
                                onChange={e => setAuthTargetRole(e.target.value)}
                                placeholder="Cloud Solutions Architect"
                                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-coral"
                              />
                            </div>
                          </div>
                        </>
                      )}

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={authLoading}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-coral py-2.5 text-xs font-semibold text-white shadow-md shadow-coral/20 hover:bg-coral/90 disabled:opacity-50"
                        >
                          {authLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                          {authMode === 'signin' ? 'Sign In' : 'Create Supabase Account'}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            )}

            {/* ----------------- TAB: SUPABASE CONFIG & SCHEMA ----------------- */}
            {tab === 'cloud' && (
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Cloud className="h-4 w-4 text-coral" />
                      Supabase Project Connection
                    </span>
                    <span
                      className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-full',
                        isConfigured
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      )}
                    >
                      {isConfigured ? 'Configured' : 'Missing Credentials'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Enter your Supabase Project URL and anon public key. These can also be configured via <code className="text-coral">.env</code> (<code className="text-xs">VITE_SUPABASE_URL</code> & <code className="text-xs">VITE_SUPABASE_ANON_KEY</code>).
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Supabase Project URL
                    </label>
                    <input
                      type="url"
                      value={cloudUrl}
                      onChange={e => setCloudUrl(e.target.value)}
                      placeholder="https://your-project.supabase.co"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-coral font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>Supabase Anon Public API Key</span>
                      <Lock className="h-3 w-3 text-slate-400" />
                    </label>
                    <input
                      type="password"
                      value={cloudKey}
                      onChange={e => setCloudKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:border-coral font-mono"
                    />
                  </div>
                </div>

                {testResult && (
                  <div
                    className={cn(
                      'rounded-xl border p-3 text-xs flex items-center gap-2',
                      testResult.success
                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400'
                    )}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 shrink-0" />
                    )}
                    {testResult.message}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={handleSaveCredentials}
                    className="flex-1 rounded-xl bg-coral px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-coral/90"
                  >
                    Save Credentials
                  </button>
                  <button
                    onClick={handleTestConnection}
                    disabled={testingConnection}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 disabled:opacity-50"
                  >
                    {testingConnection ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                    Test Connection
                  </button>
                  <button
                    onClick={handleClearCredentials}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    Reset
                  </button>
                </div>

                {/* Database Schema Viewer */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Code2 className="h-4 w-4 text-coral" />
                      Database Schema & Tables (SQL)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopySql}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        {copiedSql ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        {copiedSql ? 'Copied!' : 'Copy SQL'}
                      </button>
                      <button
                        onClick={() => setShowSqlPreview(!showSqlPreview)}
                        className="text-[11px] text-coral hover:underline"
                      >
                        {showSqlPreview ? 'Hide SQL' : 'View SQL'}
                      </button>
                    </div>
                  </div>

                  {showSqlPreview && (
                    <pre className="max-h-48 overflow-y-auto rounded-xl bg-slate-900 p-3 font-mono text-[10px] text-slate-300 border border-slate-800 leading-relaxed">
                      {SQL_SCHEMA_SNIPPET}
                    </pre>
                  )}
                </div>
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
