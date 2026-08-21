import { formatMoney, lineTotalCents } from '#/lib/money'
import type { Invoice, InvoiceInput, LineItem } from '#/lib/types'
import { invoiceTotalCents } from '#/lib/invoices'

type PreviewInvoice = Pick<
  Invoice,
  | 'number'
  | 'status'
  | 'from_name'
  | 'from_email'
  | 'from_address'
  | 'to_name'
  | 'to_email'
  | 'to_address'
  | 'due_date'
  | 'notes'
  | 'payment_link'
  | 'currency'
  | 'created_at'
> & { line_items: Array<Pick<LineItem, 'description' | 'quantity' | 'unit_amount_cents'>> }

export function invoiceFromInput(
  input: InvoiceInput,
  extras?: { number?: string; status?: Invoice['status']; created_at?: string },
): PreviewInvoice {
  return {
    number: extras?.number ?? 'INV-DRAFT',
    status: extras?.status ?? 'draft',
    from_name: input.from_name,
    from_email: input.from_email,
    from_address: input.from_address,
    to_name: input.to_name,
    to_email: input.to_email,
    to_address: input.to_address,
    due_date: input.due_date,
    notes: input.notes,
    payment_link: input.payment_link,
    currency: input.currency,
    created_at: extras?.created_at ?? new Date().toISOString(),
    line_items: input.line_items,
  }
}

function formatDate(value: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function InvoiceDocument({
  invoice,
  watermark,
}: {
  invoice: PreviewInvoice
  watermark?: boolean
}) {
  const total = invoiceTotalCents(invoice.line_items)

  return (
    <article className="invoice-paper relative overflow-hidden rounded-xl border border-[var(--line)] bg-white p-8 text-[var(--sea-ink)] shadow-sm md:p-10">
      {watermark ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-5xl font-bold tracking-[0.3em] text-[var(--sea-ink)]/10 uppercase">
          PLAIN
        </div>
      ) : null}
      <header className="flex flex-wrap items-start justify-between gap-6 border-b border-[var(--line)] pb-6">
        <div>
          <p className="island-kicker">Invoice</p>
          <h1 className="display-title mt-1 text-3xl">{invoice.number}</h1>
          <p className="mt-1 text-sm capitalize text-[var(--sea-ink-soft)]">{invoice.status}</p>
        </div>
        <div className="text-right text-sm">
          <p className="font-semibold">{invoice.from_name || 'Your name'}</p>
          {invoice.from_email ? <p>{invoice.from_email}</p> : null}
          {invoice.from_address ? (
            <p className="whitespace-pre-line text-[var(--sea-ink-soft)]">{invoice.from_address}</p>
          ) : null}
        </div>
      </header>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="island-kicker">Bill to</p>
          <p className="mt-1 font-semibold">{invoice.to_name || 'Client name'}</p>
          {invoice.to_email ? <p className="text-sm">{invoice.to_email}</p> : null}
          {invoice.to_address ? (
            <p className="whitespace-pre-line text-sm text-[var(--sea-ink-soft)]">
              {invoice.to_address}
            </p>
          ) : null}
        </div>
        <div className="text-sm sm:text-right">
          <p>
            <span className="text-[var(--sea-ink-soft)]">Issued </span>
            {formatDate(invoice.created_at)}
          </p>
          <p>
            <span className="text-[var(--sea-ink-soft)]">Due </span>
            {formatDate(invoice.due_date)}
          </p>
        </div>
      </div>

      <table className="mt-8 w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--line)] text-left text-[var(--sea-ink-soft)]">
            <th className="py-2 font-medium">Description</th>
            <th className="py-2 text-right font-medium">Qty</th>
            <th className="py-2 text-right font-medium">Rate</th>
            <th className="py-2 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.line_items.map((item, index) => (
            <tr key={index} className="border-b border-[var(--line)]/70">
              <td className="py-3">{item.description || '—'}</td>
              <td className="py-3 text-right">{item.quantity}</td>
              <td className="py-3 text-right">
                {formatMoney(item.unit_amount_cents, invoice.currency)}
              </td>
              <td className="py-3 text-right">
                {formatMoney(
                  lineTotalCents(item.quantity, item.unit_amount_cents),
                  invoice.currency,
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-6 text-right text-lg font-semibold">
        Total {formatMoney(total, invoice.currency)}
      </p>

      {invoice.notes ? (
        <section className="mt-8 text-sm">
          <p className="island-kicker">Notes</p>
          <p className="mt-1 whitespace-pre-line text-[var(--sea-ink-soft)]">{invoice.notes}</p>
        </section>
      ) : null}

      {invoice.payment_link ? (
        <p className="mt-6 text-sm">
          Pay:{' '}
          <a href={invoice.payment_link} className="break-all">
            {invoice.payment_link}
          </a>
        </p>
      ) : null}
    </article>
  )
}
