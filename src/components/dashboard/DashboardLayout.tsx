import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  TrendingUp,
  Award,
  PenTool,
  Briefcase,
  Globe,
  Plus,
  Moon,
  Sun,
  Command,
  User,
  ChevronRight,
  Menu,
  X,
  Home,
} from 'lucide-react'
import type { DashboardTab } from '../../types/learning'
import KanbanStudio from './KanbanStudio'
import CurriculumView from './CurriculumView'
import ProjectsView from './ProjectsView'
import SkillsView from './SkillsView'
import CertsView from './CertsView'
import NotesJournalView from './NotesJournalView'
import JobSearchKit from '../sections/JobSearchKit'
import Resources from '../sections/Resources'
import NewCardModal from './NewCardModal'
import AuthModal from './AuthModal'
import { cn } from '../../lib/utils'

interface Props {
  activeTab: DashboardTab
  setActiveTab: (tab: DashboardTab) => void
  onReturnToLanding: () => void
  store: any
  darkMode: boolean
  onToggleTheme: () => void
  onOpenCommandPalette: () => void
}

const NAV_ITEMS: { id: DashboardTab; label: string; icon: any; badge?: string }[] = [
  { id: 'kanban', label: 'Kanban Studio', icon: LayoutDashboard, badge: 'Active' },
  { id: 'curriculum', label: '16-Wk Curriculum', icon: BookOpen },
  { id: 'projects', label: 'Projects & Deliv.', icon: Layers },
  { id: 'skills', label: 'Skills Radar', icon: TrendingUp },
  { id: 'certs', label: 'Certifications', icon: Award },
  { id: 'journal', label: 'Daily Journal', icon: PenTool },
  { id: 'jobSearch', label: 'Job Search Kit', icon: Briefcase },
  { id: 'resources', label: 'Resources', icon: Globe },
]

export default function DashboardLayout({
  activeTab,
  setActiveTab,
  onReturnToLanding,
  store,
  darkMode,
  onToggleTheme,
  onOpenCommandPalette,
}: Props) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [showNewCardModal, setShowNewCardModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)

  const {
    currentUser,
    users,
    userData,
    stats,
    switchUser,
    login,
    register,
    updateUserProfile,
    addCard,
    updateCard,
    deleteCard,
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
    resetUserData,
  } = store

  const handleExport = () => {
    const json = exportData()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cloud-arch-progress-${currentUser.name.toLowerCase().replace(/\s+/g, '-')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] text-slate-900 dark:bg-[#0B1120] dark:text-slate-100">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-[#0F172A]">
        {/* Sidebar Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5 dark:border-slate-800">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={onReturnToLanding}>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-coral text-white font-extrabold shadow-sm text-xs">
              CA
            </div>
            <div>
              <span className="font-bold text-xs tracking-tight text-slate-900 dark:text-white block leading-tight">
                Cloud Architect OS
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Learning Workspace
              </span>
            </div>
          </div>

          <button
            onClick={onReturnToLanding}
            className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            title="Landing Page"
          >
            <Home className="h-4 w-4" />
          </button>
        </div>

        {/* Learner Identity Card */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div
            onClick={() => setShowAuthModal(true)}
            className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 cursor-pointer transition hover:border-coral/40 dark:border-slate-800 dark:bg-slate-800/40"
            title="Click to switch or edit profile"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-9 w-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
            />
            <div className="min-w-0 flex-1">
              <span className="font-bold text-xs text-slate-900 dark:text-white truncate block">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-coral font-semibold truncate block">
                → {currentUser.targetRole}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Workspace Views
          </span>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition',
                  isActive
                    ? 'bg-coral text-white shadow-md shadow-coral/20'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={cn('h-4 w-4', isActive ? 'text-white' : 'text-slate-400 group-hover:text-coral')} />
                  <span>{item.label}</span>
                </div>
                {item.badge && !isActive && (
                  <span className="rounded-md bg-coral/10 px-1.5 py-0.5 text-[9px] font-bold text-coral">
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-100 p-3 dark:border-slate-800 space-y-1">
          <button
            onClick={() => setShowNewCardModal(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-coral dark:bg-slate-800 dark:hover:bg-coral"
          >
            <Plus className="h-4 w-4" />
            Add Learning Card
          </button>

          <div className="flex items-center justify-between pt-2 px-1 text-[11px] text-slate-400">
            <button onClick={handleExport} className="hover:text-slate-600 dark:hover:text-slate-200">
              Export JSON
            </button>
            <span>·</span>
            <button
              onClick={() => {
                if (confirm('Reset this learner profile to default seeds?')) resetUserData()
              }}
              className="text-rose-500 hover:underline"
            >
              Reset Data
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-5 dark:border-slate-800/80 dark:bg-[#0F172A]">
          {/* Left: Mobile Menu & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">Dashboard</span>
                <ChevronRight className="h-3 w-3 text-slate-400" />
                <span className="font-bold text-slate-800 dark:text-white capitalize">
                  {NAV_ITEMS.find(n => n.id === activeTab)?.label}
                </span>
              </div>
            </div>
          </div>

          {/* Center/Right: Live Metric Badges & Tools */}
          <div className="flex items-center gap-3">
            {/* Day Counter */}
            <div className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Day {stats.dayOf112} of 112</span>
            </div>

            {/* Overall Progress Pill */}
            <div className="hidden md:flex items-center gap-2 rounded-xl border border-coral/20 bg-coral/5 px-3 py-1.5 text-xs font-semibold text-coral">
              <span>{stats.progressPct}% Complete</span>
              <div className="w-12 h-1.5 rounded-full bg-coral/20 overflow-hidden">
                <div className="h-full bg-coral" style={{ width: `${stats.progressPct}%` }} />
              </div>
            </div>

            {/* Quick + Add Card button */}
            <button
              onClick={() => setShowNewCardModal(true)}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-coral px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-coral/20 hover:bg-coral/90"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Card</span>
            </button>

            {/* Cmd+K trigger */}
            <button
              onClick={onOpenCommandPalette}
              className="hidden md:inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              title="Command Palette"
            >
              <Command className="h-3.5 w-3.5" />
              <span>Cmd+K</span>
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={onToggleTheme}
              className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:text-slate-800 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Profile Avatar / Trigger */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded-full ring-2 ring-transparent transition hover:ring-coral/40"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-8 w-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50 text-xs"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-bold text-slate-900 dark:text-white">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <User className="h-4 w-4" /> Learner Profile & Switch
                  </button>
                  <button
                    onClick={onReturnToLanding}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Home className="h-4 w-4" /> Landing Page
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main View Render */}
        <main className="flex-1 overflow-hidden">
          {activeTab === 'kanban' && (
            <KanbanStudio
              cards={userData.cards}
              onMoveCard={moveCard}
              onAddCard={addCard}
              onUpdateCard={updateCard}
              onDeleteCard={deleteCard}
              onToggleSubTask={toggleSubTask}
              onAddSubTask={addSubTask}
              onRemoveSubTask={removeSubTask}
              onImportRoadmapTask={importRoadmapTaskToBoard}
              onImportProject={importProjectToBoard}
            />
          )}

          {activeTab === 'curriculum' && (
            <CurriculumView
              checkedItems={userData.checkedItems}
              onToggleChecked={toggleRoadmapChecked}
              onSendToKanban={importRoadmapTaskToBoard}
              onSendProjectToKanban={importProjectToBoard}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsView
              checkedItems={userData.checkedItems}
              onToggleChecked={toggleRoadmapChecked}
              onSendProjectToKanban={importProjectToBoard}
            />
          )}

          {activeTab === 'skills' && (
            <SkillsView
              checkedItems={userData.checkedItems}
              cards={userData.cards}
            />
          )}

          {activeTab === 'certs' && (
            <CertsView
              certStatuses={userData.certStatuses}
              certTargets={userData.certTargets}
              onUpdateCert={updateCert}
            />
          )}

          {activeTab === 'journal' && (
            <NotesJournalView
              notes={userData.notes}
              onAddNote={addNote}
              onDeleteNote={deleteNote}
            />
          )}

          {activeTab === 'jobSearch' && (
            <div className="h-full overflow-y-auto p-6 max-w-6xl mx-auto">
              <JobSearchKit state={{ checked: userData.checkedItems } as any} />
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="h-full overflow-y-auto p-6 max-w-6xl mx-auto">
              <Resources />
            </div>
          )}
        </main>
      </div>

      {/* Global Modals */}
      {showNewCardModal && (
        <NewCardModal
          isOpen={showNewCardModal}
          onClose={() => setShowNewCardModal(false)}
          onAddCard={addCard}
        />
      )}

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          users={users}
          currentUser={currentUser}
          onSwitchUser={switchUser}
          onLogin={login}
          onRegister={register}
          onUpdateProfile={updateUserProfile}
        />
      )}

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="relative z-10 flex h-full w-72 flex-col bg-white dark:bg-[#0F172A] p-4"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-sm">Cloud Architect OS</span>
                <button onClick={() => setMobileSidebarOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 flex-1 space-y-1">
                {NAV_ITEMS.map(item => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id)
                        setMobileSidebarOpen(false)
                      }}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold',
                        isActive
                          ? 'bg-coral text-white'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  )
                })}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    onReturnToLanding()
                    setMobileSidebarOpen(false)
                  }}
                  className="flex w-full items-center gap-2 rounded-xl p-2 text-xs font-medium text-slate-500"
                >
                  <Home className="h-4 w-4" /> Exit to Landing Page
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
