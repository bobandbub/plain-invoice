import { z } from 'zod'
import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import type { EmailOtpType } from '@supabase/supabase-js'

import { createSupabaseServer } from '#/lib/supabase.server'
import type { AuthUser } from '#/lib/types'

const otpTypes = [
  'email',
  'magiclink',
  'signup',
  'invite',
  'recovery',
  'email_change',
] as const satisfies ReadonlyArray<EmailOtpType>

function asOtpType(value: string | undefined): EmailOtpType {
  if (value && otpTypes.some((item) => item === value)) {
    return value
  }
  return 'email'
}

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

export const completeMagicLink = createServerFn({ method: 'GET' })
  .validator(
    z.object({
      code: z.string().optional(),
      token_hash: z.string().optional(),
      type: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const supabase = createSupabaseServer()

    if (data.code) {
      const { error } = await supabase.auth.exchangeCodeForSession(data.code)
      if (error) throw new Error(error.message)
    } else if (data.token_hash) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: data.token_hash,
        type: asOtpType(data.type),
      })
      if (error) throw new Error(error.message)
    } else {
      throw new Error('Missing login code. Request a new magic link.')
    }

    throw redirect({ to: '/dashboard' })
  })
