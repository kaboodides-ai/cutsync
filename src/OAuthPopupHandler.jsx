import { useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle, Sparkles, Scissors, X } from 'lucide-react'
import { supabase } from './lib/supabase'

export default function OAuthPopupHandler() {
  const [status, setStatus] = useState('loading') // 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))

    const errorParam = params.get('error') || hashParams.get('error')
    const errorDesc = params.get('error_description') || hashParams.get('error_description')

    if (errorParam) {
      setStatus('error')
      setErrorMessage(
        errorDesc ||
        'אירעה שגיאה בעת ההתחברות מול הספק. וודא שחשבון ה-Google או Discord מוגדר כראוי.'
      )
      return
    }

    // Check for active session
    let isSubscribed = true

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session && isSubscribed) {
          handleSuccess(session)
        }
      } catch (err) {
        console.error('Session check error:', err)
      }
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session && isSubscribed) {
          handleSuccess(session)
        }
      }
    )

    // Fallback timer: if nothing happens within 6 seconds and no error
    const timer = setTimeout(() => {
      if (status === 'loading') {
        checkSession()
      }
    }, 2500)

    return () => {
      isSubscribed = false
      subscription?.unsubscribe()
      clearTimeout(timer)
    }
  }, [])

  const handleSuccess = (session) => {
    setStatus('success')
    // Notify main window
    try {
      if (window.opener && window.opener !== window) {
        window.opener.postMessage(
          { type: 'CUTSYNC_AUTH_SUCCESS', session },
          '*'
        )
      }
    } catch (e) {
      console.warn('Could not postMessage to opener:', e)
    }

    // Auto close popup after brief celebration
    setTimeout(() => {
      window.close()
    }, 1200)
  }

  const handleClose = () => {
    window.close()
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#0b0e17] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans select-none"
    >
      {/* Background glow ambient */}
      <div className="absolute top-[-20%] right-[-10%] w-[350px] h-[350px] rounded-full bg-purple-600/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[350px] h-[350px] rounded-full bg-indigo-600/20 blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm bg-[#121624] border border-[#26314f] rounded-3xl p-8 shadow-2xl shadow-indigo-950/60 text-center flex flex-col items-center">
        
        {/* Brand logo badge */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-900/40 mb-6">
          <Scissors className="w-6 h-6 text-white" />
        </div>

        {/* ── STATE: LOADING ── */}
        {status === 'loading' && (
          <div className="flex flex-col items-center animate-in fade-in duration-300">
            <div className="w-10 h-10 rounded-full border-2 border-indigo-500/30 border-t-indigo-400 animate-spin mb-4" />
            <h3 className="text-lg font-bold text-white mb-1">מאמת פרטי התחברות...</h3>
            <p className="text-xs text-gray-400">מתחבר ומעדכן את המשתמש שלך ב-CutSync</p>
          </div>
        )}

        {/* ── STATE: SUCCESS ── */}
        {status === 'success' && (
          <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-950/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ההתחברות הצליחה!</span>
            </div>
            <h3 className="text-xl font-black text-white mb-1">ברוך הבא ל-CutSync! 🎉</h3>
            <p className="text-xs text-gray-400 mt-1">מעביר אותך חזרה לאפליקציה וסוגר חלון זה...</p>
          </div>
        )}

        {/* ── STATE: ERROR ── */}
        {status === 'error' && (
          <div className="flex flex-col items-center animate-in fade-in duration-300">
            <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 mb-4 shadow-lg shadow-red-950/40">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">ההתחברות לא הושלמה</h3>
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs text-right leading-relaxed mb-5 w-full">
              {errorMessage}
            </div>
            <button
              onClick={handleClose}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1b2338] hover:bg-[#253252] border border-[#303f66] text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              <span>סגור חלון זה ונסה שוב</span>
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

