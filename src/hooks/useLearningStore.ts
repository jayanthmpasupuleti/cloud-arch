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
  updateSupabaseJourneyStartDate,
  fetchSupabaseCards,
  upsertSupabaseCard,
  bulkUpsertSupabaseCards,
  deleteSupabaseCard,
  clearAllSupabaseCards,
  fetchSupabaseRoadmapProgress,
  setSupabaseRoadmapItem,
  clearAllSupabaseRoadmapProgress,
  fetchSupabaseCertifications,
  upsertSupabaseCert,
  clearAllSupabaseCertifications,
  fetchSupabaseNotes,
  upsertSupabaseNote,
  deleteSupabaseNote,
  clearAllSupabaseNotes,
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
    startDate: new Date().toISOString().split('T')[0],
    journeyStartDate: null, // Day 0 until user moves first card to inProgress
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
    journeyStartDate: null,
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

// Default starting user state: Blank slate with no cards on the board
function getDefaultUserData(user: UserProfile): UserDataStore {
  return {
    user: {
      ...user,
      journeyStartDate: user.journeyStartDate || null,
    },
    cards: [], // Blank slate default!
    checkedItems: {},
    certStatuses: {
      'cert-gcp-pca': 'planned',
      'cert-aws-saa': 'planned',
      'cert-terraform': 'planned',
      'cert-cka': 'planned',
    },
    certTargets: {
      'cert-gcp-pca': '',
      'cert-aws-saa': '',
      'cert-terraform': '',
      'cert-cka': '',
    },
    notes: [],
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

  // Local users list
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

  // Current active user object (combines Supabase auth metadata with database profile)
  const currentUser = useMemo<UserProfile>(() => {
    if (supabaseUser) {
      const meta = supabaseUser.user_metadata || {}
      return {
        id: supabaseUser.id,
        name:
          meta.full_name ||
          meta.name ||
          supabaseUser.email?.split('@')[0] ||
          'Cloud Learner',
        email: supabaseUser.email || '',
        avatar:
          meta.avatar_url ||
          meta.picture ||
          `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(supabaseUser.email || 'cloud')}`,
        role: meta.role || 'Cloud Engineer Aspirant',
        targetRole: meta.target_role || 'Lead Cloud Solutions Architect',
        startDate: meta.start_date || new Date().toISOString().split('T')[0],
        journeyStartDate: userData.user?.journeyStartDate ?? null,
        bio: meta.bio || 'Tracking cloud architecture milestones via Supabase.',
        createdAt: supabaseUser.created_at || new Date().toISOString(),
      }
    }
    return (
      users.find(u => u.id === activeUserId) ||
      users[0] ||
      DEFAULT_USERS[0]
    )
  }, [supabaseUser, users, activeUserId, userData.user])

  // Track if current update was triggered by realtime subscription
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
    getSession()
      .then(session => {
        if (session?.user) {
          setSupabaseSession(session)
          setSupabaseUser(session.user)
        } else {
          setSyncStatus('offline')
        }
      })
      .catch(err => {
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
        name:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split('@')[0] ||
          'Cloud Learner',
        email: user.email || '',
        avatar:
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.email || 'cloud')}`,
        role: user.user_metadata?.role || 'Cloud Engineer Aspirant',
        targetRole: user.user_metadata?.target_role || 'Lead Cloud Solutions Architect',
        startDate: user.user_metadata?.start_date || new Date().toISOString().split('T')[0],
        journeyStartDate: null, // Day 0 until user moves first card to inProgress
        bio: user.user_metadata?.bio || '',
        createdAt: user.created_at,
      }

      // If no remote profile was found, create it in Supabase
      if (!remoteProfile) {
        await upsertSupabaseProfile(userProfile)
      }

      // 2. Kanban Cards - Default is an empty array (blank slate)
      const remoteCards = (await fetchSupabaseCards(user.id)) || []

      // 3. Roadmap Progress
      const remoteProgress = (await fetchSupabaseRoadmapProgress(user.id)) || {}

      // 4. Certifications
      const remoteCerts = await fetchSupabaseCertifications(user.id)

      // 5. Daily Notes
      const remoteNotes = (await fetchSupabaseNotes(user.id)) || []

      isRemoteSyncRef.current = true
      setUserData({
        user: userProfile,
        cards: remoteCards,
        checkedItems: remoteProgress,
        certStatuses: remoteCerts?.statuses || {
          'cert-gcp-pca': 'planned',
          'cert-aws-saa': 'planned',
          'cert-terraform': 'planned',
          'cert-cka': 'planned',
        },
        certTargets: remoteCerts?.targets || {},
        notes: remoteNotes,
        theme: 'dark',
      })

      // Cache locally for offline resilience
      try {
        localStorage.setItem(
          `${USER_DATA_PREFIX}${user.id}`,
          JSON.stringify({
            user: userProfile,
            cards: remoteCards,
            checkedItems: remoteProgress,
            certStatuses: remoteCerts?.statuses || {},
            certTargets: remoteCerts?.targets || {},
            notes: remoteNotes,
            theme: 'dark',
          })
        )
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
  const persistUserData = useCallback(
    (updater: (prev: UserDataStore) => UserDataStore) => {
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
    },
    [supabaseUser]
  )

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
  // Journey Timer: Starts automatically when first card reaches inProgress
  // --------------------------------------------------------------------------
  const ensureJourneyStarted = useCallback(() => {
    let nowStarted: string | null = null

    persistUserData(prev => {
      if (prev.user.journeyStartDate) {
        return prev
      }
      nowStarted = new Date().toISOString()
      return {
        ...prev,
        user: {
          ...prev.user,
          journeyStartDate: nowStarted,
        },
      }
    })

    if (supabaseUser) {
      const nowIso = new Date().toISOString()
      updateSupabaseJourneyStartDate(supabaseUser.id, nowIso)
    }
  }, [persistUserData, supabaseUser])

  // --------------------------------------------------------------------------
  // Reset / Clear All Progress back to Day 0 Blank Slate
  // --------------------------------------------------------------------------
  const clearAllProgress = useCallback(() => {
    persistUserData(prev => ({
      ...prev,
      user: {
        ...prev.user,
        journeyStartDate: null, // Wipe days back to 0
      },
      cards: [], // Blank slate: 0 cards
      checkedItems: {},
      notes: [],
      certStatuses: {
        'cert-gcp-pca': 'planned',
        'cert-aws-saa': 'planned',
        'cert-terraform': 'planned',
        'cert-cka': 'planned',
      },
      certTargets: {},
    }))

    if (supabaseUser) {
      setSyncStatus('syncing')
      Promise.all([
        clearAllSupabaseCards(supabaseUser.id),
        clearAllSupabaseRoadmapProgress(supabaseUser.id),
        clearAllSupabaseNotes(supabaseUser.id),
        clearAllSupabaseCertifications(supabaseUser.id),
        updateSupabaseJourneyStartDate(supabaseUser.id, null),
      ])
        .then(() => {
          setSyncStatus('synced')
        })
        .catch(err => {
          console.error('Error clearing progress in Supabase:', err)
          setSyncStatus('error')
        })
    }
  }, [persistUserData, supabaseUser])

  // --------------------------------------------------------------------------
  // Auth Operations
  // --------------------------------------------------------------------------
  const switchUser = useCallback(
    (userId: string) => {
      if (supabaseUser) {
        signOutUser()
        setSupabaseUser(null)
      }
      if (users.some(u => u.id === userId)) {
        setActiveUserId(userId)
      }
    },
    [users, supabaseUser]
  )

  const login = useCallback(
    (email: string, name?: string) => {
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
        targetRole: 'Lead Cloud Solutions Architect',
        startDate: new Date().toISOString().split('T')[0],
        journeyStartDate: null,
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
    },
    [users]
  )

  const register = useCallback(
    (name: string, email: string, role: string, targetRole: string) => {
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        name,
        email,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
        role: role || 'Software / Data Engineer',
        targetRole: targetRole || 'Cloud Architect',
        startDate: new Date().toISOString().split('T')[0],
        journeyStartDate: null,
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
    },
    [users]
  )

  const updateUserProfile = useCallback(
    (updates: Partial<UserProfile>) => {
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
    },
    [supabaseUser, activeUserId, persistUserData]
  )

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
  const addCard = useCallback(
    (card: Partial<KanbanCard>): KanbanCard => {
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

      // If added directly to inProgress, start journey
      if (newCard.column === 'inProgress') {
        ensureJourneyStarted()
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
    },
    [persistUserData, supabaseUser, ensureJourneyStarted]
  )

  const updateCard = useCallback(
    (cardId: string, updates: Partial<KanbanCard>) => {
      let cardToSave: KanbanCard | null = null

      if (updates.column === 'inProgress') {
        ensureJourneyStarted()
      }

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
    },
    [persistUserData, supabaseUser, ensureJourneyStarted]
  )

  const deleteCard = useCallback(
    (cardId: string) => {
      persistUserData(prev => ({
        ...prev,
        cards: prev.cards.filter(c => c.id !== cardId),
      }))

      if (supabaseUser) {
        setSyncStatus('syncing')
        deleteSupabaseCard(cardId, supabaseUser.id).then(() => setSyncStatus('synced'))
      }
    },
    [persistUserData, supabaseUser]
  )

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

  const moveCard = useCallback(
    (cardId: string, targetColumn: ColumnId, targetIndex?: number) => {
      let movedCard: KanbanCard | null = null

      // Moving card to inProgress starts the user's plan and begins journey timer
      if (targetColumn === 'inProgress') {
        ensureJourneyStarted()
      }

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
    },
    [persistUserData, supabaseUser, ensureJourneyStarted]
  )

  const toggleSubTask = useCallback(
    (cardId: string, subtaskId: string) => {
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
    },
    [persistUserData, supabaseUser]
  )

  const addSubTask = useCallback(
    (cardId: string, label: string) => {
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
    },
    [persistUserData, supabaseUser]
  )

  const removeSubTask = useCallback(
    (cardId: string, subtaskId: string) => {
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
    },
    [persistUserData, supabaseUser]
  )

  // --------------------------------------------------------------------------
  // Curriculum & Roadmap Integration
  // --------------------------------------------------------------------------
  const importRoadmapTaskToBoard = useCallback(
    (itemId: string, targetColumn: ColumnId = 'todo') => {
      if (targetColumn === 'inProgress') {
        ensureJourneyStarted()
      }

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
    },
    [userData.cards, addCard, moveCard, ensureJourneyStarted]
  )

  const importProjectToBoard = useCallback(
    (projectId: string, targetColumn: ColumnId = 'inProgress') => {
      if (targetColumn === 'inProgress') {
        ensureJourneyStarted()
      }

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
    },
    [userData.cards, addCard, moveCard, ensureJourneyStarted]
  )

  const toggleRoadmapChecked = useCallback(
    (id: string) => {
      const nextVal = !userData.checkedItems[id]

      persistUserData(prev => ({
        ...prev,
        checkedItems: { ...prev.checkedItems, [id]: nextVal },
      }))

      if (supabaseUser) {
        setSyncStatus('syncing')
        setSupabaseRoadmapItem(supabaseUser.id, id, nextVal).then(() => setSyncStatus('synced'))
      }
    },
    [userData.checkedItems, persistUserData, supabaseUser]
  )

  const updateCert = useCallback(
    (id: string, field: 'status' | 'targetDate', value: string) => {
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
    },
    [persistUserData, supabaseUser]
  )

  // --------------------------------------------------------------------------
  // Daily Notes
  // --------------------------------------------------------------------------
  const addNote = useCallback(
    (note: Omit<DailyNote, 'id'>) => {
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
    },
    [persistUserData, supabaseUser]
  )

  const deleteNote = useCallback(
    (noteId: string) => {
      persistUserData(prev => ({
        ...prev,
        notes: prev.notes.filter(n => n.id !== noteId),
      }))

      if (supabaseUser) {
        setSyncStatus('syncing')
        deleteSupabaseNote(noteId, supabaseUser.id).then(() => setSyncStatus('synced'))
      }
    },
    [persistUserData, supabaseUser]
  )

  // --------------------------------------------------------------------------
  // Computed Stats & Journey Elapsed Time
  // --------------------------------------------------------------------------
  const stats = useMemo(() => {
    const journeyStart = userData.user?.journeyStartDate || currentUser.journeyStartDate
    const isJourneyStarted = Boolean(journeyStart)
    let diffDays = 0
    let currentWeek = 0
    let elapsedHours = 0

    if (journeyStart) {
      const startMs = new Date(journeyStart).getTime()
      const nowMs = Date.now()
      const elapsedMs = Math.max(0, nowMs - startMs)
      diffDays = Math.max(1, Math.min(112, Math.floor(elapsedMs / (24 * 60 * 60 * 1000)) + 1))
      currentWeek = Math.max(1, Math.min(16, Math.floor((diffDays - 1) / 7) + 1))
      elapsedHours = Math.floor(elapsedMs / (60 * 60 * 1000))
    }

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
      isJourneyStarted,
      journeyStartDate: journeyStart,
      dayOf112: diffDays,
      currentWeek,
      elapsedHours,
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
  // Export / Import
  // --------------------------------------------------------------------------
  const exportData = useCallback(() => {
    return JSON.stringify(userData, null, 2)
  }, [userData])

  const importData = useCallback(
    (jsonStr: string) => {
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
    },
    [persistUserData, supabaseUser]
  )

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
    clearAllProgress, // Complete wipe back to Day 0 blank slate
    ensureJourneyStarted,
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
  }
}
