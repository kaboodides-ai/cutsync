// src/lib/supabase.js
// Supabase client singleton — imported wherever DB/Auth access is needed

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || supabaseUrl.includes('YOUR_PROJECT_ID')) {
  console.warn(
    '[CutSync] ⚠️  Supabase credentials not set in .env.local\n' +
    'Open .env.local and replace VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY\n' +
    'with your actual values from Supabase Dashboard → Settings → API.'
  )
}

// Safari on iOS aggressively clears localStorage under ITP (Intelligent Tracking Prevention).
// We use a hybrid storage: write to both localStorage AND sessionStorage.
// On page open after full browser close, if localStorage is gone, sessionStorage may still have the token
// (it survives minimise/restore on iOS but not full quit — which is exactly the Supabase token format needed).
//
// The real fix for full quit persistence is that Supabase's refresh token in localStorage should survive
// as long as Safari doesn't classify it as cross-site tracking data.
// We use a unique storageKey prefixed with the domain to avoid cross-site conflicts.
const STORAGE_KEY_PREFIX = 'cutsync_auth_'

const hybridStorage = {
  getItem: (key) => {
    try {
      // Primary: localStorage (survives full quit on most browsers)
      const val = window.localStorage.getItem(key)
      if (val) return val
      // Fallback: sessionStorage (survives minimize/restore on iOS)
      return window.sessionStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem: (key, value) => {
    try {
      window.localStorage.setItem(key, value)
    } catch {
      // localStorage blocked? (Safari Private mode quota = 0)
    }
    try {
      window.sessionStorage.setItem(key, value)
    } catch {
      // ignore
    }
  },
  removeItem: (key) => {
    try { window.localStorage.removeItem(key) } catch { /* ignore */ }
    try { window.sessionStorage.removeItem(key) } catch { /* ignore */ }
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: STORAGE_KEY_PREFIX + 'session',
    storage: hybridStorage
  }
})
