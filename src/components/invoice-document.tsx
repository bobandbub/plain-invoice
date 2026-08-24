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
  const paid = invoice.status === 'paid'

  return (
    <article className="invoice-paper relative overflow-visible rounded-[5px] border border-[var(--sea-ink)] bg-[var(--surface-strong)] p-7 text-[var(--sea-ink)] shadow-[7px_8px_0_rgba(26,30,39,0.88)] md:p-8">
      {watermark ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center font-mono text-6xl uppercase tracking-[0.2em] text-[var(--stamp)]/15">
          due
        </div>
      ) : null}
      {paid ? (
        <div className="rubber-stamp" aria-hidden="true">
          PAID
        </div>
      ) : null}

      <header className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="font-mono text-[0.7rem] tracking-[0.12em] uppercase text-[var(--sea-ink-soft)]">
            Invoice
          </p>
          <h1 className="mt-1.5 font-mono text-[0.95rem] font-semibold">{invoice.number}</h1>
          {paid ? null : (
            <p className="mt-2">
              <span className={`status-pill status-pill-${invoice.status}`}>{invoice.status}</span>
            </p>
          )}
        </div>
        <div className="text-right text-sm text-[var(--sea-ink-soft)]">
          <p className="font-semibold text-[var(--sea-ink)]">{invoice.from_name || 'Your name'}</p>
          {invoice.from_email ? <p>{invoice.from_email}</p> : null}
          {invoice.from_address ? (
            <p className="whitespace-pre-line">{invoice.from_address}</p>
          ) : null}
        </div>
      </header>

      <hr className="my-5 border-0 border-t border-[var(--line)]" />

      <div className="mb-5 flex flex-wrap justify-between gap-3 font-mono text-xs text-[var(--sea-ink-soft)]">
        <span>
          Bill to <b className="font-semibold text-[var(--sea-ink)]">{invoice.to_name || 'Client name'}</b>
        </span>
        <span>
          Due <b className="font-semibold text-[var(--sea-ink)]">{formatDate(invoice.due_date)}</b>
        </span>
      </div>
      {invoice.to_email || invoice.to_address ? (
        <p className="-mt-3 mb-5 text-sm text-[var(--sea-ink-soft)]">
          {invoice.to_email}
          {invoice.to_email && invoice.to_address ? ' · ' : null}
          {invoice.to_address ? (
            <span className="whitespace-pre-line">{invoice.to_address}</span>
          ) : null}
        </p>
      ) : null}

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--sea-ink)] text-left font-mono text-[0.66rem] tracking-[0.08em] text-[var(--sea-ink-soft)] uppercase">
            <th className="pb-2 font-medium">Description</th>
            <th className="pb-2 text-right font-medium">Qty</th>
            <th className="pb-2 text-right font-medium">Rate</th>
            <th className="pb-2 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.line_items.map((item, index) => (
            <tr key={index} className="border-b border-[var(--line)]">
              <td className="py-2.5">{item.description || '—'}</td>
              <td className="py-2.5 text-right">{item.quantity}</td>
              <td className="py-2.5 text-right">
                {formatMoney(item.unit_amount_cents, invoice.currency)}
              </td>
              <td className="py-2.5 text-right">
                {formatMoney(
                  lineTotalCents(item.quantity, item.unit_amount_cents),
                  invoice.currency,
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-5 flex items-baseline justify-between">
        <span className="font-mono text-xs tracking-[0.08em] text-[var(--sea-ink-soft)] uppercase">
          Total due
        </span>
        <span className="font-mono text-[1.6rem] font-bold">
          {formatMoney(total, invoice.currency)}
        </span>
      </div>

      {invoice.notes ? (
        <p className="mt-5 border-t border-dashed border-[var(--line)] pt-4 text-[0.8rem] text-[var(--sea-ink-soft)] whitespace-pre-line">
          {invoice.notes}
        </p>
      ) : null}

      {invoice.payment_link ? (
        <p className="mt-4 text-sm">
          Pay:{' '}
          <a href={invoice.payment_link} className="break-all">
            {invoice.payment_link}
          </a>
        </p>
      ) : null}
    </article>
  )
}
