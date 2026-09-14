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
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-xl flex flex-col gap-5 animate-in zoom-in-95 duration-150 text-right relative overflow-hidden text-zinc-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <FolderEdit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-zinc-100">עריכת פרטי פרויקט ✏️</h3>
              <p className="text-[12px] text-zinc-400">שנה את שם הפרויקט או את שם הלקוח</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Project Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-zinc-300 flex items-center gap-1.5">
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
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 rounded-lg pr-10 pl-3 py-2.5 text-[13px] text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
              <Pencil className="w-4 h-4 text-zinc-500 absolute right-3.5 top-3" />
            </div>
          </div>

          {/* Client Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-zinc-300 flex items-center gap-1.5">
              <span>שם הלקוח:</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="לדוגמה: דניאל כהן / חברת אלפא"
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 rounded-lg pr-10 pl-3 py-2.5 text-[13px] text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
              <User className="w-4 h-4 text-zinc-500 absolute right-3.5 top-3" />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-[13px] font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-bold shadow-sm transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
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

