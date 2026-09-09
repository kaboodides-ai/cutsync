import { useState, useRef } from 'react'
import { X, Upload, Video, Sparkles, Check, Film, User, Link2, AlertCircle, Loader2 } from 'lucide-react'
import { uploadVideoToStorage } from './authService'

const SAMPLE_TEMPLATES = [
  {
    id: 'sample-commercial',
    title: 'סרטון תדמית לדוגמה',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: '00:15'
  },
  {
    id: 'sample-joy',
    title: 'קליפ אנימציה קצר',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    duration: '00:15'
  }
]

export default function NewProjectModal({ isOpen, onClose, onCreateProject }) {
  const [title, setTitle] = useState('')
  const [clientName, setClientName] = useState('')
  const [videoSourceType, setVideoSourceType] = useState('upload') // 'upload' | 'url' | 'sample'
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState('')
  const [directVideoUrl, setDirectVideoUrl] = useState('')
  const [selectedSampleUrl, setSelectedSampleUrl] = useState(SAMPLE_TEMPLATES[0].url)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef(null)

  if (!isOpen) return null

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setUploadedFile(file)
      setUploadedVideoUrl(url)
      setUploadError('')
      if (!title) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "")
        setTitle(cleanName)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    setUploadError('')
    let finalVideoUrl = ''

    if (videoSourceType === 'upload' && uploadedFile) {
      try {
        setUploadStatus('מעלה סרטון לענן כדי שהלקוח יוכל לצפות בו... ☁️')
        finalVideoUrl = await uploadVideoToStorage(uploadedFile)
      } catch (err) {
        console.warn('[CutSync] Cloud upload failed, falling back to local URL:', err)
        finalVideoUrl = uploadedVideoUrl
        setUploadError(
          'הסרטון נשמר מקומית. כדי שהלקוח יוכל לצפות בו במכשירים אחרים, יש לוודא ש-Bucket בשם videos קיים ב-Supabase Storage (או להשתמש בקישור ישיר לסרטון).'
        )
      }
    } else if (videoSourceType === 'url') {
      finalVideoUrl = directVideoUrl.trim()
    } else {
      finalVideoUrl = selectedSampleUrl
    }

    if (!finalVideoUrl) {
      finalVideoUrl = selectedSampleUrl
    }

    onCreateProject({
      title: title.trim(),
      clientName: clientName.trim() || 'הלקוח',
      videoSrc: finalVideoUrl,
      videoFileName: uploadedFile ? uploadedFile.name : 'סרטון פרויקט.mp4'
    })

    setIsSubmitting(false)
    setUploadStatus('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 rtl" dir="rtl">
      <div className="bg-[#141826] border border-[#27324c] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl shadow-purple-950/50 flex flex-col gap-5 animate-in zoom-in-95 duration-150 text-right relative overflow-hidden">
        
        {/* Glow decoration */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-purple-600/15 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#212b42] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-950/60">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">פרויקט סקירה חדש 🚀</h3>
              <p className="text-[11px] text-gray-400">העלה סרטון וצור קישור אינטראקטיבי ללקוח</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#1e2538] transition-colors"
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
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="למשל: סרטון תדמית מוצר - חברת אלפא"
              className="bg-[#1a2133] border border-[#2c3752] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
            />
          </div>

          {/* Client Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-200 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>שם הלקוח / איש הקשר (אופציונלי):</span>
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="למשל: דניאל (מנהל שיווק)"
              className="bg-[#1a2133] border border-[#2c3752] focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Video Selection Source */}
          <div className="flex flex-col gap-2 pt-1">
            <label className="text-xs font-semibold text-gray-200">
              בחר סרטון לפרויקט:
            </label>
            
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setVideoSourceType('upload')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  videoSourceType === 'upload'
                    ? 'bg-purple-950/40 border-purple-500 text-purple-200 shadow-md'
                    : 'bg-[#181f30] border-[#252f48] text-gray-400 hover:text-gray-200'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span className="text-[11px] font-bold">קובץ מהמחשב</span>
              </button>

              <button
                type="button"
                onClick={() => setVideoSourceType('url')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  videoSourceType === 'url'
                    ? 'bg-indigo-950/40 border-indigo-500 text-indigo-200 shadow-md'
                    : 'bg-[#181f30] border-[#252f48] text-gray-400 hover:text-gray-200'
                }`}
              >
                <Link2 className="w-4 h-4" />
                <span className="text-[11px] font-bold">קישור ישיר (URL)</span>
              </button>

              <button
                type="button"
                onClick={() => setVideoSourceType('sample')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  videoSourceType === 'sample'
                    ? 'bg-purple-950/40 border-purple-500 text-purple-200 shadow-md'
                    : 'bg-[#181f30] border-[#252f48] text-gray-400 hover:text-gray-200'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-[11px] font-bold">סרטון דוגמה</span>
              </button>
            </div>

            {/* Upload Area */}
            {videoSourceType === 'upload' && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="mt-1 border-2 border-dashed border-[#2d3a5a] hover:border-purple-500/60 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-[#161c2c] hover:bg-[#1a2236] transition-all text-center"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="video/*"
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-full bg-purple-500/15 text-purple-400 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                {uploadedFile ? (
                  <div>
                    <span className="text-xs font-bold text-emerald-400 block">{uploadedFile.name}</span>
                    <span className="text-[10px] text-gray-400">קובץ נבחר ({(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB) — יעלה לענן של Supabase</span>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs font-bold text-white block">לחץ כאן לבחירת קובץ וידאו</span>
                    <span className="text-[10px] text-gray-400">MP4, MOV, WebM — עולה לענן וזמין לכל לקוח</span>
                  </div>
                )}
              </div>
            )}

            {/* Direct URL Area */}
            {videoSourceType === 'url' && (
              <div className="mt-1 flex flex-col gap-1.5">
                <input
                  type="url"
                  value={directVideoUrl}
                  onChange={(e) => setDirectVideoUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4 או קישור ישיר מ-Drive/Dropbox"
                  className="bg-[#1a2133] border border-[#2c3752] focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
                <span className="text-[10px] text-gray-400">הדבק קישור ישיר לקובץ וידאו הפתוח לצפייה פומבית ברשת.</span>
              </div>
            )}

            {/* Sample Templates Area */}
            {videoSourceType === 'sample' && (
              <div className="mt-1 flex flex-col gap-2">
                {SAMPLE_TEMPLATES.map((tmpl) => (
                  <label
                    key={tmpl.id}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                      selectedSampleUrl === tmpl.url
                        ? 'bg-purple-950/50 border-purple-500/60 text-white'
                        : 'bg-[#181f30] border-[#252f48] text-gray-300 hover:bg-[#1e273d]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="sampleTemplate"
                        checked={selectedSampleUrl === tmpl.url}
                        onChange={() => setSelectedSampleUrl(tmpl.url)}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <span className="font-semibold">{tmpl.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400">{tmpl.duration}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Upload Status indicator */}
            {uploadStatus && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-200 text-xs font-medium animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                <span>{uploadStatus}</span>
              </div>
            )}

            {/* Upload warning/error */}
            {uploadError && (
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#212b42] mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs text-gray-400 hover:text-white hover:bg-[#1a2133] transition-colors"
            >
              ביטול
            </button>

            <button
              type="submit"
              disabled={!title.trim() || isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-purple-950/60 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>צור פרויקט והתחל לעבוד 🚀</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}

