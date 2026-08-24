import { useEffect } from 'react'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouter,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import { Analytics } from '@vercel/analytics/react'

import { SiteFooter, SiteHeader } from '#/components/site-chrome'
import { MotionProvider, PageTransition } from '#/components/motion'
import { APP_NAME, APP_DESCRIPTION } from '#/lib/config'
import { getAuthUser } from '#/lib/auth.functions'
import { createSupabaseBrowser, isSupabaseConfigured } from '#/lib/supabase.browser'
import type { AuthUser } from '#/lib/types'
import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

export interface MyRouterContext {
  queryClient: QueryClient
  user: AuthUser | null
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async () => {
    const user = await getAuthUser()
    return { user }
  },
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: APP_NAME,
      },
      {
        name: 'description',
        content: APP_DESCRIPTION,
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.svg' },
    ],
  }),
  component: RootComponent,
  shellComponent: RootDocument,
})

function RootComponent() {
  const { user } = Route.useRouteContext()
  return (
    <MotionProvider>
      <AuthSync />
      <SiteHeader user={user} />
      <PageTransition>
        <Outlet />
      </PageTransition>
      <SiteFooter />
    </MotionProvider>
  )
}

function AuthSync() {
  const router = useRouter()
  const { user } = Route.useRouteContext()
  const userId = user?.id ?? null

  useEffect(() => {
    if (!isSupabaseConfigured()) return

    const supabase = createSupabaseBrowser()
    let cancelled = false

    void supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return
      if ((data.user?.id ?? null) !== userId) {
        void router.invalidate()
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        void router.invalidate()
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [router, userId])

  return null
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Analytics />
        {import.meta.env.DEV ? (
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
              TanStackQueryDevtools,
            ]}
          />
        ) : null}
        <Scripts />
      </body>
    </html>
  )
}
