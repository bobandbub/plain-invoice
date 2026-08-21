import Stripe from 'stripe'
import { createServerFn } from '@tanstack/react-start'
import { getRequestUrl } from '@tanstack/react-start/server'

import { APP_NAME, PRO_PRICE_CENTS } from '#/lib/config'
import { requireUser } from '#/lib/supabase.server'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_NOT_CONFIGURED')
  return new Stripe(key)
}

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}

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
      success_url: `${origin}/dashboard?upgraded=1`,
      cancel_url: `${origin}/upgrade`,
    })

    if (!session.url) throw new Error('Stripe did not return a checkout URL')
    return { url: session.url }
  },
)

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
