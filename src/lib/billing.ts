import Stripe from 'stripe'

import { createSupabaseAdmin } from '#/lib/supabase.server'

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_NOT_CONFIGURED')
  return new Stripe(key)
}

export async function activateProPlan(input: {
  userId: string
  stripeCustomerId?: string | null
}) {
  const admin = createSupabaseAdmin()
  const { error } = await admin
    .from('profiles')
    .update({
      plan: 'pro',
      paid_at: new Date().toISOString(),
      stripe_customer_id: input.stripeCustomerId ?? null,
    })
    .eq('id', input.userId)

  if (error) throw new Error(error.message)
}
