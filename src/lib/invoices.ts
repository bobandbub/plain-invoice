import { z } from 'zod'

import { DEFAULT_CURRENCY } from '#/lib/config'
import type { Invoice, InvoiceInput, InvoiceListItem, LineItem } from '#/lib/types'
import { lineTotalCents } from '#/lib/money'

export const invoiceInputSchema = z.object({
  id: z.string().uuid().optional(),
  from_name: z.string().trim().min(1, 'Your name is required'),
  from_email: z.string().trim(),
  from_address: z.string(),
  to_name: z.string().trim().min(1, 'Client name is required'),
  to_email: z.string().trim(),
  to_address: z.string(),
  due_date: z.string().nullable(),
  notes: z.string(),
  payment_link: z.string(),
  currency: z.string().default(DEFAULT_CURRENCY),
  line_items: z
    .array(
      z.object({
        description: z.string().trim().min(1, 'Each line needs a description'),
        quantity: z.number().positive(),
        unit_amount_cents: z.number().int().min(0),
      }),
    )
    .min(1, 'Add at least one line'),
})

export function emptyInvoiceInput(fromEmail = ''): InvoiceInput {
  return {
    from_name: '',
    from_email: fromEmail,
    from_address: '',
    to_name: '',
    to_email: '',
    to_address: '',
    due_date: null,
    notes: '',
    payment_link: '',
    currency: DEFAULT_CURRENCY,
    line_items: [{ description: '', quantity: 1, unit_amount_cents: 0 }],
  }
}

export function invoiceTotalCents(items: Array<Pick<LineItem, 'quantity' | 'unit_amount_cents'>>) {
  return items.reduce(
    (sum, item) => sum + lineTotalCents(Number(item.quantity), item.unit_amount_cents),
    0,
  )
}

export function mapLineItems(rows: Array<Record<string, unknown>> | null): Array<LineItem> {
  return (rows ?? []).map((row, index) => ({
    id: String(row.id ?? index),
    description: String(row.description ?? ''),
    quantity: Number(row.quantity ?? 0),
    unit_amount_cents: Number(row.unit_amount_cents ?? 0),
    sort_order: Number(row.sort_order ?? index),
  }))
}

export function mapInvoice(row: Record<string, unknown>): Invoice {
  return {
    id: String(row.id),
    public_id: String(row.public_id),
    number: String(row.number),
    status: row.status as Invoice['status'],
    from_name: String(row.from_name ?? ''),
    from_email: String(row.from_email ?? ''),
    from_address: String(row.from_address ?? ''),
    to_name: String(row.to_name ?? ''),
    to_email: String(row.to_email ?? ''),
    to_address: String(row.to_address ?? ''),
    due_date: row.due_date ? String(row.due_date) : null,
    notes: String(row.notes ?? ''),
    payment_link: String(row.payment_link ?? ''),
    currency: String(row.currency ?? DEFAULT_CURRENCY),
    created_at: String(row.created_at ?? ''),
    line_items: mapLineItems(
      (row.line_items as Array<Record<string, unknown>> | null) ?? null,
    ),
  }
}

export function mapListItem(row: Record<string, unknown>): InvoiceListItem {
  const items = mapLineItems(
    (row.line_items as Array<Record<string, unknown>> | null) ?? null,
  )
  return {
    id: String(row.id),
    public_id: String(row.public_id),
    number: String(row.number),
    status: row.status as InvoiceListItem['status'],
    to_name: String(row.to_name ?? ''),
    due_date: row.due_date ? String(row.due_date) : null,
    created_at: String(row.created_at ?? ''),
    total_cents: invoiceTotalCents(items),
  }
}

export function publicId() {
  const bytes = new Uint8Array(9)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export function nextInvoiceNumber(existing: Array<string>) {
  const year = new Date().getFullYear()
  const prefix = `INV-${year}-`
  let max = 0
  for (const number of existing) {
    if (!number.startsWith(prefix)) continue
    const n = Number.parseInt(number.slice(prefix.length), 10)
    if (Number.isFinite(n) && n > max) max = n
  }
  return `${prefix}${String(max + 1).padStart(3, '0')}`
}
