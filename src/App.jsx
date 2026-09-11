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
  AlertCircle,
  Film,
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
  Bell,
  Home,
  LayoutDashboard,
  Link2,
  Mic,
  MicOff,
  Square,
  MessageSquare,
  Type,
  Camera,
  Keyboard,
  Pencil
} from 'lucide-react'
import LandingPage from './LandingPage'
import ProjectsDashboard from './ProjectsDashboard'
import NewProjectModal from './NewProjectModal'
import EditProjectModal from './EditProjectModal'
import AuthModal from './AuthModal'
import Confetti from './Confetti'
import KeyboardShortcutsModal from './KeyboardShortcutsModal'
import OAuthPopupHandler from './OAuthPopupHandler'
import {
  playPop,
  playCheck,
  playCelebration,
  playCopy,
  playReaction,
  isSoundEnabled,
  setSoundEnabled
} from './soundFx'
import {
  getCurrentUser,
  logoutUser,
  getUserProjects,
  saveUserProjects,
  shapeCutSyncUser,
  getSessionUser,
  fetchProfile,
  getProjectById,
  saveClientComments,
  saveVersionApproval,
  uploadVideoToStorage,
  generateUUID,
  isValidUUID,
  deleteProject
} from './authService'
import { supabase } from './lib/supabase'

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
    if (!audioRef.current || !src) return
    if (playing) {
      audioRef.current.pause()
    } else {
      const playPromise = audioRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio play error:', err)
          setPlaying(false)
        })
      }
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

function MainApp() {
  const videoRef = useRef(null)
  const fileInputRef = useRef(null)
  const fileInputNewVersionRef = useRef(null)
  const canvasRef = useRef(null)
  const playerContainerRef = useRef(null)
  const canvasSnapshotRef = useRef(null)

  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [recordedAudioData, setRecordedAudioData] = useState(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const recordingTimerRef = useRef(null)
  const hasWelcomedRef = useRef(false)

  // Auth State
  const [currentUser, setCurrentUser] = useState(null) // null until Supabase session resolves
  const [authLoading, setAuthLoading] = useState(true)  // true while checking session
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalInitialTab, setAuthModalInitialTab] = useState('login')

  // Projects State (loaded async from Supabase)
  const [projects, setProjects] = useState([])

  // Active Project ID & Modal State
  const [activeProjectId, setActiveProjectId] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('project') || localStorage.getItem('cutsync_active_project_id') || null
  })
  
  useEffect(() => {
    if (activeProjectId) {
      localStorage.setItem('cutsync_active_project_id', activeProjectId)
    } else {
      localStorage.removeItem('cutsync_active_project_id')
    }
  }, [activeProjectId])

  const [showNewProjectModal, setShowNewProjectModal] = useState(false)

  // ── Load projects for a user async ─────────────────────────
  const loadUserProjects = useCallback(async (user) => {
    if (!user?.id) return
    const projs = await getUserProjects(user.id)
    setProjects(projs)
    if (projs.length > 0 && !activeProjectId) {
      setActiveProjectId(projs[0].id)
    }
  }, [activeProjectId])

  // ── Load direct project from URL (?project=UUID) ───────────
  // Works for clients without login, or direct links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const projParam = params.get('project')
    if (projParam) {
      getProjectById(projParam).then((proj) => {
        if (proj) {
          setProjects((prev) => {
            const exists = prev.some((p) => p.id === proj.id)
            return exists ? prev.map((p) => (p.id === proj.id ? proj : p)) : [proj, ...prev]
          })
          setActiveProjectId(proj.id)
          if (params.get('view') === 'client') {
            setMode('client')
            setCurrentView('studio')
          }
        }
      }).catch((err) => {
        console.warn('[CutSync] Failed to load direct project:', err)
      })
    }
  }, [])

  // ── Supabase Auth State Change Listener ────────────────────
  // This fires on: page load (session restore), login, logout, token refresh
  useEffect(() => {
    // Check for existing session on mount
    getSessionUser().then((user) => {
      setCurrentUser(user)
      setAuthLoading(false)
      if (user) loadUserProjects(user)
    }).catch(err => {
      console.warn('[CutSync] getSessionUser failed:', err)
      setAuthLoading(false)
    })

    // Subscribe to future auth state changes (login/logout/token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
          // If this is the OAuth popup window, close it immediately
          if (window.opener && window.opener !== window) {
            window.close()
            return
          }
          setShowAuthModal(false)
          const profile = await fetchProfile(session.user.id)
          const user = shapeCutSyncUser(session.user, profile)
          setCurrentUser(user)
          setAuthLoading(false)
          const projs = await getUserProjects(user.id)
          setProjects(projs)
          if (projs.length > 0 && !activeProjectId) setActiveProjectId(projs[0].id)
          
          // Only navigate to dashboard on explicit login
          if (event === 'SIGNED_IN') {
            setCurrentView((v) => (v === 'home' ? 'dashboard' : v))
            if (!hasWelcomedRef.current) {
              showToast(`ברוך הבא, ${user.name}! 👋`, 'success')
              hasWelcomedRef.current = true
            }
          }
        } else if (event === 'SIGNED_OUT') {
          console.warn('[CutSync] Supabase emitted SIGNED_OUT event!')
          if (hasWelcomedRef.current) {
            showToast('הסשן פג, נותקת מהמערכת', 'warning')
          }
          setCurrentUser(null)
          setProjects([])
          setActiveProjectId(null)
          setAuthLoading(false)
          setCurrentView('home')
          hasWelcomedRef.current = false
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Silent token refresh — just update user if needed
          const profile = await fetchProfile(session.user.id)
          const user = shapeCutSyncUser(session.user, profile)
          setCurrentUser(user)
        }
      }
    )

    const handleAuthMessage = async (event) => {
      if (event.data?.type === 'CUTSYNC_AUTH_SUCCESS') {
        const user = await getSessionUser()
        if (user) {
          handleAuthSuccess(user)
          setShowAuthModal(false)
        }
      }
    }
    window.addEventListener('message', handleAuthMessage)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('message', handleAuthMessage)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAuthSuccess = (user) => {
    // Called after email/password login — OAuth is handled by onAuthStateChange above
    if (!user || user.needsEmailConfirmation) return
    setCurrentUser(user)
    loadUserProjects(user).then(() => {
      setCurrentView('dashboard')
      if (!hasWelcomedRef.current) {
        showToast(`ברוך הבא, ${user.name}! התחברת בהצלחה.`, 'success')
        hasWelcomedRef.current = true
      }
    })
  }

  const handleLogout = async () => {
    await logoutUser()
    setCurrentUser(null)
    setProjects([])
    setCurrentView('home')
    hasWelcomedRef.current = false
    showToast('התנתקת בהצלחה מהמערכת', 'info')
  }

  // Dopamine Sound & Animation States
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled())
  const [showConfetti, setShowConfetti] = useState(false)
  const [floatingReactions, setFloatingReactions] = useState([])

  const handleToggleSound = () => {
    const next = !soundOn
    setSoundOn(next)
    setSoundEnabled(next)
    if (next) playPop()
    showToast(next ? '🔊 צלילי משוב הופעלו' : '🔇 צלילי משוב הושתקו', 'info')
  }

  const handleAddReaction = (commentId, emoji, event) => {
    playReaction()
    const rect = event?.currentTarget?.getBoundingClientRect()
    const id = Date.now() + Math.random()
    setFloatingReactions((prev) => [
      ...prev,
      {
        id,
        emoji,
        x: rect ? rect.left + rect.width / 2 : window.innerWidth / 2,
        y: rect ? rect.top : window.innerHeight / 2
      }
    ])
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== id))
    }, 1100)

    // Save reaction to active version comments
    setVersions((prev) =>
      prev.map((v) => {
        if (v.id === activeVersionId) {
          const updatedComments = (v.comments || []).map((c) => {
            if (c.id === commentId) {
              const reactions = { ...(c.reactions || {}) }
              reactions[emoji] = (reactions[emoji] || 0) + 1
              return { ...c, reactions }
            }
            return c
          })
          return { ...v, comments: updatedComments }
        }
        return v
      })
    )
  }
  // Current active project
  const currentProject = projects.find((p) => p.id === activeProjectId) || projects[0] || {
    id: 'proj-demo-1',
    title: 'פרויקט ברירת מחדל',
    clientName: 'הלקוח',
    versions: [],
    activeVersionId: 'v1'
  }

  // Derive current active version & its data for current project
  const versions = currentProject.versions || []
  const activeVersionId = currentProject.activeVersionId || versions[0]?.id || 'v1'
  const currentVersion = versions.find((v) => v.id === activeVersionId) || versions[0] || {
    id: 'v1',
    name: 'גרסה 1 (V1)',
    videoSrc: DEFAULT_VIDEO,
    videoTitle: currentProject.title,
    comments: [],
    approved: false
  }
  const videoSrc = currentVersion.videoSrc
  const videoTitle = currentProject.title
  const comments = currentVersion.comments || []

  // Compatibility adapters for setVersions & setActiveVersionId
  const setVersions = useCallback((updater) => {
    setProjects((prevProjects) =>
      prevProjects.map((p) => {
        if (p.id === currentProject.id) {
          const currentVers = p.versions || []
          const nextVers = typeof updater === 'function' ? updater(currentVers) : updater
          return {
            ...p,
            updatedAt: new Date().toISOString(),
            versions: nextVers
          }
        }
        return p
      })
    )
  }, [currentProject.id])

  const setActiveVersionId = useCallback((updater) => {
    setProjects((prevProjects) =>
      prevProjects.map((p) => {
        if (p.id === currentProject.id) {
          const nextVerId = typeof updater === 'function' ? updater(p.activeVersionId) : updater
          return {
            ...p,
            activeVersionId: nextVerId
          }
        }
        return p
      })
    )
  }, [currentProject.id])

  // Video playback State
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [videoLoadError, setVideoLoadError] = useState(false)

  useEffect(() => {
    setVideoLoadError(false)
  }, [videoSrc])

  // Drawing Markup State
  const [isDrawingMode, setIsDrawingMode] = useState(false)
  const [drawTool, setDrawTool] = useState('pen') // 'select' | 'pen' | 'circle' | 'arrow' | 'text'
  const [drawColor, setDrawColor] = useState('#eab308') // yellow default
  const [hasDrawing, setHasDrawing] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [activeDrawingImage, setActiveDrawingImage] = useState(null)
  const [textInputState, setTextInputState] = useState(null)
  const [shapes, setShapes] = useState([])
  const [selectedShapeId, setSelectedShapeId] = useState(null)
  const [isDraggingShape, setIsDraggingShape] = useState(false)
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 })
  const [hoveredShapeId, setHoveredShapeId] = useState(null)
  const currentPenPointsRef = useRef([])

  // Input states
  const [newCommentText, setNewCommentText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('cut')
  const [isUrgent, setIsUrgent] = useState(false)
  const commentTextareaRef = useRef(null)

  // Timeline Hover state for intuitive timecode preview
  const [timelineHover, setTimelineHover] = useState(null) // { percent: 0, time: 0 }

  // Keyboard Shortcuts Modal
  const [showShortcutsModal, setShowShortcutsModal] = useState(false)

  // Routing & View states ('home' | 'dashboard' | 'studio')
  const [currentView, setCurrentView] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    const viewParam = params.get('view')
    if (viewParam === 'client' || viewParam === 'editor' || viewParam === 'studio') {
      return 'studio'
    }
    if (viewParam === 'dashboard') {
      return 'dashboard'
    }
    return localStorage.getItem('cutsync_current_view') || 'home'
  })

  useEffect(() => {
    localStorage.setItem('cutsync_current_view', currentView)
  }, [currentView])

  const isDirectClientLink = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('view') === 'client'

  const [mode, setMode] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('view') === 'editor') return 'editor'
    if (params.get('view') === 'client') return 'client'
    return localStorage.getItem('cutsync_mode') || 'editor'
  })

  useEffect(() => {
    localStorage.setItem('cutsync_mode', mode)
  }, [mode])
  const [activeFilter, setActiveFilter] = useState('all') // 'all' | 'pending' | 'completed'
  const [copied, setCopied] = useState(false)
  const [hoveredMarker, setHoveredMarker] = useState(null)

  // Threaded Replies State
  const [expandedThreads, setExpandedThreads] = useState({ '2': true })
  const [replyInputs, setReplyInputs] = useState({})

  // Interactive Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showFullscreenDrawer, setShowFullscreenDrawer] = useState(false)

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden'
      // iOS Safari ignores overflow:hidden — position:fixed prevents scroll
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    } else {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
  }, [isFullscreen])

  // Version Approval & Reopen State
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [approverName, setApproverName] = useState('הלקוח')
  const [approvalNote, setApprovalNote] = useState('')
  const [showCelebration, setShowCelebration] = useState(false)
  const [showEditorReopenModal, setShowEditorReopenModal] = useState(false)
  const [editorReopenReason, setEditorReopenReason] = useState('')
  const [dismissedReopenModalVersionId, setDismissedReopenModalVersionId] = useState(null)
  const [toast, setToast] = useState(null)
  const toastTimeoutRef = useRef(null)

  const showToast = useCallback((message, type = 'info') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    setToast({ message, type })
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null)
    }, 4500)
  }, [])

  // Project Creation & Management Handlers
  const handleCreateProject = ({ title, clientName, videoSrc, videoFile }) => {
    const newId = generateUUID()
    const versionId = generateUUID()
    const newProject = {
      id: newId,
      title,
      clientName: clientName || 'הלקוח',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activeVersionId: versionId,
      versions: [
        {
          id: versionId,
          number: 1,
          name: 'גרסה 1 (V1)',
          videoSrc,
          videoTitle: title,
          createdAt: new Date().toISOString(),
          comments: [],
          approved: false,
          approvedAt: null,
          approvedBy: null,
          approvalNote: null,
          reopenRequested: false,
          reopenRequestedAt: null,
          reopenRequestedBy: null,
          reopenRequestReason: null
        }
      ]
    }
    setProjects(prev => [newProject, ...prev])
    setActiveProjectId(newId)
    setCurrentView('studio')
    setMode('editor')
    
    if (videoFile) {
      showToast('הפרויקט נוצר מקומית! הסרטון עולה לענן ברקע כדי שהלקוח יוכל לצפות... ⏳', 'info')
      // Background upload
      uploadVideoToStorage(videoFile)
        .then((cloudUrl) => {
          setProjects((prev) =>
            prev.map((p) => {
              if (p.id === newId) {
                return {
                  ...p,
                  versions: p.versions.map((v) =>
                    v.id === versionId ? { ...v, videoSrc: cloudUrl } : v
                  )
                }
              }
              return p
            })
          )
          showToast('הסרטון הועלה לענן בהצלחה! הלקוח יכול כעת לצפות. 🚀', 'success')
        })
        .catch((err) => {
          console.warn('[CutSync] Cloud storage upload failed for new project:', err)
          showToast(`העלאה לענן נכשלה: ${err.message || 'שגיאה לא ידועה'}. הסרטון מוצג מקומית בלבד.`, 'warning')
        })
    } else {
      showToast(`הפרויקט "${title}" נוצר בהצלחה! 🚀`, 'success')
    }
  }

  const handleDeleteProject = (projectId) => {
    const projToDelete = projects.find(p => p.id === projectId)
    if (!projToDelete) return
    
    if (window.confirm(`האם אתה בטוח שברצונך למחוק את הפרויקט "${projToDelete.title}"?`)) {
      // Background delete from Supabase
      deleteProject(projectId)
      
      setProjects(prev => {
        const remaining = prev.filter(p => p.id !== projectId)
        if (activeProjectId === projectId && remaining.length > 0) {
          setActiveProjectId(remaining[0].id)
        } else if (remaining.length === 0) {
          setActiveProjectId(null)
          setCurrentView('dashboard') // Immediately drop to dashboard when no projects left
        }
        return remaining
      })
      showToast('הפרויקט נמחק בהצלחה.', 'info')
    }
  }

  const [projectToEditInStudio, setProjectToEditInStudio] = useState(null)

  const handleUpdateProject = (projectId, { title, clientName }) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const updatedTitle = title?.trim() || p.title
          const updatedClient = clientName !== undefined ? clientName.trim() : p.clientName
          return {
            ...p,
            title: updatedTitle,
            clientName: updatedClient,
            updatedAt: new Date().toISOString(),
            versions: (p.versions || []).map((v) => ({
              ...v,
              videoTitle: updatedTitle
            }))
          }
        }
        return p
      })
    )
    showToast('פרטי הפרויקט עודכנו בהצלחה! ✏️', 'success')
  }

  const copySpecificClientLink = (projectId) => {
    playCopy()
    const url = `${window.location.origin}/?project=${projectId}&view=client`
    navigator.clipboard.writeText(url)
    showToast('הועתק קישור סקירה ישיר ללקוח! שלח אותו בוואטסאפ 🔗', 'success')
  }

  // Save projects to Supabase whenever they change (debounced to avoid hammering)
  useEffect(() => {
    if (!currentUser?.id) return
    const timer = setTimeout(() => {
      saveUserProjects(currentUser.id, projects)
    }, 800)
    return () => clearTimeout(timer)
  }, [projects, currentUser])

  // Save client review feedback (comments, replies, reactions, approvals) to Supabase
  useEffect(() => {
    if (currentUser?.id || !currentProject?.id || !currentVersion?.id) return
    const timer = setTimeout(async () => {
      try {
        if (currentVersion.comments && currentVersion.comments.length > 0) {
          await saveClientComments(currentVersion.id, currentVersion.comments)
        }
        if (currentVersion.approved !== undefined) {
          await saveVersionApproval(currentVersion.id, {
            approved: currentVersion.approved,
            approvedAt: currentVersion.approvedAt,
            approvedBy: currentVersion.approvedBy,
            approvalNote: currentVersion.approvalNote
          })
        }
      } catch (err) {
        console.warn('[CutSync] Could not auto-sync client feedback to cloud:', err)
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [currentUser, currentProject?.id, currentVersion?.id, currentVersion?.comments, currentVersion?.approved])

  useEffect(() => {
    localStorage.setItem('cutsync_active_project_id', activeProjectId)
    if (activeVersionId) {
      localStorage.setItem('cutsync_active_version', activeVersionId)
    }
  }, [activeProjectId, activeVersionId])

  // Cross-tab synchronization via localStorage storage event
  useEffect(() => {
    const handleStorageChange = (e) => {
      const expectedKey = currentUser?.id ? `cutsync_projects_${currentUser.id}` : 'cutsync_projects'
      if (e.key === expectedKey && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue)
          if (Array.isArray(updated)) {
            setProjects(updated)
          }
        } catch (err) {
          console.error('Failed to sync projects across tabs', err)
        }
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [currentUser])

  // Canvas Drawing functions
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    canvasSnapshotRef.current = null
    setShapes([])
    setSelectedShapeId(null)
    setHasDrawing(false)
    setActiveDrawingImage(null)
    setTextInputState(null)
  }, [])

  // Delete selected shape
  const deleteSelectedShape = useCallback(() => {
    if (!selectedShapeId) return
    setShapes((prev) => {
      const updated = prev.filter((s) => s.id !== selectedShapeId)
      if (updated.length === 0) setHasDrawing(false)
      return updated
    })
    setSelectedShapeId(null)
  }, [selectedShapeId])

  // Undo last shape
  const undoLastShape = useCallback(() => {
    setShapes((prev) => {
      if (prev.length === 0) return prev
      const updated = prev.slice(0, prev.length - 1)
      if (updated.length === 0) setHasDrawing(false)
      return updated
    })
    setSelectedShapeId(null)
  }, [])

  // Mathematical helper: distance from point (px, py) to line segment (x1, y1) -> (x2, y2)
  const pointToSegmentDist = (px, py, x1, y1, x2, y2) => {
    const l2 = Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)
    if (l2 === 0) return Math.hypot(px - x1, py - y1)
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2
    t = Math.max(0, Math.min(1, t))
    const projX = x1 + t * (x2 - x1)
    const projY = y1 + t * (y2 - y1)
    return Math.hypot(px - projX, py - projY)
  }

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

  // Draw text badge helper
  const drawTextBadge = (ctx, text, x, y, color) => {
    ctx.save()
    const fontSize = 18
    ctx.font = `bold ${fontSize}px Heebo, Rubik, sans-serif`
    const metrics = ctx.measureText(text)
    const textWidth = metrics.width
    const paddingX = 14
    const paddingY = 8
    const boxWidth = textWidth + paddingX * 2
    const boxHeight = fontSize + paddingY * 2
    const radius = 8

    let boxX = x - boxWidth / 2
    let boxY = y - boxHeight / 2
    if (boxX < 10) boxX = 10
    if (boxX + boxWidth > 950) boxX = 950 - boxWidth
    if (boxY < 10) boxY = 10
    if (boxY + boxHeight > 530) boxY = 530 - boxHeight

    ctx.fillStyle = 'rgba(10, 14, 24, 0.94)'
    ctx.strokeStyle = color
    ctx.lineWidth = 2.5
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)'
    ctx.shadowBlur = 12
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 4

    ctx.beginPath()
    if (ctx.roundRect) {
      ctx.roundRect(boxX, boxY, boxWidth, boxHeight, radius)
    } else {
      ctx.rect(boxX, boxY, boxWidth, boxHeight)
    }
    ctx.fill()
    ctx.stroke()

    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0

    ctx.fillStyle = '#ffffff'
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    ctx.fillText(text, boxX + boxWidth / 2, boxY + boxHeight / 2)

    ctx.restore()
  }

  // Hit testing for shapes
  const hitTestShape = (shape, x, y, ctx) => {
    if (shape.type === 'circle') {
      const dist = Math.hypot(x - shape.cx, y - shape.cy)
      return dist <= shape.radius + 14
    }
    if (shape.type === 'arrow') {
      return pointToSegmentDist(x, y, shape.fromX, shape.fromY, shape.toX, shape.toY) <= 16
    }
    if (shape.type === 'text') {
      const fontSize = 18
      if (ctx) ctx.font = `bold ${fontSize}px Heebo, Rubik, sans-serif`
      const textWidth = ctx ? ctx.measureText(shape.text).width : (shape.text.length * 11)
      const paddingX = 14
      const paddingY = 8
      const boxWidth = textWidth + paddingX * 2
      const boxHeight = fontSize + paddingY * 2
      let boxX = shape.x - boxWidth / 2
      let boxY = shape.y - boxHeight / 2
      if (boxX < 10) boxX = 10
      if (boxX + boxWidth > 950) boxX = 950 - boxWidth
      if (boxY < 10) boxY = 10
      if (boxY + boxHeight > 530) boxY = 530 - boxHeight
      return x >= boxX - 6 && x <= boxX + boxWidth + 6 && y >= boxY - 6 && y <= boxY + boxHeight + 6
    }
    if (shape.type === 'pen') {
      if (!shape.points || shape.points.length === 0) return false
      if (shape.points.length === 1) return Math.hypot(x - shape.points[0].x, y - shape.points[0].y) <= 14
      for (let i = 0; i < shape.points.length - 1; i++) {
        if (pointToSegmentDist(x, y, shape.points[i].x, shape.points[i].y, shape.points[i + 1].x, shape.points[i + 1].y) <= 14) {
          return true
        }
      }
      return false
    }
    return false
  }

  const findShapeAtPos = (x, y, shapesList, ctx) => {
    for (let i = shapesList.length - 1; i >= 0; i--) {
      if (hitTestShape(shapesList[i], x, y, ctx)) {
        return shapesList[i]
      }
    }
    return null
  }

  // Render a single shape with optional selection handles
  const renderSingleShape = (ctx, s, isSelected) => {
    if (s.type === 'circle') {
      ctx.save()
      ctx.strokeStyle = s.color
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(s.cx, s.cy, s.radius, 0, 2 * Math.PI)
      ctx.stroke()

      if (isSelected) {
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 1.5
        ctx.setLineDash([4, 4])
        ctx.beginPath()
        ctx.arc(s.cx, s.cy, s.radius + 6, 0, 2 * Math.PI)
        ctx.stroke()
        ctx.setLineDash([])

        const handles = [
          { x: 0, y: -(s.radius + 6) },
          { x: (s.radius + 6), y: 0 },
          { x: 0, y: (s.radius + 6) },
          { x: -(s.radius + 6), y: 0 }
        ]
        ctx.fillStyle = '#ffffff'
        ctx.strokeStyle = s.color
        ctx.lineWidth = 1.5
        handles.forEach(h => {
          ctx.fillRect(s.cx + h.x - 3, s.cy + h.y - 3, 6, 6)
          ctx.strokeRect(s.cx + h.x - 3, s.cy + h.y - 3, 6, 6)
        })
      }
      ctx.restore()
    } else if (s.type === 'arrow') {
      ctx.save()
      drawArrow(ctx, s.fromX, s.fromY, s.toX, s.toY, s.color)

      if (isSelected) {
        ctx.fillStyle = '#ffffff'
        ctx.strokeStyle = s.color
        ctx.lineWidth = 1.5
        ;[{ x: s.fromX, y: s.fromY }, { x: s.toX, y: s.toY }].forEach(p => {
          ctx.beginPath()
          ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI)
          ctx.fill()
          ctx.stroke()
        })

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'
        ctx.lineWidth = 1
        ctx.setLineDash([3, 3])
        ctx.beginPath()
        ctx.moveTo(s.fromX, s.fromY)
        ctx.lineTo(s.toX, s.toY)
        ctx.stroke()
      }
      ctx.restore()
    } else if (s.type === 'text') {
      ctx.save()
      drawTextBadge(ctx, s.text, s.x, s.y, s.color)

      if (isSelected) {
        const fontSize = 18
        ctx.font = `bold ${fontSize}px Heebo, Rubik, sans-serif`
        const textWidth = ctx.measureText(s.text).width
        const paddingX = 14
        const paddingY = 8
        const boxWidth = textWidth + paddingX * 2
        const boxHeight = fontSize + paddingY * 2
        let boxX = s.x - boxWidth / 2
        let boxY = s.y - boxHeight / 2
        if (boxX < 10) boxX = 10
        if (boxX + boxWidth > 950) boxX = 950 - boxWidth
        if (boxY < 10) boxY = 10
        if (boxY + boxHeight > 530) boxY = 530 - boxHeight

        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 1.5
        ctx.setLineDash([4, 4])
        ctx.strokeRect(boxX - 4, boxY - 4, boxWidth + 8, boxHeight + 8)
        ctx.setLineDash([])

        ctx.fillStyle = '#ffffff'
        ctx.strokeStyle = s.color
        ctx.lineWidth = 1.5
        ;[
          { x: boxX - 4, y: boxY - 4 },
          { x: boxX + boxWidth + 4, y: boxY - 4 },
          { x: boxX + boxWidth + 4, y: boxY + boxHeight + 4 },
          { x: boxX - 4, y: boxY + boxHeight + 4 }
        ].forEach(c => {
          ctx.fillRect(c.x - 3, c.y - 3, 6, 6)
          ctx.strokeRect(c.x - 3, c.y - 3, 6, 6)
        })
      }
      ctx.restore()
    } else if (s.type === 'pen') {
      ctx.save()
      if (s.points && s.points.length > 0) {
        ctx.strokeStyle = s.color
        ctx.fillStyle = s.color
        ctx.lineWidth = 3
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.beginPath()
        ctx.moveTo(s.points[0].x, s.points[0].y)
        for (let i = 1; i < s.points.length; i++) {
          ctx.lineTo(s.points[i].x, s.points[i].y)
        }
        ctx.stroke()

        if (isSelected) {
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
          s.points.forEach(p => {
            minX = Math.min(minX, p.x)
            minY = Math.min(minY, p.y)
            maxX = Math.max(maxX, p.x)
            maxY = Math.max(maxY, p.y)
          })
          ctx.strokeStyle = '#ffffff'
          ctx.lineWidth = 1.5
          ctx.setLineDash([4, 4])
          ctx.strokeRect(minX - 6, minY - 6, maxX - minX + 12, maxY - minY + 12)
        }
      }
      ctx.restore()
    }
  }

  // Render all shapes on canvas
  const renderShapesOnCanvas = useCallback((canvas, shapesList, selId, activePreview = null) => {
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    shapesList.forEach(s => {
      renderSingleShape(ctx, s, s.id === selId)
    })

    if (activePreview) {
      if (activePreview.type === 'circle') {
        ctx.save()
        ctx.strokeStyle = activePreview.color
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(activePreview.cx, activePreview.cy, activePreview.radius, 0, 2 * Math.PI)
        ctx.stroke()
        ctx.restore()
      } else if (activePreview.type === 'arrow') {
        ctx.save()
        drawArrow(ctx, activePreview.fromX, activePreview.fromY, activePreview.toX, activePreview.toY, activePreview.color)
        ctx.restore()
      } else if (activePreview.type === 'pen' && activePreview.points) {
        ctx.save()
        ctx.strokeStyle = activePreview.color
        ctx.lineWidth = 3
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.beginPath()
        ctx.moveTo(activePreview.points[0].x, activePreview.points[0].y)
        for (let i = 1; i < activePreview.points.length; i++) {
          ctx.lineTo(activePreview.points[i].x, activePreview.points[i].y)
        }
        ctx.stroke()
        ctx.restore()
      }
    }
  }, [])

  // Auto-redraw canvas whenever shapes or selectedShapeId changes
  useEffect(() => {
    if (canvasRef.current && isDrawingMode) {
      renderShapesOnCanvas(canvasRef.current, shapes, selectedShapeId)
    }
  }, [shapes, selectedShapeId, isDrawingMode, renderShapesOnCanvas])

  // Commit text input to shapes array
  const commitTextOverlay = () => {
    if (!textInputState || !textInputState.text.trim()) {
      setTextInputState(null)
      return
    }

    const newShape = {
      id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type: 'text',
      color: drawColor,
      x: textInputState.x,
      y: textInputState.y,
      text: textInputState.text.trim()
    }

    setShapes(prev => [...prev, newShape])
    setSelectedShapeId(newShape.id)
    setHasDrawing(true)
    setTextInputState(null)
  }

  // Precise coordinate calculation accounting for letterboxing/pillarboxing caused by object-contain
  const getCanvasCoordinates = (e, canvas) => {
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const containerWidth = rect.width
    const containerHeight = rect.height
    if (containerWidth === 0 || containerHeight === 0) return { x: 0, y: 0 }

    const containerAspect = containerWidth / containerHeight
    const canvasAspect = canvas.width / canvas.height

    let drawWidth, drawHeight, offsetX, offsetY

    if (containerAspect > canvasAspect) {
      drawHeight = containerHeight
      drawWidth = containerHeight * canvasAspect
      offsetX = (containerWidth - drawWidth) / 2
      offsetY = 0
    } else {
      drawWidth = containerWidth
      drawHeight = containerWidth / canvasAspect
      offsetX = 0
      offsetY = (containerHeight - drawHeight) / 2
    }

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const clampedX = Math.max(0, Math.min(mouseX - offsetX, drawWidth))
    const clampedY = Math.max(0, Math.min(mouseY - offsetY, drawHeight))

    const x = (clampedX / drawWidth) * canvas.width
    const y = (clampedY / drawHeight) * canvas.height

    return { x, y }
  }

  // Handle canvas mouse events (Drawing, Selecting, Dragging & Moving!)
  const handleMouseDown = (e) => {
    if (!isDrawingMode) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const { x, y } = getCanvasCoordinates(e, canvas)

    // Check if user clicked on ANY existing shape
    const clickedShape = findShapeAtPos(x, y, shapes, ctx)

    if (clickedShape) {
      if (textInputState && textInputState.text.trim()) {
        commitTextOverlay()
      } else {
        setTextInputState(null)
      }
      setSelectedShapeId(clickedShape.id)
      setIsDraggingShape(true)
      setDragStartPos({ x, y })
      return
    }

    // Clicked empty space
    if (drawTool === 'text') {
      if (textInputState && textInputState.text.trim()) {
        commitTextOverlay()
      }
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      const pctX = (mouseX / rect.width) * 100
      const pctY = (mouseY / rect.height) * 100
      setSelectedShapeId(null)
      setTextInputState({
        x,
        y,
        pctX: Math.min(Math.max(5, pctX), 75),
        pctY: Math.min(Math.max(5, pctY), 85),
        text: ''
      })
      return
    }

    if (drawTool === 'select') {
      setSelectedShapeId(null)
      return
    }

    // Start drawing new shape
    setSelectedShapeId(null)
    setIsDrawing(true)
    setStartPos({ x, y })

    if (drawTool === 'pen') {
      currentPenPointsRef.current = [{ x, y }]
    }
  }

  const handleMouseMove = (e) => {
    if (!isDrawingMode) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const { x, y } = getCanvasCoordinates(e, canvas)

    // A: Dragging existing shape
    if (isDraggingShape && selectedShapeId) {
      const dx = x - dragStartPos.x
      const dy = y - dragStartPos.y
      if (dx !== 0 || dy !== 0) {
        setShapes(prevShapes =>
          prevShapes.map(s => {
            if (s.id !== selectedShapeId) return s
            if (s.type === 'circle') {
              return {
                ...s,
                cx: Math.max(10, Math.min(950, s.cx + dx)),
                cy: Math.max(10, Math.min(530, s.cy + dy))
              }
            }
            if (s.type === 'arrow') {
              return {
                ...s,
                fromX: Math.max(10, Math.min(950, s.fromX + dx)),
                fromY: Math.max(10, Math.min(530, s.fromY + dy)),
                toX: Math.max(10, Math.min(950, s.toX + dx)),
                toY: Math.max(10, Math.min(530, s.toY + dy))
              }
            }
            if (s.type === 'text') {
              return {
                ...s,
                x: Math.max(10, Math.min(950, s.x + dx)),
                y: Math.max(10, Math.min(530, s.y + dy))
              }
            }
            if (s.type === 'pen') {
              return {
                ...s,
                points: s.points.map(p => ({
                  x: Math.max(10, Math.min(950, p.x + dx)),
                  y: Math.max(10, Math.min(530, p.y + dy))
                }))
              }
            }
            return s
          })
        )
        setDragStartPos({ x, y })
      }
      return
    }

    // B: Actively drawing a new shape
    if (isDrawing) {
      if (drawTool === 'pen') {
        currentPenPointsRef.current.push({ x, y })
        renderShapesOnCanvas(canvas, shapes, null, {
          type: 'pen',
          color: drawColor,
          points: currentPenPointsRef.current
        })
      } else if (drawTool === 'circle') {
        const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2))
        renderShapesOnCanvas(canvas, shapes, null, {
          type: 'circle',
          color: drawColor,
          cx: startPos.x,
          cy: startPos.y,
          radius
        })
      } else if (drawTool === 'arrow') {
        renderShapesOnCanvas(canvas, shapes, null, {
          type: 'arrow',
          color: drawColor,
          fromX: startPos.x,
          fromY: startPos.y,
          toX: x,
          toY: y
        })
      }
      return
    }

    // C: Hover check for cursor styling
    const shapeUnder = findShapeAtPos(x, y, shapes, ctx)
    setHoveredShapeId(shapeUnder ? shapeUnder.id : null)
  }

  const handleMouseUp = (e) => {
    if (!isDrawingMode) return

    if (isDraggingShape) {
      setIsDraggingShape(false)
      return
    }

    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    // Normalize touch events — on touchend, coordinates are in changedTouches
    let clientX = e.clientX
    let clientY = e.clientY
    if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX
      clientY = e.changedTouches[0].clientY
    } else if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    }
    const { x, y } = getCanvasCoordinates({ clientX, clientY }, canvas)

    if (drawTool === 'circle') {
      const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2))
      if (radius > 4) {
        const newShape = {
          id: `circle-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          type: 'circle',
          color: drawColor,
          cx: startPos.x,
          cy: startPos.y,
          radius
        }
        setShapes(prev => [...prev, newShape])
        setSelectedShapeId(newShape.id)
        setHasDrawing(true)
      } else {
        renderShapesOnCanvas(canvas, shapes, selectedShapeId)
      }
    } else if (drawTool === 'arrow') {
      const dist = Math.hypot(x - startPos.x, y - startPos.y)
      if (dist > 6) {
        const newShape = {
          id: `arrow-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          type: 'arrow',
          color: drawColor,
          fromX: startPos.x,
          fromY: startPos.y,
          toX: x,
          toY: y
        }
        setShapes(prev => [...prev, newShape])
        setSelectedShapeId(newShape.id)
        setHasDrawing(true)
      } else {
        renderShapesOnCanvas(canvas, shapes, selectedShapeId)
      }
    } else if (drawTool === 'pen') {
      if (currentPenPointsRef.current.length > 1) {
        const newShape = {
          id: `pen-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          type: 'pen',
          color: drawColor,
          points: [...currentPenPointsRef.current]
        }
        setShapes(prev => [...prev, newShape])
        setSelectedShapeId(newShape.id)
        setHasDrawing(true)
      } else {
        renderShapesOnCanvas(canvas, shapes, selectedShapeId)
      }
      currentPenPointsRef.current = []
    }

    setIsDrawing(false)
  }

  // Video event handlers
  const handlePlayPause = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      const playPromise = videoRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Video play prevented or source issue:', err)
          setIsPlaying(false)
        })
      }
    }
  }

  // Fullscreen Handler — iOS Safari doesn't support requestFullscreen API at all.
  // We detect it and use CSS fallback (isFullscreen state) for all mobile, and try native API on desktop.
  const isMobileSafari = typeof navigator !== 'undefined' &&
    /iP(ad|hone|od)/.test(navigator.userAgent) &&
    !window.MSStream

  const toggleFullscreen = () => {
    if (isFullscreen) {
      // Exit fullscreen
      setIsFullscreen(false)
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {})
      } else if (document.webkitFullscreenElement && document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
      }
      return
    }

    // Enter fullscreen
    const el = playerContainerRef.current
    if (!el) { setIsFullscreen(true); return }

    if (isMobileSafari) {
      // iOS Safari: only CSS fullscreen works
      setIsFullscreen(true)
      return
    }

    // Desktop / Android Chrome: try native fullscreen, fall back to CSS
    const requestFn = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen
    if (requestFn) {
      requestFn.call(el).then(() => {
        setIsFullscreen(true)
      }).catch(() => {
        // Native failed (e.g. user gesture timeout), use CSS
        setIsFullscreen(true)
      })
    } else {
      setIsFullscreen(true)
    }
  }

  // Sync isFullscreen state when user presses Esc on desktop
  useEffect(() => {
    const handleFsChange = () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        setIsFullscreen(false)
      }
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    document.addEventListener('webkitfullscreenchange', handleFsChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange)
      document.removeEventListener('webkitfullscreenchange', handleFsChange)
    }
  }, [])

  // Frame Snapshot Capture (PNG 📸)
  const handleCaptureSnapshot = useCallback((targetTime = null, targetDrawing = null) => {
    const video = videoRef.current
    if (!video) return

    playCopy()

    const vWidth = video.videoWidth || 1920
    const vHeight = video.videoHeight || 1080
    const offCanvas = document.createElement('canvas')
    offCanvas.width = vWidth
    offCanvas.height = vHeight
    const ctx = offCanvas.getContext('2d')

    // Draw current video frame
    try {
      ctx.drawImage(video, 0, 0, vWidth, vHeight)
    } catch (err) {
      console.warn('Video snapshot draw error:', err)
    }

    const timeForFilename = targetTime !== null ? targetTime : currentTime
    const finishDownload = (canvasObj) => {
      try {
        const dataUrl = canvasObj.toDataURL('image/png')
        const link = document.createElement('a')
        const timeStr = formatTime(timeForFilename).replace(':', '-')
        link.download = `CutSync_${currentProject.title || 'Video'}_Frame_${timeStr}.png`
        link.href = dataUrl
        link.click()
        showToast('תמונת הפריים הורדה בהצלחה! 📸', 'success')
      } catch (e) {
        showToast('הורדת תמונת הפריים הצליחה! 📸', 'success')
      }
    }

    const drawingSource = targetDrawing || activeDrawingImage || (hasDrawing && canvasRef.current ? canvasRef.current : null)

    if (drawingSource) {
      if (typeof drawingSource === 'string') {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          ctx.drawImage(img, 0, 0, vWidth, vHeight)
          finishDownload(offCanvas)
        }
        img.onerror = () => finishDownload(offCanvas)
        img.src = drawingSource
        return
      } else if (drawingSource instanceof HTMLCanvasElement) {
        ctx.drawImage(drawingSource, 0, 0, vWidth, vHeight)
        finishDownload(offCanvas)
        return
      }
    }

    finishDownload(offCanvas)
  }, [currentProject, currentTime, activeDrawingImage, hasDrawing, showToast])

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
      if (tag === 'input' || tag === 'textarea' || e.target?.isContentEditable) return

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        toggleFullscreen()
      } else if (e.key === 'Escape') {
        if (showFullscreenDrawer) {
          e.preventDefault()
          setShowFullscreenDrawer(false)
        }
        setShowShortcutsModal(false)
      } else if (e.key === ' ' || e.key === 'k' || e.key === 'K') {
        e.preventDefault()
        handlePlayPause()
      } else if (e.key === 'j' || e.key === 'J') {
        e.preventDefault()
        stepTime(-1)
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault()
        stepTime(1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        stepTime(-0.04)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        stepTime(0.04)
      } else if (e.key === 'm' || e.key === 'M' || e.key === 'c' || e.key === 'C') {
        e.preventDefault()
        if (videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause()
          setIsPlaying(false)
        }
        commentTextareaRef.current?.focus()
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault()
        handleCaptureSnapshot(currentTime, hasDrawing ? canvasRef.current : null)
      } else if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault()
        setShowShortcutsModal((prev) => !prev)
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [showFullscreenDrawer, isPlaying, currentTime, duration, hasDrawing, handleCaptureSnapshot])

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
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Immediately show the video locally for instant editing experience
    const localUrl = URL.createObjectURL(file)
    const title = file.name.replace(/\.[^/.]+$/, '')
    
    setVersions((prev) =>
      prev.map((v) => (v.id === activeVersionId ? { ...v, videoSrc: localUrl, videoTitle: title } : v))
    )
    setCurrentTime(0)
    clearCanvas()
    setVideoLoadError(false)

    // Upload to cloud in the background
    showToast('הסרטון מוצג מקומית, ומועלה לענן ברקע כדי שהלקוח יוכל לצפות... ⏳', 'info')
    try {
      const cloudUrl = await uploadVideoToStorage(file)
      // Update the version with the persistent cloud URL
      setVersions((prev) =>
        prev.map((v) => (v.id === activeVersionId ? { ...v, videoSrc: cloudUrl } : v))
      )
      showToast('הסרטון הועלה לענן בהצלחה! 🚀', 'success')
    } catch (err) {
      console.warn('[CutSync] Cloud storage upload failed:', err)
      showToast(`העלאה לענן נכשלה: ${err.message || 'שגיאה לא ידועה'}. הסרטון מוצג מקומית בלבד.`, 'warning')
    }
  }

  // Upload NEW Version (creates V2, V3, etc.)
  const handleUploadNewVersion = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Immediately show the video locally for instant editing experience
    const localUrl = URL.createObjectURL(file)
    const title = file.name.replace(/\.[^/.]+$/, '')
    const newNumber = versions.length + 1
    const newId = generateUUID()

    const newVersion = {
      id: newId,
      number: newNumber,
      name: `גרסה ${newNumber} (V${newNumber})`,
      videoSrc: localUrl,
      videoTitle: title,
      createdAt: new Date().toISOString(),
      comments: [],
      approved: false,
      approvedAt: null,
      approvedBy: null,
      approvalNote: null,
      reopenRequested: false,
      reopenRequestedAt: null,
      reopenRequestedBy: null,
      reopenRequestReason: null
    }

    setVersions((prev) => [...prev, newVersion])
    switchVersion(newId)
    setVideoLoadError(false)

    if (fileInputNewVersionRef.current) {
      fileInputNewVersionRef.current.value = ''
    }

    // Upload to cloud in the background
    showToast('הגרסה מוצגת מקומית, ומועלת לענן ברקע... ⏳', 'info')
    try {
      const cloudUrl = await uploadVideoToStorage(file)
      setVersions((prev) =>
        prev.map((v) => (v.id === newId ? { ...v, videoSrc: cloudUrl } : v))
      )
      showToast('הגרסה החדשה הועלתה לענן בהצלחה! 🚀', 'success')
    } catch (err) {
      console.warn('[CutSync] Cloud storage upload failed:', err)
      showToast(`העלאה לענן נכשלה: ${err.message || 'שגיאה לא ידועה'}. הגרסה מוצגת מקומית בלבד.`, 'warning')
    }
  }

  // Version Approval Handlers
  const handleApproveVersion = (versionId, approver = 'הלקוח', note = '') => {
    const timestamp = new Date().toISOString()
    setVersions((prev) =>
      prev.map((v) => {
        if (v.id === versionId) {
          return {
            ...v,
            approved: true,
            approvedAt: timestamp,
            approvedBy: approver,
            approvalNote: note,
            reopenRequested: false,
            reopenRequestedAt: null,
            reopenRequestedBy: null,
            reopenRequestReason: null
          }
        }
        return v
      })
    )
    playCelebration()
    setShowConfetti(true)
    setShowCelebration(true)
    showToast('הגרסה אושרה בהצלחה! איזה כיף! 🎉', 'success')
  }

  // Editor requests client permission to reopen
  const handleEditorRequestReopen = (versionId, reason = '') => {
    const timestamp = new Date().toISOString()
    setVersions((prev) =>
      prev.map((v) => {
        if (v.id === versionId) {
          return {
            ...v,
            reopenRequested: true,
            reopenRequestedAt: timestamp,
            reopenRequestedBy: 'עורך',
            reopenRequestReason: reason
          }
        }
        return v
      })
    )
    setShowEditorReopenModal(false)
    setEditorReopenReason('')
    setDismissedReopenModalVersionId(null)
    showToast('נשלחה בקשת פתיחה מחדש ללקוח! הודעה הוצגה במסך הלקוח לאישורו.', 'info')
  }

  // Editor cancels the reopen request
  const handleCancelReopenRequest = (versionId) => {
    setVersions((prev) =>
      prev.map((v) => {
        if (v.id === versionId) {
          return {
            ...v,
            reopenRequested: false,
            reopenRequestedAt: null,
            reopenRequestedBy: null,
            reopenRequestReason: null
          }
        }
        return v
      })
    )
    showToast('בקשת הפתיחה מחדש בוטלה.', 'info')
  }

  // Client approves the editor's request to reopen
  const handleClientApproveReopen = (versionId) => {
    setVersions((prev) =>
      prev.map((v) => {
        if (v.id === versionId) {
          return {
            ...v,
            approved: false,
            approvedAt: null,
            approvedBy: null,
            approvalNote: null,
            reopenRequested: false,
            reopenRequestedAt: null,
            reopenRequestedBy: null,
            reopenRequestReason: null
          }
        }
        return v
      })
    )
    setDismissedReopenModalVersionId(null)
    showToast('הגרסה נפתחה מחדש לתיקונים לבקשת העורך! 🔓', 'success')
  }

  // Client rejects the editor's request to reopen
  const handleClientRejectReopen = (versionId) => {
    setVersions((prev) =>
      prev.map((v) => {
        if (v.id === versionId) {
          return {
            ...v,
            reopenRequested: false,
            reopenRequestedAt: null,
            reopenRequestedBy: null,
            reopenRequestReason: null
          }
        }
        return v
      })
    )
    setDismissedReopenModalVersionId(null)
    showToast('הבקשה לפתיחה מחדש נדחתה. הגרסה נשארה מאושרת סופית ✅', 'info')
  }

  // Client self-reopens directly
  const handleClientSelfReopen = (versionId) => {
    if (window.confirm('האם אתה בטוח שברצונך לבטל את האישור שלך ולפתוח את הגרסה מחדש להערות נוספות?')) {
      setVersions((prev) =>
        prev.map((v) => {
          if (v.id === versionId) {
            return {
              ...v,
              approved: false,
              approvedAt: null,
              approvedBy: null,
              approvalNote: null,
              reopenRequested: false,
              reopenRequestedAt: null,
              reopenRequestedBy: null,
              reopenRequestReason: null
            }
          }
          return v
        })
      )
      setDismissedReopenModalVersionId(null)
      showToast('הגרסה נפתחה מחדש להערות. 🔓', 'info')
    }
  }

  const notifyClientReopenRequestViaWhatsApp = () => {
    let msg = `🔔 *היי ${currentVersion.approvedBy || 'הלקוח'}, שלחתי במערכת CutSync בקשה לפתיחה מחדש של ${currentVersion.name}* (${videoTitle}).\n`
    if (currentVersion.reopenRequestReason) {
      msg += `💬 *סיבת הבקשה:* "${currentVersion.reopenRequestReason}"\n`
    }
    msg += `\nאשמח שתיכנס למערכת כדי לאשר את פתיחת הגרסה מחדש כדי שאוכל להמשיך לעדכן 🎬✨\nנשלח מ-CutSync`
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const notifyClientApprovedViaWhatsApp = () => {
    let msg = `🎉 *היי, צפיתי בסרטון (${videoTitle} - ${currentVersion.name}) והכל מושלם!* \n`
    msg += `✅ הגרסה מאושרת סופית לסגירה ורנדור ע"י ${currentVersion.approvedBy || 'הלקוח'}.\n`
    if (currentVersion.approvalNote) {
      msg += `💬 הערה: "${currentVersion.approvalNote}"\n`
    }
    msg += `\nתודה רבה! 🚀✨\nנשלח דרך CutSync`
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank')
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
      renderShapesOnCanvas(canvasRef.current, shapes, null)
      drawingData = canvasRef.current.toDataURL()
    }

    const newComment = {
      id: generateUUID(),
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

    playPop()
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
    updateActiveVersionComments((prev) => {
      const updated = prev.map((c) => {
        if (c.id === id) {
          const nextCompleted = !c.completed
          if (nextCompleted) {
            playCheck()
          } else {
            playPop()
          }
          return { ...c, completed: nextCompleted }
        }
        return c
      })

      // Dopamine Milestone: When all tasks reach 100% completion!
      const allDone = updated.length > 0 && updated.every((c) => c.completed)
      if (allDone) {
        setTimeout(() => {
          playCelebration()
          setShowConfetti(true)
          showToast('🏆 מדהים! כל התיקונים בגרסה זו הושלמו בהצלחה!', 'success')
        }, 180)
      }

      return updated
    })
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
    if (currentVersion.approved) {
      msg += `✅ *סטטוס: הגרסה אושרה סופית ע"י ${currentVersion.approvedBy || 'הלקוח'}!* (${formatReplyTime(currentVersion.approvedAt)})\n`
      if (currentVersion.approvalNote) {
        msg += `💬 הערת אישור: "${currentVersion.approvalNote}"\n`
      }
    }
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

  const copyClientShareLink = () => {
    const url = `${window.location.origin}/?view=client`
    navigator.clipboard.writeText(url)
    showToast('הועתק קישור שיתוף ישיר ונקי ללקוח! 🔗', 'success')
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

  // Show loading screen while Supabase checks for existing session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0b0e17] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-900/50 animate-pulse">
            <Scissors className="w-7 h-7 text-white" />
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <svg className="w-4 h-4 animate-spin text-indigo-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <span>טוען סביבת עבודה...</span>
          </div>
        </div>
      </div>
    )
  }

  // Render Landing Page (HOME) when currentView === 'home'
  if (currentView === 'home') {
    return (
      <>
        <LandingPage
          currentUser={currentUser}
          onOpenAuthModal={(initialTab = 'login') => {
            setAuthModalInitialTab(initialTab)
            setShowAuthModal(true)
          }}
          onLogout={handleLogout}
          onEnterStudio={(target = 'editor') => {
            if (target === 'client') {
              setMode('client')
              setCurrentView('studio')
            } else {
              if (!currentUser) {
                setAuthModalInitialTab('login')
                setShowAuthModal(true)
              } else {
                setCurrentView('dashboard')
              }
            }
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        />

        {/* Global Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          initialTab={authModalInitialTab}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />

        {/* Global Toast Notification */}
        {toast && (
          <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
            toast.type === 'success'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-950/80'
              : toast.type === 'warning'
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-amber-950/80'
              : 'bg-gradient-to-r from-[#1b2336] to-[#25324e] text-white border border-[#3b4b72] shadow-blue-950/80'
          }`}>
            <span className="text-lg">
              {toast.type === 'success' ? '✅' : toast.type === 'warning' ? '⚠️' : '🔔'}
            </span>
            <div className="text-xs font-medium">
              {toast.message}
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-white/70 hover:text-white text-xs mr-2"
            >
              ✕
            </button>
          </div>
        )}
      </>
    )
  }

  // Render Projects Dashboard when currentView === 'dashboard'
  if (currentView === 'dashboard') {
    // Guard: not authenticated → back to home
    if (!currentUser) {
      setCurrentView('home')
      return null
    }
    return (
      <>
        <ProjectsDashboard
          projects={projects}
          currentUser={currentUser}
          onOpenAuthModal={(initialTab = 'login') => {
            setAuthModalInitialTab(initialTab)
            setShowAuthModal(true)
          }}
          onLogout={handleLogout}
          onOpenStudio={(projId) => {
            setActiveProjectId(projId)
            setMode('editor')
            setCurrentView('studio')
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          onOpenNewProjectModal={() => setShowNewProjectModal(true)}
          onNavigateHome={() => {
            setCurrentView('home')
            window.history.pushState({}, '', window.location.pathname)
          }}
          onCopyClientLink={(projId) => copySpecificClientLink(projId)}
          onDeleteProject={(projId) => handleDeleteProject(projId)}
          onUpdateProject={handleUpdateProject}
        />

        <NewProjectModal
          isOpen={showNewProjectModal}
          onClose={() => setShowNewProjectModal(false)}
          onCreateProject={handleCreateProject}
        />

        {/* Global Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          initialTab={authModalInitialTab}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />

        {/* Global Toast Notification */}
        {toast && (
          <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
            toast.type === 'success'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-950/80'
              : toast.type === 'warning'
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-amber-950/80'
              : 'bg-gradient-to-r from-[#1b2336] to-[#25324e] text-white border border-[#3b4b72] shadow-blue-950/80'
          }`}>
            <span className="text-lg">
              {toast.type === 'success' ? '✅' : toast.type === 'warning' ? '⚠️' : '🔔'}
            </span>
            <div className="text-xs font-medium">
              {toast.message}
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-white/70 hover:text-white text-xs mr-2"
            >
              ✕
            </button>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="min-h-screen bg-[#0b0e17] text-gray-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-purple-500/30 selection:text-purple-200">
      {/* Warm ambient background lighting (Subtle atmospheric depth, removes robotic sterility) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[15%] w-[480px] h-[480px] rounded-full bg-purple-600/[0.07] blur-[130px]" />
        <div className="absolute top-[25%] left-[-8%] w-[420px] h-[420px] rounded-full bg-indigo-600/[0.06] blur-[140px]" />
        <div className="absolute bottom-[10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-emerald-600/[0.04] blur-[150px]" />
      </div>

      {/* Top Navigation */}
      <header className="border-b border-white/[0.08] bg-[#10131e]/85 backdrop-blur-xl px-2 lg:px-8 py-2 sm:py-3 sticky top-0 z-40 transition-colors shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
          
          {/* Right Side: Navigation & Identity */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            {/* CutSync Home Logo - Click to go back */}
            <div
              className={`flex items-center gap-2 select-none ${isDirectClientLink ? 'cursor-default' : 'cursor-pointer'} transition-transform active:scale-95`}
              onClick={() => {
                if (!isDirectClientLink) {
                  if (mode === 'editor') setCurrentView('dashboard')
                  else setCurrentView('home')
                }
              }}
              title={isDirectClientLink ? currentProject.title : (mode === 'editor' ? "חזור לדשבורד" : "דף הבית")}
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-900/30 flex-shrink-0">
                <Scissors className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Separator */}
            <div className="w-px h-6 bg-[#232d44] hidden sm:block"></div>

            {/* Project Title */}
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-normal text-white truncate max-w-[150px] sm:max-w-[200px]">{currentProject.title}</h1>
              {mode === 'editor' && !isDirectClientLink && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setProjectToEditInStudio(currentProject)
                  }}
                  className="p-1 rounded-md text-gray-400 hover:text-purple-300 hover:bg-[#1a2337] transition-all cursor-pointer"
                  title="ערוך שם פרויקט ולקוח"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Role Badge */}
            {mode === 'editor' ? (
              <span className="hidden md:inline-block px-2.5 py-0.5 text-[10px] font-semibold rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                סטודיו עריכה 🎬
              </span>
            ) : (
              <span className="hidden md:inline-block px-2.5 py-0.5 text-[10px] font-semibold rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                מרחב משוב 👤
              </span>
            )}
          </div>

          {/* Left Side: Avatar & Sound */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Sound FX Toggle */}
            <button
              onClick={handleToggleSound}
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                soundOn
                  ? 'bg-purple-500/20 border-purple-500/40 text-purple-300 hover:bg-purple-500/30 shadow-sm'
                  : 'bg-[#161a28]/80 border-white/[0.08] text-gray-500 hover:text-gray-300'
              }`}
              title={soundOn ? 'צלילי משוב פעילים 🔊 (לחץ להשתקה)' : 'צלילי משוב מושתקים 🔇 (לחץ להפעלה)'}
            >
              {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* User Avatar */}
            {currentUser && (
              <div
                onClick={() => {
                  setAuthModalInitialTab('login')
                  setShowAuthModal(true)
                }}
                className="flex items-center gap-2 px-1 sm:px-2.5 py-1 rounded-full bg-[#141826] border border-white/[0.08] cursor-pointer hover:border-purple-500/50 transition-all"
                title="לחץ להחלפת משתמש"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
                />
                <span className="hidden lg:inline text-[11px] font-semibold text-gray-200 truncate max-w-[100px]">
                  {currentUser.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Client Personalized Welcome Banner */}
      {mode === 'client' ? (
        <div className="bg-gradient-to-r from-purple-950/30 via-[#131726]/60 to-indigo-950/30 border-b border-purple-500/20 px-4 py-3 text-xs text-purple-200/90">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 relative flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="leading-relaxed">
                שלום <strong>{currentProject.clientName || 'שותף יקר'}</strong> 👋 הגרסה החדשה של <strong>"{currentProject.title}"</strong> מוכנה לצפייה! צפה בכיף, עצור בכל נקודה כדי להשאיר הערה, לצייר על המסך או להקליט. בסיום אשר את הגרסה בקליק.
              </span>
            </div>
            <span className="text-[11px] text-purple-300 font-semibold bg-purple-500/15 px-3 py-1 rounded-full border border-purple-400/25 hidden md:inline flex-shrink-0">
              ✨ צפייה ומשוב ללקוח
            </span>
          </div>
        </div>
      ) : (
        /* Mode Guidance Banner for Editor */
        <div className="bg-gradient-to-r from-indigo-950/30 via-[#121626]/60 to-purple-950/30 border-b border-indigo-500/20 px-4 py-2.5 text-xs text-indigo-200/90">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 flex-shrink-0"></span>
              <span className="leading-relaxed">
                <strong>סטודיו עריכה:</strong> פרויקט <strong>"{currentProject.title}"</strong>. כל ההערות והסימונים של הלקוח מסונכרנים כאן לפי פריים. שיהיה סשן עריכה נעים! 🎬
              </span>
            </div>
            <span className="text-[11px] text-indigo-300 font-semibold bg-indigo-500/15 px-3 py-0.5 rounded-full border border-indigo-400/25 hidden sm:inline whitespace-nowrap">
              {completedCount === comments.length && comments.length > 0 ? '✨ כל המשימות הושלמו!' : `הושלמו ${completedCount} מתוך ${comments.length}`}
            </span>
          </div>
        </div>
      )}

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Section: Video Player & Timeline (7 cols) */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Version Stacking Switcher Bar */}
          <div className="bg-[#121624]/90 backdrop-blur-md p-3 rounded-2xl border border-white/[0.07] shadow-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto py-0.5">
              <div className="flex items-center gap-1.5 text-xs text-gray-300 font-semibold px-1 select-none">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>גרסאות סרטון:</span>
              </div>
              <div className="flex items-center gap-2">
                {versions.map((ver) => {
                  const isActive = ver.id === activeVersionId
                  const verTotal = ver.comments ? ver.comments.length : 0
                  return (
                    <button
                      key={ver.id}
                      onClick={() => switchVersion(ver.id)}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-950/40 ring-2 ring-purple-400/40 scale-[1.02]'
                          : 'bg-[#171b29]/80 text-gray-300 hover:text-white hover:bg-[#202538] border border-white/[0.06]'
                      }`}
                    >
                      <span>{ver.name}</span>
                      {ver.approved ? (
                        ver.reopenRequested ? (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 animate-pulse">
                            <Bell className="w-2.5 h-2.5" />
                            ממתין לפתיחה
                          </span>
                        ) : (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            ✓ מאושרת
                          </span>
                        )
                      ) : (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          isActive ? 'bg-purple-950/60 text-purple-200' : 'bg-[#121520] text-gray-400'
                        }`}>
                          {verTotal} {verTotal === 1 ? 'הערה' : 'הערות'}
                        </span>
                      )}
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="גרסה פעילה"></span>
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
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="video/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1e2538] hover:bg-[#27324c] border border-white/5 text-gray-300 hover:text-white text-xs font-semibold transition-all"
                  title="החלף את הסרטון בגרסה הנוכחית"
                >
                  <Upload className="w-3.5 h-3.5 text-gray-400" />
                  <span className="hidden sm:inline">החלף סרטון נוכחי</span>
                </button>

                <input
                  type="file"
                  ref={fileInputNewVersionRef}
                  onChange={handleUploadNewVersion}
                  accept="video/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputNewVersionRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 border border-purple-500/35 text-purple-200 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
                  title="העלה סרטון מתוקן חדש (V2, V3...)"
                >
                  <Plus className="w-3.5 h-3.5 text-purple-400" />
                  <span>גרסה חדשה (V{versions.length + 1})</span>
                </button>
              </div>
            )}
          </div>

          {/* Video Header Card & Player Container */}
          <div
            ref={playerContainerRef}
            className={`bg-[#111420] transition-all overflow-hidden relative select-none ${
              isFullscreen
                ? 'fixed inset-0 z-50 rounded-none border-none flex flex-col justify-between w-full h-[100dvh] bg-[#080a10]'
                : 'rounded-3xl border border-white/[0.08] shadow-2xl shadow-black/70'
            }`}
          >
            {/* Title Bar */}
            <div className="px-4 py-3 bg-[#151926]/95 border-b border-white/[0.07] flex items-center justify-between text-xs text-gray-300 z-10 flex-shrink-0">
              <div className="flex items-center gap-2 font-medium truncate">
                <Video className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span className="truncate text-gray-200">{videoTitle} — <strong className="text-purple-300 font-bold">{currentVersion.name}</strong></span>
                {currentVersion.approved && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 flex-shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>אושר ע"י {currentVersion.approvedBy || 'הלקוח'} ✨</span>
                  </span>
                )}
                {currentVersion.approved && currentVersion.reopenRequested && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 flex-shrink-0 animate-pulse">
                    <Bell className="w-3 h-3 text-amber-400" />
                    <span>העורך ביקש לפתוח מחדש</span>
                  </span>
                )}
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
                playsInline
                webkit-playsinline="true"
                onPlay={() => {
                  setIsPlaying(true)
                  if (!hasDrawing) clearCanvas()
                }}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onError={(e) => {
                  console.warn('[CutSync] Video playback error:', videoSrc, e)
                  setVideoLoadError(true)
                }}
                onClick={() => {
                  if (!isDrawingMode) handlePlayPause()
                }}
                className="w-full h-full object-contain cursor-pointer"
              />

              {/* Empty / Error State Overlay */}
              {(!videoSrc || videoLoadError) && (
                <div className="absolute inset-0 bg-[#0c101a]/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center z-40 gap-6 text-white overflow-hidden">
                  
                  {/* Glow effect */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

                  {/* Icon & Title */}
                  <div className="flex flex-col items-center gap-4 relative z-10">
                    <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-tr from-purple-600/20 to-indigo-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-2 shadow-2xl shadow-purple-900/30">
                      {videoLoadError && videoSrc ? (
                        <AlertCircle className="w-10 h-10 text-amber-400" />
                      ) : (
                        <Sparkles className="w-10 h-10" />
                      )}
                    </div>
                    {videoLoadError && videoSrc ? (
                      <h3 className="text-2xl font-extrabold text-white tracking-tight">אופס, הסרטון הזה לא זמין כרגע 🙈</h3>
                    ) : (
                      <h3 className="text-2xl font-extrabold text-white tracking-tight">בואו נתחיל לעבוד! 🎬</h3>
                    )}
                    
                    {mode === 'editor' ? (
                      <p className="text-sm text-gray-300 max-w-[420px] leading-relaxed">
                        {videoLoadError && videoSrc 
                          ? 'נראה שהקישור שבור, פג תוקף, או שהסרטון נשמר זמנית ונמחק ברענון הדף. בחר סרטון חדש כדי להמשיך לעבוד על הפרויקט.'
                          : 'העלה סרטון למערכת, קבל קישור מהיר ללקוח, ותתחיל לאסוף הערות לתיקונים בצורה חכמה ומסודרת.'}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-300 max-w-md leading-relaxed">
                        הסרטון לא זמין כרגע. אנא פנה לעורך הסרטון כדי לקבל קישור מעודכן.
                      </p>
                    )}
                  </div>

                  {/* Actions for Editor */}
                  {mode === 'editor' && (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4 relative z-10 w-full sm:w-auto">
                      
                      {/* Upload Button */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="group relative flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-xl shadow-purple-900/40 w-full sm:w-auto justify-center overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                        <Upload className="w-5 h-5 relative z-10" />
                        <span className="relative z-10">העלה סרטון מהמחשב</span>
                      </button>

                      {/* Add URL Button */}
                      <button
                        type="button"
                        onClick={() => {
                          const url = window.prompt('הדבק כאן קישור ישיר לסרטון (MP4 URL):', '')
                          if (url?.trim()) {
                            setVersions((prev) =>
                              prev.map((v) => (v.id === activeVersionId ? { ...v, videoSrc: url.trim() } : v))
                            )
                            setVideoLoadError(false)
                          }
                        }}
                        className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#1e2538] hover:bg-[#27324c] border border-white/5 hover:border-white/10 text-sm font-semibold text-gray-200 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto justify-center"
                      >
                        <Link2 className="w-5 h-5 text-indigo-400" />
                        <span>קישור ישיר (URL)</span>
                      </button>

                      {/* Sample Video Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setVersions((prev) =>
                            prev.map((v) => (v.id === activeVersionId ? { ...v, videoSrc: DEFAULT_VIDEO } : v))
                          )
                          setVideoLoadError(false)
                        }}
                        className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#131723] hover:bg-[#1a2133] border border-[#2b334a] hover:border-[#384260] text-sm font-semibold text-gray-400 hover:text-gray-200 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto justify-center"
                      >
                        <Film className="w-5 h-5" />
                        <span>סרטון דוגמה</span>
                      </button>

                    </div>
                  )}
                </div>
              )}

              {/* Overlay Canvas for Visual Annotations */}
              <canvas
                ref={canvasRef}
                width={960}
                height={540}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={(e) => {
                  if (e.touches && e.touches.length > 0) {
                    const touch = e.touches[0]
                    handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY })
                  }
                }}
                onTouchMove={(e) => {
                  // Prevent scrolling while drawing!
                  if (isDrawingMode && drawTool !== 'select') {
                    e.preventDefault()
                  }
                  if (e.touches && e.touches.length > 0) {
                    const touch = e.touches[0]
                    handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY })
                  }
                }}
                onTouchEnd={(e) => {
                  handleMouseUp(e)
                }}
                className={`absolute inset-0 w-full h-full object-contain ${
                  isDrawingMode
                    ? isDraggingShape || hoveredShapeId
                      ? 'cursor-move z-30 pointer-events-auto bg-black/10 touch-none'
                      : drawTool === 'select'
                      ? 'cursor-default z-30 pointer-events-auto bg-black/10 touch-none'
                      : drawTool === 'text'
                      ? 'cursor-text z-30 pointer-events-auto bg-black/10 touch-none'
                      : 'cursor-crosshair z-30 pointer-events-auto bg-black/10 touch-none'
                    : hasDrawing
                    ? 'z-20 pointer-events-none'
                    : 'pointer-events-none'
                }`}
              />

              {/* Floating interactive text input overlay when using Text Tool */}
              {textInputState && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${textInputState.pctX}%`,
                    top: `${textInputState.pctY}%`,
                    borderColor: drawColor,
                    transform: 'translate(-10%, -50%)',
                    zIndex: 40
                  }}
                  className="bg-[#0f1422]/95 backdrop-blur-md border-2 rounded-xl p-2 shadow-2xl flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                      טקסט
                    </span>
                    <input
                      type="text"
                      autoFocus
                      value={textInputState.text}
                      onChange={(e) => setTextInputState((prev) => ({ ...prev, text: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          commitTextOverlay()
                        } else if (e.key === 'Escape') {
                          e.preventDefault()
                          setTextInputState(null)
                        }
                      }}
                      placeholder="כתוב הערה על הפריים..."
                      className="bg-[#090c15] text-white text-xs px-2.5 py-1.5 rounded-lg border border-[#2b354e] focus:outline-none focus:ring-1 focus:ring-purple-500 min-w-[190px]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={commitTextOverlay}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1"
                    title="אשר והוסף לפריים (Enter)"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>הוסף</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextInputState(null)}
                    className="p-1.5 rounded-lg bg-[#1c2234] hover:bg-[#252e46] text-gray-400 hover:text-white text-xs transition-colors"
                    title="ביטול (Esc)"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

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
            <div
              className="p-3 bg-[#161a28] flex flex-col gap-2"
              style={isFullscreen ? { paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' } : undefined}
            >
              {/* Timeline with Modern Visual Progress & Markers */}
              <div
                className="relative w-full h-6 flex items-center cursor-pointer group select-none"
                onMouseMove={(e) => {
                  if (!duration) return
                  const rect = e.currentTarget.getBoundingClientRect()
                  // RTL: 0 is on the right, 100 is on the left
                  const pct = Math.max(0, Math.min(1, (rect.right - e.clientX) / rect.width))
                  setTimelineHover({
                    percent: pct * 100,
                    time: pct * duration
                  })
                }}
                onMouseLeave={() => setTimelineHover(null)}
              >
                {/* Visual Track Container */}
                <div className="relative w-full h-2 group-hover:h-2.5 bg-[#23293c] rounded-full overflow-hidden transition-all pointer-events-none">
                  {/* Purple-Indigo Progress Fill */}
                  <div
                    className="absolute top-0 h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-purple-600 rounded-full transition-all duration-75"
                    style={{ right: 0, left: 'auto', width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  />
                </div>

                {/* Floating Scrub Head / Playhead Thumb */}
                {duration > 0 && (
                  <div
                    style={{ right: `${(currentTime / duration) * 100}%` }}
                    className="absolute top-1/2 -translate-y-1/2 translate-x-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md shadow-purple-950 border-2 border-purple-600 pointer-events-none transition-transform group-hover:scale-125 z-20"
                  />
                )}

                {/* Hover Timecode Tooltip (like YouTube / Vimeo) */}
                {timelineHover && duration > 0 && (
                  <div
                    style={{ right: `${timelineHover.percent}%` }}
                    className="absolute bottom-7 translate-x-1/2 bg-[#0d101a] border border-[#2f3954] text-white text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg shadow-xl pointer-events-none z-40 whitespace-nowrap animate-in fade-in duration-100"
                  >
                    {formatTime(timelineHover.time)}
                  </div>
                )}

                {/* Interactive Native Range Slider (Transparent overlay for effortless scrubbing/click) */}
                <input
                  type="range"
                  dir="rtl"
                  min="0"
                  max={duration || 100}
                  step="0.05"
                  value={currentTime}
                  onChange={(e) => seekTo(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30 m-0 p-0"
                  title="גרור או לחץ כדי לקפוץ בזמן"
                />

                {/* Visual Comment Markers on Timeline */}
                {duration > 0 &&
                  comments.map((comment) => {
                    const rightPercent = (comment.time / duration) * 100
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
                        style={{ right: `${rightPercent}%` }}
                        className={`absolute top-1/2 -translate-y-1/2 translate-x-1/2 w-3.5 h-3.5 rounded-full z-40 transition-transform ${
                          comment.completed
                            ? 'bg-emerald-400 ring-2 ring-emerald-950'
                            : 'bg-amber-400 ring-2 ring-amber-950 animate-pulse'
                        } hover:scale-150 cursor-pointer shadow-md`}
                      >
                        {/* Tooltip on hover */}
                        {isHovered && (
                          <div dir="rtl" className="absolute bottom-6 right-1/2 translate-x-1/2 bg-[#0c0e17] text-white text-[11px] py-1 px-2.5 rounded-xl shadow-2xl border border-[#2d364e] whitespace-nowrap z-50 pointer-events-none flex items-center gap-1.5">
                            <span className="font-mono text-purple-300 font-bold bg-purple-950/60 px-1.5 py-0.5 rounded">
                              {formatTime(comment.time)}
                            </span>
                            <span className="text-gray-200">
                              {comment.author === 'לקוח' ? '👤 לקוח:' : '🎬 עורך:'}
                            </span>
                            {comment.drawing && '🎨 '}
                            {comment.audio && '🎙️ '}
                            <span className="max-w-[140px] truncate text-gray-300">
                              {comment.text}
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>

              {/* Bottom control bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 px-1">
                {/* Left: Play/Pause and Step buttons */}
                <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handlePlayPause}
                      className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-md shadow-purple-900/40 transition-all active:scale-95"
                      title="רווח (Space) להפעלה/עצירה"
                    >
                      {isPlaying ? <Pause className="w-5 h-5 sm:w-4 sm:h-4" /> : <Play className="w-5 h-5 sm:w-4 sm:h-4 ml-0.5" />}
                    </button>
                    <button
                      onClick={() => stepTime(-1)}
                      className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                      title="שנייה אחורה (J / 1s)"
                    >
                      <RotateCcw className="w-5 h-5 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => stepTime(1)}
                      className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                      title="שנייה קדימה (L / 1s)"
                    >
                      <RotateCw className="w-5 h-5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                  
                  <span className="text-xs sm:text-sm font-mono text-gray-300 font-semibold px-2">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                {/* Right: Playback Speed, Snapshot, Shortcuts, Mute & Fullscreen */}
                <div className="flex items-center justify-end w-full sm:w-auto gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <div className="flex items-center bg-[#181d2a]/80 rounded-xl p-0.5 border border-white/[0.06] text-[11px] flex-shrink-0">
                    {[1, 1.25, 1.5, 2].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => handleSpeedChange(rate)}
                        className={`px-2 py-0.5 rounded-lg transition-all ${
                          playbackRate === rate
                            ? 'bg-purple-600 text-white font-bold shadow-sm'
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>

                  {/* Frame Snapshot Button */}
                  <button
                    type="button"
                    onClick={() => handleCaptureSnapshot(currentTime, hasDrawing ? canvasRef.current : null)}
                    className="p-2 rounded-xl text-gray-400 hover:text-pink-400 hover:bg-white/[0.06] transition-colors cursor-pointer"
                    title="צילום והורדת פריים (S) 📸"
                  >
                    <Camera className="w-4 h-4" />
                  </button>

                  {/* Shortcuts Help Modal Button */}
                  <button
                    type="button"
                    onClick={() => setShowShortcutsModal(true)}
                    className="p-2 rounded-xl text-gray-400 hover:text-purple-300 hover:bg-white/[0.06] transition-colors cursor-pointer"
                    title="קיצורי מקלדת לעורכים (?)"
                  >
                    <Keyboard className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.muted = !isMuted
                        setIsMuted(!isMuted)
                      }
                    }}
                    className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                    title={isMuted ? 'בטל השתקה' : 'השתק'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                    title={isFullscreen ? 'צא ממסך מלא (F / Esc)' : 'מסך מלא אינטראקטיבי (F)'}
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4 text-purple-400" /> : <Maximize className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Drawing Toolbar Toggle & Tools */}
              <div className="pt-2.5 border-t border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      if (!isDrawingMode && videoRef.current && !videoRef.current.paused) {
                        videoRef.current.pause()
                        setIsPlaying(false)
                      }
                      if (isDrawingMode) {
                        setTextInputState(null)
                      }
                      setIsDrawingMode(!isDrawingMode)
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isDrawingMode
                        ? 'bg-amber-400 text-black shadow-md shadow-amber-900/30'
                        : 'bg-[#181d2a]/80 text-gray-300 hover:text-white hover:bg-[#22293c] border border-white/[0.06]'
                    }`}
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>{isDrawingMode ? 'סגור סימון ✕' : 'סמן על גבי הסרטון ✏️'}</span>
                  </button>

                  {isDrawingMode && (
                    <div className="flex items-center gap-1 bg-[#1a1f2e] p-1 rounded-lg border border-[#2b334a]">
                      {/* Tool selection */}
                      <button
                        type="button"
                        onClick={() => {
                          playPop()
                          setDrawTool('select')
                          setTextInputState(null)
                        }}
                        className={`p-1 rounded transition-colors ${drawTool === 'select' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                        title="בחר והזז צורות (Pointer)"
                      >
                        <MousePointer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          playPop()
                          setDrawTool('pen')
                          setTextInputState(null)
                        }}
                        className={`p-1 rounded transition-colors ${drawTool === 'pen' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                        title="עט חופשי"
                      >
                        <PenTool className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          playPop()
                          setDrawTool('circle')
                          setTextInputState(null)
                        }}
                        className={`p-1 rounded transition-colors ${drawTool === 'circle' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                        title="עיגול נמתח"
                      >
                        <Circle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          playPop()
                          setDrawTool('arrow')
                          setTextInputState(null)
                        }}
                        className={`p-1 rounded transition-colors ${drawTool === 'arrow' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                        title="חץ נמתח"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          playPop()
                          setDrawTool('text')
                          setTextInputState(null)
                        }}
                        className={`p-1 rounded transition-colors ${drawTool === 'text' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                        title="טקסט על גבי הפריים"
                      >
                        <Type className="w-3.5 h-3.5" />
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
                            onClick={() => {
                              setDrawColor(c.color)
                              if (selectedShapeId) {
                                setShapes((prev) =>
                                  prev.map((s) => (s.id === selectedShapeId ? { ...s, color: c.color } : s))
                                )
                              }
                            }}
                            style={{ backgroundColor: c.color }}
                            className={`w-3.5 h-3.5 rounded-full transition-transform ${drawColor === c.color ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'}`}
                            title={c.name}
                          />
                        ))}
                      </div>

                      {/* Delete selected shape */}
                      {selectedShapeId && (
                        <button
                          type="button"
                          onClick={deleteSelectedShape}
                          className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                          title="מחק צורה נבחרת (Delete)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Undo last shape */}
                      <button
                        type="button"
                        onClick={undoLastShape}
                        disabled={shapes.length === 0}
                        className="p-1 text-gray-400 hover:text-gray-200 disabled:opacity-30 disabled:pointer-events-none rounded transition-colors"
                        title="בטל צורה אחרונה (Undo)"
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Clear canvas */}
                      <button
                        type="button"
                        onClick={clearCanvas}
                        className="p-1 text-gray-400 hover:text-red-400 rounded transition-colors"
                        title="נקה הכל"
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

          {/* Add Revision Box (Simple & Conversational) */}
          <div className="bg-[#121624]/90 backdrop-blur-md p-5 rounded-3xl border border-white/[0.07] shadow-xl flex flex-col gap-3.5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse"></span>
                <div>
                  <h2 className="text-sm font-bold text-gray-100">
                    {mode === 'client' ? 'מה כדאי לשפר ברגע הזה? 💡' : 'הוספת הערה לפריים ✍️'}
                  </h2>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    עצרת בנקודת הזמן {formatTime(currentTime)} — שתף את המחשבות שלך
                  </p>
                </div>
              </div>

              {/* Simple Clean Time Badge */}
              <div className="flex items-center gap-1.5 bg-[#171b29] text-purple-300 border border-purple-500/30 px-3 py-1.5 rounded-xl text-xs font-mono font-bold shadow-inner flex-shrink-0">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span>פריים: {formatTime(currentTime)}</span>
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
                    className={`text-xs px-3 py-1 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                      selectedCategory === cat.id
                        ? `${cat.color} font-semibold ring-1 ring-white/20 shadow-sm scale-[1.02]`
                        : 'bg-[#171b29]/80 text-gray-400 border-white/[0.06] hover:border-white/[0.15] hover:text-gray-200'
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
                  ref={commentTextareaRef}
                  rows="2"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder={
                    hasDrawing
                      ? 'סימנת על גבי הפריים! הסבר בקצרה מה תרצה שנשנה כאן...'
                      : mode === 'client'
                      ? 'כתוב כאן בחופשיות (למשל: "להגביר קצת את הווליום כאן", "לחתוך שנייה לפני", "להחליף כתובית")...'
                      : 'כתוב מה נדרש לבצע ברגע זה בפרמייר...'
                  }
                  className="w-full bg-[#161a28] border border-white/[0.08] focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 rounded-2xl p-3.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none resize-none leading-relaxed transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleAddComment()
                    }
                  }}
                />
              </div>

              {/* Voice Note Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-[#161a28]/70 p-2.5 rounded-2xl border border-white/[0.06]">
                <div className="flex items-center gap-2">
                  {!isRecording && !recordedAudioData && (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Mic className="w-3.5 h-3.5 text-red-400" />
                      <span>הקלט הודעה קולית 🎙️</span>
                    </button>
                  )}

                  {isRecording && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 bg-red-950/70 text-red-300 border border-red-500/50 px-3 py-1.5 rounded-xl text-xs font-mono font-bold animate-pulse">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                        <span>מקליט... {formatTime(recordingDuration)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md shadow-red-950/40 cursor-pointer"
                      >
                        <Square className="w-3 h-3 fill-current" />
                        <span>סיים</span>
                      </button>
                      <button
                        type="button"
                        onClick={cancelRecording}
                        className="text-xs text-gray-400 hover:text-gray-200 px-2 py-1 cursor-pointer"
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
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 bg-[#1e2436] hover:bg-red-950/40 px-2.5 py-1.5 rounded-xl border border-white/[0.08] transition-colors cursor-pointer"
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
                  <span>סמן כדחוף לטיפול 🔥</span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  disabled={!newCommentText.trim() && !recordedAudioData}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg shadow-purple-900/40 transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{mode === 'client' ? 'שלח הערה לפריים ✨' : 'הוסף משימה לפריים ✨'}</span>
                </button>
              </div>
            </form>
          </div>

        </section>

        {/* Right Section: Interactive Checklist (5 cols) */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Quick Actions Bar for Editor/Client */}
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {mode === 'editor' && (
              <>
                <button
                  onClick={() => copySpecificClientLink(currentProject.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1e2538] hover:bg-[#27324c] border border-white/5 text-xs text-emerald-300 font-semibold transition-all shadow-sm"
                  title="העתק קישור סקירה ישיר ונקי לשליחה ללקוח זה"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>העתק קישור ללקוח</span>
                </button>
                <button
                  onClick={exportPremiereCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1e2538] hover:bg-[#27324c] border border-white/5 text-xs text-indigo-300 font-semibold transition-all shadow-sm"
                  title="ייצא קובץ מרקרים שנטען ישירות בפרמייר"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>מרקרים ל-Premiere</span>
                </button>
              </>
            )}
            <button
              onClick={shareViaWhatsApp}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all ${
                mode === 'client' 
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40' 
                  : 'bg-[#1e2538] hover:bg-[#27324c] border border-white/5 text-gray-300 hover:text-white'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{mode === 'client' ? `סיימתי להעיר! (${comments.length})` : 'שתף סיכום בוואטסאפ'}</span>
            </button>
          </div>

          {/* Header Card with Progress */}
          <div className="bg-[#121624]/90 backdrop-blur-md p-5 rounded-3xl border border-white/[0.07] shadow-xl">
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 xl:gap-2 mb-3.5">
              <div>
                <h2 className="text-base font-bold text-gray-100 flex items-center gap-2">
                  <span>{mode === 'client' ? 'ההערות והבקשות שלך 💬' : 'משימות לביצוע בפרמייר 🎬'}</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${
                    mode === 'client'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                  }`}>
                    {comments.length}
                  </span>
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  {mode === 'client'
                    ? 'לחיצה על כל הערה תקפיץ אותך לפריים המדויק בוידאו'
                    : `נשארו עוד ${comments.length - completedCount} משימות פתוחות לביצוע`}
                </p>
              </div>

              {/* Quick Filter tabs */}
              <div className="flex items-center bg-[#171b29] p-1 rounded-xl border border-white/[0.06] text-xs">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    activeFilter === 'all'
                      ? mode === 'client' ? 'bg-purple-600 text-white font-semibold shadow-sm' : 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  הכל ({comments.length})
                </button>
                <button
                  onClick={() => setActiveFilter('pending')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    activeFilter === 'pending'
                      ? mode === 'client' ? 'bg-purple-600 text-white font-semibold shadow-sm' : 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {mode === 'client' ? 'ממתין ⏳' : 'פתוח ⏳'} ({comments.length - completedCount})
                </button>
                <button
                  onClick={() => setActiveFilter('completed')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    activeFilter === 'completed'
                      ? mode === 'client' ? 'bg-purple-600 text-white font-semibold shadow-sm' : 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {mode === 'client' ? 'תוקן ✨' : 'בוצע ✨'} ({completedCount})
                </button>
              </div>
            </div>

            {/* Progress bar with Dopamine Counter */}
            {comments.length > 0 && (
              <div className="mt-2">
                <div className="flex justify-between text-[11px] text-gray-400 mb-1.5 font-medium">
                  <span>{mode === 'client' ? 'התקדמות התיקונים על ידי העורך' : 'קצב השלמת המשימות בפרמייר'}</span>
                  <span className="font-mono font-bold text-white bg-[#171b29] px-2.5 py-0.5 rounded-full border border-white/[0.08]">
                    {Math.round((completedCount / comments.length) * 100)}% ({completedCount}/{comments.length})
                  </span>
                </div>
                <div className="w-full h-2 bg-[#171b29] rounded-full overflow-hidden border border-white/[0.06] shadow-inner">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      completedCount === comments.length
                        ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-green-300 shadow-md shadow-emerald-500/50 animate-pulse'
                        : mode === 'client'
                        ? 'bg-gradient-to-r from-purple-500 to-emerald-400'
                        : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400'
                    }`}
                    style={{ width: `${(completedCount / comments.length) * 100}%` }}
                  />
                </div>

                {/* 100% Celebration Banner */}
                {completedCount === comments.length && comments.length > 0 && (
                  <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-[#102422] to-teal-950/70 border border-emerald-500/50 flex items-center justify-between text-xs animate-in zoom-in-95 shadow-lg shadow-emerald-950/40">
                    <div className="flex items-center gap-2 text-emerald-300 font-bold">
                      <span className="text-base animate-bounce">🏆</span>
                      <span>כל {comments.length} התיקונים הושלמו ב-100%! איזה כיף!</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        playCelebration()
                        setShowConfetti(true)
                      }}
                      className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] shadow transition-all active:scale-95 cursor-pointer"
                    >
                      קונפטי! 🎉
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* List of Revisions */}
          <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto max-h-[480px] pr-1">
            {filteredComments.length === 0 ? (
              <div className="bg-[#121624]/60 border border-dashed border-white/[0.1] rounded-3xl p-8 text-center flex flex-col items-center justify-center gap-3 text-gray-400">
                <Sparkles className="w-8 h-8 text-purple-400/60" />
                <p className="text-sm font-medium">אין כרגע הערות בקטגוריה זו</p>
                <p className="text-xs text-gray-500">עצור את הסרטון בכל רגע והוסף הערה בטופס</p>
              </div>
            ) : (
              filteredComments.map((comment) => {
                const cat = CATEGORIES.find((c) => c.id === comment.category)
                return (
                  <div
                    key={comment.id}
                    className={`group bg-[#151926]/90 hover:bg-[#191e2e] border rounded-2xl p-4 transition-all flex items-start gap-3.5 shadow-sm ${
                      comment.completed
                        ? 'border-white/[0.04] opacity-60'
                        : comment.urgent
                        ? 'border-red-500/40 bg-red-950/15'
                        : 'border-white/[0.07]'
                    }`}
                  >
                    {/* Status: Interactive Checkbox for Editor, Status Badge for Client */}
                    {mode === 'editor' ? (
                      <button
                        onClick={() => toggleCommentComplete(comment.id)}
                        className="mt-0.5 text-gray-400 hover:text-emerald-400 transition-all duration-200 active:scale-125 hover:scale-110 flex-shrink-0 cursor-pointer"
                        title={comment.completed ? 'סמן כלא בוצע' : 'סמן כבוצע בפרמייר ✨'}
                      >
                        {comment.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950/80 animate-in zoom-in-75 duration-200" />
                        ) : (
                          <Circle className="w-5 h-5 hover:text-emerald-400 transition-colors" />
                        )}
                      </button>
                    ) : (
                      <div className="mt-0.5 flex-shrink-0">
                        {comment.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-in zoom-in-75 duration-200" title="העורך סימן שזה תוקן" />
                        ) : (
                          <Clock className="w-5 h-5 text-amber-400" title="ממתין לטיפול העורך" />
                        )}
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        {/* Author Identity Badge */}
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border flex items-center gap-1 ${
                          comment.author === 'לקוח' || (!comment.author && mode === 'client')
                            ? 'bg-purple-500/15 text-purple-200 border-purple-500/25'
                            : 'bg-indigo-500/15 text-indigo-200 border-indigo-500/25'
                        }`}>
                          <span>{comment.author === 'לקוח' || (!comment.author && mode === 'client') ? '👤' : '🎬'}</span>
                          <span>{comment.author === 'לקוח' || (!comment.author && mode === 'client') ? (currentProject.clientName || 'לקוח') : 'העורך'}</span>
                        </span>

                        {/* Timecode click jumps video */}
                        <button
                          onClick={() => seekTo(comment.time, comment.drawing)}
                          className="font-mono text-xs font-bold text-purple-300 hover:text-white bg-purple-950/40 hover:bg-purple-900/60 px-2.5 py-0.5 rounded-lg border border-purple-500/30 transition-colors cursor-pointer"
                          title="קפוץ לרגע זה בוידאו"
                        >
                          ⏱️ {formatTime(comment.time)}
                        </button>

                        {/* Category badge */}
                        {cat && (
                          <span className={`text-[11px] px-2 py-0.5 rounded-lg border font-medium ${cat.color}`}>
                            {cat.icon} {cat.label}
                          </span>
                        )}

                        {comment.drawing && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => seekTo(comment.time, comment.drawing)}
                              className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-lg font-medium flex items-center gap-1 hover:bg-amber-500/25 transition-colors cursor-pointer"
                              title="לחץ לצפייה בסימון על גבי הפריים"
                            >
                              <PenTool className="w-2.5 h-2.5" />
                              <span>סימון ויזואלי ✏️</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCaptureSnapshot(comment.time, comment.drawing)
                              }}
                              className="text-[10px] bg-pink-500/15 text-pink-300 border border-pink-500/30 px-2 py-0.5 rounded-lg font-medium flex items-center gap-1 hover:bg-pink-500/25 transition-colors cursor-pointer"
                              title="הורד תמונת פריים עם הסימון (PNG)"
                            >
                              <Camera className="w-2.5 h-2.5" />
                              <span>שמור תמונה 📸</span>
                            </button>
                          </div>
                        )}

                        {comment.urgent && (
                          <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-lg font-bold">
                            דחוף 🔥
                          </span>
                        )}

                        {mode === 'client' && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-lg font-semibold mr-auto ${
                            comment.completed
                              ? 'text-emerald-300 bg-emerald-500/15 border border-emerald-500/25'
                              : 'text-amber-300 bg-amber-500/15 border border-amber-500/25'
                          }`}>
                            {comment.completed ? 'תוקן ע"י העורך 🙌' : 'ממתין לטיפול ⏳'}
                          </span>
                        )}
                      </div>

                      <p className={`text-sm leading-relaxed ${comment.completed ? 'line-through text-gray-400' : 'text-gray-100 font-normal'}`}>
                        {comment.text}
                      </p>

                      {/* Attached Audio Voice Note */}
                      {comment.audio && (
                        <AudioCommentPlayer
                          src={comment.audio}
                          duration={comment.audioDuration}
                        />
                      )}

                      {/* Interactive Emoji Reaction Bar (Dopamine) */}
                      <div className="flex items-center gap-1 mt-2.5 flex-wrap">
                        {['👍', '🔥', '👏', '💡', '❤️'].map((emoji) => {
                          const count = comment.reactions?.[emoji] || 0
                          return (
                            <button
                              key={emoji}
                              type="button"
                              onClick={(e) => handleAddReaction(comment.id, emoji, e)}
                              className={`px-2.5 py-0.5 rounded-lg text-xs transition-all flex items-center gap-1 active:scale-125 cursor-pointer ${
                                count > 0
                                  ? 'bg-purple-500/25 border border-purple-500/40 text-purple-200 shadow-sm'
                                  : 'bg-[#182030]/80 hover:bg-[#202a40] text-gray-400 hover:text-white border border-white/[0.06]'
                              }`}
                              title={`הגב עם ${emoji}`}
                            >
                              <span>{emoji}</span>
                              {count > 0 && <span className="text-[10px] font-bold text-purple-300">{count}</span>}
                            </button>
                          )
                        })}
                      </div>

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
            currentVersion.approved ? (
              <div className="bg-gradient-to-br from-[#10241b] via-[#142d22] to-[#0c1f17] p-5 rounded-3xl border border-emerald-500/40 shadow-2xl mt-auto flex flex-col gap-3.5 animate-in fade-in duration-300">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm">{currentVersion.name} אושרה סופית! 🎉</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {formatReplyTime(currentVersion.approvedAt)}
                  </span>
                </div>

                <p className="text-xs text-emerald-200/90 leading-relaxed">
                  הגרסה אושרה ע"י <strong>{currentVersion.approvedBy || 'הלקוח'}</strong> והיא מוכנה לסגירה סופית ופרסום!
                  {currentVersion.approvalNote && (
                    <span className="block italic text-emerald-100/80 mt-1">"{currentVersion.approvalNote}"</span>
                  )}
                </p>

                {/* Persistent Reopen Alert for Client if Editor requested it */}
                {currentVersion.reopenRequested && (
                  <div className="bg-amber-950/70 border border-amber-500/60 rounded-2xl p-3.5 flex flex-col gap-2.5 animate-pulse shadow-lg shadow-amber-950/40">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                        <Bell className="w-4 h-4 text-amber-400" />
                        <span>בקשה מהעורך לפתיחה מחדש</span>
                      </div>
                      <span className="text-[10px] text-amber-400/80 font-mono">
                        {formatReplyTime(currentVersion.reopenRequestedAt)}
                      </span>
                    </div>
                    <p className="text-xs text-amber-200/90 leading-relaxed">
                      העורך מעוניין לפתוח מחדש את הגרסה לצורך ביצוע דיוקים או תיקונים נוספים.
                      {currentVersion.reopenRequestReason && (
                        <span className="block mt-1 font-normal italic text-amber-100/90">
                          הודעת העורך: "{currentVersion.reopenRequestReason}"
                        </span>
                      )}
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => handleClientApproveReopen(currentVersion.id)}
                        className="py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1 transition-all shadow-md active:scale-95 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>אשר פתיחה מחדש ✅</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleClientRejectReopen(currentVersion.id)}
                        className="py-2 px-3 rounded-xl bg-[#1c2234] hover:bg-[#252e46] text-gray-300 border border-white/[0.08] font-semibold text-xs flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5 text-red-400" />
                        <span>השאר מאושר</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={notifyClientApprovedViaWhatsApp}
                    className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>שלח הודעת "אושר סופית" לעורך ב-WhatsApp 🚀</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleClientSelfReopen(currentVersion.id)}
                    className="text-xs text-gray-400 hover:text-amber-300 flex items-center justify-center gap-1.5 py-1 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>התחרטת? פתח מחדש להערות נוספות</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-[#121624] via-[#101e1a] to-[#0c1815] p-5 rounded-3xl border border-emerald-500/30 shadow-2xl mt-auto flex flex-col gap-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white text-sm">סיימת לעבור על הסרטון? 🙌</span>
                  <span className="font-mono text-emerald-300 font-bold bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 text-xs">
                    {comments.length} תיקונים רשומים
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={shareViaWhatsApp}
                    className="py-3 px-3 rounded-2xl bg-[#181e2e] hover:bg-[#20293d] text-gray-200 border border-white/[0.08] font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5 text-purple-400" />
                    <span>שלח סיכום לוואטסאפ 💬</span>
                  </button>

                  <button
                    onClick={() => setShowApprovalModal(true)}
                    className="py-3 px-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>אשר גרסה זו סופית! ✅</span>
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="bg-[#121624]/90 backdrop-blur-md p-5 rounded-3xl border border-white/[0.07] flex flex-col gap-3 shadow-xl mt-auto">
              {/* Approval status banner for Editor */}
              {currentVersion.approved ? (
                currentVersion.reopenRequested ? (
                  <div className="p-3.5 rounded-2xl bg-amber-950/50 border border-amber-500/50 flex flex-col gap-2 mb-1 shadow-lg shadow-amber-950/30">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-amber-300 font-bold">
                        <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                        <span>נשלחה בקשת פתיחה מחדש ללקוח ⏳</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCancelReopenRequest(currentVersion.id)}
                        className="text-[11px] text-gray-400 hover:text-red-400 underline transition-colors cursor-pointer"
                      >
                        בטל בקשה
                      </button>
                    </div>
                    <p className="text-[11px] text-amber-200/90 leading-relaxed">
                      הודעת אישור מופיעה כעת על המסך של הלקוח. ממתין שהלקוח יאשר.
                      {currentVersion.reopenRequestReason && (
                        <span className="block mt-0.5 text-amber-100/80 italic">"{currentVersion.reopenRequestReason}"</span>
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={notifyClientReopenRequestViaWhatsApp}
                      className="w-full py-2 px-3 rounded-xl bg-[#20273a] hover:bg-[#28324a] text-gray-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>שלח תזכורת ללקוח ב-WhatsApp</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2.5 text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <div>
                        <span className="font-bold">הלקוח אישר את {currentVersion.name}! 🎉</span>
                        <div className="text-[10px] text-gray-300">
                          אושר ע"י {currentVersion.approvedBy || 'הלקוח'} ({formatReplyTime(currentVersion.approvedAt)})
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowEditorReopenModal(true)}
                      className="text-[10px] text-amber-300 hover:text-amber-200 border border-amber-500/40 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 transition-colors flex items-center gap-1 flex-shrink-0 cursor-pointer font-semibold"
                      title="בקש מהלקוח לאשר פתיחה מחדש"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>בקש לפתוח מחדש</span>
                    </button>
                  </div>
                )
              ) : (
                <div className="p-2.5 rounded-2xl bg-[#161a28] border border-white/[0.06] flex items-center justify-between text-xs text-gray-400 mb-1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>ממתין לאישור סופי מהלקוח ⏳</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApproveVersion(currentVersion.id, 'עורך (ידני)')}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer font-medium"
                  >
                    סמן כאושר ידנית
                  </button>
                </div>
              )}

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

      {/* Studio / App Footer with Creator Credit */}
      <footer className="mt-auto py-5 border-t border-white/[0.06] bg-[#0a0d16]/80 backdrop-blur-md text-xs text-gray-400">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-white text-xs">CutSync</span>
            <span className="text-gray-500">|</span>
            <span className="text-gray-400 text-[11px]">פלטפורמת התיקונים והביקורת המדויקת לווידאו</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-300">
            <span>נוצר ופותח על ידי</span>
            <span className="text-purple-300 font-black tracking-wide px-2.5 py-0.5 rounded-lg bg-purple-500/15 border border-purple-500/30 shadow-inner">
              kaboodi
            </span>
            <span>✨</span>
          </div>
        </div>
      </footer>

      {/* Version Approval Confirmation Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121624] border border-white/[0.1] rounded-3xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-150 text-right">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    אישור סופי של {currentVersion.name} ✨
                  </h3>
                  <span className="text-[11px] text-emerald-400">איזה כיף! הגענו לשלב הסופי</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowApprovalModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-xl hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              מרוצה מאיך שהסרטון נראה? באישור הגרסה, העורך יקבל עדכון מיידי שהסבב הושלם בהצלחה וניתן לסגור ולפרסם!
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-300 font-semibold">
                שם המאשר:
              </label>
              <input
                type="text"
                value={approverName}
                onChange={(e) => setApproverName(e.target.value)}
                placeholder="למשל: דניאל (הלקוח)"
                className="bg-[#181d2c] border border-white/[0.08] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-300 font-semibold">
                מילה טובה או הערת סיכום לעורך (אופציונלי):
              </label>
              <textarea
                rows="2"
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                placeholder="למשל: 'יצא מושלם! תודה רבה על הסבלנות והעבודה המהירה ❤️'"
                className="bg-[#181d2c] border border-white/[0.08] focus:border-emerald-500 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none transition-all leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setShowApprovalModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={() => {
                  handleApproveVersion(currentVersion.id, approverName.trim() || 'הלקוח', approvalNote.trim())
                  setShowApprovalModal(false)
                  setShowCelebration(true)
                  setTimeout(() => setShowCelebration(false), 5000)
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>אשר סופית וסגור סבב! 🎉</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client Prompt Modal: Editor requests reopening after approval */}
      {mode === 'client' && currentVersion.approved && currentVersion.reopenRequested && dismissedReopenModalVersionId !== currentVersion.id && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#151a28] border-2 border-amber-500/60 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl shadow-amber-950/70 flex flex-col gap-5 animate-in zoom-in-95 duration-200 text-right relative overflow-hidden">
            {/* Ambient decorative glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 flex-shrink-0 animate-pulse">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    התקבלה בקשה מהעורך
                  </div>
                  <h3 className="text-base font-bold text-white leading-snug">
                    העורך מבקש לפתוח מחדש את הסרטון 🔔
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDismissedReopenModalVersionId(currentVersion.id)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#1f2638] transition-colors"
                title="סגור חלונית (הבקשה תישאר זמינה בתחתית המסך)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#1c2235] border border-[#2c3752] rounded-2xl p-4 flex flex-col gap-2.5">
              <p className="text-xs text-gray-200 leading-relaxed">
                סימנת את <strong className="text-white">{currentVersion.name}</strong> כמאושרת סופית, אך העורך מעוניין לפתוח אותה מחדש לצורך ביצוע שינויים או תיקונים נוספים.
              </p>
              {currentVersion.reopenRequestReason ? (
                <div className="bg-[#151a28] border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200/90">
                  <span className="font-semibold text-amber-300 block mb-1">💬 סיבת הפתיחה מהעורך:</span>
                  "{currentVersion.reopenRequestReason}"
                </div>
              ) : (
                <p className="text-[11px] text-gray-400">
                  העורך לא ציין הערה נוספת, אך ממתין לאישורך במערכת.
                </p>
              )}
              <div className="text-[10px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>זמן הבקשה: {formatReplyTime(currentVersion.reopenRequestedAt)}</span>
              </div>
            </div>

            <p className="text-[11px] text-gray-400 leading-normal">
              באישור פתיחה מחדש, הסטטוס יחזור ל"פתוח" וניתן יהיה להמשיך להוסיף הערות ולבצע תיקונים.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => handleClientApproveReopen(currentVersion.id)}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>אשר פתיחה מחדש לעריכה ✅</span>
              </button>

              <button
                type="button"
                onClick={() => handleClientRejectReopen(currentVersion.id)}
                className="w-full sm:w-auto py-3 px-4 rounded-xl bg-[#1c2234] hover:bg-[#252e46] text-gray-300 border border-[#2d3752] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <X className="w-4 h-4 text-red-400" />
                <span>דחה בקשה (השאר מאושר)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Reopen Request Dialog Modal */}
      {showEditorReopenModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151a28] border border-[#2a344e] rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-150 text-right">
            <div className="flex items-center justify-between border-b border-[#242c42] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">
                  בקשת פתיחה מחדש מהלקוח
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditorReopenModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              גרסה זו אושרה סופית על ידי הלקוח. כדי לשמור על סדר ושקיפות, תופיע ללקוח הודעה בולטת על המסך לאשר את פתיחת הגרסה מחדש לפני שניתן להמשיך.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-300 font-semibold">
                סיבת הפתיחה מחדש ללקוח (אופציונלי):
              </label>
              <textarea
                rows="2"
                value={editorReopenReason}
                onChange={(e) => setEditorReopenReason(e.target.value)}
                placeholder="למשל: 'נדרש דיוק קל בסאונד בסוף' או 'החלפת שוט בדקה 00:15'..."
                className="bg-[#1c2234] border border-[#2d3752] focus:border-amber-500 rounded-xl p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#242c42]">
              <button
                type="button"
                onClick={() => setShowEditorReopenModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white hover:bg-[#1e2538] transition-colors"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={() => handleEditorRequestReopen(currentVersion.id, editorReopenReason.trim())}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white text-xs font-bold shadow-lg shadow-amber-950/50 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>שלח בקשה ללקוח ✉️</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast Notification */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
          toast.type === 'success'
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-950/80'
            : toast.type === 'warning'
            ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-amber-950/80'
            : 'bg-gradient-to-r from-[#1b2336] to-[#25324e] text-white border border-[#3b4b72] shadow-blue-950/80'
        }`}>
          <span className="text-lg">
            {toast.type === 'success' ? '✅' : toast.type === 'warning' ? '⚠️' : '🔔'}
          </span>
          <div className="text-xs font-medium">
            {toast.message}
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-white/70 hover:text-white text-xs mr-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Celebration Toast */}
      {showCelebration && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-2xl shadow-2xl shadow-emerald-950/80 flex items-center gap-3 animate-bounce">
          <span className="text-xl">🎉</span>
          <div>
            <h4 className="text-sm font-bold">איזה כיף! הגרסה אושרה בהצלחה!</h4>
            <p className="text-xs text-emerald-100">הסטטוס עודכן לעורך ולכל הצוות.</p>
          </div>
          <button
            onClick={() => setShowCelebration(false)}
            className="text-white/80 hover:text-white mr-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Celebration Confetti Cannon */}
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Floating Emoji Particles */}
      {floatingReactions.map((r) => (
        <div
          key={r.id}
          style={{ left: r.x, top: r.y }}
          className="fixed pointer-events-none z-50 text-2xl animate-in fade-in zoom-in slide-out-to-top-12 duration-1000 -translate-x-1/2 -translate-y-1/2 select-none"
        >
          {r.emoji}
        </div>
      ))}

      {/* Edit Project Modal (for Studio header) */}
      <EditProjectModal
        isOpen={!!projectToEditInStudio}
        project={projectToEditInStudio}
        onClose={() => setProjectToEditInStudio(null)}
        onSave={(projId, updates) => {
          handleUpdateProject(projId, updates)
          setProjectToEditInStudio(null)
        }}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        initialTab={authModalInitialTab}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  )
}

export default function App() {
  const isPopup = typeof window !== 'undefined' && (
    (window.opener !== null && window.opener !== window) ||
    window.name === 'GoogleAuth' ||
    window.name === 'DiscordAuth' ||
    (window.location.search && (
      window.location.search.includes('error=') ||
      window.location.search.includes('error_code=')
    ))
  )

  if (isPopup) {
    return <OAuthPopupHandler />
  }

  return <MainApp />
}

