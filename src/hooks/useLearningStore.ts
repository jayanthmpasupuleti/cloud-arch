import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { roadmap } from '../data/roadmap'
import type {
  UserProfile,
  KanbanCard,
  ColumnId,
  DailyNote,
  UserDataStore,
  SubTask,
} from '../types/learning'
import {
  isSupabaseConfigured,
  getSupabaseClient,
} from '../lib/supabase'
import {
  getSession,
  subscribeToAuthChanges,
  signOutUser,
} from '../lib/supabaseAuth'
import {
  fetchSupabaseProfile,
  upsertSupabaseProfile,
  fetchSupabaseCards,
  upsertSupabaseCard,
  bulkUpsertSupabaseCards,
  deleteSupabaseCard,
  clearAllSupabaseCards,
  fetchSupabaseRoadmapProgress,
  setSupabaseRoadmapItem,
  fetchSupabaseCertifications,
  upsertSupabaseCert,
  fetchSupabaseNotes,
  upsertSupabaseNote,
  deleteSupabaseNote,
  mapRowToCard,
} from '../lib/supabaseDb'
import type { KanbanCardRow } from '../types/supabase'

const USERS_STORAGE_KEY = 'cloud_arch_users_v2'
const ACTIVE_USER_KEY = 'cloud_arch_active_user_v2'
const USER_DATA_PREFIX = 'cloud_arch_data_v2_'

const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'user-jayanth',
    name: 'Jayanth Pasupuleti',
    email: 'jayanth@cloudarch.dev',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'Senior Data Engineer',
    targetRole: 'Lead Cloud Solutions Architect',
    startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    bio: 'Bridging big data engineering and multi-cloud architectural resilience.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-alex',
    name: 'Alex Rivera',
    email: 'alex@cloudarch.dev',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'Backend Engineer',
    targetRole: 'Cloud Infrastructure Architect',
    startDate: new Date().toISOString().split('T')[0],
    bio: 'Mastering GCP, AWS, and enterprise Kubernetes.',
    createdAt: new Date().toISOString(),
  },
]

export const COLUMN_DEFINITIONS = [
  {
    id: 'backlog' as ColumnId,
    title: 'Backlog / Staged',
    description: 'Upcoming roadmap items & learning materials queued up',
    color: '#64748B',
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    badgeText: 'text-slate-600 dark:text-slate-300',
  },
  {
    id: 'todo' as ColumnId,
    title: 'To Do Today',
    description: 'Prioritized tasks ready to begin work on',
    color: '#3B82F6',
    badgeBg: 'bg-blue-100 dark:bg-blue-900/40',
    badgeText: 'text-blue-600 dark:text-blue-300',
  },
  {
    id: 'inProgress' as ColumnId,
    title: 'In Progress',
    description: 'Active hands-on coding, Terraform builds, & drills',
    color: '#F59E0B',
    badgeBg: 'bg-amber-100 dark:bg-amber-900/40',
    badgeText: 'text-amber-600 dark:text-amber-300',
  },
  {
    id: 'review' as ColumnId,
    title: 'Testing & Deliverables',
    description: 'Diagrams, cost models, peer review & verification',
    color: '#8B5CF6',
    badgeBg: 'bg-violet-100 dark:bg-violet-900/40',
    badgeText: 'text-violet-600 dark:text-violet-300',
  },
  {
    id: 'done' as ColumnId,
    title: 'Completed',
    description: 'Shipped with all 4 golden deliverables verified',
    color: '#10B981',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    badgeText: 'text-emerald-600 dark:text-emerald-300',
  },
]

export function generateSeedCards(): KanbanCard[] {
  const cards: KanbanCard[] = []
  const now = new Date().toISOString()

  cards.push({
    id: 'seed-1',
    title: 'Terraform CLI setup & GCP Provider Authentication',
    description: 'Configured GCP provider credentials, application-default login, and initial provider configs.',
    column: 'done',
    priority: 'medium',
    phaseId: 'phase-1',
    weekNum: 1,
    checklist: [
      { id: 'sub-1', label: 'Install tfswitch / terraform 1.8+', done: true },
      { id: 'sub-2', label: 'gcloud auth application-default login', done: true },
      { id: 'sub-3', label: 'GCS backend with versioning enabled', done: true },
    ],
    deliverables: ['providers.tf', 'backend.tf', 'State locking verification'],
    tags: ['Terraform', 'GCP', 'IaC'],
    createdAt: now,
    updatedAt: now,
  })

  cards.push({
    id: 'seed-2',
    title: 'Modular VPC Design with Shared VPC Topology',
    description: 'Architecting custom VPCs with private Google access, Cloud NAT, and least privilege subnets.',
    column: 'inProgress',
    priority: 'high',
    phaseId: 'phase-1',
    weekNum: 2,
    checklist: [
      { id: 'sub-20', label: 'Define regional subnets CIDR allocation (/20)', done: true },
      { id: 'sub-21', label: 'Configure Cloud NAT with static IPs', done: true },
      { id: 'sub-22', label: 'Private Service Access for Cloud SQL', done: false },
      { id: 'sub-23', label: 'Firewall rules with strict egress control', done: false },
    ],
    deliverables: ['Terraform VPC module', 'draw.io Network Diagram', 'Subnet sizing sheet'],
    tags: ['Networking', 'VPC', 'Phase-1'],
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: 'Remember: Cloud NAT does not translate traffic to Google APIs with Private Google Access.',
    createdAt: now,
    updatedAt: now,
  })

  cards.push({
    id: 'seed-3',
    title: 'Workload Identity Federation (Keyless GitHub Actions)',
    description: 'Eliminate downloaded service account keys by establishing trust between GitHub OIDC and GCP IAM.',
    column: 'todo',
    priority: 'high',
    phaseId: 'phase-1',
    weekNum: 3,
    checklist: [
      { id: 'sub-30', label: 'Create Workload Identity Pool and Provider', done: false },
      { id: 'sub-31', label: 'Bind GitHub repository subject claim to IAM SA', done: false },
      { id: 'sub-32', label: 'Test auth in GitHub Actions workflow', done: false },
    ],
    deliverables: ['GitHub Actions OIDC workflow', 'Security posture summary'],
    tags: ['Security', 'IAM', 'CI/CD'],
    createdAt: now,
    updatedAt: now,
  })

  cards.push({
    id: 'seed-4',
    title: 'Project 1: Production-Grade Landing Zone Scaffold',
    description: 'Build dev/stage/prod GCP folders, projects, billing alerts, and automated policy checks.',
    column: 'review',
    priority: 'high',
    phaseId: 'phase-1',
    projectId: 'project-1',
    checklist: [
      { id: 'sub-40', label: 'Terraform org/folder hierarchy modules', done: true },
      { id: 'sub-41', label: 'Budgets & Slack alerting webhook', done: true },
      { id: 'sub-42', label: 'Checkov & tfsec automated scans', done: true },
      { id: 'sub-43', label: 'Golden Rule #4: Cost analysis breakdown', done: false },
    ],
    deliverables: ['Terraform Module Repo', 'Architecture Diagram', 'README with Trade-offs', 'Monthly FinOps Model'],
    tags: ['Project', 'Landing Zone', 'Capstone-Prep'],
    createdAt: now,
    updatedAt: now,
  })

  cards.push({
    id: 'seed-5',
    title: 'GKE Private Cluster & Workload Identity',
    description: 'Provision private Kubernetes cluster with authorized networks and Workload Identity for pods.',
    column: 'backlog',
    priority: 'medium',
    phaseId: 'phase-2',
    weekNum: 6,
    checklist: [
      { id: 'sub-50', label: 'Private nodes & control plane endpoint', done: false },
      { id: 'sub-51', label: 'Configure Workload Identity for app namespaces', done: false },
      { id: 'sub-52', label: 'Network policies with Cilium / Calico', done: false },
    ],
    tags: ['Kubernetes', 'GKE', 'Phase-2'],
    createdAt: now,
    updatedAt: now,
  })

  cards.push({
    id: 'seed-6',
    title: 'Custom Deep Dive: Kafka vs Google Pub/Sub vs Kinesis',
    description: 'Comparative study on partition scaling, ordering guarantees, consumer groups, and cost per million messages.',
    column: 'todo',
    priority: 'medium',
    phaseId: 'custom',
    isCustom: true,
    checklist: [
      { id: 'sub-60', label: 'Benchmark throughput and latencies', done: false },
      { id: 'sub-61', label: 'Draft architecture trade-off decision matrix', done: false },
      { id: 'sub-62', label: 'Cost comparison across 100MB/s throughput', done: false },
    ],
    deliverables: ['Architecture Decision Record (ADR-004)', 'Price calculator spreadsheet'],
    tags: ['Data Platform', 'Architecture Drill', 'Custom'],
    createdAt: now,
    updatedAt: now,
  })

  return cards
}

function getDefaultUserData(user: UserProfile): UserDataStore {
  return {
    user,
    cards: generateSeedCards(),
    checkedItems: {
      'p1-w1-tf-install': true,
      'p1-w1-tf-vars': true,
      'p1-w1-tf-state': true,
    },
    certStatuses: {
      'cert-gcp-pca': 'in-progress',
      'cert-aws-saa': 'planned',
      'cert-terraform': 'in-progress',
      'cert-cka': 'planned',
    },
    certTargets: {
      'cert-gcp-pca': '2026-03-15',
      'cert-aws-saa': '2026-04-10',
      'cert-terraform': '2026-02-28',
      'cert-cka': '2026-05-01',
    },
    notes: [
      {
        id: 'note-1',
        date: new Date().toISOString().split('T')[0],
        title: 'Day 14: Shared VPC vs Peering Nuances',
        content: `Transferred our staging VPC to Shared VPC model. Key learning: Shared VPC centralizes subnet administration under network admins, whereas VPC Peering leaves decentralized management but cannot do transitive routing.\n\nNext action: ensure Workload Identity provider is mapped correctly in our CI pipeline.`,
        tags: ['GCP', 'Networking', 'Learning Log'],
      },
    ],
    theme: 'dark',
  }
}

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error'

export function useLearningStore() {
  // Supabase Auth & State
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null)
  const [supabaseSession, setSupabaseSession] = useState<Session | null>(null)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('offline')
  const [isCloudEnabled, setIsCloudEnabled] = useState<boolean>(() => isSupabaseConfigured())
  const isCloudActive = Boolean(supabaseUser && isCloudEnabled)

  // Local demo users list
  const [users, setUsers] = useState<UserProfile[]>(() => {
    try {
      const raw = localStorage.getItem(USERS_STORAGE_KEY)
      if (raw) return JSON.parse(raw)
    } catch (e) {
      console.error(e)
    }
    return DEFAULT_USERS
  })

  // Active user ID (Local demo mode)
  const [activeUserId, setActiveUserId] = useState<string>(() => {
    try {
      const id = localStorage.getItem(ACTIVE_USER_KEY)
      if (id) return id
    } catch (e) {
      console.error(e)
    }
    return DEFAULT_USERS[0].id
  })

  // Current active user object
  const currentUser = useMemo<UserProfile>(() => {
    if (supabaseUser) {
      const meta = supabaseUser.user_metadata || {}
      return {
        id: supabaseUser.id,
        name: meta.name || supabaseUser.email?.split('@')[0] || 'Cloud Learner',
        email: supabaseUser.email || '',
        avatar: meta.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(supabaseUser.email || 'cloud')}`,
        role: meta.role || 'Cloud Engineer Aspirant',
        targetRole: meta.target_role || 'Lead Cloud Solutions Architect',
        startDate: meta.start_date || new Date().toISOString().split('T')[0],
        bio: meta.bio || 'Tracking cloud architecture milestones via Supabase.',
        createdAt: supabaseUser.created_at || new Date().toISOString(),
      }
    }
    return users.find(u => u.id === activeUserId) || users[0] || DEFAULT_USERS[0]
  }, [supabaseUser, users, activeUserId])

  // Active User Data Store
  const [userData, setUserData] = useState<UserDataStore>(() => {
    try {
      const raw = localStorage.getItem(`${USER_DATA_PREFIX}${activeUserId}`)
      if (raw) return JSON.parse(raw)
    } catch (e) {
      console.error(e)
    }
    return getDefaultUserData(DEFAULT_USERS[0])
  })

  // Track if current update was triggered by realtime subscription to avoid echoing
  const isRemoteSyncRef = useRef(false)

  // --------------------------------------------------------------------------
  // Supabase Auth & Session Initialization
  // --------------------------------------------------------------------------
  useEffect(() => {
    const configured = isSupabaseConfigured()
    setIsCloudEnabled(configured)

    if (!configured) {
      setSyncStatus('offline')
      return
    }

    setSyncStatus('syncing')
    getSession().then(session => {
      if (session?.user) {
        setSupabaseSession(session)
        setSupabaseUser(session.user)
      } else {
        setSyncStatus('offline')
      }
    }).catch(err => {
      console.warn('Supabase getSession failed:', err)
      setSyncStatus('offline')
    })

    const unsubscribe = subscribeToAuthChanges((_event, session) => {
      setSupabaseSession(session)
      setSupabaseUser(session?.user || null)
      if (!session) {
        setSyncStatus('offline')
      }
    })

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  // --------------------------------------------------------------------------
  // Fetch / Sync from Supabase when logged in
  // --------------------------------------------------------------------------
  const loadCloudUserData = useCallback(async (user: User) => {
    setSyncStatus('syncing')
    try {
      // 1. Profile
      const remoteProfile = await fetchSupabaseProfile(user.id)
      const userProfile: UserProfile = remoteProfile || {
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Cloud Learner',
        email: user.email || '',
        avatar: user.user_metadata?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.email || 'cloud')}`,
        role: user.user_metadata?.role || 'Cloud Engineer Aspirant',
        targetRole: user.user_metadata?.target_role || 'Lead Cloud Solutions Architect',
        startDate: user.user_metadata?.start_date || new Date().toISOString().split('T')[0],
        bio: user.user_metadata?.bio || '',
        createdAt: user.created_at,
      }

      // If no remote profile was found, create it in Supabase
      if (!remoteProfile) {
        await upsertSupabaseProfile(userProfile)
      }

      // 2. Kanban Cards
      let remoteCards = await fetchSupabaseCards(user.id)
      if (remoteCards === null || remoteCards.length === 0) {
        // First-time user: seed initial cards in Supabase database
        const seed = generateSeedCards()
        await bulkUpsertSupabaseCards(seed, user.id)
        remoteCards = seed
      }

      // 3. Roadmap Progress
      const remoteProgress = await fetchSupabaseRoadmapProgress(user.id)

      // 4. Certifications
      const remoteCerts = await fetchSupabaseCertifications(user.id)

      // 5. Daily Notes
      const remoteNotes = await fetchSupabaseNotes(user.id)

      isRemoteSyncRef.current = true
      setUserData(prev => ({
        ...prev,
        user: userProfile,
        cards: remoteCards || prev.cards,
        checkedItems: remoteProgress || prev.checkedItems,
        certStatuses: remoteCerts?.statuses || prev.certStatuses,
        certTargets: remoteCerts?.targets || prev.certTargets,
        notes: remoteNotes || prev.notes,
      }))

      // Cache locally for offline backup
      try {
        localStorage.setItem(`${USER_DATA_PREFIX}${user.id}`, JSON.stringify({
          user: userProfile,
          cards: remoteCards,
          checkedItems: remoteProgress || {},
          certStatuses: remoteCerts?.statuses || {},
          certTargets: remoteCerts?.targets || {},
          notes: remoteNotes || [],
          theme: 'dark',
        }))
      } catch (e) {
        console.warn('Failed to cache Supabase user data locally', e)
      }

      setSyncStatus('synced')
    } catch (err) {
      console.error('Error synchronizing with Supabase:', err)
      setSyncStatus('error')
    }
  }, [])

  useEffect(() => {
    if (supabaseUser) {
      loadCloudUserData(supabaseUser)
    } else {
      // Local mode: reload local user's data store
      try {
        const raw = localStorage.getItem(`${USER_DATA_PREFIX}${activeUserId}`)
        if (raw) {
          setUserData(JSON.parse(raw))
        } else {
          const fresh = getDefaultUserData(currentUser)
          setUserData(fresh)
          localStorage.setItem(`${USER_DATA_PREFIX}${activeUserId}`, JSON.stringify(fresh))
        }
      } catch (e) {
        console.error(e)
      }
    }
  }, [supabaseUser, activeUserId, loadCloudUserData, currentUser])

  // --------------------------------------------------------------------------
  // Realtime Supabase Subscription for multi-tab / cross-device live sync
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!supabaseUser || !isCloudEnabled) return

    const client = getSupabaseClient()
    if (!client) return

    const channel = client
      .channel(`public:kanban_cards:${supabaseUser.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kanban_cards',
          filter: `user_id=eq.${supabaseUser.id}`,
        },
        payload => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const updatedCard = mapRowToCard(payload.new as KanbanCardRow)
            setUserData(prev => {
              const exists = prev.cards.some(c => c.id === updatedCard.id)
              const newCards = exists
                ? prev.cards.map(c => (c.id === updatedCard.id ? updatedCard : c))
                : [updatedCard, ...prev.cards]
              return { ...prev, cards: newCards }
            })
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as any).id
            if (deletedId) {
              setUserData(prev => ({
                ...prev,
                cards: prev.cards.filter(c => c.id !== deletedId),
              }))
            }
          }
        }
      )
      .subscribe()

    return () => {
      client.removeChannel(channel)
    }
  }, [supabaseUser, isCloudEnabled])

  // --------------------------------------------------------------------------
  // Local persistence helper
  // --------------------------------------------------------------------------
  const persistUserData = useCallback((updater: (prev: UserDataStore) => UserDataStore) => {
    setUserData(prev => {
      const next = updater(prev)
      try {
        const keyId = supabaseUser?.id || next.user.id
        localStorage.setItem(`${USER_DATA_PREFIX}${keyId}`, JSON.stringify(next))
      } catch (e) {
        console.error(e)
      }
      return next
    })
  }, [supabaseUser])

  // Save users when updated in local mode
  useEffect(() => {
    if (!supabaseUser) {
      try {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
      } catch (e) {
        console.error(e)
      }
    }
  }, [users, supabaseUser])

  // --------------------------------------------------------------------------
  // Auth Operations
  // --------------------------------------------------------------------------
  const switchUser = useCallback((userId: string) => {
    if (supabaseUser) {
      // If user clicks switch in local demo modal while in Supabase mode, sign out first
      signOutUser()
      setSupabaseUser(null)
    }
    if (users.some(u => u.id === userId)) {
      setActiveUserId(userId)
    }
  }, [users, supabaseUser])

  const login = useCallback((email: string, name?: string) => {
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (existing) {
      setActiveUserId(existing.id)
      return existing
    }
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: name || email.split('@')[0],
      email,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      role: 'Cloud Engineer Aspirant',
      targetRole: 'Cloud Solutions Architect',
      startDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    }
    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)
    const freshData = getDefaultUserData(newUser)
    try {
      localStorage.setItem(`${USER_DATA_PREFIX}${newUser.id}`, JSON.stringify(freshData))
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers))
    } catch (e) {
      console.error(e)
    }
    setActiveUserId(newUser.id)
    return newUser
  }, [users])

  const register = useCallback((name: string, email: string, role: string, targetRole: string) => {
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      role: role || 'Software / Data Engineer',
      targetRole: targetRole || 'Cloud Architect',
      startDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    }
    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)
    const freshData = getDefaultUserData(newUser)
    try {
      localStorage.setItem(`${USER_DATA_PREFIX}${newUser.id}`, JSON.stringify(freshData))
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers))
    } catch (e) {
      console.error(e)
    }
    setActiveUserId(newUser.id)
    return newUser
  }, [users])

  const updateUserProfile = useCallback((updates: Partial<UserProfile>) => {
    if (supabaseUser) {
      persistUserData(prev => {
        const updated = { ...prev.user, ...updates }
        upsertSupabaseProfile(updated)
        return { ...prev, user: updated }
      })
    } else {
      setUsers(prev => prev.map(u => (u.id === activeUserId ? { ...u, ...updates } : u)))
      persistUserData(prev => ({
        ...prev,
        user: { ...prev.user, ...updates },
      }))
    }
  }, [supabaseUser, activeUserId, persistUserData])

  const handleSignOutSupabase = useCallback(async () => {
    await signOutUser()
    setSupabaseUser(null)
    setSupabaseSession(null)
    setSyncStatus('offline')
  }, [])

  const refreshFromCloud = useCallback(async () => {
    if (supabaseUser) {
      await loadCloudUserData(supabaseUser)
    }
  }, [supabaseUser, loadCloudUserData])

  // --------------------------------------------------------------------------
  // Kanban CRUD Operations
  // --------------------------------------------------------------------------
  const addCard = useCallback((card: Partial<KanbanCard>): KanbanCard => {
    const newCard: KanbanCard = {
      id: card.id || `card-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: card.title || 'Untitled Learning Material',
      description: card.description || '',
      column: card.column || 'todo',
      priority: card.priority || 'medium',
      phaseId: card.phaseId || 'custom',
      weekNum: card.weekNum,
      projectId: card.projectId,
      isCustom: card.isCustom ?? true,
      checklist: card.checklist || [],
      deliverables: card.deliverables || [],
      tags: card.tags || ['Custom'],
      dueDate: card.dueDate,
      notes: card.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    persistUserData(prev => ({
      ...prev,
      cards: [newCard, ...prev.cards],
    }))

    if (supabaseUser) {
      setSyncStatus('syncing')
      upsertSupabaseCard(newCard, supabaseUser.id).then(() => setSyncStatus('synced'))
    }

    return newCard
  }, [persistUserData, supabaseUser])

  const updateCard = useCallback((cardId: string, updates: Partial<KanbanCard>) => {
    let cardToSave: KanbanCard | null = null

    persistUserData(prev => {
      const nextCards = prev.cards.map(c => {
        if (c.id === cardId) {
          cardToSave = { ...c, ...updates, updatedAt: new Date().toISOString() }
          return cardToSave
        }
        return c
      })
      return { ...prev, cards: nextCards }
    })

    if (supabaseUser && cardToSave) {
      setSyncStatus('syncing')
      upsertSupabaseCard(cardToSave, supabaseUser.id).then(() => setSyncStatus('synced'))
    }
  }, [persistUserData, supabaseUser])

  const deleteCard = useCallback((cardId: string) => {
    persistUserData(prev => ({
      ...prev,
      cards: prev.cards.filter(c => c.id !== cardId),
    }))

    if (supabaseUser) {
      setSyncStatus('syncing')
      deleteSupabaseCard(cardId, supabaseUser.id).then(() => setSyncStatus('synced'))
    }
  }, [persistUserData, supabaseUser])

  const clearAllCards = useCallback(() => {
    persistUserData(prev => ({
      ...prev,
      cards: [],
    }))

    if (supabaseUser) {
      setSyncStatus('syncing')
      clearAllSupabaseCards(supabaseUser.id).then(() => setSyncStatus('synced'))
    }
  }, [persistUserData, supabaseUser])

  const moveCard = useCallback((cardId: string, targetColumn: ColumnId, targetIndex?: number) => {
    let movedCard: KanbanCard | null = null

    persistUserData(prev => {
      const card = prev.cards.find(c => c.id === cardId)
      if (!card) return prev

      const otherCards = prev.cards.filter(c => c.id !== cardId)
      movedCard = {
        ...card,
        column: targetColumn,
        updatedAt: new Date().toISOString(),
      }

      if (typeof targetIndex === 'number' && targetIndex >= 0) {
        const columnCards = otherCards.filter(c => c.column === targetColumn)
        const restCards = otherCards.filter(c => c.column !== targetColumn)
        columnCards.splice(targetIndex, 0, movedCard)
        return {
          ...prev,
          cards: [...restCards, ...columnCards],
        }
      }

      return {
        ...prev,
        cards: [movedCard, ...otherCards],
      }
    })

    if (supabaseUser && movedCard) {
      setSyncStatus('syncing')
      upsertSupabaseCard(movedCard, supabaseUser.id).then(() => setSyncStatus('synced'))
    }
  }, [persistUserData, supabaseUser])

  const toggleSubTask = useCallback((cardId: string, subtaskId: string) => {
    let updatedCard: KanbanCard | null = null

    persistUserData(prev => ({
      ...prev,
      cards: prev.cards.map(c => {
        if (c.id !== cardId) return c
        updatedCard = {
          ...c,
          checklist: c.checklist.map(st => (st.id === subtaskId ? { ...st, done: !st.done } : st)),
          updatedAt: new Date().toISOString(),
        }
        return updatedCard
      }),
    }))

    if (supabaseUser && updatedCard) {
      setSyncStatus('syncing')
      upsertSupabaseCard(updatedCard, supabaseUser.id).then(() => setSyncStatus('synced'))
    }
  }, [persistUserData, supabaseUser])

  const addSubTask = useCallback((cardId: string, label: string) => {
    const newSubTask: SubTask = {
      id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      label,
      done: false,
    }
    let updatedCard: KanbanCard | null = null

    persistUserData(prev => ({
      ...prev,
      cards: prev.cards.map(c => {
        if (c.id !== cardId) return c
        updatedCard = {
          ...c,
          checklist: [...c.checklist, newSubTask],
          updatedAt: new Date().toISOString(),
        }
        return updatedCard
      }),
    }))

    if (supabaseUser && updatedCard) {
      setSyncStatus('syncing')
      upsertSupabaseCard(updatedCard, supabaseUser.id).then(() => setSyncStatus('synced'))
    }
  }, [persistUserData, supabaseUser])

  const removeSubTask = useCallback((cardId: string, subtaskId: string) => {
    let updatedCard: KanbanCard | null = null

    persistUserData(prev => ({
      ...prev,
      cards: prev.cards.map(c => {
        if (c.id !== cardId) return c
        updatedCard = {
          ...c,
          checklist: c.checklist.filter(st => st.id !== subtaskId),
          updatedAt: new Date().toISOString(),
        }
        return updatedCard
      }),
    }))

    if (supabaseUser && updatedCard) {
      setSyncStatus('syncing')
      upsertSupabaseCard(updatedCard, supabaseUser.id).then(() => setSyncStatus('synced'))
    }
  }, [persistUserData, supabaseUser])

  // --------------------------------------------------------------------------
  // Curriculum & Roadmap Integration
  // --------------------------------------------------------------------------
  const importRoadmapTaskToBoard = useCallback((itemId: string, targetColumn: ColumnId = 'todo') => {
    for (const phase of roadmap.phases) {
      for (const week of phase.weeksData) {
        const item = week.items.find(i => i.id === itemId)
        if (item) {
          const existing = userData.cards.find(c => c.id === item.id || c.title === item.label)
          if (existing) {
            moveCard(existing.id, targetColumn)
            return existing
          }
          return addCard({
            id: item.id,
            title: item.label,
            description: `Phase ${phase.number} (Week ${week.number}): ${week.title}`,
            column: targetColumn,
            priority: 'medium',
            phaseId: phase.id,
            weekNum: week.number,
            isCustom: false,
            tags: [phase.title.split(' ')[0], `Week ${week.number}`],
            checklist: [
              { id: `st-${item.id}-1`, label: 'Complete hands-on implementation', done: false },
              { id: `st-${item.id}-2`, label: 'Review trade-offs & documentation', done: false },
            ],
          })
        }
      }
    }
    return null
  }, [userData.cards, addCard, moveCard])

  const importProjectToBoard = useCallback((projectId: string, targetColumn: ColumnId = 'inProgress') => {
    const project = roadmap.projects.find(p => p.id === projectId)
    if (!project) return null

    const existing = userData.cards.find(c => c.projectId === projectId || c.title === project.title)
    if (existing) {
      moveCard(existing.id, targetColumn)
      return existing
    }

    return addCard({
      id: `card-proj-${project.id}`,
      title: project.title,
      description: project.description,
      column: targetColumn,
      priority: project.difficulty === 'Advanced' ? 'high' : 'medium',
      phaseId: project.phaseId,
      projectId: project.id,
      isCustom: false,
      checklist: project.checklist.map(ci => ({ id: ci.id, label: ci.label, done: false })),
      deliverables: project.deliverables,
      tags: ['Project', ...project.techStack.slice(0, 3)],
    })
  }, [userData.cards, addCard, moveCard])

  const toggleRoadmapChecked = useCallback((id: string) => {
    const nextVal = !userData.checkedItems[id]

    persistUserData(prev => ({
      ...prev,
      checkedItems: { ...prev.checkedItems, [id]: nextVal },
    }))

    if (supabaseUser) {
      setSyncStatus('syncing')
      setSupabaseRoadmapItem(supabaseUser.id, id, nextVal).then(() => setSyncStatus('synced'))
    }
  }, [userData.checkedItems, persistUserData, supabaseUser])

  const updateCert = useCallback((id: string, field: 'status' | 'targetDate', value: string) => {
    persistUserData(prev => {
      if (field === 'status') {
        return { ...prev, certStatuses: { ...prev.certStatuses, [id]: value } }
      }
      return { ...prev, certTargets: { ...prev.certTargets, [id]: value } }
    })

    if (supabaseUser) {
      setSyncStatus('syncing')
      upsertSupabaseCert(supabaseUser.id, id, {
        status: field === 'status' ? value : undefined,
        targetDate: field === 'targetDate' ? value : undefined,
      }).then(() => setSyncStatus('synced'))
    }
  }, [persistUserData, supabaseUser])

  // --------------------------------------------------------------------------
  // Daily Notes
  // --------------------------------------------------------------------------
  const addNote = useCallback((note: Omit<DailyNote, 'id'>) => {
    const newNote: DailyNote = {
      id: `note-${Date.now()}`,
      ...note,
    }

    persistUserData(prev => ({
      ...prev,
      notes: [newNote, ...prev.notes],
    }))

    if (supabaseUser) {
      setSyncStatus('syncing')
      upsertSupabaseNote(newNote, supabaseUser.id).then(() => setSyncStatus('synced'))
    }

    return newNote
  }, [persistUserData, supabaseUser])

  const deleteNote = useCallback((noteId: string) => {
    persistUserData(prev => ({
      ...prev,
      notes: prev.notes.filter(n => n.id !== noteId),
    }))

    if (supabaseUser) {
      setSyncStatus('syncing')
      deleteSupabaseNote(noteId, supabaseUser.id).then(() => setSyncStatus('synced'))
    }
  }, [persistUserData, supabaseUser])

  // --------------------------------------------------------------------------
  // Computed Stats
  // --------------------------------------------------------------------------
  const stats = useMemo(() => {
    const start = currentUser.startDate ? new Date(currentUser.startDate) : new Date()
    const diffDays = Math.max(1, Math.min(112, Math.floor((Date.now() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1))
    const currentWeek = Math.max(1, Math.min(16, Math.floor((diffDays - 1) / 7) + 1))

    let totalRoadmapItems = 0
    let doneRoadmapItems = 0
    for (const phase of roadmap.phases) {
      for (const week of phase.weeksData) {
        totalRoadmapItems += week.items.length
        doneRoadmapItems += week.items.filter(i => userData.checkedItems[i.id]).length
      }
    }
    for (const project of roadmap.projects) {
      totalRoadmapItems += project.checklist.length
      doneRoadmapItems += project.checklist.filter(i => userData.checkedItems[i.id]).length
    }

    const cardsByColumn: Record<ColumnId, KanbanCard[]> = {
      backlog: [],
      todo: [],
      inProgress: [],
      review: [],
      done: [],
    }

    for (const card of userData.cards) {
      if (cardsByColumn[card.column]) {
        cardsByColumn[card.column].push(card)
      } else {
        cardsByColumn.todo.push(card)
      }
    }

    const totalBoardCards = userData.cards.length
    const doneBoardCards = cardsByColumn.done.length
    const inProgressBoardCards = cardsByColumn.inProgress.length
    const reviewBoardCards = cardsByColumn.review.length

    const combinedTotal = totalRoadmapItems + totalBoardCards
    const combinedDone = doneRoadmapItems + doneBoardCards
    const progressPct = combinedTotal === 0 ? 0 : Math.round((combinedDone / combinedTotal) * 100)

    return {
      dayOf112: diffDays,
      currentWeek,
      totalRoadmapItems,
      doneRoadmapItems,
      cardsByColumn,
      totalBoardCards,
      doneBoardCards,
      inProgressBoardCards,
      reviewBoardCards,
      progressPct,
    }
  }, [currentUser, userData])

  // --------------------------------------------------------------------------
  // Export / Import / Reset
  // --------------------------------------------------------------------------
  const exportData = useCallback(() => {
    return JSON.stringify(userData, null, 2)
  }, [userData])

  const importData = useCallback((jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr) as UserDataStore
      if (parsed && parsed.user && Array.isArray(parsed.cards)) {
        persistUserData(() => parsed)
        if (supabaseUser) {
          bulkUpsertSupabaseCards(parsed.cards, supabaseUser.id)
        }
        return true
      }
    } catch (e) {
      console.error(e)
    }
    return false
  }, [persistUserData, supabaseUser])

  const resetUserData = useCallback(() => {
    const fresh = getDefaultUserData(currentUser)
    persistUserData(() => fresh)
    if (supabaseUser) {
      clearAllSupabaseCards(supabaseUser.id).then(() => {
        bulkUpsertSupabaseCards(fresh.cards, supabaseUser.id)
      })
    }
  }, [currentUser, persistUserData, supabaseUser])

  return {
    users,
    currentUser,
    userData,
    stats,
    supabaseUser,
    supabaseSession,
    isCloudActive,
    isCloudEnabled,
    syncStatus,
    refreshFromCloud,
    signOutSupabase: handleSignOutSupabase,
    switchUser,
    login,
    register,
    updateUserProfile,
    addCard,
    updateCard,
    deleteCard,
    clearAllCards,
    moveCard,
    toggleSubTask,
    addSubTask,
    removeSubTask,
    importRoadmapTaskToBoard,
    importProjectToBoard,
    toggleRoadmapChecked,
    updateCert,
    addNote,
    deleteNote,
    exportData,
    importData,
    resetUserData,
  }
}
