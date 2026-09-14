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
    let fileToUpload = null

    if (videoSourceType === 'upload' && uploadedFile) {
      finalVideoUrl = uploadedVideoUrl // Local blob URL for instant display
      fileToUpload = uploadedFile // Pass file to parent for background upload
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
      videoFile: fileToUpload,
      videoFileName: uploadedFile ? uploadedFile.name : 'סרטון פרויקט.mp4'
    })

    setIsSubmitting(false)
    setUploadStatus('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 rtl" dir="rtl">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-xl flex flex-col gap-5 animate-in zoom-in-95 duration-150 text-right relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-inner">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-zinc-100">פרויקט סקירה חדש 🚀</h3>
              <p className="text-[12px] text-zinc-400">העלה סרטון וצור קישור אינטראקטיבי ללקוח</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-md hover:bg-zinc-800 transition-colors"
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
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="למשל: סרטון תדמית מוצר - חברת אלפא"
              className="bg-zinc-900 border border-zinc-800 focus:border-indigo-500 rounded-lg px-3.5 py-2.5 text-[13px] text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Client Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-zinc-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>שם הלקוח / איש הקשר (אופציונלי):</span>
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="למשל: דניאל (מנהל שיווק)"
              className="bg-zinc-900 border border-zinc-800 focus:border-indigo-500 rounded-lg px-3.5 py-2.5 text-[13px] text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Video Selection Source */}
          <div className="flex flex-col gap-2 pt-1">
            <label className="text-[12px] font-semibold text-zinc-300">
              בחר סרטון לפרויקט:
            </label>
            
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setVideoSourceType('upload')}
                className={`p-2.5 rounded-lg border text-[12px] font-medium flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  videoSourceType === 'upload'
                    ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400 shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span className="text-[11px] font-bold">קובץ מהמחשב</span>
              </button>

              <button
                type="button"
                onClick={() => setVideoSourceType('url')}
                className={`p-2.5 rounded-lg border text-[12px] font-medium flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  videoSourceType === 'url'
                    ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400 shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Link2 className="w-4 h-4" />
                <span className="text-[11px] font-bold">קישור ישיר (URL)</span>
              </button>

              <button
                type="button"
                onClick={() => setVideoSourceType('sample')}
                className={`p-2.5 rounded-lg border text-[12px] font-medium flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  videoSourceType === 'sample'
                    ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400 shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
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
                className="mt-1 border border-dashed border-zinc-700 hover:border-indigo-500/50 rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-zinc-900/50 hover:bg-zinc-900 transition-colors text-center"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="video/*"
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                {uploadedFile ? (
                  <div>
                    <span className="text-[13px] font-bold text-emerald-500 block">{uploadedFile.name}</span>
                    <span className="text-[11px] text-zinc-500">קובץ נבחר ({(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB) — יעלה לענן של Supabase</span>
                  </div>
                ) : (
                  <div>
                    <span className="text-[13px] font-bold text-zinc-200 block">לחץ כאן לבחירת קובץ וידאו</span>
                    <span className="text-[11px] text-zinc-500">MP4, MOV, WebM — עולה לענן וזמין לכל לקוח</span>
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
                  className="bg-zinc-900 border border-zinc-800 focus:border-indigo-500 rounded-lg px-3.5 py-2.5 text-[13px] text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
                <span className="text-[11px] text-zinc-500">הדבק קישור ישיר לקובץ וידאו הפתוח לצפייה פומבית ברשת.</span>
              </div>
            )}

            {/* Sample Templates Area */}
            {videoSourceType === 'sample' && (
              <div className="mt-1 flex flex-col gap-2">
                {SAMPLE_TEMPLATES.map((tmpl) => (
                  <label
                    key={tmpl.id}
                    className={`flex items-center justify-between p-3 rounded-lg border text-[13px] cursor-pointer transition-colors ${
                      selectedSampleUrl === tmpl.url
                        ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-100'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="sampleTemplate"
                        checked={selectedSampleUrl === tmpl.url}
                        onChange={() => setSelectedSampleUrl(tmpl.url)}
                        className="text-indigo-600 focus:ring-indigo-500 bg-zinc-900 border-zinc-700"
                      />
                      <span className="font-medium">{tmpl.title}</span>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-500">{tmpl.duration}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Upload Status indicator */}
            {uploadStatus && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[12px] font-medium animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span>{uploadStatus}</span>
              </div>
            )}

            {/* Upload warning/error */}
            {uploadError && (
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[12px]">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-800 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-[13px] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              ביטול
            </button>

            <button
              type="submit"
              disabled={!title.trim() || isSubmitting}
              className="px-5 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-[13px] font-bold shadow-sm flex items-center gap-1.5 transition-colors"
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

