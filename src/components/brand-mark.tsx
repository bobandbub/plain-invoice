import { Link } from '@tanstack/react-router'

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="brand-mark">
      {compact ? (
        'DL'
      ) : (
        <>
          Due<span className="brand-slash">//</span>Link
        </>
      )}
    </Link>
  )
}
