import { Link, createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { useState } from 'react'

import { Button } from '#/components/ui/button'
import { Input, Label } from '#/components/ui/field'
import { exchangeAuthCode } from '#/lib/auth.functions'
import { MIN_PASSWORD_LENGTH } from '#/lib/config'
import { createSupabaseBrowser, isSupabaseConfigured } from '#/lib/supabase.browser'

export const Route = createFileRoute('/auth/update-password')({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    code: typeof search.code === 'string' ? search.code : undefined,
    token_hash: typeof search.token_hash === 'string' ? search.token_hash : undefined,
    type: typeof search.type === 'string' ? search.type : undefined,
  }),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    if (deps.code || deps.token_hash) {
      await exchangeAuthCode({
        data: {
          code: deps.code,
          token_hash: deps.token_hash,
          type: deps.type ?? 'recovery',
        },
      })
    }
  },
  component: UpdatePasswordPage,
})

function UpdatePasswordPage() {
  const navigate = useNavigate()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Use at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setBusy(true)
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase is not configured')
      }
      const supabase = createSupabaseBrowser()
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      await router.invalidate()
      await navigate({ to: '/dashboard' })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not save the password. Request a new reset email.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="page-wrap py-10">
      <p className="island-kicker">Account</p>
      <h1 className="display-title mt-2 text-3xl">Choose a password</h1>
      <p className="mt-2 max-w-md text-sm text-[var(--sea-ink-soft)]">
        This is what you’ll use to log in next time.
      </p>
      <form className="mt-6 max-w-sm space-y-4" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              type="password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <Button type="submit" disabled={busy}>
            {busy ? 'Saving…' : 'Save password'}
          </Button>
        </form>
        <p className="mt-6 text-sm">
          <Link to="/login">Back to login</Link>
        </p>
    </main>
  )
}
