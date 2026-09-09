import React from 'react'
import { X, Keyboard, Play, Pause, RotateCcw, RotateCw, Camera, Clock, MessageSquare, Maximize } from 'lucide-react'

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null

  const shortcutSections = [
    {
      title: '🎬 שליטה בנגן וניווט',
      items: [
        { keys: ['Space', 'או', 'K'], label: 'הפעלה / עצירה של הסרטון', icon: <Play className="w-3.5 h-3.5 text-purple-400" /> },
        { keys: ['J'], label: 'קפיצה 1 שניות אחורה', icon: <RotateCcw className="w-3.5 h-3.5 text-indigo-400" /> },
        { keys: ['L'], label: 'קפיצה 1 שניות קדימה', icon: <RotateCw className="w-3.5 h-3.5 text-indigo-400" /> },
        { keys: ['→'], label: 'פריים בודד קדימה (Frame Advance)', desc: 'דיוק מקצועי לנקודת חיתוך' },
        { keys: ['←'], label: 'פריים בודד אחורה (Frame Rewind)', desc: 'דיוק מקצועי לנקודת חיתוך' },
        { keys: ['F'], label: 'מסך מלא אינטראקטיבי / יציאה', icon: <Maximize className="w-3.5 h-3.5 text-emerald-400" /> },
      ]
    },
    {
      title: '✍️ הערות וסימונים',
      items: [
        { keys: ['M', 'או', 'C'], label: 'הוספת הערה לפריים', desc: 'עוצר את הוידאו ומתמקד בתיבת הטקסט', icon: <MessageSquare className="w-3.5 h-3.5 text-purple-400" /> },
        { keys: ['S'], label: 'צילום והורדת פריים (Snapshot 📸)', icon: <Camera className="w-3.5 h-3.5 text-pink-400" /> },
        { keys: ['Delete'], label: 'מחיקת צורה נבחרת בציור', desc: 'כאשר חץ, עיגול או טקסט נבחרים' },
        { keys: ['?'], label: 'פתיחה וסגירה של חלון עזרה זה' }
      ]
    }
  ]

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#121624] border border-white/[0.1] rounded-3xl max-w-xl w-full p-6 shadow-2xl flex flex-col gap-5 text-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-300 flex items-center justify-center shadow-inner">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>קיצורי מקלדת מקצועיים לעורכים</span>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
                  Pro Hotkeys
                </span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                עבוד במהירות שיא בדיוק כמו ב-Premiere Pro ו-DaVinci Resolve
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
          {shortcutSections.map((section, idx) => (
            <div key={idx} className="flex flex-col gap-2.5 bg-[#171c2b]/80 border border-white/[0.06] rounded-2xl p-3.5">
              <h4 className="text-xs font-bold text-gray-200 border-b border-white/[0.06] pb-2">
                {section.title}
              </h4>
              <div className="flex flex-col gap-2">
                {section.items.map((item, iIdx) => (
                  <div key={iIdx} className="flex items-start justify-between gap-2 text-xs">
                    <div className="flex flex-col min-w-0">
                      <span className="text-gray-200 font-medium leading-snug">{item.label}</span>
                      {item.desc && (
                        <span className="text-[10px] text-gray-400 mt-0.5">{item.desc}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {item.keys.map((k, kIdx) => (
                        k === 'או' ? (
                          <span key={kIdx} className="text-[10px] text-gray-500 px-0.5">או</span>
                        ) : (
                          <kbd
                            key={kIdx}
                            className="px-2 py-0.5 rounded-lg bg-[#20273c] border border-white/[0.12] text-purple-200 font-mono text-[11px] font-bold shadow-sm"
                          >
                            {k}
                          </kbd>
                        )
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer tip */}
        <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-xs text-gray-400">
          <span className="text-[11px] flex items-center gap-1.5">
            <span>💡 טיפ:</span>
            <span>הקיצורים פעילים בכל עת כאשר אינך מקליד בתוך שדה טקסט.</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            הבנתי, סגור
          </button>
        </div>
      </div>
    </div>
  )
}
