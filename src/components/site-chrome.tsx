import { Link, useRouterState } from '@tanstack/react-router'

import { APP_NAME } from '#/lib/config'
import type { AuthUser } from '#/lib/types'

export function SiteHeader({ user }: { user: AuthUser | null }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const printable = pathname.startsWith('/i/')

  if (printable) return null

  return (
    <header className="no-print sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--header-bg)] backdrop-blur">
      <div className="page-wrap flex h-16 items-center justify-between">
        <Link to="/" className="display-title text-xl font-bold text-[var(--sea-ink)] no-underline">
          {APP_NAME}
        </Link>
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
              <a href="#pricing" className="nav-link">
                Pricing
              </a>
              <Link to="/login" className="rounded-md bg-[var(--sea-ink)] px-3 py-2 font-semibold text-white no-underline hover:text-white">
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
        <p>{APP_NAME} — send a clean invoice and know if it was paid.</p>
        <div className="flex gap-4">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </div>
      </div>
    </footer>
  )
}
