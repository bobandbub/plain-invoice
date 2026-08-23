import Stripe from 'stripe'
import { createFileRoute } from '@tanstack/react-router'

import { activateProPlan } from '#/lib/billing'

export const Route = createFileRoute('/api/stripe/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.STRIPE_WEBHOOK_SECRET
        const stripeKey = process.env.STRIPE_SECRET_KEY
        if (!secret || !stripeKey) {
          return new Response('Stripe webhook is not configured', { status: 503 })
        }

        const signature = request.headers.get('stripe-signature')
        if (!signature) {
          return new Response('Missing stripe-signature', { status: 400 })
        }

        const rawBody = await request.text()
        const stripe = new Stripe(stripeKey)

        let event: Stripe.Event
        try {
          event = stripe.webhooks.constructEvent(rawBody, signature, secret)
        } catch {
          return new Response('Invalid signature', { status: 400 })
        }

        if (event.type === 'checkout.session.completed') {
          const session = event.data.object
          const userId =
            session.metadata?.user_id ?? session.client_reference_id ?? null
          if (userId && session.payment_status === 'paid') {
            await activateProPlan({
              userId,
              stripeCustomerId:
                typeof session.customer === 'string' ? session.customer : null,
            })
          }
        }

        return new Response(JSON.stringify({ received: true }), {
          headers: { 'Content-Type': 'application/json' },
        })
      },
    },
  },
})
