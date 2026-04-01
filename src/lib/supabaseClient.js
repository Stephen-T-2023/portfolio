/* ============================================
   supabaseClient.js
   Ashborne Portfolio
   Initialises and exports a single Supabase
   client instance used across the entire site
   ============================================ */

import { createClient } from '@supabase/supabase-js'

/* Pull keys from environment variables so they
   are never hardcoded into source code */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase