// CutSync Authentication & Per-User Project Isolation Service

const STORAGE_USERS_KEY = 'cutsync_users_db'
const STORAGE_CURRENT_USER_KEY = 'cutsync_current_user'

const DEFAULT_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'

// Initial Seed Users for immediate testing
const INITIAL_USERS = [
  {
    id: 'usr-google-1',
    name: 'עומר כהן',
    email: 'omer.cohen@gmail.com',
    provider: 'google',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    createdAt: '2026-09-01T10:00:00.000Z'
  },
  {
    id: 'usr-discord-1',
    name: 'YossiEditor#4420',
    email: 'yossi.editor@discord.gg',
    provider: 'discord',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
    createdAt: '2026-09-03T12:30:00.000Z'
  },
  {
    id: 'usr-email-1',
    name: 'מיכל שרון',
    email: 'michal@studio.co.il',
    password: 'password123',
    provider: 'email',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    createdAt: '2026-09-05T14:15:00.000Z'
  }
]

// Seed projects per user
function getSeedProjectsForUser(user) {
  if (user.id === 'usr-google-1') {
    return [
      {
        id: 'proj-google-1',
        title: 'סרטון תדמית מוצר - חברת אלפא (עומר)',
        clientName: 'דניאל כהן',
        createdAt: '2026-09-01T11:00:00.000Z',
        updatedAt: new Date().toISOString(),
        activeVersionId: 'v1',
        versions: [
          {
            id: 'v1',
            number: 1,
            name: 'גרסה 1 (V1)',
            videoSrc: DEFAULT_VIDEO,
            videoTitle: 'סרטון תדמית מוצר - חברת אלפא (עומר)',
            createdAt: '2026-09-01T11:00:00.000Z',
            comments: [
              { id: '1', time: 3, category: 'cut', text: 'לקצר את השתיקה בהתחלה בחצי שנייה', completed: false, author: 'לקוח', drawing: null, replies: [] },
              { id: '2', time: 8, category: 'audio', text: 'להגביר כאן מעט את מוזיקת הרקע', completed: true, author: 'לקוח', drawing: null, replies: [
                { id: 'r1', author: 'עורך', text: 'הגברתי ב-3dB ואיזנתי עם הדיבור', createdAt: '2026-09-01T12:00:00.000Z' }
              ] }
            ],
            approved: false
          }
        ]
      },
      {
        id: 'proj-google-2',
        title: 'קמפיין טיקטוק ורילס - קיץ 2026',
        clientName: 'נועה רובין',
        createdAt: '2026-09-04T09:30:00.000Z',
        updatedAt: new Date().toISOString(),
        activeVersionId: 'v1',
        versions: [
          {
            id: 'v1',
            number: 1,
            name: 'גרסה 1 (V1)',
            videoSrc: DEFAULT_VIDEO,
            videoTitle: 'קמפיין טיקטוק ורילס - קיץ 2026',
            createdAt: '2026-09-04T09:30:00.000Z',
            comments: [
              { id: 't1', time: 2, category: 'text', text: 'להחליף פונט לפונט עבה וקריא יותר', completed: true, author: 'לקוח', replies: [] }
            ],
            approved: true,
            approvedAt: '2026-09-04T15:00:00.000Z',
            approvedBy: 'נועה רובין'
          }
        ]
      }
    ]
  }

  if (user.id === 'usr-discord-1') {
    return [
      {
        id: 'proj-discord-1',
        title: 'קליפ מוזיקלי - שיר נושא רשמי 🎵 (Yossi)',
        clientName: 'להקת רעמים',
        createdAt: '2026-09-03T13:00:00.000Z',
        updatedAt: new Date().toISOString(),
        activeVersionId: 'v1',
        versions: [
          {
            id: 'v1',
            number: 1,
            name: 'גרסה 1 (V1)',
            videoSrc: DEFAULT_VIDEO,
            videoTitle: 'קליפ מוזיקלי - שיר נושא רשמי 🎵 (Yossi)',
            createdAt: '2026-09-03T13:00:00.000Z',
            comments: [
              { id: 'd1', time: 5, category: 'color', text: 'המעבר לצבע חם מדי, לקרר קצת גוונים כחולים', completed: false, author: 'לקוח', replies: [] }
            ],
            approved: false
          }
        ]
      }
    ]
  }

  if (user.id === 'usr-email-1') {
    return [
      {
        id: 'proj-email-1',
        title: 'סרטון הדרכה למשתמשי מערכת (מיכל שרון)',
        clientName: 'הנהלת הדרכה',
        createdAt: '2026-09-05T15:00:00.000Z',
        updatedAt: new Date().toISOString(),
        activeVersionId: 'v1',
        versions: [
          {
            id: 'v1',
            number: 1,
            name: 'גרסה 1 (V1)',
            videoSrc: DEFAULT_VIDEO,
            videoTitle: 'סרטון הדרכה למשתמשי מערכת (מיכל שרון)',
            createdAt: '2026-09-05T15:00:00.000Z',
            comments: [
              { id: 'm1', time: 1, category: 'general', text: 'מעולה! הוספתי כתוביות בעריכה', completed: true, author: 'לקוח', replies: [] }
            ],
            approved: false
          }
        ]
      }
    ]
  }

  // Generic starter project for newly registered users
  return [
    {
      id: `proj-${user.id}-${Date.now()}`,
      title: `פרויקט ראשון של ${user.name || 'העורך'} 🎬`,
      clientName: 'לקוח לדוגמה',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activeVersionId: 'v1',
      versions: [
        {
          id: 'v1',
          number: 1,
          name: 'גרסה 1 (V1)',
          videoSrc: DEFAULT_VIDEO,
          videoTitle: `פרויקט ראשון של ${user.name || 'העורך'} 🎬`,
          createdAt: new Date().toISOString(),
          comments: [
            { id: 'w1', time: 4, category: 'general', text: 'ברוך הבא ל-CutSync! שתף קישור זה עם הלקוח שלך כדי להתחיל לקבל הערות.', completed: false, author: 'CutSync Bot', replies: [] }
          ],
          approved: false
        }
      ]
    }
  ]
}

// Get all registered users from localStorage
export function getUsersDb() {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {
    console.error('Error reading users db:', e)
  }
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(INITIAL_USERS))
  return INITIAL_USERS
}

// Save users db
function saveUsersDb(users) {
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users))
}

// Get currently authenticated user
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(STORAGE_CURRENT_USER_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch (e) {
    console.error('Error reading current user:', e)
  }
  // Default to first user (Omer - Google) if nothing is stored, or null
  // Setting default initial user ensures a smooth out-of-the-box experience
  const defaultUser = INITIAL_USERS[0]
  setCurrentUser(defaultUser)
  return defaultUser
}

// Set currently authenticated user
export function setCurrentUser(user) {
  if (!user) {
    localStorage.removeItem(STORAGE_CURRENT_USER_KEY)
  } else {
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(user))
  }
}

// Log out
export function logoutUser() {
  localStorage.removeItem(STORAGE_CURRENT_USER_KEY)
}

// Login with Email & Password
export function loginWithEmail(email, password) {
  const users = getUsersDb()
  const cleanEmail = email.trim().toLowerCase()
  const user = users.find(u => u.email.toLowerCase() === cleanEmail)

  if (!user) {
    throw new Error('כתובת האימייל אינה רשומה במערכת')
  }

  if (user.password && user.password !== password) {
    throw new Error('הסיסמה שהוזנה שגויה, נסה שוב')
  }

  setCurrentUser(user)
  return user
}

// Full Registration with Email & Password
export function registerWithEmail({ name, email, password }) {
  const cleanEmail = email.trim().toLowerCase()
  const cleanName = name.trim()

  if (!cleanName) throw new Error('נא להזין שם מלא')
  if (!cleanEmail || !cleanEmail.includes('@')) throw new Error('נא להזין כתובת אימייל תקינה')
  if (!password || password.length < 6) throw new Error('הסיסמה חייבת להכיל לפחות 6 תווים')

  const users = getUsersDb()
  const existing = users.find(u => u.email.toLowerCase() === cleanEmail)
  if (existing) {
    throw new Error('כתובת אימייל זו כבר רשומה במערכת. נסה להתחבר.')
  }

  const newUser = {
    id: `usr-email-${Date.now()}`,
    name: cleanName,
    email: cleanEmail,
    password: password,
    provider: 'email',
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=6366f1,8b5cf6,ec4899`,
    createdAt: new Date().toISOString()
  }

  users.push(newUser)
  saveUsersDb(users)
  setCurrentUser(newUser)

  // Initialize seed projects for this new user
  const initialProjects = getSeedProjectsForUser(newUser)
  saveUserProjects(newUser.id, initialProjects)

  return newUser
}

// Fast Google / Gmail Auth
export function loginWithGoogle(customEmail, customName) {
  const users = getUsersDb()
  const email = (customEmail || 'omer.cohen@gmail.com').trim().toLowerCase()
  const name = customName?.trim() || 'עומר כהן'

  let user = users.find(u => u.email.toLowerCase() === email && u.provider === 'google')
  if (!user) {
    user = {
      id: `usr-google-${Date.now()}`,
      name: name,
      email: email,
      provider: 'google',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=ea4335,fbbc05,34a853`,
      createdAt: new Date().toISOString()
    }
    users.push(user)
    saveUsersDb(users)
    saveUserProjects(user.id, getSeedProjectsForUser(user))
  }

  setCurrentUser(user)
  return user
}

// Fast Discord Auth
export function loginWithDiscord(customUsername) {
  const users = getUsersDb()
  const username = (customUsername || 'YossiEditor#4420').trim()
  const email = `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@discord.gg`

  let user = users.find(u => u.name === username && u.provider === 'discord')
  if (!user) {
    user = {
      id: `usr-discord-${Date.now()}`,
      name: username,
      email: email,
      provider: 'discord',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}&backgroundColor=5865F2`,
      createdAt: new Date().toISOString()
    }
    users.push(user)
    saveUsersDb(users)
    saveUserProjects(user.id, getSeedProjectsForUser(user))
  }

  setCurrentUser(user)
  return user
}

// Per-User Projects Isolation: Get projects for specific userId
export function getUserProjects(userId) {
  if (!userId) return []
  const key = `cutsync_projects_${userId}`
  try {
    const raw = localStorage.getItem(key)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch (e) {
    console.error('Error loading projects for user:', userId, e)
  }

  // If no projects exist yet for this user, seed them
  const users = getUsersDb()
  const user = users.find(u => u.id === userId) || { id: userId, name: 'משתמש' }
  const seeded = getSeedProjectsForUser(user)
  saveUserProjects(userId, seeded)
  return seeded
}

// Per-User Projects Isolation: Save projects for specific userId
export function saveUserProjects(userId, projects) {
  if (!userId) return
  const key = `cutsync_projects_${userId}`
  localStorage.setItem(key, JSON.stringify(projects))
}
