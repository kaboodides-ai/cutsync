import { useState, useRef, useEffect } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Scissors,
  CheckCircle2,
  Circle,
  Trash2,
  Share2,
  MessageCircle,
  Copy,
  Check,
  Video,
  Plus,
  Clock,
  Sparkles,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  Upload,
  Layers,
  HelpCircle
} from 'lucide-react'

// Demo sample video (Open source Blender video)
const DEFAULT_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'

const CATEGORIES = [
  { id: 'cut', label: 'חיתוך', icon: '✂️', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { id: 'audio', label: 'סאונד', icon: '🔊', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { id: 'text', label: 'טקסט / כתוביות', icon: '📝', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  { id: 'color', label: 'צבע / אפקט', icon: '🎨', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  { id: 'general', label: 'כללי', icon: '💬', color: 'bg-gray-500/20 text-gray-300 border-gray-500/40' },
]

function formatTime(seconds) {
  if (isNaN(seconds)) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const pad = (n) => (n < 10 ? '0' + n : n)
  return `${pad(mins)}:${pad(secs)}`
}

function App() {
  const videoRef = useRef(null)
  const fileInputRef = useRef(null)

  // Video State
  const [videoSrc, setVideoSrc] = useState(DEFAULT_VIDEO)
  const [videoTitle, setVideoTitle] = useState('פרויקט לדוגמה: סרטון תדמית v1')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isMuted, setIsMuted] = useState(false)

  // Comments / Revisions State
  const [comments, setComments] = useState(() => {
    const saved = localStorage.getItem('cutsync_comments')
    if (saved) {
      try { return JSON.parse(saved) } catch (e) { console.error(e) }
    }
    return [
      { id: '1', time: 3, category: 'cut', text: 'לקצר את השתיקה בהתחלה בחצי שנייה', completed: false, author: 'לקוח' },
      { id: '2', time: 8, category: 'audio', text: 'להגביר כאן מעט את מוזיקת הרקע', completed: true, author: 'לקוח' },
      { id: '3', time: 12, category: 'text', text: 'לבדוק איות בשם החברה', completed: false, author: 'לקוח' },
    ]
  })

  // Input states
  const [newCommentText, setNewCommentText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('cut')
  const [isUrgent, setIsUrgent] = useState(false)

  // View & Filter states
  const [mode, setMode] = useState('client') // 'client' | 'editor'
  const [activeFilter, setActiveFilter] = useState('all') // 'all' | 'pending' | 'completed'
  const [copied, setCopied] = useState(false)
  const [hoveredMarker, setHoveredMarker] = useState(null)

  // Save comments to localStorage
  useEffect(() => {
    localStorage.setItem('cutsync_comments', JSON.stringify(comments))
  }, [comments])

  // Video event handlers
  const handlePlayPause = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const seekTo = (timeInSec) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timeInSec
      setCurrentTime(timeInSec)
    }
  }

  const stepTime = (delta) => {
    if (!videoRef.current) return
    const newTime = Math.min(Math.max(0, videoRef.current.currentTime + delta), duration)
    seekTo(newTime)
  }

  const handleSpeedChange = (rate) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate
      setPlaybackRate(rate)
    }
  }

  // File upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setVideoSrc(url)
      setVideoTitle(file.name.replace(/\.[^/.]+$/, ''))
      setComments([]) // reset for new video
      setCurrentTime(0)
    }
  }

  // Add Comment
  const handleAddComment = (e) => {
    e?.preventDefault()
    if (!newCommentText.trim()) return

    const newComment = {
      id: Date.now().toString(),
      time: Math.floor(currentTime),
      category: selectedCategory,
      text: newCommentText.trim(),
      urgent: isUrgent,
      completed: false,
      author: mode === 'client' ? 'לקוח' : 'עורך',
      createdAt: new Date().toISOString()
    }

    setComments((prev) => [...prev, newComment].sort((a, b) => a.time - b.time))
    setNewCommentText('')
    setIsUrgent(false)
  }

  // Toggle Completed
  const toggleCommentComplete = (id) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, completed: !c.completed } : c))
    )
  }

  // Delete Comment
  const deleteComment = (id) => {
    setComments((prev) => prev.filter((c) => c.id !== id))
  }

  // Generate WhatsApp Message
  const getWhatsAppMessage = () => {
    let msg = `🎬 *סיכום תיקונים - ${videoTitle}*\n`
    msg += `סה"כ תיקונים: ${comments.length} | בוצעו: ${comments.filter(c => c.completed).length}\n\n`

    if (comments.length === 0) {
      msg += `אין כרגע תיקונים רשומים לסרטון.\n`
    } else {
      comments.forEach((c) => {
        const cat = CATEGORIES.find(cat => cat.id === c.category)
        const status = c.completed ? '✅' : '⏳'
        const tag = cat ? `[${cat.label}]` : ''
        msg += `${status} *${formatTime(c.time)}* ${tag}: ${c.text}\n`
      })
    }

    msg += `\n✨ נשלח דרך CutSync`
    return msg
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getWhatsAppMessage())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareViaWhatsApp = () => {
    const encoded = encodeURIComponent(getWhatsAppMessage())
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank')
  }

  // Filtered comments
  const filteredComments = comments.filter((c) => {
    if (activeFilter === 'pending') return !c.completed
    if (activeFilter === 'completed') return c.completed
    return true
  })

  const completedCount = comments.filter((c) => c.completed).length

  return (
    <div className="min-h-screen bg-[#0d0f17] text-gray-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="border-b border-[#212638] bg-[#131622]/90 backdrop-blur px-4 lg:px-8 py-3.5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-900/30">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-wide text-white">CutSync</h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  MVP v1.0
                </span>
              </div>
              <p className="text-xs text-gray-400 hidden sm:block">אישור סרטונים ותיקונים אינטראקטיביים לעורכים ולקוחות</p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-[#1c2132] p-1 rounded-xl border border-[#2b334a]">
            <button
              onClick={() => setMode('client')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mode === 'client'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>מצב לקוח (הוספת הערות)</span>
            </button>
            <button
              onClick={() => setMode('editor')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mode === 'editor'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>מצב עורך (צ'קליסט וביצוע)</span>
            </button>
          </div>

          {/* Video upload & Actions */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="video/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1e2436] hover:bg-[#283049] border border-[#2e3752] text-xs text-gray-200 transition-colors"
              title="העלה סרטון מקומי מהמחשב"
            >
              <Upload className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden md:inline">החלף סרטון</span>
            </button>

            <button
              onClick={shareViaWhatsApp}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow-md shadow-emerald-950/40 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>שלח לוואטסאפ</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Section: Video Player & Timeline (7 cols) */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Video Header Card */}
          <div className="bg-[#151926] rounded-2xl border border-[#23293d] overflow-hidden shadow-2xl shadow-black/60">
            {/* Title Bar */}
            <div className="px-4 py-2.5 bg-[#1a1f30] border-b border-[#242b40] flex items-center justify-between text-xs text-gray-300">
              <div className="flex items-center gap-2 font-medium truncate">
                <Video className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span className="truncate">{videoTitle}</span>
              </div>
              <span className="text-gray-400 font-mono text-[11px] bg-[#111420] px-2 py-0.5 rounded border border-[#2b334a]">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Video Canvas Container */}
            <div className="relative bg-black aspect-video flex items-center justify-center group overflow-hidden">
              <video
                ref={videoRef}
                src={videoSrc}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onClick={handlePlayPause}
                className="w-full h-full object-contain cursor-pointer"
              />

              {/* Big overlay play button when paused */}
              {!isPlaying && (
                <button
                  onClick={handlePlayPause}
                  className="absolute w-16 h-16 rounded-full bg-purple-600/90 hover:bg-purple-500 text-white flex items-center justify-center shadow-xl shadow-purple-900/50 backdrop-blur-sm transition-transform hover:scale-110 active:scale-95"
                >
                  <Play className="w-8 h-8 fill-current ml-1" />
                </button>
              )}
            </div>

            {/* Custom Interactive Player Controls */}
            <div className="p-3 bg-[#161a28] flex flex-col gap-2">
              {/* Timeline with Markers */}
              <div className="relative w-full h-5 flex items-center cursor-pointer group select-none">
                {/* Background track */}
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.05"
                  value={currentTime}
                  onChange={(e) => seekTo(parseFloat(e.target.value))}
                  className="w-full h-2 bg-[#252c40] rounded-lg appearance-none cursor-pointer accent-purple-500 z-10 opacity-90 group-hover:h-2.5 transition-all"
                />

                {/* Visual Comment Markers on Timeline */}
                {duration > 0 &&
                  comments.map((comment) => {
                    const leftPercent = (comment.time / duration) * 100
                    const isHovered = hoveredMarker === comment.id
                    return (
                      <div
                        key={comment.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          seekTo(comment.time)
                        }}
                        onMouseEnter={() => setHoveredMarker(comment.id)}
                        onMouseLeave={() => setHoveredMarker(null)}
                        style={{ left: `${leftPercent}%` }}
                        className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full z-20 transition-transform ${
                          comment.completed
                            ? 'bg-emerald-500 ring-2 ring-emerald-900'
                            : 'bg-amber-400 ring-2 ring-amber-950 animate-pulse'
                        } hover:scale-150 cursor-pointer shadow-md`}
                      >
                        {/* Tooltip on hover */}
                        {isHovered && (
                          <div className="absolute bottom-6 right-1/2 translate-x-1/2 bg-[#0c0e17] text-white text-[11px] py-1 px-2.5 rounded-md shadow-xl border border-[#2d364e] whitespace-nowrap z-50 pointer-events-none">
                            <span className="font-mono text-purple-400 font-bold ml-1">
                              {formatTime(comment.time)}
                            </span>
                            {comment.text}
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>

              {/* Bottom control bar */}
              <div className="flex items-center justify-between gap-2 pt-1">
                {/* Left: Play/Pause and Step buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePlayPause}
                    className="w-8 h-8 rounded-lg bg-[#22283a] hover:bg-[#2f3852] text-gray-200 flex items-center justify-center transition-colors"
                    title="רווח (Space) להפעלה/עצירה"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>
                  <button
                    onClick={() => stepTime(-1)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-100 hover:bg-[#22283a] transition-colors"
                    title="שנייה אחת אחורה (1s)"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => stepTime(1)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-100 hover:bg-[#22283a] transition-colors"
                    title="שנייה אחת קדימה (1s)"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>

                  <span className="text-xs font-mono text-gray-300 font-semibold px-2">
                    {formatTime(currentTime)}
                  </span>
                </div>

                {/* Right: Playback Speed & Mute */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-[#202536] rounded-lg p-0.5 border border-[#2a3248] text-[11px]">
                    {[1, 1.25, 1.5, 2].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => handleSpeedChange(rate)}
                        className={`px-2 py-0.5 rounded ${
                          playbackRate === rate
                            ? 'bg-purple-600 text-white font-bold'
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.muted = !isMuted
                        setIsMuted(!isMuted)
                      }
                    }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-100 hover:bg-[#22283a] transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Add Revision Box (Focus of Client Mode) */}
          <div className="bg-[#151926] p-4 rounded-2xl border border-[#23293d] shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></span>
                <h2 className="text-sm font-bold text-gray-100">
                  הוספת תיקון ברגע הנוכחי
                </h2>
              </div>
              <div className="flex items-center gap-1.5 bg-[#1b2031] text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-lg text-xs font-mono font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(currentTime)}</span>
              </div>
            </div>

            <form onSubmit={handleAddComment} className="flex flex-col gap-3">
              {/* Category tags */}
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                      selectedCategory === cat.id
                        ? `${cat.color} font-semibold ring-1 ring-white/20 shadow-sm`
                        : 'bg-[#1b2031] text-gray-400 border-[#2a3248] hover:border-gray-500'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* Text Input */}
              <div className="relative">
                <textarea
                  rows="2"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="כתוב כאן מה צריך לתקן ברגע הזה... (למשל: לחתוך 2 שניות, להנמיך מוזיקה, לשנות צבע כתובית)"
                  className="w-full bg-[#1b2031] border border-[#2e3752] focus:border-purple-500 rounded-xl p-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleAddComment()
                    }
                  }}
                />
              </div>

              {/* Submit & Status Bar */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="rounded border-[#2e3752] bg-[#1b2031] text-purple-600 focus:ring-0"
                  />
                  <span>סמן כתיקון דחוף 🔥</span>
                </label>

                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg shadow-purple-900/40 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>הוסף תיקון (Enter)</span>
                </button>
              </div>
            </form>
          </div>

        </section>

        {/* Right Section: Interactive Checklist (5 cols) */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Header Card with Progress */}
          <div className="bg-[#151926] p-4 rounded-2xl border border-[#23293d] shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-bold text-gray-100 flex items-center gap-2">
                  <span>צ'קליסט תיקונים</span>
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                    {comments.length}
                  </span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  לחץ על שעת התיקון לקפיצה ישירה בנגן
                </p>
              </div>

              {/* Quick Filter tabs */}
              <div className="flex items-center bg-[#1b2031] p-0.5 rounded-lg border border-[#2a3248] text-xs">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    activeFilter === 'all' ? 'bg-purple-600 text-white font-medium' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  הכל ({comments.length})
                </button>
                <button
                  onClick={() => setActiveFilter('pending')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    activeFilter === 'pending' ? 'bg-purple-600 text-white font-medium' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  ממתין ({comments.length - completedCount})
                </button>
                <button
                  onClick={() => setActiveFilter('completed')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    activeFilter === 'completed' ? 'bg-purple-600 text-white font-medium' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  בוצע ({completedCount})
                </button>
              </div>
            </div>

            {/* Progress bar */}
            {comments.length > 0 && (
              <div className="mt-2">
                <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                  <span>התקדמות תיקונים</span>
                  <span className="font-mono">{Math.round((completedCount / comments.length) * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#23293d] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${(completedCount / comments.length) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* List of Revisions */}
          <div className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-[500px] pr-1">
            {filteredComments.length === 0 ? (
              <div className="bg-[#151926]/50 border border-dashed border-[#262c3f] rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3 text-gray-400">
                <Sparkles className="w-8 h-8 text-purple-400/60" />
                <p className="text-sm">אין כרגע הערות בקטגוריה זו</p>
                <p className="text-xs text-gray-500">עצור את הסרטון והוסף הערה בטופס למטה</p>
              </div>
            ) : (
              filteredComments.map((comment) => {
                const cat = CATEGORIES.find((c) => c.id === comment.category)
                return (
                  <div
                    key={comment.id}
                    className={`group bg-[#151926] hover:bg-[#181d2c] border rounded-xl p-3 transition-all flex items-start gap-3 shadow-sm ${
                      comment.completed
                        ? 'border-[#20273a] opacity-60'
                        : comment.urgent
                        ? 'border-red-500/40 bg-red-950/10'
                        : 'border-[#232a3f]'
                    }`}
                  >
                    {/* Completion checkbox */}
                    <button
                      onClick={() => toggleCommentComplete(comment.id)}
                      className="mt-0.5 text-gray-400 hover:text-emerald-400 transition-colors flex-shrink-0"
                      title={comment.completed ? 'סמן כממתין' : 'סמן כבוצע'}
                    >
                      {comment.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {/* Timecode click jumps video */}
                        <button
                          onClick={() => seekTo(comment.time)}
                          className="font-mono text-xs font-bold text-purple-400 hover:text-purple-300 bg-purple-950/50 hover:bg-purple-900/60 px-2 py-0.5 rounded border border-purple-500/30 transition-colors"
                          title="קפוץ לרגע זה בוידאו"
                        >
                          ⏱️ {formatTime(comment.time)}
                        </button>

                        {/* Category badge */}
                        {cat && (
                          <span className={`text-[11px] px-2 py-0.5 rounded-md border font-medium ${cat.color}`}>
                            {cat.icon} {cat.label}
                          </span>
                        )}

                        {comment.urgent && (
                          <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/40 px-1.5 py-0.2 rounded font-bold">
                            דחוף 🔥
                          </span>
                        )}
                      </div>

                      <p className={`text-sm leading-relaxed ${comment.completed ? 'line-through text-gray-400' : 'text-gray-200'}`}>
                        {comment.text}
                      </p>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => deleteComment(comment.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all p-1"
                      title="מחק הערה"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )
              })
            )}
          </div>

          {/* Export / Share Actions Card */}
          <div className="bg-[#151926] p-4 rounded-2xl border border-[#23293d] flex flex-col gap-2.5 shadow-xl mt-auto">
            <h3 className="text-xs font-bold text-gray-300 flex items-center gap-2">
              <Share2 className="w-3.5 h-3.5 text-purple-400" />
              <span>ייצוא ושיתוף תיקונים</span>
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={copyToClipboard}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#1d2235] hover:bg-[#272e47] border border-[#2c354e] text-xs font-semibold text-gray-200 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'הועתק!' : 'העתק רשימה'}</span>
              </button>

              <button
                onClick={shareViaWhatsApp}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>פתח ב-WhatsApp</span>
              </button>
            </div>
          </div>

        </section>
      </main>
    </div>
  )
}

export default App

