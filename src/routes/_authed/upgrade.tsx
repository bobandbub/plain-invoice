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
    <main className="page-wrap page-enter py-10">
      <p className="island-kicker">Upgrade</p>
      <h1 className="display-title mt-3 text-4xl">
        Once, then <em>unlimited</em>.
      </h1>
      <div className="pricing-box mt-10 max-w-3xl">
        <div>
          <p className="amt">
            <span className="free">{FREE_INVOICE_LIMIT} invoices free</span>
            {' — then '}
            <b>{PRO_PRICE_LABEL}</b>
            {', for unlimited. No subscription line item.'}
          </p>
          <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
            Pay once. We do not collect your client’s payment.
          </p>
          {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
          {plan === 'pro' ? (
            <p className="mt-3 text-sm">Your unlimited license is already active.</p>
          ) : null}
          {!stripeReady && plan !== 'pro' ? (
            <p className="mt-3 text-sm text-[var(--sea-ink-soft)]">
              Add <code>STRIPE_SECRET_KEY</code> to enable checkout. Until then the
              paywall still blocks a 4th free invoice.
            </p>
          ) : null}
        </div>
        {plan !== 'pro' && stripeReady ? (
          <Button
            size="lg"
            className="has-arrow"
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
        ) : null}
      </div>
    </main>
  )
}
