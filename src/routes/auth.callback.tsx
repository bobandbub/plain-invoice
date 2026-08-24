import { Link, createFileRoute } from '@tanstack/react-router'

import { completeMagicLink } from '#/lib/auth.functions'

export const Route = createFileRoute('/auth/callback')({
  validateSearch: (search: Record<string, unknown>) => ({
    code: typeof search.code === 'string' ? search.code : undefined,
    token_hash: typeof search.token_hash === 'string' ? search.token_hash : undefined,
    type: typeof search.type === 'string' ? search.type : undefined,
  }),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    await completeMagicLink({
      data: {
        code: deps.code,
        token_hash: deps.token_hash,
        type: deps.type,
      },
    })
  },
  component: AuthCallbackPending,
  errorComponent: AuthCallbackError,
})

function AuthCallbackPending() {
  return (
    <main className="page-wrap py-20 text-center">
      <p className="text-[var(--sea-ink-soft)]">Signing you in…</p>
    </main>
  )
}

function AuthCallbackError({ error }: { error: Error }) {
  return (
    <main className="page-wrap py-20 text-center">
      <h1 className="display-title text-3xl">Could not finish sign-in</h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-[var(--sea-ink-soft)]">
        {error.message}
      </p>
      <p className="mx-auto mt-3 max-w-md text-sm text-[var(--sea-ink-soft)]">
        Open the email link in the same browser where you requested it, or go
        back and log in with your password.
      </p>
      <p className="mt-6">
        <Link to="/login">Back to login</Link>
      </p>
    </main>
  )
}
