import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  X,
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
  HelpCircle,
  PenTool,
  ArrowUpRight,
  Eraser,
  Undo2,
  MousePointer,
  Download,
  Send,
  FileSpreadsheet,
  AlertCircle,
  Mic,
  MicOff,
  Square,
  MessageSquare
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

function formatReplyTime(isoString) {
  if (!isoString) return ''
  try {
    const d = new Date(isoString)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    const hours = d.getHours().toString().padStart(2, '0')
    const minutes = d.getMinutes().toString().padStart(2, '0')
    if (isToday) {
      return `היום ${hours}:${minutes}`
    }
    const day = d.getDate().toString().padStart(2, '0')
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    return `${day}/${month} ${hours}:${minutes}`
  } catch (e) {
    return ''
  }
}

function AudioCommentPlayer({ src, duration, label = "הערה קולית" }) {
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef(null)

  const toggle = (e) => {
    e.stopPropagation()
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current && audioRef.current.duration) {
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100)
    }
  }

  return (
    <div className="flex items-center gap-2.5 bg-[#171c2b] border border-[#2d364e] rounded-xl px-3 py-1.5 text-xs text-purple-200 select-none shadow-sm">
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false)
          setProgress(0)
        }}
        onTimeUpdate={handleTimeUpdate}
        className="hidden"
      />
      <button
        type="button"
        onClick={toggle}
        className="w-6 h-6 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-950/50 transition-transform active:scale-95 flex-shrink-0"
        title={playing ? 'עצור השמעה' : 'האזן להקלטה'}
      >
        {playing ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 ml-0.5 fill-current" />}
      </button>

      <div className="flex flex-col gap-0.5 min-w-[120px]">
        <div className="flex items-center justify-between text-[10px] font-mono text-gray-300">
          <span className="flex items-center gap-1 text-emerald-400">
            <Mic className="w-3 h-3" />
            <span>{label}</span>
          </span>
          <span>{duration ? `${duration}s` : ''}</span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-1 bg-[#232a3d] rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-400 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function App() {
  const videoRef = useRef(null)
  const fileInputRef = useRef(null)
  const fileInputNewVersionRef = useRef(null)
  const canvasRef = useRef(null)
  const playerContainerRef = useRef(null)

  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [recordedAudioData, setRecordedAudioData] = useState(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const recordingTimerRef = useRef(null)

  // Version Stacking State (V1, V2, V3...)
  const [versions, setVersions] = useState(() => {
    const saved = localStorage.getItem('cutsync_versions')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      } catch (e) { console.error(e) }
    }

    // Backward compatibility: migrate legacy single comments to V1
    const oldComments = localStorage.getItem('cutsync_comments')
    let initialComments = [
      { id: '1', time: 3, category: 'cut', text: 'לקצר את השתיקה בהתחלה בחצי שנייה', completed: false, author: 'לקוח', drawing: null, replies: [] },
      { id: '2', time: 8, category: 'audio', text: 'להגביר כאן מעט את מוזיקת הרקע', completed: true, author: 'לקוח', drawing: null, replies: [
        { id: 'r1', author: 'עורך', text: 'הגברתי ב-3dB ואיזנתי עם הדיבור, נשמע מעולה עכשיו!', createdAt: new Date(Date.now() - 3600000).toISOString() }
      ] },
      { id: '3', time: 12, category: 'text', text: 'לבדוק איות בשם החברה', completed: false, author: 'לקוח', drawing: null, replies: [] },
    ]
    if (oldComments) {
      try {
        const parsed = JSON.parse(oldComments)
        if (Array.isArray(parsed) && parsed.length > 0) initialComments = parsed
      } catch (e) { console.error(e) }
    }

    return [
      {
        id: 'v1',
        number: 1,
        name: 'גרסה 1 (V1)',
        videoSrc: DEFAULT_VIDEO,
        videoTitle: 'פרויקט לדוגמה: סרטון תדמית v1',
        createdAt: new Date().toISOString(),
        comments: initialComments
      }
    ]
  })

  const [activeVersionId, setActiveVersionId] = useState(() => {
    return localStorage.getItem('cutsync_active_version') || 'v1'
  })

  // Derive current active version & its data
  const currentVersion = versions.find((v) => v.id === activeVersionId) || versions[0]
  const videoSrc = currentVersion.videoSrc
  const videoTitle = currentVersion.videoTitle
  const comments = currentVersion.comments || []

  // Video playback State
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isMuted, setIsMuted] = useState(false)

  // Drawing Markup State
  const [isDrawingMode, setIsDrawingMode] = useState(false)
  const [drawTool, setDrawTool] = useState('pen') // 'pen' | 'circle' | 'arrow'
  const [drawColor, setDrawColor] = useState('#eab308') // yellow default
  const [hasDrawing, setHasDrawing] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [activeDrawingImage, setActiveDrawingImage] = useState(null)

  // Input states
  const [newCommentText, setNewCommentText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('cut')
  const [isUrgent, setIsUrgent] = useState(false)

  // View & Filter states
  const [mode, setMode] = useState('client') // 'client' | 'editor'
  const [activeFilter, setActiveFilter] = useState('all') // 'all' | 'pending' | 'completed'
  const [copied, setCopied] = useState(false)
  const [hoveredMarker, setHoveredMarker] = useState(null)

  // Threaded Replies State
  const [expandedThreads, setExpandedThreads] = useState({ '2': true })
  const [replyInputs, setReplyInputs] = useState({})

  // Interactive Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showFullscreenDrawer, setShowFullscreenDrawer] = useState(false)

  // Save versions and active version to localStorage
  useEffect(() => {
    localStorage.setItem('cutsync_versions', JSON.stringify(versions))
  }, [versions])

  useEffect(() => {
    localStorage.setItem('cutsync_active_version', activeVersionId)
  }, [activeVersionId])

  // Canvas Drawing functions
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasDrawing(false)
    setActiveDrawingImage(null)
  }, [])

  // Draw arrow helper
  const drawArrow = (ctx, fromx, fromy, tox, toy, color) => {
    const headlen = 14
    const dx = tox - fromx
    const dy = toy - fromy
    const angle = Math.atan2(dy, dx)
    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(fromx, fromy)
    ctx.lineTo(tox, toy)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(tox, toy)
    ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6))
    ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6))
    ctx.closePath()
    ctx.fill()
  }

  // Handle canvas mouse events
  const handleMouseDown = (e) => {
    if (!isDrawingMode) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height

    setIsDrawing(true)
    setStartPos({ x, y })

    if (drawTool === 'pen') {
      const ctx = canvas.getContext('2d')
      ctx.strokeStyle = drawColor
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(x, y)
    }
  }

  const handleMouseMove = (e) => {
    if (!isDrawing || !isDrawingMode) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height

    if (drawTool === 'pen') {
      ctx.lineTo(x, y)
      ctx.stroke()
      setHasDrawing(true)
    }
  }

  const handleMouseUp = (e) => {
    if (!isDrawing || !isDrawingMode) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height

    if (drawTool === 'circle') {
      const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2))
      ctx.strokeStyle = drawColor
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI)
      ctx.stroke()
      setHasDrawing(true)
    } else if (drawTool === 'arrow') {
      drawArrow(ctx, startPos.x, startPos.y, x, y, drawColor)
      setHasDrawing(true)
    }

    setIsDrawing(false)
  }

  // Video event handlers
  const handlePlayPause = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
  }

  // Fullscreen Handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (playerContainerRef.current?.requestFullscreen) {
        playerContainerRef.current.requestFullscreen().catch((err) => {
          console.warn('Native fullscreen failed, using CSS fallback:', err)
          setIsFullscreen(true)
        })
      } else {
        setIsFullscreen(true)
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => console.warn(err))
      }
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = !!document.fullscreenElement
      setIsFullscreen(active)
      if (!active) {
        setShowFullscreenDrawer(false)
      }
    }

    const handleKeyDown = (e) => {
      const tag = e.target?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea') return

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        toggleFullscreen()
      } else if (e.key === 'Escape') {
        if (showFullscreenDrawer) {
          e.preventDefault()
          setShowFullscreenDrawer(false)
        }
      } else if (e.key === ' ') {
        e.preventDefault()
        handlePlayPause()
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [showFullscreenDrawer, isPlaying])

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

  const renderDrawing = (drawingData) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (drawingData) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        setHasDrawing(true)
      }
      img.src = drawingData
    } else {
      setHasDrawing(false)
    }
  }

  const seekTo = (timeInSec, drawingData = null) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timeInSec
      setCurrentTime(timeInSec)
    }
    if (drawingData) {
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause()
        setIsPlaying(false)
      }
      renderDrawing(drawingData)
    } else {
      clearCanvas()
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

  // Helper to update comments inside active version
  const updateActiveVersionComments = (updater) => {
    setVersions((prev) =>
      prev.map((v) => {
        if (v.id === activeVersionId) {
          const currentList = Array.isArray(v.comments) ? v.comments : []
          const updated = typeof updater === 'function' ? updater(currentList) : updater
          return { ...v, comments: Array.isArray(updated) ? updated : [] }
        }
        return v
      })
    )
  }

  // Switch Version
  const switchVersion = (versionId) => {
    if (versionId === activeVersionId) return
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
    setActiveVersionId(versionId)
    setCurrentTime(0)
    clearCanvas()
    setIsDrawingMode(false)
  }

  // Replace video in CURRENT active version
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      const title = file.name.replace(/\.[^/.]+$/, '')
      setVersions((prev) =>
        prev.map((v) => (v.id === activeVersionId ? { ...v, videoSrc: url, videoTitle: title } : v))
      )
      setCurrentTime(0)
      clearCanvas()
    }
  }

  // Upload NEW Version (creates V2, V3, etc.)
  const handleUploadNewVersion = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const newNumber = versions.length + 1
    const newId = `v${newNumber}`
    const url = URL.createObjectURL(file)
    const title = file.name.replace(/\.[^/.]+$/, '')

    const newVersion = {
      id: newId,
      number: newNumber,
      name: `גרסה ${newNumber} (V${newNumber})`,
      videoSrc: url,
      videoTitle: title,
      createdAt: new Date().toISOString(),
      comments: []
    }

    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause()
      setIsPlaying(false)
    }

    setVersions((prev) => [...prev, newVersion])
    setActiveVersionId(newId)
    setCurrentTime(0)
    clearCanvas()
    setIsDrawingMode(false)

    if (fileInputNewVersionRef.current) {
      fileInputNewVersionRef.current.value = ''
    }
  }

  // Voice Recording Handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const reader = new FileReader()
        reader.readAsDataURL(audioBlob)
        reader.onloadend = () => {
          setRecordedAudioData(reader.result)
        }
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingDuration(0)

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      console.error('Microphone access denied:', err)
      alert('נא לאשר גישה למיקרופון כדי להקליט הערה קולית.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      clearInterval(recordingTimerRef.current)
    }
  }

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stream?.getTracks().forEach((track) => track.stop())
      setIsRecording(false)
      clearInterval(recordingTimerRef.current)
    }
    setRecordedAudioData(null)
    setRecordingDuration(0)
  }

  // Add Comment to active version
  const handleAddComment = (e) => {
    e?.preventDefault()
    if (!newCommentText.trim() && !recordedAudioData) return

    let drawingData = null
    if (hasDrawing && canvasRef.current) {
      drawingData = canvasRef.current.toDataURL()
    }

    const newComment = {
      id: Date.now().toString(),
      time: Math.floor(currentTime),
      category: selectedCategory,
      text: newCommentText.trim() || 'הודעה קולית',
      urgent: isUrgent,
      drawing: drawingData,
      audio: recordedAudioData,
      audioDuration: recordingDuration,
      completed: false,
      author: mode === 'client' ? 'לקוח' : 'עורך',
      replies: [],
      createdAt: new Date().toISOString()
    }

    updateActiveVersionComments((prev) => [...prev, newComment].sort((a, b) => a.time - b.time))
    setNewCommentText('')
    setIsUrgent(false)
    setRecordedAudioData(null)
    setRecordingDuration(0)
    clearCanvas()
    setIsDrawingMode(false)
  }

  // Toggle Completed in active version
  const toggleCommentComplete = (id) => {
    updateActiveVersionComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, completed: !c.completed } : c))
    )
  }

  // Delete Comment in active version
  const deleteComment = (id) => {
    updateActiveVersionComments((prev) => prev.filter((c) => c.id !== id))
  }

  // Threaded Replies Handlers
  const toggleThread = (commentId) => {
    setExpandedThreads((prev) => ({
      ...prev,
      [commentId]: !prev[commentId]
    }))
  }

  const handleAddReply = (commentId, customText = null) => {
    const textToSend = (customText || replyInputs[commentId] || '').trim()
    if (!textToSend) return

    const newReply = {
      id: Date.now().toString(),
      author: mode === 'client' ? 'לקוח' : 'עורך',
      text: textToSend,
      createdAt: new Date().toISOString()
    }

    updateActiveVersionComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const existing = Array.isArray(c.replies) ? c.replies : []
          return {
            ...c,
            replies: [...existing, newReply]
          }
        }
        return c
      })
    )

    setReplyInputs((prev) => ({ ...prev, [commentId]: '' }))
    setExpandedThreads((prev) => ({ ...prev, [commentId]: true }))
  }

  const handleDeleteReply = (commentId, replyId) => {
    updateActiveVersionComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const existing = Array.isArray(c.replies) ? c.replies : []
          return {
            ...c,
            replies: existing.filter((r) => r.id !== replyId)
          }
        }
        return c
      })
    )
  }

  // Generate WhatsApp Message
  const getWhatsAppMessage = () => {
    let msg = `🎬 *סיכום תיקונים - ${videoTitle} (${currentVersion.name})*\n`
    msg += `סה"כ תיקונים: ${comments.length} | בוצעו: ${comments.filter(c => c.completed).length}\n\n`

    if (comments.length === 0) {
      msg += `אין כרגע תיקונים רשומים לסרטון.\n`
    } else {
      comments.forEach((c) => {
        const cat = CATEGORIES.find(cat => cat.id === c.category)
        const status = c.completed ? '✅' : '⏳'
        const tag = cat ? `[${cat.label}]` : ''
        const audioTag = c.audio ? ' 🎙️ (הודעה קולית)' : ''
        msg += `${status} *${formatTime(c.time)}* ${tag}: ${c.text}${audioTag}\n`

        if (Array.isArray(c.replies) && c.replies.length > 0) {
          c.replies.forEach((r) => {
            const authorTag = r.author === 'עורך' ? '🎬 עורך' : '👤 לקוח'
            msg += `   ↳ _${authorTag}:_ ${r.text}\n`
          })
        }
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

  const exportPremiereCSV = () => {
    let csv = "Marker Name,Description,In,Out,Duration,Marker Type\n"
    comments.forEach((c) => {
      const cat = CATEGORIES.find(cat => cat.id === c.category)
      const timecode = `00:${formatTime(c.time)}:00`
      const name = cat ? `${cat.label} - ${c.urgent ? 'דחוף' : 'תיקון'}` : 'תיקון'
      const desc = `"${c.text.replace(/"/g, '""')}"`
      csv += `${name},${desc},${timecode},${timecode},00:00:00:00,Comment\n`
    })
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${videoTitle}_${currentVersion.id}_markers.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const shareViaWhatsApp = () => {
    const encoded = encodeURIComponent(getWhatsAppMessage())
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank')
  }

  const notifyClientDone = () => {
    const msg = `🎉 *היי, סיימתי את כל התיקונים לסרטון!* (${videoTitle})\nהגרסה המעודכנת מוכנה לצפייה. ✨`
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank')
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
            {mode === 'editor' && (
              <>
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
                  <Upload className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden md:inline">החלף סרטון</span>
                </button>

                <button
                  onClick={exportPremiereCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e2436] hover:bg-[#283049] border border-[#2e3752] text-xs text-indigo-300 transition-colors"
                  title="ייצא קובץ מרקרים שנטען ישירות בפרמייר"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden md:inline">מרקרים ל-Premiere</span>
                </button>
              </>
            )}

            {mode === 'client' ? (
              <button
                onClick={shareViaWhatsApp}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition-all hover:scale-105 active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>סיימתי להעיר! ({comments.length})</span>
              </button>
            ) : (
              <button
                onClick={shareViaWhatsApp}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow-md shadow-emerald-950/40 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>שתף סיכום בוואטסאפ</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mode Guidance Banner */}
      <div className={`px-4 py-2 text-xs border-b transition-colors select-none ${
        mode === 'client'
          ? 'bg-purple-950/40 border-purple-900/50 text-purple-200'
          : 'bg-indigo-950/40 border-indigo-900/50 text-indigo-200'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {mode === 'client' ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></span>
                <span><strong>מצב לקוח:</strong> צפה בסרטון, עצור בכל נקודה שתרצה לתקן, סמן על המסך או כתוב הערה. בסיום לחץ על הכפתור הירוק למעלה או למטה.</span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 flex-shrink-0"></span>
                <span><strong>מצב עורך:</strong> לחץ על כל הערה לקפיצה מיידית לפריים. סמן [V] למשימות שתיקנת בפרמייר, וייצא קובץ מרקרים CSV לציר הזמן שלך.</span>
              </>
            )}
          </div>
          <span className="font-mono text-[11px] opacity-75 hidden sm:inline whitespace-nowrap">
            {mode === 'client' ? `נרשמו ${comments.length} הערות` : `בוצעו ${completedCount} מתוך ${comments.length}`}
          </span>
        </div>
      </div>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Section: Video Player & Timeline (7 cols) */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Version Stacking Switcher Bar */}
          <div className="bg-[#151926] p-2.5 rounded-2xl border border-[#23293d] shadow-lg flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 overflow-x-auto py-0.5">
              <div className="flex items-center gap-1 text-xs text-gray-400 font-bold px-1 select-none">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>גרסאות:</span>
              </div>
              <div className="flex items-center gap-1.5">
                {versions.map((ver) => {
                  const isActive = ver.id === activeVersionId
                  const verTotal = ver.comments ? ver.comments.length : 0
                  return (
                    <button
                      key={ver.id}
                      onClick={() => switchVersion(ver.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/50 ring-2 ring-purple-400/50 scale-[1.02]'
                          : 'bg-[#1c2234] text-gray-300 hover:text-white hover:bg-[#252d45] border border-[#2b344e]'
                      }`}
                    >
                      <span>{ver.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-medium ${
                        isActive ? 'bg-purple-950/70 text-purple-200' : 'bg-[#121520] text-gray-400'
                      }`}>
                        {verTotal} {verTotal === 1 ? 'הערה' : 'הערות'}
                      </span>
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="גרסה נוכחית מוצגת"></span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Upload New Version Button for Editor */}
            {mode === 'editor' && (
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputNewVersionRef}
                  onChange={handleUploadNewVersion}
                  accept="video/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputNewVersionRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-bold transition-all hover:scale-105 active:scale-95"
                  title="העלה סרטון מתוקן חדש (V2, V3...)"
                >
                  <Plus className="w-3.5 h-3.5 text-purple-400" />
                  <span>העלה גרסה חדשה (V{versions.length + 1})</span>
                </button>
              </div>
            )}
          </div>

          {/* Video Header Card & Player Container */}
          <div
            ref={playerContainerRef}
            className={`bg-[#151926] transition-all overflow-hidden relative select-none ${
              isFullscreen
                ? 'fixed inset-0 z-50 rounded-none border-none flex flex-col justify-between w-screen h-screen bg-[#090b12]'
                : 'rounded-2xl border border-[#23293d] shadow-2xl shadow-black/60'
            }`}
          >
            {/* Title Bar */}
            <div className="px-4 py-2.5 bg-[#1a1f30] border-b border-[#242b40] flex items-center justify-between text-xs text-gray-300 z-10 flex-shrink-0">
              <div className="flex items-center gap-2 font-medium truncate">
                <Video className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span className="truncate">{videoTitle} - <strong className="text-purple-300 font-bold">{currentVersion.name}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                {isFullscreen && (
                  <button
                    type="button"
                    onClick={() => setShowFullscreenDrawer(!showFullscreenDrawer)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      showFullscreenDrawer
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-[#232a3f] text-gray-300 hover:text-white hover:bg-[#2e3752]'
                    }`}
                    title="רשימת תיקונים והערות במסך מלא"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                    <span>תיקונים ({comments.length})</span>
                  </button>
                )}
                <span className="text-gray-400 font-mono text-[11px] bg-[#111420] px-2 py-0.5 rounded border border-[#2b334a]">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
                {isFullscreen && (
                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold transition-colors"
                    title="צא ממסך מלא (Esc / F)"
                  >
                    <Minimize className="w-3.5 h-3.5" />
                    <span>צא ממסך מלא (Esc)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Video Canvas Container */}
            <div className={`relative bg-black flex items-center justify-center group overflow-hidden select-none ${
              isFullscreen ? 'flex-1 min-h-0 w-full' : 'aspect-video'
            }`}>
              <video
                ref={videoRef}
                src={videoSrc}
                onPlay={() => {
                  setIsPlaying(true)
                  if (!hasDrawing) clearCanvas()
                }}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onClick={() => {
                  if (!isDrawingMode) handlePlayPause()
                }}
                className="w-full h-full object-contain cursor-pointer"
              />

              {/* Overlay Canvas for Visual Annotations */}
              <canvas
                ref={canvasRef}
                width={960}
                height={540}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className={`absolute inset-0 w-full h-full object-contain ${
                  isDrawingMode
                    ? 'cursor-crosshair z-30 pointer-events-auto bg-black/10'
                    : hasDrawing
                    ? 'z-20 pointer-events-none'
                    : 'pointer-events-none'
                }`}
              />

              {/* Big overlay play button when paused and not drawing */}
              {!isPlaying && !isDrawingMode && !hasDrawing && (
                <button
                  onClick={handlePlayPause}
                  className="absolute w-16 h-16 rounded-full bg-purple-600/90 hover:bg-purple-500 text-white flex items-center justify-center shadow-xl shadow-purple-900/50 backdrop-blur-sm transition-transform hover:scale-110 active:scale-95 z-20"
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
                          seekTo(comment.time, comment.drawing)
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
                            {comment.drawing && '🎨 '}
                            {comment.audio && '🎙️ '}
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

                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-100 hover:bg-[#22283a] transition-colors"
                    title={isFullscreen ? 'צא ממסך מלא (F / Esc)' : 'מסך מלא אינטראקטיבי (F)'}
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4 text-purple-400" /> : <Maximize className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Drawing Toolbar Toggle & Tools */}
              <div className="pt-2 border-t border-[#23293d] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (videoRef.current && !videoRef.current.paused) {
                        videoRef.current.pause()
                        setIsPlaying(false)
                      }
                      setIsDrawingMode(!isDrawingMode)
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isDrawingMode
                        ? 'bg-amber-500 text-black shadow-md shadow-amber-900/30'
                        : 'bg-[#22283a] text-gray-300 hover:text-white hover:bg-[#2c3349]'
                    }`}
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>{isDrawingMode ? 'סגור מצב סימון' : 'צייר על הפריים'}</span>
                  </button>

                  {isDrawingMode && (
                    <div className="flex items-center gap-1 bg-[#1a1f2e] p-1 rounded-lg border border-[#2b334a]">
                      {/* Tool selection */}
                      <button
                        type="button"
                        onClick={() => setDrawTool('pen')}
                        className={`p-1 rounded ${drawTool === 'pen' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                        title="עט חופשי"
                      >
                        <PenTool className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDrawTool('circle')}
                        className={`p-1 rounded ${drawTool === 'circle' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                        title="עיגול"
                      >
                        <Circle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDrawTool('arrow')}
                        className={`p-1 rounded ${drawTool === 'arrow' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                        title="חץ"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>

                      {/* Color palette */}
                      <div className="flex items-center gap-1 border-r border-[#2b334a] pr-1.5 mr-1">
                        {[
                          { color: '#eab308', name: 'צהוב' },
                          { color: '#ef4444', name: 'אדום' },
                          { color: '#10b981', name: 'ירוק' },
                          { color: '#38bdf8', name: 'תכלת' }
                        ].map((c) => (
                          <button
                            key={c.color}
                            type="button"
                            onClick={() => setDrawColor(c.color)}
                            style={{ backgroundColor: c.color }}
                            className={`w-3.5 h-3.5 rounded-full transition-transform ${drawColor === c.color ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'}`}
                            title={c.name}
                          />
                        ))}
                      </div>

                      {/* Clear canvas */}
                      <button
                        type="button"
                        onClick={clearCanvas}
                        className="p-1 text-gray-400 hover:text-red-400 rounded transition-colors"
                        title="נקה ציור"
                      >
                        <Eraser className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {hasDrawing && (
                  <span className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span>✨</span>
                    <span>יש סימון שמור ברגע זה</span>
                  </span>
                )}
              </div>
            </div>

            {/* Fullscreen Quick Comment Bar (Docked at bottom in Fullscreen) */}
            {isFullscreen && (
              <div className="bg-[#121624]/95 backdrop-blur-md border-t border-[#232c42] p-3 flex flex-col gap-2 shadow-2xl flex-shrink-0 z-30">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-purple-300 bg-purple-950/70 px-2.5 py-1 rounded-lg border border-purple-500/30">
                      ⏱️ פריים: {formatTime(currentTime)}
                    </span>
                    <span className="text-xs text-gray-300 font-medium">
                      {mode === 'client' ? 'הוסף תיקון לפריים זה:' : 'הוסף משימה לפריים זה:'}
                    </span>
                  </div>

                  {/* Category picker */}
                  <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                    {CATEGORIES.map((cat) => (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`text-[11px] px-2 py-0.5 rounded-md border transition-all flex items-center gap-1 ${
                          selectedCategory === cat.id
                            ? `${cat.color} font-bold ring-1 ring-white/20 shadow-sm`
                            : 'bg-[#1b2031] text-gray-400 border-[#2a3248] hover:border-gray-500'
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span className="hidden sm:inline">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Input + Shortcuts */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleAddComment()
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder={
                      hasDrawing
                        ? 'רשמת סימון על הפריים! הוסף הסבר קצר (למשל: "להחליף את הפונט שמסומן")...'
                        : 'כתוב מה צריך לתקן ברגע הזה... (Enter לשליחה)'
                    }
                    className="flex-1 bg-[#1a1f30] border border-[#2e3752] focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />

                  {/* Voice recording */}
                  {!isRecording && !recordedAudioData && (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold flex-shrink-0 transition-all hover:scale-105"
                      title="הקלט הודעה קולית לפריים זה"
                    >
                      <Mic className="w-3.5 h-3.5 text-red-400" />
                      <span className="hidden md:inline">הקלט קולית</span>
                    </button>
                  )}

                  {isRecording && (
                    <div className="flex items-center gap-1.5 bg-red-950/80 text-red-300 border border-red-500/50 px-2.5 py-1.5 rounded-xl text-xs flex-shrink-0 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      <span className="font-mono font-bold">{formatTime(recordingDuration)}</span>
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded"
                      >
                        סיים
                      </button>
                    </div>
                  )}

                  {recordedAudioData && !isRecording && (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <AudioCommentPlayer
                        src={recordedAudioData}
                        duration={recordingDuration}
                        label="הקלטה"
                      />
                      <button
                        type="button"
                        onClick={cancelRecording}
                        className="text-xs text-gray-400 hover:text-red-400 p-1"
                        title="בטל והקלט שוב"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  )}

                  <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer select-none flex-shrink-0 hidden sm:flex">
                    <input
                      type="checkbox"
                      checked={isUrgent}
                      onChange={(e) => setIsUrgent(e.target.checked)}
                      className="rounded border-[#2e3752] bg-[#1b2031] text-purple-600 focus:ring-0"
                    />
                    <span>🔥 דחוף</span>
                  </label>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={!newCommentText.trim() && !recordedAudioData && !hasDrawing}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg shadow-purple-900/40 transition-all active:scale-95 flex-shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>הוסף תיקון</span>
                  </button>
                </form>
              </div>
            )}

            {/* Fullscreen Revisions Side Drawer */}
            {isFullscreen && showFullscreenDrawer && (
              <aside className="absolute top-0 right-0 bottom-0 w-80 sm:w-96 bg-[#121624]/95 backdrop-blur-xl border-l border-[#273047] z-40 flex flex-col shadow-2xl select-text">
                {/* Drawer Header */}
                <div className="p-3.5 border-b border-[#232b40] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-purple-400" />
                    <h3 className="text-xs font-bold text-gray-100">
                      רשימת תיקונים ({comments.length})
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFullscreenDrawer(false)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1f2537] transition-colors"
                    title="סגור פאנל (Esc)"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-1 p-2 bg-[#161a29] border-b border-[#22293e] text-xs">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      activeFilter === 'all'
                        ? 'bg-purple-600 text-white font-medium'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    הכל ({comments.length})
                  </button>
                  <button
                    onClick={() => setActiveFilter('pending')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      activeFilter === 'pending'
                        ? 'bg-purple-600 text-white font-medium'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    ממתין ({comments.length - completedCount})
                  </button>
                  <button
                    onClick={() => setActiveFilter('completed')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      activeFilter === 'completed'
                        ? 'bg-purple-600 text-white font-medium'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    תוקן ({completedCount})
                  </button>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
                  {filteredComments.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-xs flex flex-col items-center justify-center gap-2">
                      <Sparkles className="w-6 h-6 text-purple-400/50" />
                      <span>אין הערות בקטגוריה זו</span>
                    </div>
                  ) : (
                    filteredComments.map((comment) => {
                      const cat = CATEGORIES.find((c) => c.id === comment.category)
                      return (
                        <div
                          key={comment.id}
                          className={`bg-[#181d2c] border rounded-xl p-2.5 text-xs flex flex-col gap-1.5 transition-all shadow-sm ${
                            comment.completed
                              ? 'border-[#22293d] opacity-60'
                              : comment.urgent
                              ? 'border-red-500/40 bg-red-950/15'
                              : 'border-[#28324a]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 flex-wrap">
                            <button
                              type="button"
                              onClick={() => seekTo(comment.time, comment.drawing)}
                              className="font-mono text-xs font-bold text-purple-400 hover:text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30 transition-colors"
                              title="קפוץ לרגע זה בוידאו"
                            >
                              ⏱️ {formatTime(comment.time)}
                            </button>

                            {cat && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${cat.color}`}>
                                {cat.icon} {cat.label}
                              </span>
                            )}

                            {comment.drawing && (
                              <button
                                type="button"
                                onClick={() => seekTo(comment.time, comment.drawing)}
                                className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-medium flex items-center gap-1 hover:bg-amber-500/30"
                                title="צפה בסימון על גבי הפריים"
                              >
                                <PenTool className="w-2.5 h-2.5" />
                                <span>סימון</span>
                              </button>
                            )}

                            {mode === 'editor' && (
                              <button
                                type="button"
                                onClick={() => toggleCommentComplete(comment.id)}
                                className="mr-auto text-gray-400 hover:text-emerald-400"
                                title={comment.completed ? 'סמן כלא בוצע' : 'סמן כבוצע'}
                              >
                                {comment.completed ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <Circle className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>

                          <p className={`text-xs leading-relaxed ${comment.completed ? 'line-through text-gray-400' : 'text-gray-200'}`}>
                            {comment.text}
                          </p>

                          {comment.audio && (
                            <AudioCommentPlayer src={comment.audio} duration={comment.audioDuration} />
                          )}

                          {/* Threaded Discussion in Fullscreen Drawer */}
                          <div className="pt-1 border-t border-[#232b40]">
                            <button
                              type="button"
                              onClick={() => toggleThread(comment.id)}
                              className="text-[10px] text-gray-400 hover:text-purple-300 flex items-center gap-1"
                            >
                              <MessageSquare className="w-3 h-3 text-purple-400" />
                              <span>
                                {(comment.replies?.length || 0) > 0
                                  ? `${comment.replies.length} תגובות בשיחה`
                                  : '💬 השב...'}
                              </span>
                            </button>

                            {expandedThreads[comment.id] && (
                              <div className="mt-1.5 bg-[#10131f] rounded-lg p-2 border border-[#22293d] flex flex-col gap-1.5">
                                {Array.isArray(comment.replies) && comment.replies.length > 0 && (
                                  <div className="flex flex-col gap-1 max-h-28 overflow-y-auto">
                                    {comment.replies.map((reply) => (
                                      <div key={reply.id} className="p-1.5 rounded bg-[#161a28] text-[10px]">
                                        <div className="flex items-center justify-between text-gray-400 mb-0.5">
                                          <span className="font-bold text-purple-300">{reply.author}</span>
                                          <span className="font-mono">{formatReplyTime(reply.createdAt)}</span>
                                        </div>
                                        <p className="text-gray-200">{reply.text}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <form
                                  onSubmit={(e) => {
                                    e.preventDefault()
                                    handleAddReply(comment.id)
                                  }}
                                  className="flex items-center gap-1"
                                >
                                  <input
                                    type="text"
                                    value={replyInputs[comment.id] || ''}
                                    onChange={(e) =>
                                      setReplyInputs((prev) => ({
                                        ...prev,
                                        [comment.id]: e.target.value
                                      }))
                                    }
                                    placeholder="השב..."
                                    className="flex-1 bg-[#181d2c] border border-[#2c354e] rounded px-2 py-1 text-[10px] text-gray-100 focus:outline-none"
                                  />
                                  <button
                                    type="submit"
                                    disabled={!(replyInputs[comment.id] || '').trim()}
                                    className="p-1 rounded bg-purple-600 text-white text-[10px]"
                                  >
                                    <Send className="w-2.5 h-2.5" />
                                  </button>
                                </form>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Drawer Footer */}
                <div className="p-2.5 bg-[#10131f] border-t border-[#232b40] flex items-center justify-between text-[11px] text-gray-400">
                  <span>{completedCount}/{comments.length} בוצעו</span>
                  <button
                    type="button"
                    onClick={() => setShowFullscreenDrawer(false)}
                    className="text-xs text-purple-300 hover:text-white"
                  >
                    סגור פאנל ✕
                  </button>
                </div>
              </aside>
            )}
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

              {/* Voice Note Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-[#171b29] p-2.5 rounded-xl border border-[#262f45]">
                <div className="flex items-center gap-2">
                  {!isRecording && !recordedAudioData && (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
                    >
                      <Mic className="w-3.5 h-3.5 text-red-400" />
                      <span>הקלט הודעה קולית</span>
                    </button>
                  )}

                  {isRecording && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 bg-red-950/70 text-red-300 border border-red-500/50 px-3 py-1.5 rounded-lg text-xs font-mono font-bold animate-pulse">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                        <span>מקליט... {formatTime(recordingDuration)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md shadow-red-950/40"
                      >
                        <Square className="w-3 h-3 fill-current" />
                        <span>סיים</span>
                      </button>
                      <button
                        type="button"
                        onClick={cancelRecording}
                        className="text-xs text-gray-400 hover:text-gray-200 px-2 py-1"
                      >
                        בטל
                      </button>
                    </div>
                  )}

                  {recordedAudioData && !isRecording && (
                    <div className="flex items-center gap-2">
                      <AudioCommentPlayer
                        src={recordedAudioData}
                        duration={recordingDuration}
                        label="האזן להקלטה שלך"
                      />
                      <button
                        type="button"
                        onClick={cancelRecording}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 bg-[#1e2436] hover:bg-red-950/40 px-2.5 py-1.5 rounded-xl border border-[#2c354e] transition-colors"
                        title="מחק והקלט שוב"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-red-400" />
                        <span>הקלט שוב</span>
                      </button>
                    </div>
                  )}
                </div>

                <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="rounded border-[#2e3752] bg-[#1b2031] text-purple-600 focus:ring-0"
                  />
                  <span>סמן כתיקון דחוף 🔥</span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  disabled={!newCommentText.trim() && !recordedAudioData}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg shadow-purple-900/40 transition-all active:scale-95"
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
                  <span>{mode === 'client' ? 'ההערות שלך לסרטון' : 'צ\'קליסט משימות לביצוע'}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${
                    mode === 'client'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                  }`}>
                    {comments.length}
                  </span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {mode === 'client'
                    ? 'לחץ על שעת ההערה לקפיצה לפריים ולצפייה בסימונים'
                    : `נשארו עוד ${comments.length - completedCount} משימות פתוחות בפרמייר`}
                </p>
              </div>

              {/* Quick Filter tabs */}
              <div className="flex items-center bg-[#1b2031] p-0.5 rounded-lg border border-[#2a3248] text-xs">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    activeFilter === 'all'
                      ? mode === 'client' ? 'bg-purple-600 text-white font-medium' : 'bg-indigo-600 text-white font-medium'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  הכל ({comments.length})
                </button>
                <button
                  onClick={() => setActiveFilter('pending')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    activeFilter === 'pending'
                      ? mode === 'client' ? 'bg-purple-600 text-white font-medium' : 'bg-indigo-600 text-white font-medium'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {mode === 'client' ? 'ממתין' : 'פתוח'} ({comments.length - completedCount})
                </button>
                <button
                  onClick={() => setActiveFilter('completed')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    activeFilter === 'completed'
                      ? mode === 'client' ? 'bg-purple-600 text-white font-medium' : 'bg-indigo-600 text-white font-medium'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {mode === 'client' ? 'תוקן' : 'בוצע'} ({completedCount})
                </button>
              </div>
            </div>

            {/* Progress bar */}
            {comments.length > 0 && (
              <div className="mt-2">
                <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                  <span>{mode === 'client' ? 'סטטוס ביצוע התיקונים על ידי העורך' : 'קצב התקדמות בפרמייר'}</span>
                  <span className="font-mono">{Math.round((completedCount / comments.length) * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#23293d] rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      mode === 'client'
                        ? 'bg-gradient-to-r from-purple-500 to-emerald-400'
                        : 'bg-gradient-to-r from-indigo-500 to-emerald-400'
                    }`}
                    style={{ width: `${(completedCount / comments.length) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* List of Revisions */}
          <div className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-[480px] pr-1">
            {filteredComments.length === 0 ? (
              <div className="bg-[#151926]/50 border border-dashed border-[#262c3f] rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3 text-gray-400">
                <Sparkles className="w-8 h-8 text-purple-400/60" />
                <p className="text-sm">אין כרגע הערות בקטגוריה זו</p>
                <p className="text-xs text-gray-500">עצור את הסרטון והוסף הערה בטופס</p>
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
                    {/* Status: Interactive Checkbox for Editor, Status Badge for Client */}
                    {mode === 'editor' ? (
                      <button
                        onClick={() => toggleCommentComplete(comment.id)}
                        className="mt-0.5 text-gray-400 hover:text-emerald-400 transition-colors flex-shrink-0"
                        title={comment.completed ? 'סמן כלא בוצע' : 'סמן כבוצע בפרמייר'}
                      >
                        {comment.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>
                    ) : (
                      <div className="mt-0.5 flex-shrink-0">
                        {comment.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" title="העורך סימן שזה תוקן" />
                        ) : (
                          <Clock className="w-5 h-5 text-amber-400" title="ממתין לטיפול העורך" />
                        )}
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {/* Timecode click jumps video */}
                        <button
                          onClick={() => seekTo(comment.time, comment.drawing)}
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

                        {comment.drawing && (
                          <button
                            type="button"
                            onClick={() => seekTo(comment.time, comment.drawing)}
                            className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-medium flex items-center gap-1 hover:bg-amber-500/30 transition-colors"
                            title="לחץ לצפייה בסימון על גבי הפריים"
                          >
                            <PenTool className="w-2.5 h-2.5" />
                            <span>סימון ויזואלי</span>
                          </button>
                        )}

                        {comment.urgent && (
                          <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/40 px-1.5 py-0.2 rounded font-bold">
                            דחוף 🔥
                          </span>
                        )}

                        {mode === 'client' && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium mr-auto ${
                            comment.completed
                              ? 'text-emerald-300 bg-emerald-500/10'
                              : 'text-amber-300 bg-amber-500/10'
                          }`}>
                            {comment.completed ? 'תוקן ע"י העורך ✅' : 'בטיפול העורך ⏳'}
                          </span>
                        )}
                      </div>

                      <p className={`text-sm leading-relaxed ${comment.completed ? 'line-through text-gray-400' : 'text-gray-200'}`}>
                        {comment.text}
                      </p>

                      {/* Attached Audio Voice Note */}
                      {comment.audio && (
                        <AudioCommentPlayer
                          src={comment.audio}
                          duration={comment.audioDuration}
                        />
                      )}

                      {/* Threaded Discussion Section */}
                      <div className="mt-2.5 pt-2 border-t border-[#22283a]">
                        {/* Toggle Button */}
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => toggleThread(comment.id)}
                            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-purple-300 font-medium transition-colors group/btn"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-purple-400 group-hover/btn:scale-110 transition-transform" />
                            <span>
                              {(comment.replies?.length || 0) > 0
                                ? `${comment.replies.length} תגובות בשיחה`
                                : '💬 תגובות / שיחה על התיקון'}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">
                              {expandedThreads[comment.id] ? '▲ סגור' : '▼ פתח'}
                            </span>
                          </button>

                          {(comment.replies?.length || 0) > 0 && !expandedThreads[comment.id] && (
                            <span className="text-[10px] bg-purple-500/10 text-purple-300 px-1.5 py-0.5 rounded-full border border-purple-500/20">
                              פעיל ({comment.replies.length})
                            </span>
                          )}
                        </div>

                        {/* Expanded Thread Drawer */}
                        {expandedThreads[comment.id] && (
                          <div className="mt-2.5 bg-[#10131f] rounded-xl p-3 border border-[#232b40] flex flex-col gap-2.5 shadow-inner">
                            {/* Existing Replies */}
                            {Array.isArray(comment.replies) && comment.replies.length > 0 ? (
                              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                                {comment.replies.map((reply) => {
                                  const isEditor = reply.author === 'עורך'
                                  return (
                                    <div
                                      key={reply.id}
                                      className={`p-2 rounded-lg border text-xs flex flex-col gap-1 transition-all ${
                                        isEditor
                                          ? 'bg-[#151928] border-indigo-500/30 text-indigo-100'
                                          : 'bg-[#181528] border-purple-500/30 text-purple-100'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                          <span
                                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                                              isEditor
                                                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                                                : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                            }`}
                                          >
                                            {isEditor ? '🎬 עורך' : '👤 לקוח'}
                                          </span>
                                          <span className="text-[10px] text-gray-400 font-mono">
                                            {formatReplyTime(reply.createdAt)}
                                          </span>
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => handleDeleteReply(comment.id, reply.id)}
                                          className="text-gray-500 hover:text-red-400 transition-colors p-0.5"
                                          title="מחק תגובה"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>

                                      <p className="text-gray-200 text-xs whitespace-pre-wrap leading-relaxed">
                                        {reply.text}
                                      </p>
                                    </div>
                                  )
                                })}
                              </div>
                            ) : (
                              <p className="text-[11px] text-gray-400 italic">
                                אין עדיין תגובות לתיקון זה. אפשר לשאול שאלה או להשאיר עדכון ישירות כאן במקום בוואטסאפ:
                              </p>
                            )}

                            {/* Quick suggested responses */}
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {(mode === 'client'
                                ? ['מעולה, תודה!', 'עדיף קצר יותר', 'סומך על הטעם שלך', 'אפשר עוד אופציה?']
                                : ['תוקן, תבדוק עכשיו ✓', 'לאיזה צבע להחליף?', 'צריך עוד פירוט', 'בוצע בגרסה הבאה']
                              ).map((suggestion, sIdx) => (
                                <button
                                  key={sIdx}
                                  type="button"
                                  onClick={() => handleAddReply(comment.id, suggestion)}
                                  className="text-[10px] px-2 py-0.5 rounded-full bg-[#1b2133] hover:bg-[#252c42] text-gray-300 hover:text-white border border-[#2d364f] transition-all"
                                >
                                  + {suggestion}
                                </button>
                              ))}
                            </div>

                            {/* Reply Input Form */}
                            <form
                              onSubmit={(e) => {
                                e.preventDefault()
                                handleAddReply(comment.id)
                              }}
                              className="flex items-center gap-1.5 pt-1"
                            >
                              <input
                                type="text"
                                value={replyInputs[comment.id] || ''}
                                onChange={(e) =>
                                  setReplyInputs((prev) => ({
                                    ...prev,
                                    [comment.id]: e.target.value
                                  }))
                                }
                                placeholder={
                                  mode === 'client'
                                    ? 'השב כלקוח (למשל: "התכוונתי לצבע צהוב זוהר")...'
                                    : 'השב כעורך (למשל: "תוקן, תבדוק עכשיו ב-00:04")...'
                                }
                                className="flex-1 bg-[#161a29] border border-[#2c354e] focus:border-purple-500 rounded-lg px-2.5 py-1.5 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                              />
                              <button
                                type="submit"
                                disabled={!(replyInputs[comment.id] || '').trim()}
                                className={`p-2 rounded-lg text-white text-xs font-semibold flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                                  mode === 'client'
                                    ? 'bg-purple-600 hover:bg-purple-500 shadow-sm shadow-purple-950/50'
                                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-sm shadow-indigo-950/50'
                                }`}
                                title="שלח תגובה (Enter)"
                              >
                                <Send className="w-3 h-3" />
                              </button>
                            </form>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delete button (Client can delete their notes, Editor can clean) */}
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

          {/* Role-tailored Action Footer */}
          {mode === 'client' ? (
            <div className="bg-gradient-to-br from-[#151926] via-[#12221e] to-[#0c1f19] p-4 rounded-2xl border border-emerald-500/30 shadow-2xl mt-auto flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">סיימת לעבור על הסרטון?</span>
                <span className="font-mono text-emerald-400 font-bold">{comments.length} תיקונים רשומים</span>
              </div>
              <button
                onClick={shareViaWhatsApp}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>שלח את כל התיקונים לעורך ב-WhatsApp</span>
              </button>
            </div>
          ) : (
            <div className="bg-[#151926] p-4 rounded-2xl border border-[#23293d] flex flex-col gap-2.5 shadow-xl mt-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-300 flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                  <span>פעולות עורך וסנכרון</span>
                </h3>
                <span className="text-[11px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {completedCount}/{comments.length} בוצעו
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={exportPremiereCSV}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#1d2235] hover:bg-[#272e47] border border-[#2c354e] text-xs font-semibold text-indigo-200 transition-all"
                  title="הורד קובץ מרקרים CSV לפרמייר"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
                  <span>ייצא CSV לפרמייר</span>
                </button>

                <button
                  onClick={copyToClipboard}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#1d2235] hover:bg-[#272e47] border border-[#2c354e] text-xs font-semibold text-gray-200 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'הועתק!' : 'העתק רשימה'}</span>
                </button>
              </div>

              <button
                onClick={notifyClientDone}
                className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-950/40 flex items-center justify-center gap-2 transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>עדכן לקוח בוואטסאפ: "התיקונים בוצעו!" 🎉</span>
              </button>
            </div>
          )}

        </section>
      </main>
    </div>
  )
}

export default App

