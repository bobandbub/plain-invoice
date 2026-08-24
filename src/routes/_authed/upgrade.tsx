import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'

import { Button } from '#/components/ui/button'
import { FREE_INVOICE_LIMIT, PRO_PRICE_LABEL } from '#/lib/config'
import { createCheckoutSession, getBillingStatus } from '#/lib/billing.functions'

export const Route = createFileRoute('/_authed/upgrade')({
  loader: () => getBillingStatus(),
  component: UpgradePage,
})

function UpgradePage() {
  const { plan, stripeReady } = Route.useLoaderData()
  const checkout = useServerFn(createCheckoutSession)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  return (
    <main className="page-wrap page-enter py-16">
      <div className="island-shell mx-auto max-w-lg rounded-3xl p-8">
        <p className="island-kicker">Upgrade</p>
        <h1 className="display-title mt-2 text-4xl">Unlimited invoices, {PRO_PRICE_LABEL}.</h1>
        <p className="mt-3 text-[var(--sea-ink-soft)]">
          The free plan includes {FREE_INVOICE_LIMIT} invoices. Pay once — no
          subscription.
        </p>
        {plan === 'pro' ? (
          <p className="mt-6 text-sm">Your unlimited license is already active.</p>
        ) : (
          <div className="mt-8">
            {error ? <p className="mb-3 text-sm text-red-700">{error}</p> : null}
            {!stripeReady ? (
              <p className="text-sm text-[var(--sea-ink-soft)]">
                Add <code>STRIPE_SECRET_KEY</code> to enable checkout. Until then the
                paywall still blocks a 4th free invoice.
              </p>
            ) : (
              <Button
                size="lg"
                disabled={busy}
                onClick={async () => {
                  setBusy(true)
                  setError(null)
                  try {
                    const { url } = await checkout()
                    window.location.href = url
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Checkout failed')
                    setBusy(false)
                  }
                }}
              >
                {busy ? 'Redirecting…' : `Pay ${PRO_PRICE_LABEL}`}
              </Button>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
