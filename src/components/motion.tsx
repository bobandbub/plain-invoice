import { LazyMotion, MotionConfig, domAnimation, m } from 'motion/react'
import { useRouterState } from '@tanstack/react-router'
import type { ReactNode } from 'react'

const ease = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
}

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user" transition={{ duration: 0.32, ease }}>
        {children}
      </MotionConfig>
    </LazyMotion>
  )
}

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  if (pathname.startsWith('/i/')) {
    return children
  }

  return (
    <m.div
      key={pathname}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, ease }}
    >
      {children}
    </m.div>
  )
}

export function FadeIn({
  children,
  className,
  delay = 0,
  amount = 0.2,
}: {
  children: ReactNode
  className?: string
  delay?: number
  amount?: number
}) {
  return (
    <m.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount, margin: '0px 0px -48px 0px' }}
      transition={{ duration: 0.48, delay, ease }}
    >
      {children}
    </m.div>
  )
}

export function HoverLift({
  children,
  className,
  scale = 1.015,
}: {
  children: ReactNode
  className?: string
  scale?: number
}) {
  return (
    <m.div
      className={className}
      whileHover={{ y: -3, scale }}
      transition={{ duration: 0.22, ease }}
    >
      {children}
    </m.div>
  )
}

export { m }
