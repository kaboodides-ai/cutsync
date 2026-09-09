import { useState } from 'react'
import {
  Play,
  Scissors,
  CheckCircle2,
  MessageCircle,
  Mic,
  PenTool,
  Layers,
  ArrowLeft,
  Sparkles,
  Clock,
  ShieldCheck,
  Check,
  FileSpreadsheet,
  Zap,
  ChevronDown,
  ChevronUp,
  Star,
  Users,
  Video,
  Send,
  RotateCcw,
  MousePointer,
  HelpCircle,
  Eye,
  Link2,
  User,
  LogOut
} from 'lucide-react'

export default function LandingPage({ onEnterStudio, currentUser, onOpenAuthModal, onLogout }) {
  const [openFaq, setOpenFaq] = useState(null)

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const faqs = [
    {
      q: 'האם הלקוח שלי צריך להירשם או להוריד תוכנה?',
      a: 'ממש לא! הלקוח מקבל קישור ישיר, נכנס בדפדפן (במחשב או בנייד) ויכול להתחיל לסמן הערות מיד, ללא צורך בהרשמה, סיסמה או הורדת אפליקציה.'
    },
    {
      q: 'איך מתבצע הסנכרון עם Adobe Premiere Pro?',
      a: 'בסיום סבב התיקונים, העורך לוחץ על כפתור "ייצא CSV לפרמייר". הקובץ שמתקבל מיובא ישירות לטיימליין של פרמייר והופך למרקרים צבעוניים עם כל ההערות על הפריימים המדויקים.'
    },
    {
      q: 'מה קורה אם הלקוח מתחרט אחרי שאישר את הגרסה?',
      a: 'CutSync כוללת מנגנון אישור גרסה מאובטח. אם העורך מעוניין לפתוח את הגרסה מחדש, נשלחת בקשה אינטראקטיבית שקופצת ישירות על המסך של הלקוח לאישורו, כדי למנוע אי הבנות.'
    },
    {
      q: 'האם אפשר לצייר ולהקליט הערות קוליות?',
      a: 'כן! הלקוח יכול לצייר על גבי הפריים (ציור חופשי, עיגול או חץ במתיחה חיה), וכן להקליט הערה קולית אם קשה לו להסביר במילים כתובות.'
    },
    {
      q: 'האם השימוש בדמו כרוך בתשלום?',
      a: 'גרסת הדמו פתוחה וחינמית לחלוטין להתנסות עבור עורכי וידאו, יוצרי תוכן ולקוחותיהם.'
    }
  ]

  return (
    <div className="min-h-screen bg-[#0a0d16] text-gray-100 font-sans selection:bg-purple-500 selection:text-white relative overflow-hidden rtl" dir="rtl">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-purple-600/15 via-indigo-600/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 -right-60 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 -left-60 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0a0d16]/80 border-b border-[#1c2336]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-emerald-400 p-[2px] shadow-lg shadow-purple-950/60">
              <div className="w-full h-full bg-[#0d1220] rounded-[14px] flex items-center justify-center">
                <Scissors className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white font-mono">CutSync</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  by kaboodi
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  v1.0 בעברית
                </span>
              </div>
              <span className="text-[11px] text-gray-400 font-medium block">
                פלטפורמת התיקונים לווידאו • נוצר ע״י kaboodi
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-gray-300">
            <a href="#why" className="hover:text-purple-300 transition-colors">למה CutSync?</a>
            <a href="#features" className="hover:text-purple-300 transition-colors">תכונות הדגל</a>
            <a href="#how-it-works" className="hover:text-purple-300 transition-colors">איך זה עובד?</a>
            <a href="#roles" className="hover:text-purple-300 transition-colors">חיבור עורך ולקוח</a>
            <a href="#faq" className="hover:text-purple-300 transition-colors">שאלות נפוצות</a>
          </nav>

          {/* Quick Auth / CTA */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEnterStudio('editor')}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-[#141926] hover:bg-[#1d253a] border border-[#232d44] transition-all cursor-pointer"
                  title="כניסה לדשבורד"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-lg object-cover border border-purple-500/40"
                  />
                  <span className="hidden sm:inline text-xs font-bold text-white">{currentUser.name}</span>
                </button>
                <button
                  onClick={() => onEnterStudio('editor')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 shadow-lg shadow-purple-950/60 transition-all hover:scale-[1.03] active:scale-95 cursor-pointer"
                >
                  <span>דשבורד פרויקטים 🚀</span>
                </button>
                <button
                  onClick={onLogout}
                  className="p-2 rounded-xl bg-[#141926] hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-[#232d44] transition-all cursor-pointer"
                  title="התנתק"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuthModal?.('login')}
                  className="px-4 py-2.5 rounded-xl bg-[#141926] hover:bg-[#1d253a] border border-[#232d44] text-xs font-bold text-gray-200 hover:text-white transition-all cursor-pointer"
                >
                  התחברות / הרשמה
                </button>
                <button
                  onClick={() => onOpenAuthModal?.('register')}
                  className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 shadow-lg shadow-purple-950/60 transition-all hover:scale-[1.03] active:scale-95 cursor-pointer"
                >
                  <span>התחל בחינם 🚀</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center flex flex-col items-center">
        
        {/* Announce Chip */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#182035]/90 border border-purple-500/30 text-purple-300 text-xs font-medium mb-8 shadow-xl shadow-purple-950/40 animate-in fade-in slide-in-from-top-4 duration-500">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>הפלטפורמה הישראלית הראשונה לביקורת ואישור סרטונים</span>
          <span className="text-gray-400">|</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> 100% RTL
          </span>
        </div>

        {/* Big Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
          להפסיק להתווכח בוואטסאפ על{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-emerald-400">
            תיקוני וידאו.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          הלקוח שלך מסמן, מצייר ומקליט הערות בדיוק של פיקסל ופריים – והעורך מקבל הכל מסודר ומייצא ישירות ל-Timeline ב-Premiere Pro.
        </p>

        {/* CTA Buttons Group */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => {
              if (currentUser) {
                onEnterStudio('editor')
              } else {
                onOpenAuthModal?.('register')
              }
            }}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-500 hover:from-purple-500 hover:to-teal-400 text-white font-black text-base shadow-2xl shadow-purple-950/80 flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 group cursor-pointer"
          >
            <span>{currentUser ? 'המשך לדשבורד שלך 🚀' : 'התחל לעבוד עכשיו (חינם בדמו)'}</span>
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>

          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-[#141b2d] hover:bg-[#1c263e] border border-[#273454] text-gray-200 font-bold text-base flex items-center justify-center gap-2.5 transition-all"
          >
            <Play className="w-4 h-4 text-purple-400 fill-purple-400" />
            <span>איך זה עובד?</span>
          </a>
        </div>

        {/* Trust Points */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-y-3 gap-x-6 text-xs text-gray-400 font-medium select-none">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>ללא צורך בהתקנה – הכל בדפדפן</span>
          </div>
          <span className="text-gray-600 hidden sm:inline">•</span>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>ייצוא CSV ישירות ל-Premiere Pro</span>
          </div>
          <span className="text-gray-600 hidden sm:inline">•</span>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>מנגנון אישור גרסה רשמי</span>
          </div>
          <span className="text-gray-600 hidden sm:inline">•</span>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>הקלטות קוליות מובנות</span>
          </div>
        </div>

        {/* Hero Interactive Mockup Showcase */}
        <div className="mt-16 w-full max-w-5xl rounded-3xl p-2 sm:p-3 bg-gradient-to-b from-[#25304c]/80 via-[#161c2d]/90 to-[#0c0f18] border border-[#2d3a5a] shadow-2xl shadow-purple-950/70 relative">
          
          {/* Top Mockup Window Controls */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#232d44] text-xs text-gray-400 bg-[#101422] rounded-t-2xl">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
              <span className="mr-3 font-mono text-[11px] text-gray-300 font-semibold">CutSync Studio — סרטון תדמית v1 (גרסה 1)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> אושר ע"י הלקוח
              </span>
            </div>
          </div>

          {/* Simulated Player View */}
          <div className="relative aspect-video bg-[#0b0e18] rounded-b-2xl overflow-hidden flex items-center justify-center cursor-pointer group" onClick={() => onEnterStudio('editor')}>
            {/* Background Simulated Frame */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#12182b] via-[#0e1424] to-[#070a12] flex items-center justify-center">
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 opacity-90">
                <div className="w-20 h-20 rounded-3xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-2xl shadow-purple-900/40">
                  <Play className="w-9 h-9 fill-purple-400 ml-1" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">לחץ כאן כדי לפתוח את הסטודיו החי</h3>
                <p className="text-xs text-gray-400 max-w-md">התנסה בכל הכלים: סימון וציור, הערות קוליות, אישור גרסאות וייצוא לפרמייר</p>
              </div>
            </div>

            {/* Simulated Annotations Over the Frame */}
            <div className="absolute top-1/4 right-1/4 pointer-events-none animate-pulse">
              <div className="w-32 h-32 rounded-full border-4 border-amber-400/80 shadow-lg shadow-amber-400/30 flex items-center justify-center">
                <span className="text-[11px] font-bold text-amber-300 bg-black/60 px-2 py-0.5 rounded">להחליף שוט</span>
              </div>
            </div>

            {/* Floating Simulated Pin Card */}
            <div className="absolute top-12 left-12 bg-[#171e30]/95 backdrop-blur-md border border-purple-500/40 rounded-2xl p-3 shadow-2xl max-w-xs text-right hidden sm:block">
              <div className="flex items-center justify-between gap-2 text-[11px] mb-1.5">
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold">00:08</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Mic className="w-3 h-3" /> הערה קולית
                </span>
              </div>
              <p className="text-xs text-gray-200 font-medium">"להגביר כאן מעט את מוזיקת הרקע, זה שקט מדי"</p>
              <div className="mt-2 text-[10px] text-gray-400 flex items-center gap-1">
                <span>👤 דניאל (לקוח)</span>
                <span>•</span>
                <span className="text-indigo-300">תגובה מהעורך: "תוקן ב-3dB!"</span>
              </div>
            </div>

            {/* Bottom Timeline Simulation */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 flex flex-col gap-2">
              <div className="w-full h-2 rounded-full bg-gray-700/60 relative overflow-hidden">
                <div className="h-full w-2/5 bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full"></div>
                <div className="absolute top-0 right-[25%] w-2.5 h-2.5 rounded-full bg-amber-400 -translate-y-[1px]"></div>
                <div className="absolute top-0 right-[60%] w-2.5 h-2.5 rounded-full bg-emerald-400 -translate-y-[1px]"></div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-300 font-mono">
                <span>00:08 / 00:23</span>
                <span className="text-emerald-400 font-sans font-bold">3 תיקונים רשומים בציר הזמן</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section (Before vs After) */}
      <section id="why" className="py-20 bg-[#0d111d] border-y border-[#1a2236] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-purple-400 tracking-wider uppercase mb-3">למה CutSync?</h2>
            <h3 className="text-3xl sm:text-4xl font-black text-white">
              ההבדל בין סיוט התיקונים לבין שקט נפשי
            </h3>
            <p className="mt-3 text-sm sm:text-base text-gray-400">
              למה עשרות עורכי וידאו עוברים מוואטסאפ ואימיילים לניהול תיקונים מקצועי:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* The Old Painful Way */}
            <div className="bg-[#141824] rounded-3xl p-6 sm:p-8 border border-red-500/20 shadow-xl flex flex-col gap-5 relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-500/15 text-red-400 flex items-center justify-center font-bold text-lg">
                  ✕
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">הדרך הישנה (וואטסאפ ומיילים)</h4>
                  <p className="text-xs text-red-400/90 font-medium">בלבול, שעות מבוזבזות וויכוחים</p>
                </div>
              </div>

              <ul className="space-y-4 text-xs sm:text-sm text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold mt-0.5">•</span>
                  <span><strong>הודעות קוליות מבלבלות:</strong> "בדקה שתיים ומשהו יש איזה קטע שצריך לתקן" – לך תנחש על איזה פריים מדובר.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold mt-0.5">•</span>
                  <span><strong>הקלדת טיים-קוד ידנית:</strong> לעצור, להעתיק שניות לפרמייר, לבדוק שוב, ולבזבז שעות יקרות.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold mt-0.5">•</span>
                  <span><strong>הלקוח נזכר בתיקון אחרי הרינדור:</strong> אין שום תיעוד רשמי אם הגרסה אושרה או מה סוכם.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold mt-0.5">•</span>
                  <span><strong>בלגן בגרסאות:</strong> "שלחתי לך את v2_final_final_3.mp4 בוואטסאפ"...</span>
                </li>
              </ul>
            </div>

            {/* The CutSync Way */}
            <div className="bg-gradient-to-br from-[#121c2c] via-[#101b2a] to-[#0c1724] rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/40 shadow-2xl shadow-emerald-950/40 flex flex-col gap-5 relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
                  ✓
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">חווית CutSync 🚀</h4>
                  <p className="text-xs text-emerald-400 font-medium">דיוק, מקצועיות וסגירת פרויקטים בחצי זמן</p>
                </div>
              </div>

              <ul className="space-y-4 text-xs sm:text-sm text-emerald-100">
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>ציור וסימון ישיר על הפריים:</strong> הלקוח מקיף בעיגול או מותח חץ בדיוק לאן שצריך להסתכל.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>ייצוא ישיר ל-Timeline בפרמייר:</strong> בלחיצה אחת מורידים CSV שנטען כמרקרים צבעוניים על הציר.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>אישור גרסה חגיגי ומתועד:</strong> נשמר מי אישר, מתי, ונעילת הגרסה לשינויים ללא אישור חוזר.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>סדר מוחלט בסבבי עבודה:</strong> V1, V2, V3 – כל גרסה עם התיקונים והסרטון שלה.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-20 lg:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-purple-400 tracking-wider uppercase mb-3">תכונות הדגל</h2>
          <h3 className="text-3xl sm:text-4xl font-black text-white">
            כל מה שצריך כדי לסגור סרטון במהירות שיא
          </h3>
          <p className="mt-3 text-sm sm:text-base text-gray-400">
            בנינו את המערכת בדיוק סביב הצרכים האמיתיים של עורכי וידאו ויוצרי תוכן בארץ:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Feature 1: Drawing on screen */}
          <div className="bg-[#121624] p-7 rounded-3xl border border-[#20273c] hover:border-purple-500/50 transition-all group shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <PenTool className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">סימון וציור חי על המסך</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              הלקוח יכול לצייר בחופשיות, למתוח חץ שמכוון לאובייקט או להקיף בעיגול עם אנימציית גרירה חיה בזמן אמת.
            </p>
          </div>

          {/* Feature 2: Voice memos */}
          <div className="bg-[#121624] p-7 rounded-3xl border border-[#20273c] hover:border-indigo-500/50 transition-all group shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Mic className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">הקלטת הערות קוליות</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              לפעמים קשה להסביר בטקסט. בלחיצה אחת הלקוח מקליט הודעה קולית שמוצמדת בדיוק לשנייה המתאימה בסרטון.
            </p>
          </div>

          {/* Feature 3: Premiere Pro CSV Export */}
          <div className="bg-[#121624] p-7 rounded-3xl border border-emerald-500/50 transition-all group shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">ייצוא ל-Premiere Pro</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              הורדת קובץ מרקרים תקני בפורמט CSV שנטען ישר על ציר הזמן של פרמייר. אין צורך להקליד שניות ידנית!
            </p>
          </div>

          {/* Feature 4: Threaded replies */}
          <div className="bg-[#121624] p-7 rounded-3xl border border-[#20273c] hover:border-pink-500/50 transition-all group shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">שרשורי שיחה בתוך כל תיקון</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              העורך והלקוח מתכתבים ישירות בתוך התיקון הספציפי. תגיות צבעוניות מבדילות בין עורך ללקוח עם מענה מהיר.
            </p>
          </div>

          {/* Feature 5: Version Stacking */}
          <div className="bg-[#121624] p-7 rounded-3xl border border-[#20273c] hover:border-amber-500/50 transition-all group shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">ניהול גרסאות (V1, V2, V3...)</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              כל סבב תיקונים מופרד לגרסה מסודרת. אפשר לעבור בין גרסאות, לראות אילו תיקונים טופלו ולהעלות קובץ חדש.
            </p>
          </div>

          {/* Feature 6: Version Approval & Reopen Guard */}
          <div className="bg-[#121624] p-7 rounded-3xl border border-[#20273c] hover:border-teal-500/50 transition-all group shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">אישור גרסה ונעילה מאובטחת</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              הלקוח מאשר את הגרסה סופית עם שמו ותאריך. פתיחה מחדש ע"י העורך מקפיצה הודעת אישור על המסך של הלקוח.
            </p>
          </div>

        </div>
      </section>

      {/* How It Works (3 Steps) */}
      <section id="how-it-works" className="py-20 bg-[#0d111d] border-y border-[#1a2236]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <h2 className="text-xs font-bold text-purple-400 tracking-wider uppercase mb-3">תהליך העבודה</h2>
          <h3 className="text-3xl sm:text-4xl font-black text-white mb-16">
            איך זה עובד? ב-3 צעדים פשוטים
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
            
            {/* Step 1 */}
            <div className="bg-[#131726] p-8 rounded-3xl border border-[#222b42] flex flex-col items-center text-center relative">
              <div className="w-14 h-14 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-black text-xl mb-6 shadow-lg shadow-purple-950/50">
                1
              </div>
              <h4 className="text-lg font-bold text-white mb-2">העורך מעלה סרטון</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                טוענים את קובץ הווידאו למערכת (או עובדים עם הדמו) ומקבלים קישור שיתוף ייעודי ששולחים ללקוח.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#131726] p-8 rounded-3xl border border-[#222b42] flex flex-col items-center text-center relative">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-black text-xl mb-6 shadow-lg shadow-indigo-950/50">
                2
              </div>
              <h4 className="text-lg font-bold text-white mb-2">הלקוח מסמן ומאשר</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                הלקוח צופה, עוצר בכל פריים, מצייר, מקליט הערות, ובסיום מאשר סופית או שולח סיכום בוואטסאפ.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#131726] p-8 rounded-3xl border border-[#222b42] flex flex-col items-center text-center relative">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-xl mb-6 shadow-lg shadow-emerald-950/50">
                3
              </div>
              <h4 className="text-lg font-bold text-white mb-2">ייצוא לפרמייר וסגירה</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                העורך מייצא קובץ CSV ישירות ל-Premiere Pro, מתקן את כל הנקודות ברוגע ומספק את התוצר המושלם.
              </p>
            </div>

          </div>

          <div className="mt-14">
            <button
              onClick={() => onEnterStudio('editor')}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-950/80 transition-all hover:scale-105 active:scale-95"
            >
              התנסה בתהליך עכשיו בדמו חי 🎬
            </button>
          </div>

        </div>
      </section>

      {/* Seamless Workflow: Editor Workspace ↔ Client Direct Link */}
      <section id="roles" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-xs font-bold text-purple-400 tracking-wider uppercase mb-2">איך זה עובד בפועל?</h2>
          <h3 className="text-3xl font-black text-white">חיבור פשוט ומהיר בין העורך ללקוח</h3>
          <p className="mt-2 text-xs sm:text-sm text-gray-400">
            העורך מקבל שליטה מלאה בניהול הפרויקט — והלקוח נכנס ישירות לקישור שלו בלי שום סיבוך:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Card 1: Editor Workspace */}
          <div className="bg-gradient-to-b from-[#161c2d] to-[#101422] p-8 rounded-3xl border border-indigo-500/30 shadow-2xl flex flex-col justify-between gap-6 hover:border-indigo-500/60 transition-all">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Scissors className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">1. דשבורד העורך 🎬</h4>
                  <span className="text-xs text-indigo-300">ניהול פרויקטים וסבבי גרסאות</span>
                </div>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed mb-4">
                מרכז השליטה שלך: העלה סרטונים, נהל גרסאות (V1, V2, V3), העתק קישור ייעודי לכל לקוח, סמן משימות כבוצעו, וייצא קובץ CSV ישירות ל-Timeline בפרמייר.
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] text-gray-400">
                <span className="px-2.5 py-1 rounded-lg bg-[#1b2236] border border-[#2b3654]">✓ דשבורד מרובה פרויקטים</span>
                <span className="px-2.5 py-1 rounded-lg bg-[#1b2236] border border-[#2b3654]">✓ ייצוא מרקרים ל-Premiere</span>
                <span className="px-2.5 py-1 rounded-lg bg-[#1b2236] border border-[#2b3654]">✓ צ'קליסט משימות לתיקון</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (currentUser) {
                  onEnterStudio('editor')
                } else {
                  onOpenAuthModal?.('login')
                }
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-950/60 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>כניסה לדשבורד הפרויקטים</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Client Direct Experience */}
          <div className="bg-gradient-to-b from-[#131d27] to-[#0e1720] p-8 rounded-3xl border border-emerald-500/30 shadow-2xl flex flex-col justify-between gap-6 hover:border-emerald-500/60 transition-all">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Link2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">2. קישור ישיר ללקוח 🔗</h4>
                  <span className="text-xs text-emerald-300">נשלח בוואטסאפ — ללא צורך בהרשמה</span>
                </div>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed mb-4">
                הלקוח מקבל ממך קישור ישיר לסרטון שלו. הוא פותח אותו בכל דפדפן (במחשב או בנייד), רואה את הברכה האישית, מסמן הערות וציורים, ומאשר את הגרסה הסופית ברגע שהכל מושלם.
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] text-gray-400">
                <span className="px-2.5 py-1 rounded-lg bg-[#142323] border border-[#203a35]">✓ 0 הרשמות, 0 סיסמאות</span>
                <span className="px-2.5 py-1 rounded-lg bg-[#142323] border border-[#203a35]">✓ קישור ייחודי לכל פרויקט</span>
                <span className="px-2.5 py-1 rounded-lg bg-[#142323] border border-[#203a35]">✓ אישור גרסה רשמי בלחיצה</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0b141a] border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-300 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>הלקוח מקבל קישור פרטי בוואטסאפ לכל סרטון</span>
              </div>
              <button
                type="button"
                onClick={() => onEnterStudio('client')}
                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 whitespace-nowrap"
                title="צפה בדוגמה לאיך הלקוח רואה את הקישור"
              >
                <span>צפה בדמו לקוח</span>
                <ArrowLeft className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-[#0d111d] border-t border-[#1a2236]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold text-purple-400 tracking-wider uppercase mb-2">שאלות נפוצות</h2>
            <h3 className="text-3xl font-black text-white">כל מה שרצית לדעת</h3>
          </div>

          <div className="flex flex-col gap-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index
              return (
                <div
                  key={index}
                  className="bg-[#131828] border border-[#222b44] rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 text-right flex items-center justify-between gap-4 hover:text-purple-300 transition-colors"
                  >
                    <span className="text-sm font-bold text-white">{faq.q}</span>
                    <div className={`p-1 rounded-lg bg-[#1a2136] text-gray-400 transition-transform ${isOpen ? 'rotate-180 text-purple-400' : ''}`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-gray-300 leading-relaxed border-t border-[#1e263d]/60 pt-3 animate-in fade-in duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* Final Bottom CTA Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-emerald-950/40 border border-purple-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <h3 className="text-2xl sm:text-4xl font-black text-white mb-4">
            מוכן לייעל את סבב התיקונים הבא שלך?
          </h3>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto mb-8 leading-relaxed">
            הצטרף לחוויית עבודה מקצועית, שקופה ומסודרת. התחל עכשיו בחינם בדמו החי של CutSync.
          </p>

          <button
            onClick={() => onEnterStudio('editor')}
            className="px-9 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 text-white font-black text-base shadow-2xl shadow-purple-950/80 transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-2.5"
          >
            <span>פתח את הסטודיו עכשיו (חינם)</span>
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a2236] bg-[#090c14] py-12 text-xs text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-mono font-bold">
              CS
            </div>
            <div>
              <span className="text-sm font-bold text-white font-mono">CutSync</span>
              <p className="text-[11px] text-gray-500">פלטפורמת התיקונים המדויקת לווידאו</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-400 font-medium">
            <a href="#why" className="hover:text-white transition-colors">יתרונות</a>
            <a href="#features" className="hover:text-white transition-colors">תכונות</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">איך זה עובד</a>
            <a href="#faq" className="hover:text-white transition-colors">שאלות נפוצות</a>
          </div>

          <div className="text-center sm:text-left text-gray-300 text-xs flex flex-col sm:items-end gap-1.5">
            <div className="flex items-center gap-1.5 font-medium">
              <span>נוצר ופותח על ידי</span>
              <span className="text-purple-300 font-black tracking-wide px-2.5 py-0.5 rounded-lg bg-purple-500/15 border border-purple-500/30 shadow-inner">
                kaboodi
              </span>
              <span>✨</span>
            </div>
            <span className="text-[11px] text-gray-500">
              נבנה באהבה עבור עורכי הווידאו ויוצרי התוכן בישראל 🇮🇱
            </span>
          </div>

        </div>
      </footer>

    </div>
  )
}

