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
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-indigo-500/30 selection:text-white relative overflow-hidden rtl" dir="rtl">
      
      {/* Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#09090b]/80 border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 rounded-lg bg-indigo-600 p-[1px] shadow-sm flex-shrink-0">
              <div className="w-full h-full bg-[#18181b] rounded-[7px] flex items-center justify-center">
                <Scissors className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white font-mono">CutSync</span>
                <span className="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  by kaboodi
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                  v1.0
                </span>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium text-zinc-400">
            <a href="#why" className="hover:text-zinc-100 transition-colors">למה CutSync?</a>
            <a href="#features" className="hover:text-zinc-100 transition-colors">תכונות הדגל</a>
            <a href="#how-it-works" className="hover:text-zinc-100 transition-colors">איך זה עובד?</a>
            <a href="#roles" className="hover:text-zinc-100 transition-colors">חיבור עורך ולקוח</a>
            <a href="#faq" className="hover:text-zinc-100 transition-colors">שאלות נפוצות</a>
          </nav>

          {/* Quick Auth / CTA */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEnterStudio('editor')}
                  className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer"
                  title="כניסה לדשבורד"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded-md object-cover border border-zinc-700"
                  />
                  <span className="hidden sm:inline text-xs font-semibold text-zinc-200">{currentUser.name}</span>
                </button>
                <button
                  onClick={() => onEnterStudio('editor')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-colors cursor-pointer"
                >
                  <span>דשבורד פרויקטים</span>
                </button>
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                  title="התנתק"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuthModal?.('login')}
                  className="px-3 py-1.5 rounded-lg text-[13px] font-medium text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
                >
                  התחברות / הרשמה
                </button>
                <button
                  onClick={() => onOpenAuthModal?.('register')}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-[13px] font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-colors cursor-pointer"
                >
                  <span>התחל בחינם</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center flex flex-col items-center">
        
        {/* Announce Chip */}
        <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px] font-medium mb-8 shadow-sm">
          <span className="flex h-1.5 w-1.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
          </span>
          <span>פלטפורמת ביקורת הוידאו המובילה בישראל</span>
        </div>

        {/* Big Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight max-w-4xl mx-auto">
          להפסיק להתווכח בוואטסאפ על{' '}
          <span className="text-indigo-400">
            תיקוני וידאו.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-[15px] sm:text-base lg:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          הלקוח שלך מסמן, מצייר ומקליט הערות בדיוק של פיקסל ופריים – והעורך מקבל הכל מסודר ומייצא ישירות ל-Timeline ב-Premiere Pro.
        </p>

        {/* CTA Buttons Group */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              if (currentUser) {
                onEnterStudio('editor')
              } else {
                onOpenAuthModal?.('register')
              }
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[15px] shadow-sm flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
          >
            <span>{currentUser ? 'המשך לדשבורד שלך' : 'התחל לעבוד עכשיו'}</span>
            <ArrowLeft className="w-4 h-4" />
          </button>

          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-medium text-[15px] flex items-center justify-center gap-2.5 transition-colors"
          >
            <Play className="w-4 h-4 text-zinc-400" />
            <span>איך זה עובד?</span>
          </a>
        </div>

        {/* Trust Points */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-y-3 gap-x-6 text-[13px] text-zinc-500 font-medium select-none">
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
        <div className="mt-16 w-full max-w-5xl rounded-xl p-1 bg-zinc-900 border border-zinc-800 shadow-xl relative">
          
          {/* Top Mockup Window Controls */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 text-[11px] text-zinc-400 bg-zinc-950 rounded-t-lg gap-2" dir="ltr">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-700"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-700"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-700"></span>
              </div>
              <span className="ml-3 font-mono font-medium truncate leading-none pt-0.5">
                CutSync Studio <span className="hidden sm:inline text-zinc-500">— סרטון תדמית v1</span>
              </span>
            </div>
            <div className="flex items-center flex-shrink-0" dir="rtl">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-medium flex items-center gap-1.5 whitespace-nowrap">
                <CheckCircle2 className="w-3 h-3 flex-shrink-0" /> אושר<span className="hidden sm:inline"> ע"י הלקוח</span>
              </span>
            </div>
          </div>

          {/* Simulated Player View */}
          <div className="relative aspect-video bg-zinc-950 rounded-b-lg overflow-hidden flex items-center justify-center cursor-pointer group" onClick={() => onEnterStudio('editor')}>
            {/* Background Simulated Frame */}
            <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 opacity-90">
                <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-sm">
                  <Play className="w-7 h-7 text-white ml-1" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-100 mb-1">לחץ כאן כדי לפתוח את הסטודיו החי</h3>
                <p className="hidden sm:block text-[13px] text-zinc-400 max-w-md">התנסה בכל הכלים: סימון וציור, הערות קוליות, אישור גרסאות וייצוא לפרמייר</p>
              </div>
            </div>

            {/* Simulated Annotations Over the Frame */}
            <div className="absolute top-[10%] right-[10%] sm:top-1/4 sm:right-1/4 pointer-events-none">
              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-[3px] border-indigo-500 flex items-center justify-center">
                <span className="text-[10px] font-medium text-white bg-indigo-600 px-2 py-0.5 rounded whitespace-nowrap shadow-sm">להחליף שוט</span>
              </div>
            </div>

            {/* Floating Simulated Pin Card */}
            <div className="absolute top-12 left-12 bg-zinc-900 border border-zinc-800 rounded-lg p-3 shadow-md max-w-xs text-right hidden sm:block">
              <div className="flex items-center justify-between gap-2 text-[11px] mb-2">
                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">00:08</span>
                <span className="text-indigo-400 font-medium flex items-center gap-1">
                  <Mic className="w-3 h-3" /> הערה קולית
                </span>
              </div>
              <p className="text-[13px] text-zinc-200">"להגביר כאן מעט את מוזיקת הרקע, זה שקט מדי"</p>
              <div className="mt-2.5 text-[11px] text-zinc-500 flex items-center gap-1.5">
                <span>דניאל (לקוח)</span>
                <span>•</span>
                <span className="text-zinc-400">תגובה מהעורך: "תוקן ב-3dB!"</span>
              </div>
            </div>

            {/* Bottom Timeline Simulation */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-zinc-950 to-transparent p-4 flex flex-col gap-2">
              <div className="w-full h-1.5 rounded-full bg-zinc-800 relative overflow-hidden">
                <div className="h-full w-2/5 bg-indigo-500 rounded-full"></div>
                <div className="absolute top-0 right-[25%] w-2 h-2 rounded-full bg-zinc-300 -translate-y-[1px]"></div>
                <div className="absolute top-0 right-[60%] w-2 h-2 rounded-full bg-indigo-400 -translate-y-[1px]"></div>
              </div>
              <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between text-[11px] text-zinc-400 gap-1.5 sm:gap-0 mt-1 sm:mt-0">
                <span className="font-mono order-2 sm:order-1" dir="ltr">00:08 / 00:23</span>
                <span className="text-zinc-300 font-sans font-medium order-1 sm:order-2">3 תיקונים רשומים בציר הזמן</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section (Before vs After) */}
      <section id="why" className="py-20 bg-zinc-950 border-y border-zinc-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-[11px] font-bold text-indigo-500 tracking-wider uppercase mb-3">למה CutSync?</h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-white">
              ההבדל בין סיוט התיקונים לבין שקט נפשי
            </h3>
            <p className="mt-4 text-[15px] sm:text-base text-zinc-400">
              למה עשרות עורכי וידאו עוברים מוואטסאפ ואימיילים לניהול תיקונים מקצועי:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            
            {/* The Old Painful Way */}
            <div className="bg-zinc-900 rounded-xl p-6 sm:p-8 border border-zinc-800 flex flex-col gap-6 relative overflow-hidden">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 text-zinc-500 flex items-center justify-center font-bold">
                  ✕
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold text-zinc-100">הדרך הישנה (וואטסאפ)</h4>
                  <p className="text-[13px] text-zinc-500">בלבול, שעות מבוזבזות וויכוחים</p>
                </div>
              </div>

              <ul className="space-y-4 text-[13px] sm:text-[14px] text-zinc-400">
                <li className="flex items-start gap-3">
                  <span className="text-zinc-600 font-bold mt-0.5">•</span>
                  <span><strong>הודעות קוליות מבלבלות:</strong> "בדקה שתיים ומשהו יש איזה קטע שצריך לתקן" – הניחוש עליך.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-zinc-600 font-bold mt-0.5">•</span>
                  <span><strong>הקלדת טיים-קוד ידנית:</strong> לעצור, להעתיק שניות לפרמייר, לבדוק שוב.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-zinc-600 font-bold mt-0.5">•</span>
                  <span><strong>אין תיעוד רשמי:</strong> הלקוח נזכר בתיקון אחרי הרינדור כי אין אישור.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-zinc-600 font-bold mt-0.5">•</span>
                  <span><strong>בלגן בגרסאות:</strong> "שלחתי לך את v2_final_final_3.mp4".</span>
                </li>
              </ul>
            </div>

            {/* The CutSync Way */}
            <div className="bg-[#18181b] rounded-xl p-6 sm:p-8 border border-indigo-500/20 shadow-sm flex flex-col gap-6 relative overflow-hidden">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold text-white">חווית CutSync</h4>
                  <p className="text-[13px] text-indigo-400">דיוק, מקצועיות וסגירת פרויקטים בחצי זמן</p>
                </div>
              </div>

              <ul className="space-y-4 text-[13px] sm:text-[14px] text-zinc-300">
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <span><strong>ציור חופשי על הפריים:</strong> הלקוח מקיף או מותח חץ ישירות על האובייקט.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <span><strong>ייצוא ישיר ל-Premiere Pro:</strong> הורדת CSV שנטען כמרקרים על ציר הזמן.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <span><strong>אישור גרסה מתועד:</strong> נשמר מי אישר ומתי, כדי למנוע אי הבנות.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <span><strong>סדר מוחלט:</strong> כל סבב מופרד לגרסה (V1, V2) עם הסרטון שלו.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-20 lg:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-[11px] font-bold text-indigo-500 tracking-wider uppercase mb-3">תכונות הדגל</h2>
          <h3 className="text-3xl sm:text-4xl font-bold text-white">
            כל מה שצריך בסביבת עבודה מקצועית
          </h3>
          <p className="mt-4 text-[15px] sm:text-base text-zinc-400">
            בנינו את המערכת בדיוק סביב הצרכים של עורכי וידאו בישראל:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Feature 1 */}
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 transition-colors hover:border-zinc-700">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center mb-5">
              <PenTool className="w-5 h-5" />
            </div>
            <h4 className="text-[15px] font-semibold text-zinc-100 mb-2.5">סימון וציור בזמן אמת</h4>
            <p className="text-[13px] text-zinc-400 leading-relaxed">
              הלקוח יכול לצייר בחופשיות או למתוח חץ שמכוון לאובייקט עם אנימציית גרירה חיה בזמן אמת.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 transition-colors hover:border-zinc-700">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center mb-5">
              <Mic className="w-5 h-5" />
            </div>
            <h4 className="text-[15px] font-semibold text-zinc-100 mb-2.5">הקלטת הערות קוליות</h4>
            <p className="text-[13px] text-zinc-400 leading-relaxed">
              לפעמים קשה להסביר בטקסט. בלחיצה אחת הלקוח מקליט הודעה קולית שמוצמדת בדיוק לשנייה המתאימה.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 transition-colors hover:border-zinc-700">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center mb-5">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h4 className="text-[15px] font-semibold text-zinc-100 mb-2.5">ייצוא ל-Premiere Pro</h4>
            <p className="text-[13px] text-zinc-400 leading-relaxed">
              הורדת קובץ מרקרים CSV שנטען ישר על ציר הזמן של פרמייר ללא צורך בהקלדת שניות ידנית.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 transition-colors hover:border-zinc-700">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center mb-5">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h4 className="text-[15px] font-semibold text-zinc-100 mb-2.5">שרשורי שיחה בתיקונים</h4>
            <p className="text-[13px] text-zinc-400 leading-relaxed">
              העורך והלקוח מתכתבים ישירות בתוך התיקון הספציפי. תגיות מבדילות בין עורך ללקוח.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 transition-colors hover:border-zinc-700">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center mb-5">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-[15px] font-semibold text-zinc-100 mb-2.5">ניהול גרסאות מתקדם</h4>
            <p className="text-[13px] text-zinc-400 leading-relaxed">
              כל סבב תיקונים מופרד לגרסה מסודרת. אפשר לעבור בין גרסאות ולהעלות קובץ חדש בקלות.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 transition-colors hover:border-zinc-700">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center mb-5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-[15px] font-semibold text-zinc-100 mb-2.5">נעילת פרויקט בסיום</h4>
            <p className="text-[13px] text-zinc-400 leading-relaxed">
              לאחר אישור הלקוח, הגרסה ננעלת כדי למנוע הוספת הערות מיותרות או שינויים בדיעבד.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works (3 Steps) */}
      <section id="how-it-works" className="py-20 bg-zinc-950 border-y border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <h2 className="text-[11px] font-bold text-indigo-500 tracking-wider uppercase mb-3">תהליך העבודה</h2>
          <h3 className="text-3xl sm:text-4xl font-bold text-white mb-16">
            איך זה עובד? ב-3 צעדים
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto relative">
            
            {/* Step 1 */}
            <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 flex flex-col items-center text-center relative">
              <div className="w-12 h-12 rounded-full bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-lg mb-6">
                1
              </div>
              <h4 className="text-[15px] font-semibold text-zinc-100 mb-2.5">העורך מעלה סרטון</h4>
              <p className="text-[13px] text-zinc-400 leading-relaxed">
                טוענים את קובץ הווידאו למערכת ומקבלים קישור שיתוף ייעודי ששולחים ללקוח.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 flex flex-col items-center text-center relative">
              <div className="w-12 h-12 rounded-full bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-lg mb-6">
                2
              </div>
              <h4 className="text-[15px] font-semibold text-zinc-100 mb-2.5">הלקוח מסמן ומאשר</h4>
              <p className="text-[13px] text-zinc-400 leading-relaxed">
                הלקוח צופה, עוצר בכל פריים, מצייר, מקליט הערות, ובסיום מאשר סופית את הגרסה.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 flex flex-col items-center text-center relative">
              <div className="w-12 h-12 rounded-full bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-lg mb-6">
                3
              </div>
              <h4 className="text-[15px] font-semibold text-zinc-100 mb-2.5">ייצוא לפרמייר וסגירה</h4>
              <p className="text-[13px] text-zinc-400 leading-relaxed">
                העורך מייצא קובץ CSV ישירות ל-Premiere Pro, מתקן את כל הנקודות ברוגע ומספק את התוצר.
              </p>
            </div>

          </div>

          <div className="mt-14">
            <button
              onClick={() => onEnterStudio('editor')}
              className="px-8 py-3 rounded-lg bg-white text-zinc-900 hover:bg-zinc-200 font-semibold text-[15px] shadow-sm transition-colors"
            >
              התנסה בתהליך עכשיו בדמו חי
            </button>
          </div>

        </div>
      </section>

      {/* Seamless Workflow: Editor Workspace ↔ Client Direct Link */}
      <section id="roles" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-[11px] font-bold text-indigo-500 tracking-wider uppercase mb-2">זרימת עבודה</h2>
          <h3 className="text-3xl font-bold text-white">חיבור פשוט בין העורך ללקוח</h3>
          <p className="mt-4 text-[15px] text-zinc-400">
            העורך שולט בניהול הפרויקט — הלקוח מקבל גישה ישירה בלי סיבוכים:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          
          {/* Card 1: Editor Workspace */}
          <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 shadow-sm flex flex-col justify-between gap-6 transition-colors hover:border-zinc-700">
            <div>
              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-10 h-10 rounded-lg bg-indigo-600/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                  <Scissors className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold text-white">1. דשבורד העורך</h4>
                  <span className="text-[13px] text-zinc-500">ניהול פרויקטים וגרסאות</span>
                </div>
              </div>
              <p className="text-[13px] text-zinc-400 leading-relaxed mb-5">
                מרכז השליטה שלך: העלה סרטונים, נהל גרסאות (V1, V2, V3), העתק קישור ייעודי, סמן משימות כבוצעו, וייצא CSV ישירות ל-Premiere.
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] text-zinc-500 font-medium">
                <span className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800">דשבורד מתקדם</span>
                <span className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800">ייצוא ל-Premiere</span>
                <span className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800">צ'קליסט משימות</span>
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
              className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>כניסה לדשבורד הפרויקטים</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Client Direct Experience */}
          <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 shadow-sm flex flex-col justify-between gap-6 transition-colors hover:border-zinc-700">
            <div>
              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold text-white">2. סביבת הלקוח</h4>
                  <span className="text-[13px] text-zinc-500">קישור ישיר ומהיר ללא הרשמה</span>
                </div>
              </div>
              <p className="text-[13px] text-zinc-400 leading-relaxed mb-5">
                הלקוח מקבל קישור ישיר, פותח אותו בכל דפדפן, מסמן הערות וציורים, ומאשר את הגרסה הסופית ברגע שהכל מושלם. בלי סיסמאות ובלי הורדות.
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] text-zinc-500 font-medium">
                <span className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800">ללא הרשמה</span>
                <span className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800">גישה מכל דפדפן</span>
                <span className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800">אישור בלחיצה</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3 text-[11px]">
              <div className="flex items-center gap-2 text-zinc-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>הלקוח מקבל קישור פרטי</span>
              </div>
              <button
                type="button"
                onClick={() => onEnterStudio('client')}
                className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
                title="צפה בדוגמה לאיך הלקוח רואה את הקישור"
              >
                <span>צפה בדמו</span>
                <ArrowLeft className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <h2 className="text-[11px] font-bold text-indigo-500 tracking-wider uppercase mb-2">שאלות נפוצות</h2>
            <h3 className="text-3xl font-bold text-white">כל מה שרצית לדעת</h3>
          </div>

          <div className="flex flex-col gap-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index
              return (
                <div
                  key={index}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 text-right flex items-center justify-between gap-4 hover:bg-zinc-800/50 transition-colors"
                  >
                    <span className="text-[14px] font-semibold text-zinc-100">{faq.q}</span>
                    <div className={`text-zinc-500 transition-transform ${isOpen ? 'rotate-180 text-zinc-300' : ''}`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-[13px] text-zinc-400 leading-relaxed border-t border-zinc-800/50 pt-4">
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="bg-indigo-600 rounded-2xl p-10 sm:p-14 shadow-sm relative overflow-hidden">
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            מוכן לייעל את סבב התיקונים הבא שלך?
          </h3>
          <p className="text-[14px] sm:text-[15px] text-indigo-100 max-w-xl mx-auto mb-8 leading-relaxed">
            הצטרף לחוויית עבודה מקצועית, שקופה ומסודרת. התחל עכשיו בחינם בדמו החי של CutSync.
          </p>

          <button
            onClick={() => onEnterStudio('editor')}
            className="px-8 py-3.5 rounded-lg bg-white hover:bg-zinc-100 text-indigo-900 font-semibold text-[15px] shadow-sm transition-colors inline-flex items-center gap-2.5 cursor-pointer"
          >
            <span>פתח את הסטודיו עכשיו</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-[#09090b] py-10 text-[13px] text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-zinc-800 flex items-center justify-center text-zinc-400 font-mono font-bold text-[11px]">
              CS
            </div>
            <div>
              <span className="font-semibold text-zinc-300 font-mono">CutSync</span>
            </div>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <a href="#why" className="hover:text-zinc-200 transition-colors">יתרונות</a>
            <a href="#features" className="hover:text-zinc-200 transition-colors">תכונות</a>
            <a href="#how-it-works" className="hover:text-zinc-200 transition-colors">איך זה עובד</a>
            <a href="#faq" className="hover:text-zinc-200 transition-colors">שאלות נפוצות</a>
          </div>

          <div className="text-center sm:text-left text-zinc-400 flex flex-col sm:items-end gap-1">
            <div className="flex items-center gap-1.5 font-medium">
              <span>נוצר ופותח על ידי</span>
              <span className="text-zinc-300 font-bold px-2 py-0.5 rounded bg-zinc-800">
                kaboodi
              </span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  )
}

