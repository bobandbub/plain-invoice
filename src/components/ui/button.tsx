import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import type { HTMLMotionProps } from 'motion/react'

import { m } from '#/components/motion'
import { cn } from '#/lib/utils'

export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-[8px] font-mono text-[0.84rem] font-medium tracking-[0.04em] uppercase disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border border-[var(--sea-ink)] bg-[var(--sea-ink)] text-[var(--stamp-ink)] hover:border-[var(--stamp)] hover:bg-[var(--stamp)] hover:text-[var(--stamp-ink)]',
        stamp:
          'border border-[var(--sea-ink)] bg-[var(--sea-ink)] text-[var(--stamp-ink)] hover:border-[var(--stamp)] hover:bg-[var(--stamp)] hover:text-[var(--stamp-ink)]',
        outline:
          'border border-[var(--sea-ink)] bg-transparent text-[var(--sea-ink)] hover:bg-[var(--sea-ink)] hover:text-[var(--stamp-ink)]',
        ghost: 'text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]',
        danger:
          'border border-[var(--stamp)] bg-[var(--stamp)] text-[var(--stamp-ink)] hover:bg-[#8d2918]',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-8 px-3 text-[0.72rem]',
        lg: 'h-12 px-6',
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
  disabled,
  ...props
}: HTMLMotionProps<'button'> & VariantProps<typeof buttonVariants>) {
  return (
    <m.button
      type={type}
      disabled={disabled}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
      whileHover={disabled ? undefined : { y: -2, scale: 1.03 }}
      whileTap={disabled ? undefined : { y: 0, scale: 0.98 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
    />
  )
}
