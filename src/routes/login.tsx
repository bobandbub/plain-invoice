import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { Button } from '#/components/ui/button'
import { Input, Label } from '#/components/ui/field'
import { APP_NAME } from '#/lib/config'
import { createSupabaseBrowser, isSupabaseConfigured } from '#/lib/supabase.browser'

export const Route = createFileRoute('/login')({
  ssr: false,
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const configured = isSupabaseConfigured()

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const supabase = createSupabaseBrowser()
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (otpError) throw otpError
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the login email')
    } finally {
      setBusy(false)
    }
  }

  if (!configured) {
    return (
      <main className="page-wrap py-16">
        <div className="island-shell mx-auto max-w-lg rounded-2xl p-8">
          <h1 className="display-title text-3xl">Set up {APP_NAME} first</h1>
          <p className="mt-3 text-[var(--sea-ink-soft)]">
            Copy <code>.env.example</code> to <code>.env</code>, add a new Supabase
            project’s URL and publishable key, then run the SQL in{' '}
            <code>supabase/migrations</code>.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="page-wrap py-16">
      <div className="island-shell mx-auto max-w-md rounded-2xl p-8">
        <p className="island-kicker">Magic link</p>
        <h1 className="display-title mt-2 text-3xl">Log in to {APP_NAME}</h1>
        <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
          We’ll email you a link. No password.
        </p>
        {sent ? (
          <p className="mt-6 text-sm">
            Check <strong>{email}</strong> and open the link to continue.
          </p>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            <Button type="submit" disabled={busy}>
              {busy ? 'Sending…' : 'Email me a link'}
            </Button>
          </form>
        )}
        <button
          type="button"
          className="mt-6 text-sm text-[var(--sea-ink-soft)]"
          onClick={() => navigate({ to: '/' })}
        >
          Back to home
        </button>
      </div>
    </main>
  )
}
