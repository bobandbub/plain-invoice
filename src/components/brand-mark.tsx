import { Link } from '@tanstack/react-router'

import { APP_NAME } from '#/lib/config'

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      to="/"
      className="group inline-flex items-center gap-2 text-[var(--sea-ink)] no-underline"
    >
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--sea-ink)] text-xs font-extrabold tracking-tight text-white transition-transform duration-200 group-hover:-translate-y-0.5">
        DL
      </span>
      {compact ? null : (
        <span className="display-title text-xl font-bold">{APP_NAME}</span>
      )}
    </Link>
  )
}
