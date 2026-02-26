// Lazy initialize Supabase client to avoid build-time errors
let _supabase: any = null

function getSupabaseClient() {
  if (!_supabase) {
    const { createClient } = require('@supabase/supabase-js')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
    _supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
  return _supabase
}

export const supabase = {
  from: (table: string) => getSupabaseClient().from(table),
  auth: {
    getSession: () => getSupabaseClient().auth.getSession(),
  },
}
