import { useState, useEffect } from 'react'
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  KeyRound
} from 'lucide-react'
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  loginWithDiscord,
  sendPasswordResetEmail
} from './authService'

// ─── Official Google "G" Icon ─────────────────────────────────
function GoogleIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
    </svg>
  )
}

// ─── Official Discord Icon ────────────────────────────────────
function DiscordIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────
// AuthModal — Real Supabase Authentication
// Supports: Email/Password, Google OAuth, Discord OAuth, Forgot Password
// ─────────────────────────────────────────────────────────────
export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialTab = 'login' }) {
  // 'main' | 'forgot'
  const [viewMode, setViewMode] = useState('main')
  const [tab, setTab] = useState(initialTab) // 'login' | 'register'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(null) // 'google' | 'discord' | null

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setViewMode('main')
      setTab(initialTab)
      setError(null)
      setSuccess(null)
      setLoading(false)
      setOauthLoading(null)
      setName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
    }
  }, [isOpen, initialTab])

  if (!isOpen) return null

  // ── Email / Password Submit ─────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (tab === 'login') {
        const user = await loginWithEmail(email, password)
        setLoading(false)
        onAuthSuccess(user)
        onClose()
      } else {
        if (password !== confirmPassword) {
          throw new Error('הסיסמאות אינן תואמות. וודא שכתבת את אותה הסיסמה פעמיים.')
        }
        const user = await registerWithEmail({ name, email, password })
        setLoading(false)
        if (user?.needsEmailConfirmation) {
          setSuccess('נשלח אליך מייל אימות! אנא אשר אותו כדי לסיים את ההרשמה.')
        } else {
          onAuthSuccess(user)
          onClose()
        }
      }
    } catch (err) {
      setLoading(false)
      setError(err.message || 'אירעה שגיאה. נסה שוב.')
    }
  }

  // ── Google OAuth ────────────────────────────────────────────
  const handleGoogle = async () => {
    setError(null)
    setOauthLoading('google')
    try {
      await loginWithGoogle()
      setTimeout(() => setOauthLoading(null), 2500)
    } catch (err) {
      setOauthLoading(null)
      setError(err.message)
    }
  }

  // ── Discord OAuth ───────────────────────────────────────────
  const handleDiscord = async () => {
    setError(null)
    setOauthLoading('discord')
    try {
      await loginWithDiscord()
      setTimeout(() => setOauthLoading(null), 2500)
    } catch (err) {
      setOauthLoading(null)
      setError(err.message)
    }
  }

  // ── Forgot Password ─────────────────────────────────────────
  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('נא להזין את כתובת האימייל שלך')
      return
    }
    setError(null)
    setLoading(true)
    try {
      await sendPasswordResetEmail(email)
      setLoading(false)
      setSuccess('נשלח אליך מייל לאיפוס הסיסמה! בדוק את תיבת הדואר שלך.')
    } catch (err) {
      setLoading(false)
      setError(err.message)
    }
  }

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-md bg-[#101422] border border-[#26314f] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/50 text-gray-100 overflow-hidden">

        {/* Ambient glow */}
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

        {/* ══════════════════════════════════════════════════════ */}
        {/* VIEW: FORGOT PASSWORD                                  */}
        {/* ══════════════════════════════════════════════════════ */}
        {viewMode === 'forgot' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <button
              onClick={() => { setViewMode('main'); setError(null); setSuccess(null) }}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white mb-5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
              <span>חזרה להתחברות</span>
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-3">
                <KeyRound className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-black text-white">איפוס סיסמה</h3>
              <p className="text-xs text-gray-400 mt-1">נשלח אליך קישור לאיפוס הסיסמה</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{success}</span>
              </div>
            )}

            {!success && (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">כתובת האימייל שלך</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="editor@studio.com"
                      className="w-full pr-9 pl-3 py-2.5 text-xs bg-[#0b0e17] border border-[#232c45] rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <Mail className="w-4 h-4 text-gray-500 absolute right-3 top-3" />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-950/60 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? 'שולח...' : 'שלח קישור לאיפוס סיסמה'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════ */}
        {/* VIEW: MAIN (SOCIAL + EMAIL/PASS)                       */}
        {/* ══════════════════════════════════════════════════════ */}
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
                onClick={() => { setTab('login'); setError(null); setSuccess(null) }}
                className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  tab === 'login' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950' : 'text-gray-400 hover:text-white'
                }`}
              >
                התחברות
              </button>
              <button
                type="button"
                onClick={() => { setTab('register'); setError(null); setSuccess(null) }}
                className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  tab === 'register' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950' : 'text-gray-400 hover:text-white'
                }`}
              >
                הרשמה מלאה
              </button>
            </div>

            {/* Alerts */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{success}</span>
              </div>
            )}

            {/* ── Social Logins ────────────────────────────────── */}
            <div className="space-y-2.5 mb-5">
              {/* Google */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={!!oauthLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-gray-100 text-gray-900 font-bold text-xs flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-95 shadow-md cursor-pointer disabled:opacity-60"
              >
                {oauthLoading === 'google' ? (
                  <svg className="w-4 h-4 animate-spin text-gray-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : (
                  <GoogleIcon className="w-4 h-4" />
                )}
                <span>{oauthLoading === 'google' ? 'מעבר ל-Google...' : 'המשך באמצעות Google / Gmail'}</span>
              </button>

              {/* Discord */}
              <button
                type="button"
                onClick={handleDiscord}
                disabled={!!oauthLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold text-xs flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-95 shadow-md shadow-[#5865F2]/20 cursor-pointer disabled:opacity-60"
              >
                {oauthLoading === 'discord' ? (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : (
                  <DiscordIcon className="w-4 h-4 text-white" />
                )}
                <span>{oauthLoading === 'discord' ? 'מעבר ל-Discord...' : 'המשך באמצעות Discord'}</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="w-full border-t border-gray-800" />
              <span className="absolute px-3 bg-[#101422] text-[11px] text-gray-500 font-medium">
                או באמצעות אימייל וסיסמה
              </span>
            </div>

            {/* ── Email / Password Form ────────────────────────── */}
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
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-950/60 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                      <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    <span>{tab === 'login' ? 'מתחבר...' : 'יוצר חשבון...'}</span>
                  </>
                ) : (
                  <>
                    <span>{tab === 'login' ? 'התחבר לדשבורד' : 'סיום הרשמה ויצירת חשבון'}</span>
                    <ArrowLeft className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Forgot Password link */}
            {tab === 'login' && (
              <button
                type="button"
                onClick={() => { setViewMode('forgot'); setError(null); setSuccess(null) }}
                className="w-full mt-3 text-center text-[11px] text-gray-500 hover:text-indigo-400 transition-colors cursor-pointer"
              >
                שכחתי סיסמה
              </button>
            )}

            {/* Security badge */}
            <div className="mt-4 p-2.5 rounded-xl bg-[#090d16] border border-gray-800 text-[10px] text-gray-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>חיבור מאובטח: הנתונים שלך מוצפנים ומאוחסנים בסביבה מבודדת. לא נשמרות סיסמאות גלויות.</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
