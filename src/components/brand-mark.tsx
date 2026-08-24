import { Link } from '@tanstack/react-router'

import { APP_NAME } from '#/lib/config'

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="brand-mark">
      <span className="brand-mark-name">{compact ? 'DL' : APP_NAME}</span>
      <span className="brand-mark-rule" aria-hidden="true" />
    </Link>
  )
}
