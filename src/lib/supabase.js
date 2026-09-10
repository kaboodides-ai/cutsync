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

const customStorage = {
  getItem: (key) => {
    if (typeof window === 'undefined') return null;
    try {
      let val = window.localStorage.getItem(key);
      if (!val) {
        // Fallback to cookie
        const cookies = document.cookie.split(';');
        const cookie = cookies.find(c => c.trim().startsWith(key + '='));
        if (cookie) {
          const cookieVal = cookie.substring(cookie.indexOf('=') + 1);
          val = decodeURIComponent(cookieVal);
          // Restore to localStorage
          window.localStorage.setItem(key, val);
        }
      }
      return val;
    } catch (e) {
      console.warn('Storage getItem error:', e);
      return null;
    }
  },
  setItem: (key, value) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, value);
      // Also save to cookie (expires in 30 days)
      const encoded = encodeURIComponent(value);
      if (encoded.length < 4000) { // Max cookie size is ~4KB
        document.cookie = `${key}=${encoded}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
      }
    } catch (e) {
      console.warn('Storage setItem error:', e);
    }
  },
  removeItem: (key) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
      document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax`;
    } catch (e) {
      console.warn('Storage removeItem error:', e);
    }
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: customStorage
  }
})

