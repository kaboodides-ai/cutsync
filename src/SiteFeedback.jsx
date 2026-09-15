import React, { useState } from 'react'
import { MessageSquarePlus, X, Send, Sparkles } from 'lucide-react'
import { supabase } from './lib/supabase'

export default function SiteFeedback() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim()) return

    setIsSubmitting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const { error } = await supabase.from('site_feedback').insert({
        message: message.trim(),
        user_id: session?.user?.id || null,
        url: window.location.href,
        user_agent: navigator.userAgent
      })

      if (error) throw error

      setSubmitted(true)
      setTimeout(() => {
        setIsOpen(false)
        setSubmitted(false)
        setMessage('')
      }, 3000)
    } catch (err) {
      console.error('[CutSync] Error submitting feedback:', err)
      alert('שגיאה בשליחת המשוב, אנא נסה שוב.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded-full px-4 py-2.5 flex items-center gap-2 shadow-lg backdrop-blur-md transition-all active:scale-95 group"
        title="יש לך רעיון לשיפור או מצאת באג?"
      >
        <MessageSquarePlus className="w-4 h-4 group-hover:text-indigo-400 transition-colors" />
        <span className="text-xs font-semibold">משוב על המערכת</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                יש לך הצעה או מצאת באג?
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5">
              {submitted ? (
                <div className="text-center py-6 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <Send className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-zinc-100">תודה רבה!</h4>
                  <p className="text-xs text-zinc-400">המשוב שלך נשלח בהצלחה ויעזור לנו לשפר את האתר.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    המערכת בגרסת בטא! נשמח לשמוע על כל רעיון לשיפור, תוספת שהיית רוצה לראות, או תקלה שנתקלת בה.
                  </p>
                  
                  <textarea
                    autoFocus
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="ספר לנו מה כדאי לתקן או להוסיף..."
                    className="w-full h-32 bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                    required
                  />

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={!message.trim() || isSubmitting}
                      className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                    >
                      {isSubmitting ? (
                        <span className="animate-pulse">שולח...</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          שלח משוב
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}