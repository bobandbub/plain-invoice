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

const authCodeSchema = z.object({
  code: z.string().optional(),
  token_hash: z.string().optional(),
  type: z.string().optional(),
})

type AuthCodeInput = z.infer<typeof authCodeSchema>

function asOtpType(value: string | undefined): EmailOtpType {
  if (value && otpTypes.some((item) => item === value)) {
    return value
  }
  return 'email'
}

async function exchangeAuthCodeData(data: AuthCodeInput) {
  if (!data.code && !data.token_hash) return

  const supabase = createSupabaseServer()

  if (data.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(data.code)
    if (error) throw new Error(error.message)
    return
  }

  if (!data.token_hash) return

  const { error } = await supabase.auth.verifyOtp({
    token_hash: data.token_hash,
    type: asOtpType(data.type),
  })
  if (error) throw new Error(error.message)
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

export const signOut = createServerFn({ method: 'POST' }).handler(async () => {
  try {
    const supabase = createSupabaseServer()
    await supabase.auth.signOut()
  } catch {
    // Already signed out, or cookies were missing.
  }
})

export const exchangeAuthCode = createServerFn({ method: 'GET' })
  .validator(authCodeSchema)
  .handler(async ({ data }) => {
    await exchangeAuthCodeData(data)
  })

export const completeMagicLink = createServerFn({ method: 'GET' })
  .validator(authCodeSchema)
  .handler(async ({ data }) => {
    if (!data.code && !data.token_hash) {
      throw new Error('Missing login code. Request a new email and try again.')
    }

    await exchangeAuthCodeData(data)

    throw redirect({
      to: data.type === 'recovery' ? '/auth/update-password' : '/dashboard',
    })
  })
