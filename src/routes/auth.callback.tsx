import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { createSupabaseBrowser } from '#/lib/supabase.browser'

export const Route = createFileRoute('/auth/callback')({
  ssr: false,
  component: AuthCallback,
})

function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      const url = new URL(window.location.href)
      const code = url.searchParams.get('code')
      const tokenHash = url.searchParams.get('token_hash')
      const type = url.searchParams.get('type')
      const supabase = createSupabaseBrowser()

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (exchangeError) throw exchangeError
      } else if (tokenHash && type) {
        const { error: otpError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type,
        })
        if (otpError) throw otpError
      } else {
        throw new Error('Missing login code. Request a new magic link.')
      }

      await navigate({ to: '/dashboard' })
    }

    void run().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Sign-in failed')
    })
  }, [navigate])

  return (
    <main className="page-wrap py-20 text-center">
      {error ? (
        <p className="text-red-700">{error}</p>
      ) : (
        <p className="text-[var(--sea-ink-soft)]">Signing you in…</p>
      )}
    </main>
  )
}
