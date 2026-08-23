import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'

import { Button } from '#/components/ui/button'
import { FREE_INVOICE_LIMIT, PRO_PRICE_LABEL } from '#/lib/config'
import { confirmCheckout } from '#/lib/billing.functions'
import { deleteInvoice, getDashboard } from '#/lib/invoices.functions'
import { formatMoney } from '#/lib/money'
import type { InvoiceStatus } from '#/lib/types'

type DashboardSearch = {
  status?: InvoiceStatus
  upgraded?: string
  session_id?: string
}

export const Route = createFileRoute('/_authed/dashboard')({
  validateSearch: (search: Record<string, unknown>): DashboardSearch => ({
    status: ['draft', 'sent', 'paid'].includes(String(search.status))
      ? (search.status as InvoiceStatus)
      : undefined,
    upgraded: typeof search.upgraded === 'string' ? search.upgraded : undefined,
    session_id: typeof search.session_id === 'string' ? search.session_id : undefined,
  }),
  loaderDeps: ({ search }) => ({ session_id: search.session_id }),
  loader: async ({ deps }) => {
    if (deps.session_id) {
      await confirmCheckout({ data: { session_id: deps.session_id } })
    }
    return getDashboard()
  },
  component: DashboardPage,
})

const filters: Array<{ id: 'all' | InvoiceStatus; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'draft', label: 'Draft' },
  { id: 'sent', label: 'Sent' },
  { id: 'paid', label: 'Paid' },
]

function DashboardPage() {
  const data = Route.useLoaderData()
  const search = Route.useSearch()
  const router = useRouter()
  const remove = useServerFn(deleteInvoice)
  const upgraded = search.upgraded === '1'

  const visible = search.status
    ? data.invoices.filter((invoice) => invoice.status === search.status)
    : data.invoices

  return (
    <main className="page-wrap py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="island-kicker">Dashboard</p>
          <h1 className="display-title mt-1 text-4xl">Invoices</h1>
          <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
            {data.plan === 'pro'
              ? 'Unlimited license is active.'
              : `${data.invoiceCount} / ${FREE_INVOICE_LIMIT} free invoices used.`}
          </p>
        </div>
        {data.plan === 'free' && data.remainingFree <= 0 ? (
          <Link to="/upgrade" className="no-underline">
            <Button>Upgrade {PRO_PRICE_LABEL}</Button>
          </Link>
        ) : (
          <Link to="/invoices/new" className="no-underline">
            <Button>New invoice</Button>
          </Link>
        )}
      </div>

      {upgraded ? (
        <p className="mt-4 rounded-md border border-[var(--line)] bg-white px-4 py-3 text-sm">
          {data.plan === 'pro'
            ? 'Payment confirmed. Unlimited invoices are unlocked.'
            : 'Returned from Stripe, but the payment is not confirmed yet. Try refreshing once.'}
        </p>
      ) : null}

      <div className="mt-6 flex gap-2">
        {filters.map((filter) => (
          <Link
            key={filter.id}
            to="/dashboard"
            search={{ status: filter.id === 'all' ? undefined : filter.id }}
            className={`rounded-full px-3 py-1 text-sm no-underline ${
              (search.status ?? 'all') === filter.id
                ? 'bg-[var(--sea-ink)] text-white'
                : 'bg-white/80 text-[var(--sea-ink-soft)]'
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      <div className="island-shell mt-6 overflow-hidden rounded-2xl">
        {visible.length === 0 ? (
          <p className="p-8 text-[var(--sea-ink-soft)]">
            No invoices yet. Create one, share the link, mark it paid.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-left text-[var(--sea-ink-soft)]">
                <th className="px-4 py-3 font-medium">Number</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {visible.map((invoice) => (
                <tr key={invoice.id} className="border-b border-[var(--line)]/80">
                  <td className="px-4 py-3">
                    <Link to="/invoices/$id" params={{ id: invoice.id }}>
                      {invoice.number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{invoice.to_name}</td>
                  <td className="px-4 py-3 capitalize">{invoice.status}</td>
                  <td className="px-4 py-3 text-right">{formatMoney(invoice.total_cents)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        if (!confirm(`Delete ${invoice.number}?`)) return
                        await remove({ data: { id: invoice.id } })
                        await router.invalidate()
                      }}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  )
}
