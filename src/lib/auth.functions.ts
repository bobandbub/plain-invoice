import { createServerFn } from '@tanstack/react-start'

import { createSupabaseServer } from '#/lib/supabase.server'
import type { AuthUser } from '#/lib/types'

export const getAuthUser = createServerFn({ method: 'GET' }).handler(
  async (): Promise<AuthUser | null> => {
    try {
      const supabase = createSupabaseServer()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return null
      return { id: user.id, email: user.email ?? null }
    } catch {
      return null
    }
  },
)
