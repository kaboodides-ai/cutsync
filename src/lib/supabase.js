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
    let val = window.localStorage.getItem(key);
    if (!val) {
      // Fallback to cookie
      const cookies = document.cookie.split(';');
      const cookie = cookies.find(c => c.trim().startsWith(key + '='));
      if (cookie) {
        val = decodeURIComponent(cookie.split('=')[1]);
        // Restore to localStorage
        window.localStorage.setItem(key, val);
      }
    }
    return val;
  },
  setItem: (key, value) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, value);
    // Also save to cookie (expires in 30 days)
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
  },
  removeItem: (key) => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
    document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax`;
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

