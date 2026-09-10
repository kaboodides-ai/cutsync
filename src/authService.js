// src/authService.js
// CutSync Auth & Per-User Project Service — powered by Supabase
// Public API is identical to the old localStorage version so App.jsx needs minimal changes.

import { supabase } from './lib/supabase'
import { generateUUID, isValidUUID } from './lib/uuid'

export { generateUUID, isValidUUID }

const DEFAULT_VIDEO =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'

// ─────────────────────────────────────────────────────────────
// Helper: shape a Supabase user + profile into the CutSync user object
// ─────────────────────────────────────────────────────────────
export function shapeCutSyncUser(supabaseUser, profile) {
  if (!supabaseUser) return null
  const meta = supabaseUser.user_metadata || {}
  const appMeta = supabaseUser.app_metadata || {}
  const provider = profile?.provider || appMeta.provider || 'email'

  return {
    id: supabaseUser.id,
    name:
      profile?.name ||
      meta.full_name ||
      meta.name ||
      supabaseUser.email?.split('@')[0] ||
      'משתמש',
    email: supabaseUser.email || '',
    avatar:
      profile?.avatar_url ||
      meta.avatar_url ||
      meta.picture ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        meta.full_name || supabaseUser.email || 'U'
      )}&backgroundColor=6366f1,8b5cf6`,
    provider
  }
}

// ─────────────────────────────────────────────────────────────
// Get current authenticated user (sync snapshot)
// Returns shaped CutSync user object or null
// ─────────────────────────────────────────────────────────────
export function getCurrentUser() {
  // This is called synchronously at init time.
  // The real session is restored asynchronously via onAuthStateChange in App.jsx.
  // We return null here and let onAuthStateChange populate the user.
  return null
}

// ─────────────────────────────────────────────────────────────
// Fetch current Supabase session + profile (async)
// ─────────────────────────────────────────────────────────────
export async function getSessionUser() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null
  const profile = await fetchProfile(session.user.id)
  return shapeCutSyncUser(session.user, profile)
}

// ─────────────────────────────────────────────────────────────
// Fetch profile row from public.profiles
// ─────────────────────────────────────────────────────────────
export async function fetchProfile(userId) {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data || null
}

// ─────────────────────────────────────────────────────────────
// Email + Password — Register
// ─────────────────────────────────────────────────────────────
export async function registerWithEmail({ name, email, password }) {
  const cleanEmail = email.trim().toLowerCase()
  const cleanName = name.trim()

  if (!cleanName) throw new Error('נא להזין שם מלא')
  if (!cleanEmail || !cleanEmail.includes('@')) throw new Error('נא להזין כתובת אימייל תקינה')
  if (!password || password.length < 6) throw new Error('הסיסמה חייבת להכיל לפחות 6 תווים')

  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      data: { full_name: cleanName }
    }
  })

  if (error) throw new Error(translateSupabaseError(error.message))

  // If email confirmation is required, data.session will be null
  if (!data.session) {
    // Return a partial user so the UI can show "check your email"
    return { id: data.user?.id, name: cleanName, email: cleanEmail, provider: 'email', avatar: null, needsEmailConfirmation: true }
  }

  const profile = await fetchProfile(data.user.id)
  return shapeCutSyncUser(data.user, profile)
}

// ─────────────────────────────────────────────────────────────
// Email + Password — Login
// ─────────────────────────────────────────────────────────────
export async function loginWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password
  })

  if (error) throw new Error(translateSupabaseError(error.message))
  const profile = await fetchProfile(data.user.id)
  return shapeCutSyncUser(data.user, profile)
}

// ─────────────────────────────────────────────────────────────
// Forgot Password — sends reset email
// ─────────────────────────────────────────────────────────────
export async function sendPasswordResetEmail(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    { redirectTo: `${window.location.origin}/` }
  )
  if (error) throw new Error(translateSupabaseError(error.message))
}

// ─────────────────────────────────────────────────────────────
// Google OAuth — opens real Google popup/redirect
// Helper to open official OAuth popup window
function openAuthPopup(url, title = 'OAuth') {
  const width = 500
  const height = 650
  const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - width) / 2))
  const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - height) / 2))

  const popup = window.open(
    url,
    title,
    `width=${width},height=${height},left=${left},top=${top},status=0,menubar=0,toolbar=0,resizable=yes,scrollbars=yes`
  )

  if (!popup || popup.closed || typeof popup.closed === 'undefined') {
    // If browser blocked popup, fallback to redirecting current window
    window.location.href = url
  } else {
    popup.focus()
  }
}

// ─────────────────────────────────────────────────────────────
// Google OAuth — opens real Google popup
// ─────────────────────────────────────────────────────────────
export async function loginWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`,
      skipBrowserRedirect: true,
      queryParams: { access_type: 'offline', prompt: 'consent' }
    }
  })
  if (error) throw new Error(translateSupabaseError(error.message))
  if (data?.url) {
    openAuthPopup(data.url, 'GoogleAuth')
  } else {
    throw new Error('לא התקבל קישור התחברות מגוגל')
  }
}

// ─────────────────────────────────────────────────────────────
// Discord OAuth — opens real Discord popup
// ─────────────────────────────────────────────────────────────
export async function loginWithDiscord() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: `${window.location.origin}/`,
      skipBrowserRedirect: true
    }
  })
  if (error) throw new Error(translateSupabaseError(error.message))
  if (data?.url) {
    openAuthPopup(data.url, 'DiscordAuth')
  } else {
    throw new Error('לא התקבל קישור התחברות מדיסקורד')
  }
}

// ─────────────────────────────────────────────────────────────
// Logout
// ─────────────────────────────────────────────────────────────
export async function logoutUser() {
  await supabase.auth.signOut()
}

// Compatibility shim (called from App.jsx synchronously in some places)
export function setCurrentUser() {
  // No-op — Supabase manages session internally
}

// ─────────────────────────────────────────────────────────────
// getUsersDb — used by AuthModal for listing saved accounts
// Returns [] — not applicable with real auth
// ─────────────────────────────────────────────────────────────
export function getUsersDb() {
  return []
}

// ─────────────────────────────────────────────────────────────
// Projects — load all projects for current user (with versions + comments)
// ─────────────────────────────────────────────────────────────
export async function getUserProjects(userId) {
  if (!userId) return []

  // Fetch projects
  const { data: projectRows, error: projErr } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (projErr) {
    console.error('[CutSync] Error loading projects:', projErr)
    return []
  }
  if (!projectRows || projectRows.length === 0) {
    return []
  }

  // Fetch versions + comments for all projects
  const projectIds = projectRows.map((p) => p.id)

  const { data: versionRows } = await supabase
    .from('versions')
    .select('*')
    .in('project_id', projectIds)
    .order('number', { ascending: true })

  const versionIds = (versionRows || []).map((v) => v.id)
  let commentRows = []
  if (versionIds.length > 0) {
    const { data: cr } = await supabase
      .from('comments')
      .select('*')
      .in('version_id', versionIds)
      .order('time', { ascending: true })
    commentRows = cr || []
  }

  // Assemble into nested structure used by React state
  return projectRows.map((proj) => {
    const versions = (versionRows || [])
      .filter((v) => v.project_id === proj.id)
      .map((ver) => ({
        id: ver.id,
        number: ver.number,
        name: ver.name,
        videoSrc: ver.video_src,
        videoTitle: proj.title,
        approved: ver.approved,
        approvedAt: ver.approved_at,
        approvedBy: ver.approved_by,
        createdAt: ver.created_at,
        comments: commentRows
          .filter((c) => c.version_id === ver.id)
          .map((c) => ({
            id: c.id,
            time: c.time,
            category: c.category,
            text: c.text,
            author: c.author,
            completed: c.completed,
            drawing: c.drawing,
            reactions: c.reactions || {},
            replies: c.replies || [],
            audioSrc: c.audio_src,
            audioDuration: c.audio_duration,
            createdAt: c.created_at
          }))
      }))

    return {
      id: proj.id,
      title: proj.title,
      clientName: proj.client_name,
      activeVersionId: proj.active_version_id || versions[0]?.id,
      createdAt: proj.created_at,
      updatedAt: proj.updated_at,
      versions
    }
  })
}

// ─────────────────────────────────────────────────────────────
// Project by ID — load a single project (accessible to clients without login)
// ─────────────────────────────────────────────────────────────
export async function getProjectById(projectId) {
  if (!projectId) return null

  const { data: proj, error: projErr } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (projErr || !proj) {
    console.warn('[CutSync] Could not find project:', projectId, projErr)
    return null
  }

  const { data: versionRows } = await supabase
    .from('versions')
    .select('*')
    .eq('project_id', proj.id)
    .order('number', { ascending: true })

  const versionIds = (versionRows || []).map((v) => v.id)
  let commentRows = []
  if (versionIds.length > 0) {
    const { data: cr } = await supabase
      .from('comments')
      .select('*')
      .in('version_id', versionIds)
      .order('time', { ascending: true })
    commentRows = cr || []
  }

  const versions = (versionRows || []).map((ver) => ({
    id: ver.id,
    number: ver.number,
    name: ver.name,
    videoSrc: ver.video_src,
    videoTitle: proj.title,
    approved: ver.approved,
    approvedAt: ver.approved_at,
    approvedBy: ver.approved_by,
    approvalNote: ver.approval_note,
    createdAt: ver.created_at,
    comments: commentRows
      .filter((c) => c.version_id === ver.id)
      .map((c) => ({
        id: c.id,
        time: c.time,
        category: c.category,
        text: c.text,
        author: c.author,
        completed: c.completed,
        drawing: c.drawing,
        reactions: c.reactions || {},
        replies: c.replies || [],
        audioSrc: c.audio_src,
        audioDuration: c.audio_duration,
        createdAt: c.created_at
      }))
  }))

  if (versions.length === 0) {
    const defaultVerId = generateUUID()
    versions.push({
      id: defaultVerId,
      number: 1,
      name: 'גרסה 1 (V1)',
      videoSrc: DEFAULT_VIDEO,
      videoTitle: proj.title,
      approved: false,
      comments: []
    })
  }

  return {
    id: proj.id,
    title: proj.title,
    clientName: proj.client_name || 'הלקוח',
    activeVersionId: proj.active_version_id || versions[0]?.id,
    createdAt: proj.created_at,
    updatedAt: proj.updated_at,
    versions
  }
}

// ─────────────────────────────────────────────────────────────
// Upload video to Supabase Storage ('videos' bucket)
// ─────────────────────────────────────────────────────────────
export async function uploadVideoToStorage(file) {
  if (!file) return null

  const ext = file.name.split('.').pop() || 'mp4'
  const cleanName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`
  const filePath = `uploads/${cleanName}`

  const { data, error } = await supabase.storage
    .from('videos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'video/mp4'
    })

  if (error) {
    console.error('[CutSync] Error uploading video to Supabase Storage:', error)
    throw error
  }

  const { data: publicUrlData } = supabase.storage
    .from('videos')
    .getPublicUrl(filePath)

  return publicUrlData.publicUrl
}

// ─────────────────────────────────────────────────────────────
// Save comments added by client directly to Supabase
// ─────────────────────────────────────────────────────────────
export async function saveClientComments(versionId, comments) {
  if (!versionId || !comments) return

  for (const c of comments) {
    const commentId = isValidUUID(c.id) ? c.id : generateUUID()
    const { error } = await supabase.from('comments').upsert({
      id: commentId,
      version_id: versionId,
      time: c.time || 0,
      category: c.category || 'general',
      text: c.text || '',
      author: c.author || 'לקוח',
      completed: !!c.completed,
      drawing: c.drawing || null,
      reactions: c.reactions || {},
      replies: c.replies || [],
      audio_src: c.audioSrc || null,
      audio_duration: c.audioDuration || null
    })
    if (error) console.error('[CutSync] Error saving client comment:', error)
  }
}

// ─────────────────────────────────────────────────────────────
// Save version approval state (called when client approves)
// ─────────────────────────────────────────────────────────────
export async function saveVersionApproval(versionId, approvalData) {
  if (!versionId || !approvalData) return

  const { error } = await supabase.from('versions').update({
    approved: !!approvalData.approved,
    approved_at: approvalData.approvedAt || null,
    approved_by: approvalData.approvedBy || null,
    approval_note: approvalData.approvalNote || null
  }).eq('id', versionId)

  if (error) {
    console.error('[CutSync] Error updating version approval:', error)
  }
}

// ─────────────────────────────────────────────────────────────
// Projects — save entire project list back to Supabase
// This does a smart diff: upsert projects/versions, upsert comments
// ─────────────────────────────────────────────────────────────
export async function saveUserProjects(userId, projects) {
  if (!userId || !projects) return

  for (const proj of projects) {
    const safeProjId = isValidUUID(proj.id) ? proj.id : generateUUID()
    const safeActiveVerId = isValidUUID(proj.activeVersionId) ? proj.activeVersionId : null

    // Upsert project row
    const { error: pErr } = await supabase.from('projects').upsert({
      id: safeProjId,
      user_id: userId,
      title: proj.title,
      client_name: proj.clientName || '',
      active_version_id: safeActiveVerId,
      updated_at: new Date().toISOString()
    })
    if (pErr) { console.error('[CutSync] Error saving project:', pErr); continue }

    for (const ver of (proj.versions || [])) {
      const safeVerId = isValidUUID(ver.id) ? ver.id : generateUUID()
      // Upsert version row
      const { error: vErr } = await supabase.from('versions').upsert({
        id: safeVerId,
        project_id: safeProjId,
        number: ver.number || 1,
        name: ver.name || 'גרסה 1',
        video_src: ver.videoSrc || '',
        approved: ver.approved || false,
        approved_at: ver.approvedAt || null,
        approved_by: ver.approvedBy || null,
        approval_note: ver.approvalNote || null
      })
      if (vErr) { console.error('[CutSync] Error saving version:', vErr); continue }

      // Upsert comments
      for (const c of (ver.comments || [])) {
        const safeCommentId = isValidUUID(c.id) ? c.id : generateUUID()
        await supabase.from('comments').upsert({
          id: safeCommentId,
          version_id: safeVerId,
          time: c.time || 0,
          category: c.category || 'general',
          text: c.text || '',
          author: c.author || 'לקוח',
          completed: c.completed || false,
          drawing: c.drawing || null,
          reactions: c.reactions || {},
          replies: c.replies || [],
          audio_src: c.audioSrc || null,
          audio_duration: c.audioDuration || null
        })
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Delete a specific project
// ─────────────────────────────────────────────────────────────
export async function deleteProject(projectId) {
  if (!projectId) return
  const { error } = await supabase.from('projects').delete().eq('id', projectId)
  if (error) {
    console.error('[CutSync] Error deleting project:', error)
  }
}

// ─────────────────────────────────────────────────────────────
// Seed a starter project for brand-new users
// ─────────────────────────────────────────────────────────────
async function seedStarterProject(userId) {
  const projectId = crypto.randomUUID()
  const versionId = crypto.randomUUID()
  const commentId = crypto.randomUUID()
  const now = new Date().toISOString()

  await supabase.from('projects').insert({
    id: projectId,
    user_id: userId,
    title: 'הפרויקט הראשון שלי 🎬',
    client_name: 'לקוח לדוגמה',
    active_version_id: versionId,
    created_at: now,
    updated_at: now
  })

  await supabase.from('versions').insert({
    id: versionId,
    project_id: projectId,
    number: 1,
    name: 'גרסה 1 (V1)',
    video_src: DEFAULT_VIDEO,
    approved: false,
    created_at: now
  })

  await supabase.from('comments').insert({
    id: commentId,
    version_id: versionId,
    time: 4,
    category: 'general',
    text: 'ברוך הבא ל-CutSync! 🎉 שתף את קישור הפרויקט עם הלקוח שלך כדי להתחיל לקבל הערות.',
    author: 'CutSync',
    completed: false,
    replies: [],
    reactions: {},
    created_at: now
  })

  return [{
    id: projectId,
    title: 'הפרויקט הראשון שלי 🎬',
    clientName: 'לקוח לדוגמה',
    activeVersionId: versionId,
    createdAt: now,
    updatedAt: now,
    versions: [{
      id: versionId,
      number: 1,
      name: 'גרסה 1 (V1)',
      videoSrc: DEFAULT_VIDEO,
      videoTitle: 'הפרויקט הראשון שלי 🎬',
      approved: false,
      createdAt: now,
      comments: [{
        id: commentId,
        time: 4,
        category: 'general',
        text: 'ברוך הבא ל-CutSync! 🎉 שתף את קישור הפרויקט עם הלקוח שלך כדי להתחיל לקבל הערות.',
        author: 'CutSync',
        completed: false,
        drawing: null,
        reactions: {},
        replies: [],
        createdAt: now
      }]
    }]
  }]
}

// ─────────────────────────────────────────────────────────────
// Translate common Supabase error messages to Hebrew
// ─────────────────────────────────────────────────────────────
function translateSupabaseError(msg) {
  if (!msg) return 'אירעה שגיאה. נסה שוב.'
  const m = msg.toLowerCase()
  if (m.includes('invalid login credentials') || m.includes('invalid credentials'))
    return 'כתובת האימייל או הסיסמה שגויים. נסה שוב.'
  if (m.includes('email not confirmed'))
    return 'האימייל שלך טרם אומת. בדוק את תיבת הדואר ולחץ על הקישור שקיבלת.'
  if (m.includes('user already registered') || m.includes('already been registered'))
    return 'כתובת אימייל זו כבר רשומה. נסה להתחבר.'
  if (m.includes('password should be at least'))
    return 'הסיסמה חייבת להכיל לפחות 6 תווים.'
  if (m.includes('unable to validate email'))
    return 'כתובת אימייל לא תקינה.'
  if (m.includes('rate limit'))
    return 'יותר מדי ניסיונות. המתן מספר דקות ונסה שוב.'
  if (m.includes('provider') && m.includes('not enabled'))
    return 'ספק ההתחברות הזה אינו מוגדר עדיין. בדוק את הגדרות Supabase.'
  return msg
}
