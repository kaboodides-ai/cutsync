import { useState, useEffect } from 'react'
import { X, Pencil, User, Check, FolderEdit } from 'lucide-react'

export default function EditProjectModal({ isOpen, onClose, project, onSave }) {
  const [title, setTitle] = useState('')
  const [clientName, setClientName] = useState('')

  useEffect(() => {
    if (project) {
      setTitle(project.title || '')
      setClientName(project.clientName || '')
    }
  }, [project, isOpen])

  if (!isOpen || !project) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return

    onSave(project.id, {
      title: title.trim(),
      clientName: clientName.trim()
    })
    onClose()
  }

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-[#141826] border border-[#27324c] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl shadow-purple-950/60 flex flex-col gap-5 animate-in zoom-in-95 duration-150 text-right relative overflow-hidden text-gray-100">
        
        {/* Glow decoration */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-purple-600/15 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#212b42] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-950/60">
              <FolderEdit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">עריכת פרטי פרויקט ✏️</h3>
              <p className="text-[11px] text-gray-400">שנה את שם הפרויקט או את שם הלקוח</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#1e2538] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Project Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-200 flex items-center gap-1.5">
              <span>שם הפרויקט:</span>
              <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="לדוגמה: סרטון תדמית מוצר 2026"
                className="w-full bg-[#0d111d] border border-[#26334f] focus:border-purple-500 rounded-xl pr-9 pl-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
              />
              <Pencil className="w-4 h-4 text-gray-500 absolute right-3 top-3" />
            </div>
          </div>

          {/* Client Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-200 flex items-center gap-1.5">
              <span>שם הלקוח:</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="לדוגמה: דניאל כהן / חברת אלפא"
                className="w-full bg-[#0d111d] border border-[#26334f] focus:border-purple-500 rounded-xl pr-9 pl-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
              />
              <User className="w-4 h-4 text-gray-500 absolute right-3 top-3" />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#212b42] mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-[#1a2133] transition-colors cursor-pointer"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-950/60 transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>שמור שינויים</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}

