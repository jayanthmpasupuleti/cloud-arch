import { useState, useEffect, useCallback } from 'react'
import LandingPage from './components/landing/LandingPage'
import DashboardLayout from './components/dashboard/DashboardLayout'
import AuthModal from './components/dashboard/AuthModal'
import { CommandPalette } from './components/primitives/CommandPalette'
import { useLearningStore } from './hooks/useLearningStore'
import type { DashboardTab } from './types/learning'
import './index.css'

const VIEW_MODE_KEY = 'cloud_arch_view_mode_v2'

export default function App() {
  const store = useLearningStore()
  const {
    currentUser,
    users,
    switchUser,
    login,
    register,
    updateUserProfile,
  } = store

  // View Mode: 'landing' or 'dashboard'
  const [viewMode, setViewMode] = useState<'landing' | 'dashboard'>(() => {
    try {
      const saved = localStorage.getItem(VIEW_MODE_KEY)
      if (saved === 'landing' || saved === 'dashboard') return saved
    } catch (e) {
      console.error(e)
    }
    // Default to dashboard if user has previous progress or start in landing
    return 'dashboard'
  })

  // Active tab inside Dashboard
  const [activeTab, setActiveTab] = useState<DashboardTab>('kanban')

  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('cloud_arch_theme') !== 'light'
    } catch {
      return true
    }
  })

  // Auth modal
  const [authModalOpen, setAuthModalOpen] = useState(false)

  // Sync theme
  useEffect(() => {
    const root = document.documentElement
    if (darkMode) {
      root.classList.add('dark')
      localStorage.setItem('cloud_arch_theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('cloud_arch_theme', 'light')
    }
  }, [darkMode])

  // Save view mode
  const handleSetViewMode = useCallback((mode: 'landing' | 'dashboard') => {
    setViewMode(mode)
    try {
      localStorage.setItem(VIEW_MODE_KEY, mode)
    } catch (e) {
      console.error(e)
    }
  }, [])

  const handleToggleTheme = useCallback(() => {
    setDarkMode(d => !d)
  }, [])

  const handleOpenCommandPalette = useCallback(() => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true }))
  }, [])

  return (
    <div className="min-h-screen bg-[#FFF5ED] text-slate-900 dark:bg-[#0B1120] dark:text-slate-100 transition-colors duration-200">
      {viewMode === 'landing' ? (
        <LandingPage
          currentUser={currentUser}
          onEnterDashboard={() => handleSetViewMode('dashboard')}
          onOpenAuth={() => setAuthModalOpen(true)}
          darkMode={darkMode}
          onToggleTheme={handleToggleTheme}
        />
      ) : (
        <DashboardLayout
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onReturnToLanding={() => handleSetViewMode('landing')}
          store={store}
          darkMode={darkMode}
          onToggleTheme={handleToggleTheme}
          onOpenCommandPalette={handleOpenCommandPalette}
        />
      )}

      {/* Global Auth / Profile Modal */}
      {authModalOpen && (
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          users={users}
          currentUser={currentUser}
          onSwitchUser={switchUser}
          onLogin={login}
          onRegister={register}
          onUpdateProfile={updateUserProfile}
          isCloudActive={store.isCloudActive}
          syncStatus={store.syncStatus}
          onRefreshCloud={store.refreshFromCloud}
        />
      )}

      {/* Global Command Palette */}
      <CommandPalette
        onSelectTab={tab => {
          if (viewMode !== 'dashboard') handleSetViewMode('dashboard')
          setActiveTab(tab)
        }}
      />
    </div>
  )
}
