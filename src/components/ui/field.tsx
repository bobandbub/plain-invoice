import * as React from 'react'

import { cn } from '#/lib/utils'

export function Input({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-md border border-[var(--line)] bg-white px-3 text-sm text-[var(--sea-ink)] outline-none ring-[var(--lagoon)] placeholder:text-[var(--sea-ink-soft)] focus:ring-2',
        className,
      )}
      {...props}
    />
  )
}

export function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(
        'min-h-24 w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--sea-ink)] outline-none ring-[var(--lagoon)] placeholder:text-[var(--sea-ink-soft)] focus:ring-2',
        className,
      )}
      {...props}
    />
  )
}

export function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    <label
      className={cn('mb-1 block text-xs font-semibold tracking-wide text-[var(--sea-ink-soft)]', className)}
      {...props}
    />
  )
}
