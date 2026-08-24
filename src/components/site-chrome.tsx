import { Link, useRouterState } from '@tanstack/react-router'

import { BrandMark } from '#/components/brand-mark'
import { APP_NAME, APP_TAGLINE } from '#/lib/config'
import type { AuthUser } from '#/lib/types'

export function SiteHeader({ user }: { user: AuthUser | null }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const printable = pathname.startsWith('/i/')

  if (printable) return null

  return (
    <header className="no-print sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--header-bg)] backdrop-blur-md">
      <div className="page-wrap flex h-16 items-center justify-between">
        <BrandMark />
        <nav className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">
                Invoices
              </Link>
              <Link to="/upgrade" className="nav-link">
                Upgrade
              </Link>
              <span className="hidden text-[var(--sea-ink-soft)] sm:inline">
                {user.email}
              </span>
            </>
          ) : (
            <>
              <a href="/#pricing" className="nav-link">
                Pricing
              </a>
              <Link
                to="/login"
                className="rounded-md bg-[var(--sea-ink)] px-3 py-2 font-semibold text-white no-underline transition-transform duration-200 hover:-translate-y-0.5 hover:text-white"
              >
                Log in
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export function SiteFooter() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  if (pathname.startsWith('/i/')) return null

  return (
    <footer className="no-print site-footer mt-16">
      <div className="page-wrap flex flex-wrap items-center justify-between gap-3 py-8 text-sm text-[var(--sea-ink-soft)]">
        <p>
          {APP_NAME} — {APP_TAGLINE}
        </p>
        <div className="flex gap-4">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </div>
      </div>
    </footer>
  )
}
