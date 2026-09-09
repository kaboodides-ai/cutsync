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

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

