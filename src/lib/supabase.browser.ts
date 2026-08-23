import { createBrowserClient } from '@supabase/ssr'

export function isSupabaseConfigured() {
  return Boolean(
    import.meta.env.VITE_SUPABASE_URL &&
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  )
}

export function createSupabaseBrowser() {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY')
  }
  return createBrowserClient(url, key, {
    cookieOptions: {
      path: '/',
      sameSite: 'lax',
    },
    auth: {
      // The callback route exchanges the code on the server. Auto-detect
      // here would consume the PKCE verifier first and then fail.
      detectSessionInUrl: false,
      flowType: 'pkce',
    },
  })
}
