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
  Filter
} from 'lucide-react'

export default function ProjectsDashboard({
  projects = [],
  onOpenStudio,
  onOpenNewProjectModal,
  onNavigateHome,
  onCopyClientLink,
  onDeleteProject
}) {
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
    <div className="min-h-screen bg-[#0a0d16] text-gray-100 font-sans rtl selection:bg-purple-500 selection:text-white relative overflow-hidden" dir="rtl">
      
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/3 w-[800px] h-[400px] bg-gradient-to-b from-indigo-600/10 via-purple-600/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0a0d16]/85 border-b border-[#1c2438]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo & Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141926] hover:bg-[#1d253a] border border-[#232d44] text-xs font-semibold text-gray-300 hover:text-white transition-all"
              title="חזור לדף הבית"
            >
              <Home className="w-3.5 h-3.5 text-purple-400" />
              <span>דף הבית</span>
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-emerald-400 p-[2px] shadow-lg shadow-purple-950/50">
                <div className="w-full h-full bg-[#0d1220] rounded-[10px] flex items-center justify-center">
                  <Scissors className="w-4 h-4 text-purple-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-white font-mono tracking-tight">CutSync</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    דשבורד עורך
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action: New Project CTA */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenNewProjectModal}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-500 hover:from-purple-500 hover:to-teal-400 shadow-lg shadow-purple-950/60 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>פרויקט סקירה חדש 🚀</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col gap-8">
        
        {/* Welcome & Overview Stats */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-br from-[#131929] via-[#111624] to-[#0c101b] p-6 sm:p-8 rounded-3xl border border-[#232e48] shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>מרכז ניהול הפרויקטים שלך</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              הפרויקטים והסרטונים בביקורת 🎬
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              נהל גרסאות, הפק קישורי סקירה ללקוחות, ועקוב אחר התקדמות התיקונים בזמן אמת.
            </p>
          </div>

          {/* Quick Metrics Chips */}
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
            <div className="bg-[#182136]/70 border border-[#2b3959] rounded-2xl p-3.5 text-center min-w-[90px]">
              <span className="text-xl sm:text-2xl font-black text-white block">{totalProjects}</span>
              <span className="text-[11px] text-gray-400">סה"כ פרויקטים</span>
            </div>
            <div className="bg-[#182136]/70 border border-[#2b3959] rounded-2xl p-3.5 text-center min-w-[90px]">
              <span className="text-xl sm:text-2xl font-black text-amber-400 block">{pendingProjects}</span>
              <span className="text-[11px] text-gray-400">בהערות ⏳</span>
            </div>
            <div className="bg-[#182136]/70 border border-[#2b3959] rounded-2xl p-3.5 text-center min-w-[90px]">
              <span className="text-xl sm:text-2xl font-black text-emerald-400 block">{approvedProjects}</span>
              <span className="text-[11px] text-gray-400">אושרו ✅</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#111624] p-3 rounded-2xl border border-[#1f283e]">
          
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חפש לפי שם פרויקט או לקוח..."
              className="w-full bg-[#171e30] border border-[#26324e] focus:border-purple-500 rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeFilter === 'all'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-[#182033] text-gray-400 hover:text-white hover:bg-[#202b45]'
              }`}
            >
              כל הפרויקטים ({totalProjects})
            </button>
            <button
              onClick={() => setActiveFilter('pending')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeFilter === 'pending'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-[#182033] text-gray-400 hover:text-white hover:bg-[#202b45]'
              }`}
            >
              ממתין להערות ({pendingProjects})
            </button>
            <button
              onClick={() => setActiveFilter('approved')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeFilter === 'approved'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-[#182033] text-gray-400 hover:text-white hover:bg-[#202b45]'
              }`}
            >
              אושרו סופית ({approvedProjects})
            </button>
          </div>

        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="bg-[#111624] border border-[#212c44] rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-purple-600/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Film className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">לא נמצאו פרויקטים</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                {searchQuery ? 'לא נמצאו תוצאות התואמות לחיפוש שלך.' : 'עדיין לא פתחת פרויקטים. לחץ על הכפתור מטה והתחל לעבוד!'}
              </p>
            </div>
            <button
              onClick={onOpenNewProjectModal}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-950/50 flex items-center gap-2 mt-2"
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
                  className="bg-[#121726] border border-[#232e48] hover:border-purple-500/40 rounded-3xl p-5 shadow-xl flex flex-col justify-between gap-5 transition-all group hover:shadow-2xl hover:shadow-purple-950/30 relative"
                >
                  {/* Top Meta Info */}
                  <div className="flex flex-col gap-3">
                    
                    {/* Video Visual Preview Box */}
                    <div
                      onClick={() => onOpenStudio(project.id)}
                      className="aspect-video bg-[#0b0e18] rounded-2xl border border-[#1f2840] relative overflow-hidden flex items-center justify-center cursor-pointer group-hover:border-purple-500/60 transition-colors"
                    >
                      {currentVersion.videoSrc ? (
                        <video
                          src={currentVersion.videoSrc}
                          className="w-full h-full object-cover opacity-65 group-hover:opacity-85 transition-opacity pointer-events-none"
                          preload="metadata"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#161f33] to-[#0c101c]" />
                      )}

                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                        <div className="w-12 h-12 rounded-2xl bg-purple-600/90 text-white flex items-center justify-center shadow-lg shadow-purple-950/80 group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                      </div>

                      {/* Version Badge on Thumbnail */}
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                        <span className="px-2.5 py-0.5 rounded-lg bg-black/80 backdrop-blur-sm text-[11px] font-mono font-bold text-white border border-white/10">
                          {currentVersion.name || 'V1'}
                        </span>
                      </div>

                      {/* Approval status banner on thumbnail */}
                      <div className="absolute bottom-2.5 right-2.5 left-2.5 flex items-center justify-between text-[10px]">
                        {isApproved ? (
                          <span className="px-2.5 py-0.5 rounded-md bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1 shadow-md">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>אושר סופית ✅</span>
                          </span>
                        ) : isReopenRequested ? (
                          <span className="px-2.5 py-0.5 rounded-md bg-amber-950/90 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1 animate-pulse shadow-md">
                            <Bell className="w-3 h-3 text-amber-400" />
                            <span>ממתין לפתיחה מחדש</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-md bg-indigo-950/90 text-indigo-300 border border-indigo-500/40 font-medium flex items-center gap-1 shadow-md">
                            <Clock className="w-3 h-3 text-indigo-400" />
                            <span>ממתין להערות</span>
                          </span>
                        )}

                        <span className="px-2 py-0.5 rounded-md bg-black/80 text-gray-300 font-mono">
                          {comments.length} תיקונים
                        </span>
                      </div>
                    </div>

                    {/* Title & Client Name */}
                    <div>
                      <h3
                        onClick={() => onOpenStudio(project.id)}
                        className="text-base font-bold text-white hover:text-purple-300 transition-colors cursor-pointer truncate"
                        title={project.title}
                      >
                        {project.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                        <User className="w-3.5 h-3.5 text-indigo-400" />
                        <span>לקוח: <strong className="text-gray-300">{project.clientName || 'כללי'}</strong></span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="bg-[#171f33] rounded-xl p-2.5 border border-[#243150] flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-400">התקדמות תיקונים:</span>
                        <span className="font-mono text-indigo-300 font-semibold">
                          {completedCount} מתוך {comments.length} בוצעו
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#0e1322] overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full transition-all duration-300"
                          style={{
                            width: `${comments.length > 0 ? (completedCount / comments.length) * 100 : 0}%`
                          }}
                        />
                      </div>
                    </div>

                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-[#1e273d]">
                    <button
                      type="button"
                      onClick={() => onOpenStudio(project.id)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-950/40 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>פתח בסטודיו</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onCopyClientLink(project.id)}
                      className="py-2.5 px-3 rounded-xl bg-[#192236] hover:bg-[#232f4b] text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      title="העתק קישור סקירה ישיר ללקוח"
                    >
                      <Link2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>קישור לקוח</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteProject(project.id)}
                      className="p-2.5 rounded-xl bg-[#192033] hover:bg-red-950/50 text-gray-400 hover:text-red-400 border border-[#26314c] hover:border-red-500/30 transition-colors"
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

    </div>
  )
}
