import { createFileRoute, redirect, useNavigate, useRouter } from '@tanstack/react-router'
import { useState } from 'react'

import { Button } from '#/components/ui/button'
import { Input, Label } from '#/components/ui/field'
import { APP_NAME, MIN_PASSWORD_LENGTH } from '#/lib/config'
import { createSupabaseBrowser, isSupabaseConfigured } from '#/lib/supabase.browser'

type LoginSearch = {
  mode?: 'signup'
}

type AuthView = 'login' | 'signup' | 'forgot' | 'check-email' | 'reset-sent'

export const Route = createFileRoute('/login')({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    mode: search.mode === 'signup' ? 'signup' : undefined,
  }),
  beforeLoad: ({ context }) => {
    if (context.user) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: LoginPage,
})

function authCallbackUrl() {
  return `${window.location.origin}/auth/callback`
}

function LoginPage() {
  const navigate = useNavigate()
  const router = useRouter()
  const search = Route.useSearch()
  const [view, setView] = useState<AuthView>(search.mode === 'signup' ? 'signup' : 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const configured = isSupabaseConfigured()

  async function enterApp() {
    await router.invalidate()
    await navigate({ to: '/dashboard' })
  }

  if (!configured) {
    return (
      <main className="page-wrap page-enter py-10">
        <div className="island-shell max-w-lg p-7">
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

  async function onLogin(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const supabase = createSupabaseBrowser()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInError) {
        if (signInError.message.toLowerCase().includes('invalid login')) {
          throw new Error(
            'Email or password is wrong. If you used email-only login before, set a password with Forgot password.',
          )
        }
        throw signInError
      }
      await enterApp()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not log in')
    } finally {
      setBusy(false)
    }
  }

  async function onSignup(event: React.FormEvent) {
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
      const supabase = createSupabaseBrowser()
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: authCallbackUrl(),
        },
      })
      if (signUpError) throw signUpError
      if (data.session) {
        await enterApp()
        return
      }
      setView('check-email')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the account')
    } finally {
      setBusy(false)
    }
  }

  async function onForgot(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const supabase = createSupabaseBrowser()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })
      if (resetError) throw resetError
      setView('reset-sent')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the reset email')
    } finally {
      setBusy(false)
    }
  }

  const title =
    view === 'signup'
      ? `Create a ${APP_NAME} account`
      : view === 'forgot' || view === 'reset-sent'
        ? 'Reset your password'
        : view === 'check-email'
          ? 'Confirm your email'
          : `Log in to ${APP_NAME}`

  return (
    <main className="page-wrap page-enter grid items-start gap-10 py-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] md:gap-16 md:py-12">
      <aside className="max-w-sm">
        <p className="island-kicker">Account</p>
        <p className="display-title mt-3 text-4xl leading-[1.05]">
          The bill, then the <em>link</em>.
        </p>
        <p className="mt-4 text-[var(--sea-ink-soft)]">
          Stay signed in on this browser. No magic link required.
        </p>
      </aside>
      <div>
        <p className="island-kicker">
          {view === 'signup' ? 'New account' : 'Welcome back'}
        </p>
        <h1 className="display-title mt-2 text-3xl">{title}</h1>
        <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
          {view === 'signup'
            ? 'Email and password. You stay signed in on this browser.'
            : view === 'forgot'
              ? 'We’ll email a link so you can choose a password.'
              : view === 'reset-sent'
                ? `Check ${email} for a reset link.`
                : view === 'check-email'
                  ? `Check ${email} and open the confirmation link, then log in.`
                  : 'Use the same email and password next time. No magic link.'}
        </p>

        {view === 'login' ? (
          <form className="mt-6 space-y-4" onSubmit={onLogin}>
            <EmailField email={email} onChange={setEmail} />
            <PasswordField
              id="password"
              label="Password"
              autoComplete="current-password"
              value={password}
              onChange={setPassword}
            />
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            <Button type="submit" disabled={busy}>
              {busy ? 'Signing in…' : 'Log in'}
            </Button>
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <button
                type="button"
                className="text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
                onClick={() => {
                  setError(null)
                  setView('forgot')
                }}
              >
                Forgot password?
              </button>
              <button
                type="button"
                className="font-semibold text-[var(--sea-ink)]"
                onClick={() => {
                  setError(null)
                  setView('signup')
                }}
              >
                Create an account
              </button>
            </div>
          </form>
        ) : null}

        {view === 'signup' ? (
          <form className="mt-6 space-y-4" onSubmit={onSignup}>
            <EmailField email={email} onChange={setEmail} />
            <PasswordField
              id="password"
              label="Password"
              autoComplete="new-password"
              value={password}
              onChange={setPassword}
            />
            <PasswordField
              id="confirm"
              label="Confirm password"
              autoComplete="new-password"
              value={confirm}
              onChange={setConfirm}
            />
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            <Button type="submit" disabled={busy}>
              {busy ? 'Creating…' : 'Create account'}
            </Button>
            <p className="text-sm text-[var(--sea-ink-soft)]">
              Already have an account?{' '}
              <button
                type="button"
                className="font-semibold text-[var(--sea-ink)]"
                onClick={() => {
                  setError(null)
                  setView('login')
                }}
              >
                Log in
              </button>
            </p>
          </form>
        ) : null}

        {view === 'forgot' ? (
          <form className="mt-6 space-y-4" onSubmit={onForgot}>
            <EmailField email={email} onChange={setEmail} />
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            <Button type="submit" disabled={busy}>
              {busy ? 'Sending…' : 'Email reset link'}
            </Button>
            <button
              type="button"
              className="text-sm text-[var(--sea-ink-soft)]"
              onClick={() => {
                setError(null)
                setView('login')
              }}
            >
              Back to login
            </button>
          </form>
        ) : null}

        {view === 'check-email' || view === 'reset-sent' ? (
          <div className="mt-6 space-y-4">
            <Button
              type="button"
              onClick={() => {
                setError(null)
                setView('login')
              }}
            >
              Back to login
            </Button>
          </div>
        ) : null}

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

function EmailField({
  email,
  onChange,
}: {
  email: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

function PasswordField({
  id,
  label,
  autoComplete,
  value,
  onChange,
}: {
  id: string
  label: string
  autoComplete: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="password"
        required
        minLength={MIN_PASSWORD_LENGTH}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
