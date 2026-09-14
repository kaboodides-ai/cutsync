import { useState } from 'react'
import {
  Scissors,
  Plus,
  Home,
  Film,
  Search,
  CheckCircle2,
  Clock,
  Bell,
  Link2,
  Trash2,
  ExternalLink,
  Layers,
  MessageSquare,
  Play,
  User,
  Sparkles,
  ArrowRight,
  Filter,
  LogOut,
  ChevronDown,
  Pencil
} from 'lucide-react'
import EditProjectModal from './EditProjectModal'

export default function ProjectsDashboard({
  projects = [],
  currentUser,
  onOpenStudio,
  onOpenNewProjectModal,
  onNavigateHome,
  onCopyClientLink,
  onDeleteProject,
  onUpdateProject,
  onOpenAuthModal,
  onLogout
}) {
  const [projectToEdit, setProjectToEdit] = useState(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all') // 'all' | 'pending' | 'approved'

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.clientName && project.clientName.toLowerCase().includes(searchQuery.toLowerCase()))

    if (!matchesSearch) return false

    const latestVersion = project.versions?.[project.versions.length - 1]
    const isApproved = latestVersion?.approved

    if (activeFilter === 'approved') return isApproved
    if (activeFilter === 'pending') return !isApproved
    return true
  })

  // Summary stats
  const totalProjects = projects.length
  const approvedProjects = projects.filter(p => {
    const latest = p.versions?.[p.versions.length - 1]
    return latest?.approved
  }).length
  const pendingProjects = totalProjects - approvedProjects

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans rtl selection:bg-indigo-500/30 selection:text-white relative overflow-hidden" dir="rtl">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-zinc-950/90 border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo & Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[12px] font-semibold text-zinc-400 hover:text-zinc-100 transition-colors"
              title="חזור לדף הבית"
            >
              <Home className="w-3.5 h-3.5 text-indigo-400" />
              <span>דף הבית</span>
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Scissors className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-zinc-100 font-mono tracking-tight">CutSync</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    by kaboodi
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-zinc-900 text-zinc-300 border border-zinc-800">
                    דשבורד עורך
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions: New Project CTA & User Profile */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenNewProjectModal}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-lg text-[13px] font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>פרויקט סקירה חדש 🚀</span>
            </button>

            {/* User Profile Pill & Dropdown */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer shadow-sm"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-md object-cover border border-zinc-700"
                  />
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-[12px] font-bold text-zinc-100 leading-tight">{currentUser.name}</span>
                    <span className="text-[10px] text-zinc-400 font-medium">
                      {currentUser.provider === 'google' ? 'Gmail / Google' : currentUser.provider === 'discord' ? 'Discord' : 'אימייל'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                </button>

                {userMenuOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-zinc-950 border border-zinc-800 rounded-xl p-2 shadow-xl z-50 animate-in fade-in">
                    <div className="px-3 py-2 border-b border-zinc-800 mb-1">
                      <p className="text-[12px] font-bold text-zinc-100">{currentUser.name}</p>
                      <p className="text-[11px] text-zinc-400 truncate">{currentUser.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false)
                        onOpenAuthModal?.('login')
                      }}
                      className="w-full text-right px-3 py-2 rounded-md hover:bg-zinc-900 text-[12px] text-zinc-300 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      <span>החלף משתמש</span>
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false)
                        onLogout?.()
                      }}
                      className="w-full text-right px-3 py-2 rounded-md hover:bg-red-500/10 text-[12px] text-red-400 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-400" />
                      <span>התנתק מהחשבון</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onOpenAuthModal?.('login')}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-[13px] font-bold transition-colors cursor-pointer"
              >
                התחברות
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col gap-8">
        
        {/* Welcome & Overview Stats */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-zinc-900 p-6 sm:p-8 rounded-2xl border border-zinc-800 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>מרכז ניהול הפרויקטים שלך</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-100">
              {currentUser ? `הפרויקטים של ${currentUser.name} 🎬` : 'הפרויקטים והסרטונים בביקורת 🎬'}
            </h1>
            <p className="text-[13px] sm:text-sm text-zinc-400 mt-2 max-w-xl">
              נהל גרסאות, הפק קישורי סקירה ללקוחות, ועקוב אחר התקדמות התיקונים בזמן אמת.
            </p>
          </div>

          {/* Quick Metrics Chips */}
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-center min-w-[90px]">
              <span className="text-xl sm:text-2xl font-black text-zinc-100 block">{totalProjects}</span>
              <span className="text-[11px] text-zinc-400">סה"כ פרויקטים</span>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-center min-w-[90px]">
              <span className="text-xl sm:text-2xl font-black text-amber-400 block">{pendingProjects}</span>
              <span className="text-[11px] text-zinc-400">בהערות ⏳</span>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-center min-w-[90px]">
              <span className="text-xl sm:text-2xl font-black text-emerald-400 block">{approvedProjects}</span>
              <span className="text-[11px] text-zinc-400">אושרו ✅</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900 p-3 rounded-xl border border-zinc-800">
          
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חפש לפי שם פרויקט או לקוח..."
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-lg pr-9 pl-4 py-2 text-[13px] text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
                activeFilter === 'all'
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/50 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              כל הפרויקטים ({totalProjects})
            </button>
            <button
              onClick={() => setActiveFilter('pending')}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
                activeFilter === 'pending'
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/50 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              ממתין להערות ({pendingProjects})
            </button>
            <button
              onClick={() => setActiveFilter('approved')}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
                activeFilter === 'approved'
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/50 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              אושרו סופית ({approvedProjects})
            </button>
          </div>

        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Film className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-100 mb-1">לא נמצאו פרויקטים</h3>
              <p className="text-[13px] text-zinc-400 max-w-sm mx-auto">
                {searchQuery ? 'לא נמצאו תוצאות התואמות לחיפוש שלך.' : 'עדיין לא פתחת פרויקטים. לחץ על הכפתור מטה והתחל לעבוד!'}
              </p>
            </div>
            <button
              onClick={onOpenNewProjectModal}
              className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-bold shadow-sm flex items-center gap-2 mt-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>צור פרויקט חדש</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const currentVersion = project.versions?.find(v => v.id === project.activeVersionId) || project.versions?.[project.versions.length - 1] || {}
              const comments = currentVersion.comments || []
              const completedCount = comments.filter(c => c.completed).length
              const isApproved = currentVersion.approved
              const isReopenRequested = currentVersion.reopenRequested

              return (
                <div
                  key={project.id}
                  className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-5 transition-all group hover:shadow-lg relative"
                >
                  {/* Top Meta Info */}
                  <div className="flex flex-col gap-4">
                    
                    {/* Video Visual Preview Box */}
                    <div
                      onClick={() => onOpenStudio(project.id)}
                      className="aspect-video bg-zinc-900 rounded-xl border border-zinc-800 relative overflow-hidden flex items-center justify-center cursor-pointer group-hover:border-zinc-700 transition-colors"
                    >
                      {currentVersion.videoSrc ? (
                        <video
                          src={currentVersion.videoSrc}
                          className="w-full h-full object-cover opacity-65 group-hover:opacity-85 transition-opacity pointer-events-none"
                          preload="metadata"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-900" />
                      )}

                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-zinc-950/90 text-white flex items-center justify-center shadow-md border border-zinc-700/50 group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                      </div>

                      {/* Version Badge on Thumbnail */}
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                        <span className="px-2.5 py-0.5 rounded-md bg-zinc-950/90 backdrop-blur-sm text-[11px] font-mono font-bold text-zinc-100 border border-zinc-800">
                          {currentVersion.name || 'V1'}
                        </span>
                      </div>

                      {/* Approval status banner on thumbnail */}
                      <div className="absolute bottom-2.5 right-2.5 left-2.5 flex items-center justify-between text-[10px]">
                        {isApproved ? (
                          <span className="px-2.5 py-0.5 rounded-md bg-emerald-950/90 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1 shadow-sm">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>אושר סופית ✅</span>
                          </span>
                        ) : isReopenRequested ? (
                          <span className="px-2.5 py-0.5 rounded-md bg-amber-950/90 text-amber-400 border border-amber-500/30 font-bold flex items-center gap-1 shadow-sm">
                            <Bell className="w-3 h-3 text-amber-400" />
                            <span>ממתין לפתיחה מחדש</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-md bg-indigo-950/90 text-indigo-400 border border-indigo-500/30 font-medium flex items-center gap-1 shadow-sm">
                            <Clock className="w-3 h-3 text-indigo-400" />
                            <span>ממתין להערות</span>
                          </span>
                        )}

                        <span className="px-2 py-0.5 rounded-md bg-zinc-950/90 text-zinc-300 font-mono border border-zinc-800">
                          {comments.length} תיקונים
                        </span>
                      </div>
                    </div>

                    {/* Title & Client Name */}
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3
                          onClick={() => onOpenStudio(project.id)}
                          className="text-[15px] font-bold text-zinc-100 hover:text-indigo-400 transition-colors cursor-pointer truncate flex-1"
                          title={project.title}
                        >
                          {project.title}
                        </h3>
                        <button
                          type="button"
                          onClick={() => setProjectToEdit(project)}
                          className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors cursor-pointer"
                          title="ערוך שם פרויקט ולקוח"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 text-[12px] text-zinc-400 mt-1">
                        <User className="w-3.5 h-3.5 text-indigo-400" />
                        <span>לקוח: <strong className="text-zinc-300 font-medium">{project.clientName || 'כללי'}</strong></span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-400">התקדמות תיקונים:</span>
                        <span className="font-mono text-zinc-300 font-medium">
                          {completedCount} מתוך {comments.length} בוצעו
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800/50">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                          style={{
                            width: `${comments.length > 0 ? (completedCount / comments.length) * 100 : 0}%`
                          }}
                        />
                      </div>
                    </div>

                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-4 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => onOpenStudio(project.id)}
                      className="flex-1 py-2 px-3 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[12px] shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>פתח בסטודיו</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onCopyClientLink(project.id)}
                      className="py-2 px-3 rounded-md bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-zinc-800 text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      title="העתק קישור סקירה ישיר ללקוח"
                    >
                      <Link2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>קישור לקוח</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setProjectToEdit(project)}
                      className="p-2 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
                      title="ערוך שם פרויקט ולקוח"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteProject(project.id)}
                      className="p-2 rounded-md bg-zinc-900 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-500/20 transition-colors"
                      title="מחק פרויקט"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              )
            })}
          </div>
        )}

      </main>

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={!!projectToEdit}
        project={projectToEdit}
        onClose={() => setProjectToEdit(null)}
        onSave={(projectId, updates) => {
          onUpdateProject?.(projectId, updates)
          setProjectToEdit(null)
        }}
      />

      {/* Dashboard Footer with Creator Credit */}
      <footer className="mt-auto py-5 border-t border-zinc-900 bg-zinc-950/80 backdrop-blur-md text-[12px] text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-zinc-300 text-[12px]">CutSync</span>
            <span className="text-zinc-700">|</span>
            <span className="text-zinc-500 text-[11px]">דשבורד ניהול פרויקטים</span>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-zinc-400">
            <span>נוצר ופותח על ידי</span>
            <span className="text-indigo-400 font-bold tracking-wide px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20">
              kaboodi
            </span>
            <span>✨</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
