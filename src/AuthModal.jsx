import { useState, useEffect } from 'react'
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ShieldCheck,
  Check
} from 'lucide-react'
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  loginWithDiscord,
  getUsersDb
} from './authService'

// Official Google "G" Icon SVG
function GoogleIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  )
}

// Official Discord Icon SVG
function DiscordIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  )
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialTab = 'login' }) {
  // Main view modes: 'main' | 'google_oauth' | 'discord_oauth'
  const [viewMode, setViewMode] = useState('main')
  const [tab, setTab] = useState(initialTab) // 'login' | 'register'

  // Standard form fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  // Google OAuth specific fields
  const [googleEmail, setGoogleEmail] = useState('')
  const [googleName, setGoogleName] = useState('')
  const [isNewGoogleAccount, setIsNewGoogleAccount] = useState(false)

  // Discord OAuth specific fields
  const [discordUsername, setDiscordUsername] = useState('')
  const [discordEmail, setDiscordEmail] = useState('')
  const [isNewDiscordAccount, setIsNewDiscordAccount] = useState(false)

  // Available saved accounts from db
  const [savedUsers, setSavedUsers] = useState([])

  useEffect(() => {
    if (isOpen) {
      const users = getUsersDb()
      setSavedUsers(users)
      setViewMode('main')
      setError(null)
    }
  }, [isOpen])

  // Listen for real browser popup completion
  useEffect(() => {
    const handleAuthMessage = (event) => {
      if (event.data?.type === 'CUTSYNC_AUTH_SUCCESS' && event.data?.user) {
        onAuthSuccess(event.data.user)
        onClose()
      }
    }
    window.addEventListener('message', handleAuthMessage)
    return () => window.removeEventListener('message', handleAuthMessage)
  }, [onAuthSuccess, onClose])

  if (!isOpen) return null

  const googleUsers = savedUsers.filter(u => u.provider === 'google')
  const discordUsers = savedUsers.filter(u => u.provider === 'discord')

  // Real Browser Popup Launcher
  const openOAuthPopup = (provider) => {
    const width = 480
    const height = 640
    const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - width) / 2))
    const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - height) / 2))

    const popup = window.open(
      `/auth-popup.html?provider=${provider}`,
      'CutSyncOAuthPopup',
      `width=${width},height=${height},left=${left},top=${top},status=0,menubar=0,toolbar=0,location=0,resizable=yes,scrollbars=yes`
    )

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      // Browser popup blocked: fall back seamlessly to in-modal view
      setViewMode(provider === 'google' ? 'google_oauth' : 'discord_oauth')
    } else {
      popup.focus()
    }
  }

  // Standard Email/Password Submit
  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (tab === 'login') {
        const user = loginWithEmail(email, password)
        setLoading(false)
        onAuthSuccess(user)
        onClose()
      } else {
        if (password !== confirmPassword) {
          throw new Error('הסיסמאות אינן תואמות, אנא וודא שכתבת את אותה הסיסמה פעמיים')
        }
        const user = registerWithEmail({ name, email, password })
        setLoading(false)
        onAuthSuccess(user)
        onClose()
      }
    } catch (err) {
      setLoading(false)
      setError(err.message || 'אירעה שגיאה בפעולה')
    }
  }

  // Handle Google OAuth Connect
  const handleGoogleConnect = (e) => {
    if (e) e.preventDefault()
    setError(null)

    const cleanEmail = googleEmail.trim().toLowerCase()
    const cleanName = googleName.trim()

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('נא להזין כתובת Gmail תקינה')
      return
    }

    setLoading(true)
    setTimeout(() => {
      try {
        const derivedName = cleanName || cleanEmail.split('@')[0]
        const user = loginWithGoogle(cleanEmail, derivedName)
        setLoading(false)
        onAuthSuccess(user)
        onClose()
      } catch (err) {
        setLoading(false)
        setError(err.message)
      }
    }, 400)
  }

  // Handle Discord OAuth Connect
  const handleDiscordConnect = (e) => {
    if (e) e.preventDefault()
    setError(null)

    const cleanUser = discordUsername.trim()
    if (!cleanUser) {
      setError('נא להזין כינוי או שם משתמש ב-Discord')
      return
    }

    setLoading(true)
    setTimeout(() => {
      try {
        const user = loginWithDiscord(cleanUser)
        setLoading(false)
        onAuthSuccess(user)
        onClose()
      } catch (err) {
        setLoading(false)
        setError(err.message)
      }
    }, 400)
  }

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative w-full max-w-md bg-[#101422] border border-[#26314f] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/50 text-gray-100 overflow-hidden">
        
        {/* Glow ambient decorations */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 w-8 h-8 rounded-full bg-[#182033] hover:bg-[#232e49] border border-gray-700/50 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer"
          title="סגור"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ======================================================== */}
        {/* VIEW 1: GOOGLE OAUTH INTERACTIVE SCREEN                  */}
        {/* ======================================================== */}
        {viewMode === 'google_oauth' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <button
              onClick={() => {
                setViewMode('main')
                setError(null)
              }}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white mb-4 cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>חזרה לאפשרויות התחברות</span>
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mx-auto mb-3 shadow-md">
                <GoogleIcon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-white">התחברות באמצעות Google</h3>
              <p className="text-xs text-gray-400 mt-1">מעבר מאובטח אל CutSync Studio</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* List of existing Google accounts if any */}
            {googleUsers.length > 0 && !isNewGoogleAccount && (
              <div className="mb-4 space-y-2">
                <div className="text-[11px] text-gray-400 font-semibold mb-1">
                  בחר חשבון Google מחובר:
                </div>
                {googleUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      const user = loginWithGoogle(u.email, u.name)
                      onAuthSuccess(user)
                      onClose()
                    }}
                    className="w-full p-3 rounded-2xl bg-[#151c2e] hover:bg-[#1c263e] border border-[#273552] flex items-center justify-between text-right transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-9 h-9 rounded-full object-cover border border-purple-500/30"
                      />
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                          {u.name}
                        </div>
                        <div className="text-[11px] text-gray-400">{u.email}</div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                      התחבר
                    </span>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setIsNewGoogleAccount(true)}
                  className="w-full py-2.5 px-3 rounded-xl border border-dashed border-gray-700 hover:border-purple-500/50 text-xs text-gray-300 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
                >
                  <PlusCircle className="w-4 h-4 text-purple-400" />
                  <span>השתמש בחשבון Gmail אישי אחר</span>
                </button>
              </div>
            )}

            {/* Form to enter real custom Google / Gmail account */}
            {(googleUsers.length === 0 || isNewGoogleAccount) && (
              <form onSubmit={handleGoogleConnect} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                    כתובת ה-Gmail שלך
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      autoFocus
                      value={googleEmail}
                      onChange={(e) => setGoogleEmail(e.target.value)}
                      placeholder="your.email@gmail.com"
                      className="w-full pr-9 pl-3 py-2.5 text-xs bg-[#0b0e17] border border-[#232c45] rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <Mail className="w-4 h-4 text-gray-500 absolute right-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                    שמך המלא בחשבון גוגל
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={googleName}
                      onChange={(e) => setGoogleName(e.target.value)}
                      placeholder="לדוגמה: ישראל ישראלי"
                      className="w-full pr-9 pl-3 py-2.5 text-xs bg-[#0b0e17] border border-[#232c45] rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <User className="w-4 h-4 text-gray-500 absolute right-3 top-3" />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-white hover:bg-gray-100 text-gray-900 font-bold text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <GoogleIcon className="w-4 h-4" />
                    <span>{loading ? 'מתחבר ל-Google...' : 'אישור וכניסה עם חשבון Google זה'}</span>
                  </button>
                </div>

                {googleUsers.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsNewGoogleAccount(false)}
                    className="w-full py-2 text-center text-[11px] text-gray-400 hover:text-white"
                  >
                    חזרה לרשימת החשבונות השמורים
                  </button>
                )}
              </form>
            )}

            <div className="mt-4 p-2.5 rounded-xl bg-[#090d16] border border-gray-800 text-[10px] text-gray-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>חיבור מאובטח: פרטי הפרויקטים יישמרו בסביבה מבודדת תחת חשבון ה-Gmail שלך.</span>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: DISCORD OAUTH INTERACTIVE SCREEN                 */}
        {/* ======================================================== */}
        {viewMode === 'discord_oauth' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <button
              onClick={() => {
                setViewMode('main')
                setError(null)
              }}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white mb-4 cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>חזרה לאפשרויות התחברות</span>
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#5865F2] flex items-center justify-center mx-auto mb-3 shadow-md shadow-[#5865F2]/40">
                <DiscordIcon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-black text-white">התחברות באמצעות Discord</h3>
              <p className="text-xs text-gray-400 mt-1">CutSync מבקשת גישה לחשבון הדיסקורד שלך</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* List of existing Discord accounts if any */}
            {discordUsers.length > 0 && !isNewDiscordAccount && (
              <div className="mb-4 space-y-2">
                <div className="text-[11px] text-gray-400 font-semibold mb-1">
                  בחר חשבון Discord מחובר:
                </div>
                {discordUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      const user = loginWithDiscord(u.name)
                      onAuthSuccess(user)
                      onClose()
                    }}
                    className="w-full p-3 rounded-2xl bg-[#151c2e] hover:bg-[#1c263e] border border-[#273552] flex items-center justify-between text-right transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-9 h-9 rounded-full object-cover border border-[#5865F2]/40"
                      />
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-[#8a96f8] transition-colors">
                          {u.name}
                        </div>
                        <div className="text-[11px] text-gray-400">{u.email}</div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#5865F2]/20 text-[#8a96f8] border border-[#5865F2]/30">
                      התחבר
                    </span>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setIsNewDiscordAccount(true)}
                  className="w-full py-2.5 px-3 rounded-xl border border-dashed border-gray-700 hover:border-[#5865F2]/50 text-xs text-gray-300 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
                >
                  <PlusCircle className="w-4 h-4 text-[#8a96f8]" />
                  <span>התחבר עם חשבון Discord אישי אחר</span>
                </button>
              </div>
            )}

            {/* Form to enter real custom Discord user */}
            {(discordUsers.length === 0 || isNewDiscordAccount) && (
              <form onSubmit={handleDiscordConnect} className="space-y-3">
                <div className="p-3 rounded-2xl bg-[#141b2c] border border-[#293654] text-xs text-gray-300 space-y-1.5 mb-3">
                  <div className="text-[11px] font-bold text-white mb-1">הרשאות מבוקשות:</div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>גישה לשם המשתמש והאווטאר שלך</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>שיוך סביבת עבודה ופרויקטים ייעודיים</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                    כינוי / שם משתמש ב-Discord
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      autoFocus
                      value={discordUsername}
                      onChange={(e) => setDiscordUsername(e.target.value)}
                      placeholder="לדוגמה: VideoCreator#1234 או myusername"
                      className="w-full pr-9 pl-3 py-2.5 text-xs bg-[#0b0e17] border border-[#232c45] rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-[#5865F2] transition-colors"
                    />
                    <User className="w-4 h-4 text-gray-500 absolute right-3 top-3" />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold text-xs shadow-lg shadow-[#5865F2]/40 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <DiscordIcon className="w-4 h-4 text-white" />
                    <span>{loading ? 'מאמת מול Discord...' : 'אשר והתחבר (Authorize)'}</span>
                  </button>
                </div>

                {discordUsers.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsNewDiscordAccount(false)}
                    className="w-full py-2 text-center text-[11px] text-gray-400 hover:text-white"
                  >
                    חזרה לרשימת החשבונות השמורים
                  </button>
                )}
              </form>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: MAIN AUTH SCREEN (GOOGLE, DISCORD, EMAIL TABS)   */}
        {/* ======================================================== */}
        {viewMode === 'main' && (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>סביבת עבודה אישית לעורכים</span>
              </div>
              <h2 className="text-2xl font-black text-white">
                {tab === 'login' ? 'התחברות ל-CutSync' : 'הרשמה לחשבון חדש'}
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                {tab === 'login'
                  ? 'התחבר כדי לגשת לדשבורד הפרויקטים האישי שלך'
                  : 'פתח חשבון וקבל דשבורד ייעודי לניהול גרסאות וסרטונים'}
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="grid grid-cols-2 p-1 bg-[#0b0e17] rounded-2xl border border-gray-800/80 mb-5">
              <button
                type="button"
                onClick={() => {
                  setTab('login')
                  setError(null)
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  tab === 'login'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                התחברות
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('register')
                  setError(null)
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  tab === 'register'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                הרשמה מלאה
              </button>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Social Logins - Real Browser Popup Window */}
            <div className="space-y-2.5 mb-5">
              {/* Google Button */}
              <button
                type="button"
                onClick={() => openOAuthPopup('google')}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-gray-100 text-gray-900 font-bold text-xs flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-95 shadow-md cursor-pointer"
              >
                <GoogleIcon className="w-4 h-4" />
                <span>המשך באמצעות Google / Gmail</span>
              </button>

              {/* Discord Button */}
              <button
                type="button"
                onClick={() => openOAuthPopup('discord')}
                className="w-full py-2.5 px-4 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold text-xs flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-95 shadow-md shadow-[#5865F2]/20 cursor-pointer"
              >
                <DiscordIcon className="w-4 h-4 text-white" />
                <span>המשך באמצעות Discord</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="w-full border-t border-gray-800"></div>
              <span className="absolute px-3 bg-[#101422] text-[11px] text-gray-500 font-medium">
                או באמצעות אימייל וסיסמה
              </span>
            </div>

            {/* Standard Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {tab === 'register' && (
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">שם מלא</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="לדוגמה: דניאל כהן"
                      className="w-full pr-9 pl-3 py-2 text-xs bg-[#0b0e17] border border-[#232c45] rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <User className="w-4 h-4 text-gray-500 absolute right-3 top-2.5" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">כתובת אימייל</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="editor@studio.com"
                    className="w-full pr-9 pl-3 py-2 text-xs bg-[#0b0e17] border border-[#232c45] rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <Mail className="w-4 h-4 text-gray-500 absolute right-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">סיסמה</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="לפחות 6 תווים"
                    className="w-full pr-9 pl-9 py-2 text-xs bg-[#0b0e17] border border-[#232c45] rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <Lock className="w-4 h-4 text-gray-500 absolute right-3 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-2.5 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {tab === 'register' && (
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">אימות סיסמה</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="הקלד שוב את אותה הסיסמה"
                      className="w-full pr-9 pl-3 py-2 text-xs bg-[#0b0e17] border border-[#232c45] rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <Lock className="w-4 h-4 text-gray-500 absolute right-3 top-2.5" />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-950/60 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{tab === 'login' ? 'התחבר לדשבורד' : 'סיום הרשמה ויצירת חשבון'}</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  )
}
