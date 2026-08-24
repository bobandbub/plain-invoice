import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '#/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-[2px] text-sm font-semibold disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--sea-ink)] text-[var(--stamp-ink)] hover:bg-[#2b2722]',
        stamp: 'bg-[var(--stamp)] text-[var(--stamp-ink)] hover:bg-[#9a3618]',
        outline:
          'border border-[var(--sea-ink)] bg-transparent text-[var(--sea-ink)] hover:bg-[var(--sea-ink)] hover:text-[var(--stamp-ink)]',
        ghost: 'text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]',
        danger: 'bg-[var(--stamp)] text-[var(--stamp-ink)] hover:bg-[#9a3618]',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-11 px-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export function Button({
  className,
  variant,
  size,
  type = 'button',
  ...props
}: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants>) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}
