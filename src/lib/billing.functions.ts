import { z } from 'zod'
import { createServerFn } from '@tanstack/react-start'
import { getRequestUrl } from '@tanstack/react-start/server'

import { activateProPlan, getStripe, isStripeConfigured } from '#/lib/billing'
import { APP_NAME, PRO_PRICE_CENTS } from '#/lib/config'
import { requireUser } from '#/lib/supabase.server'

export { isStripeConfigured }

export const createCheckoutSession = createServerFn({ method: 'POST' }).handler(
  async (): Promise<{ url: string }> => {
    const { user } = await requireUser()
    const stripe = getStripe()
    const origin =
      process.env.VITE_APP_URL ?? process.env.APP_URL ?? getRequestUrl().origin

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: user.email ?? undefined,
      client_reference_id: user.id,
      metadata: { user_id: user.id },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: PRO_PRICE_CENTS,
            product_data: {
              name: `${APP_NAME} unlimited license`,
              description: 'Create unlimited invoices. One-time payment.',
            },
          },
        },
      ],
      success_url: `${origin}/dashboard?upgraded=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/upgrade`,
    })

    if (!session.url) throw new Error('Stripe did not return a checkout URL')
    return { url: session.url }
  },
)

export const confirmCheckout = createServerFn({ method: 'POST' })
  .validator(z.object({ session_id: z.string().min(1) }))
  .handler(async ({ data }): Promise<{ plan: 'free' | 'pro' }> => {
    const { user } = await requireUser()
    const session = await getStripe().checkout.sessions.retrieve(data.session_id)
    const owner = session.metadata?.user_id ?? session.client_reference_id

    if (session.payment_status !== 'paid') {
      throw new Error('PAYMENT_NOT_COMPLETE')
    }
    if (!owner || owner !== user.id) {
      throw new Error('UNAUTHORIZED')
    }

    await activateProPlan({
      userId: user.id,
      stripeCustomerId: typeof session.customer === 'string' ? session.customer : null,
    })

    return { plan: 'pro' }
  })

export const getBillingStatus = createServerFn({ method: 'GET' }).handler(
  async (): Promise<{ plan: 'free' | 'pro'; stripeReady: boolean }> => {
    const { supabase, user } = await requireUser()
    const { data } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .maybeSingle()
    return {
      plan: data?.plan === 'pro' ? 'pro' : 'free',
      stripeReady: isStripeConfigured(),
    }
  },
)
