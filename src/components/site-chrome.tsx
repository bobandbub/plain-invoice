import { Link, useNavigate, useRouter, useRouterState } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'

import { BrandMark } from '#/components/brand-mark'
import { APP_NAME, APP_TAGLINE } from '#/lib/config'
import { signOut } from '#/lib/auth.functions'
import { createSupabaseBrowser, isSupabaseConfigured } from '#/lib/supabase.browser'
import type { AuthUser } from '#/lib/types'

export function SiteHeader({ user }: { user: AuthUser | null }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const printable = pathname.startsWith('/i/')

  if (printable) return null

  return (
    <header className="no-print sticky top-0 z-20 border-b-2 border-[var(--sea-ink)] bg-[var(--header-bg)] [view-transition-name:site-header]">
      <div className="page-wrap flex h-[4.25rem] items-center justify-between">
        <BrandMark />
        <nav className="flex items-center gap-4 sm:gap-7">
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">
                Invoices
              </Link>
              <Link to="/upgrade" className="nav-link">
                Upgrade
              </Link>
              <span className="hidden max-w-[12rem] truncate font-mono text-[0.78rem] tracking-[0.04em] text-[var(--sea-ink-soft)] sm:inline">
                {user.email}
              </span>
              <SignOutButton />
            </>
          ) : (
            <>
              <a href="/#pricing" className="nav-link">
                Pricing
              </a>
              <Link to="/login" className="nav-login">
                Log in
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

function SignOutButton() {
  const navigate = useNavigate()
  const router = useRouter()
  const serverSignOut = useServerFn(signOut)

  async function onSignOut() {
    try {
      if (isSupabaseConfigured()) {
        await createSupabaseBrowser().auth.signOut()
      }
    } finally {
      await serverSignOut()
      await router.invalidate()
      await navigate({ to: '/' })
    }
  }

  return (
    <button type="button" className="nav-link" onClick={() => void onSignOut()}>
      Log out
    </button>
  )
}

export function SiteFooter() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  if (pathname.startsWith('/i/')) return null

  return (
    <footer className="no-print site-footer">
      <div className="page-wrap flex flex-wrap items-baseline justify-between gap-3 py-7 font-mono text-[0.72rem] tracking-[0.03em] text-[var(--sea-ink-soft)]">
        <p>
          {APP_NAME} — {APP_TAGLINE}
        </p>
        <div className="flex gap-5 uppercase">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </div>
      </div>
    </footer>
  )
}
