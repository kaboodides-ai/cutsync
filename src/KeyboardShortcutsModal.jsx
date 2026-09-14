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
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-xl w-full p-6 shadow-xl flex flex-col gap-5 text-right text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-inner">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <span>קיצורי מקלדת מקצועיים לעורכים</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-md font-bold">
                  Pro Hotkeys
                </span>
              </h3>
              <p className="text-[12px] text-zinc-400 mt-0.5">
                עבוד במהירות שיא בדיוק כמו ב-Premiere Pro ו-DaVinci Resolve
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
          {shortcutSections.map((section, idx) => (
            <div key={idx} className="flex flex-col gap-2.5 bg-zinc-900 border border-zinc-800 rounded-xl p-3.5">
              <h4 className="text-[13px] font-bold text-zinc-200 border-b border-zinc-800 pb-2">
                {section.title}
              </h4>
              <div className="flex flex-col gap-2">
                {section.items.map((item, iIdx) => (
                  <div key={iIdx} className="flex items-start justify-between gap-2 text-[12px]">
                    <div className="flex flex-col min-w-0">
                      <span className="text-zinc-200 font-medium leading-snug">{item.label}</span>
                      {item.desc && (
                        <span className="text-[11px] text-zinc-400 mt-0.5">{item.desc}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {item.keys.map((k, kIdx) => (
                        k === 'או' ? (
                          <span key={kIdx} className="text-[10px] text-zinc-500 px-0.5">או</span>
                        ) : (
                          <kbd
                            key={kIdx}
                            className="px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-200 font-mono text-[11px] font-bold shadow-sm"
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
        <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-[12px] text-zinc-400">
          <span className="text-[12px] flex items-center gap-1.5">
            <span>💡 טיפ:</span>
            <span>הקיצורים פעילים בכל עת כאשר אינך מקליד בתוך שדה טקסט.</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[13px] shadow-sm transition-colors cursor-pointer"
          >
            הבנתי, סגור
          </button>
        </div>
      </div>
    </div>
  )
}
