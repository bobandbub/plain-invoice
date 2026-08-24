import { useState } from 'react'

import { InvoiceDocument, invoiceFromInput } from '#/components/invoice-document'
import { Button } from '#/components/ui/button'
import { Input, Label, Textarea } from '#/components/ui/field'
import { centsToDollarInput, dollarsToCents } from '#/lib/money'
import type { InvoiceInput, InvoiceStatus } from '#/lib/types'

function RateInput({
  cents,
  onCents,
}: {
  cents: number
  onCents: (value: number) => void
}) {
  const [text, setText] = useState(centsToDollarInput(cents))
  return (
    <Input
      inputMode="decimal"
      value={text}
      onChange={(e) => {
        setText(e.target.value)
        onCents(dollarsToCents(e.target.value))
      }}
      onBlur={() => setText(centsToDollarInput(cents))}
    />
  )
}

export function InvoiceForm({
  initial,
  number,
  submitting,
  error,
  onSubmit,
  showMarkSent = false,
  showEmail = false,
  saveLabel = 'Save draft',
  status = 'draft',
}: {
  initial: InvoiceInput
  number?: string
  submitting?: boolean
  error?: string | null
  onSubmit: (input: InvoiceInput, intent: 'draft' | 'sent' | 'email') => void
  showMarkSent?: boolean
  showEmail?: boolean
  saveLabel?: string
  status?: InvoiceStatus
}) {
  const [form, setForm] = useState<InvoiceInput>(initial)

  function update<TField extends keyof InvoiceInput>(
    key: TField,
    value: InvoiceInput[TField],
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function updateLine(
    index: number,
    patch: Partial<InvoiceInput['line_items'][number]>,
  ) {
    setForm((current) => ({
      ...current,
      line_items: current.line_items.map((item, i) =>
        i === index ? { ...item, ...patch } : item,
      ),
    }))
  }

  return (
    <form
      className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit(form, 'draft')
      }}
    >
      <div className="island-shell space-y-5 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="from_name">From</Label>
            <Input
              id="from_name"
              required
              value={form.from_name}
              onChange={(e) => update('from_name', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="from_email">Your email</Label>
            <Input
              id="from_email"
              type="email"
              value={form.from_email}
              onChange={(e) => update('from_email', e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="from_address">Your address</Label>
          <Textarea
            id="from_address"
            rows={2}
            value={form.from_address}
            onChange={(e) => update('from_address', e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="to_name">Bill to</Label>
            <Input
              id="to_name"
              required
              value={form.to_name}
              onChange={(e) => update('to_name', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="to_email">Client email</Label>
            <Input
              id="to_email"
              type="email"
              value={form.to_email}
              onChange={(e) => update('to_email', e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="to_address">Client address</Label>
          <Textarea
            id="to_address"
            rows={2}
            value={form.to_address}
            onChange={(e) => update('to_address', e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="due_date">Due date</Label>
            <Input
              id="due_date"
              type="date"
              value={form.due_date ?? ''}
              onChange={(e) => update('due_date', e.target.value || null)}
            />
          </div>
          <div>
            <Label htmlFor="payment_link">Your payment link (optional)</Label>
            <Input
              id="payment_link"
              placeholder="https://buy.stripe.com/..."
              value={form.payment_link}
              onChange={(e) => update('payment_link', e.target.value)}
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label className="mb-0">Line items</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  line_items: [
                    ...current.line_items,
                    { description: '', quantity: 1, unit_amount_cents: 0 },
                  ],
                }))
              }
            >
              Add line
            </Button>
          </div>
          <div className="space-y-3">
            {form.line_items.map((item, index) => (
              <div key={index} className="grid gap-2 sm:grid-cols-[1fr_72px_96px_auto]">
                <Input
                  required
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateLine(index, { description: e.target.value })}
                />
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={item.quantity}
                  onChange={(e) =>
                    updateLine(index, { quantity: Number(e.target.value) || 0 })
                  }
                />
                <RateInput
                  cents={item.unit_amount_cents}
                  onCents={(unit_amount_cents) => updateLine(index, { unit_amount_cents })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={form.line_items.length === 1}
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      line_items: current.line_items.filter((_, i) => i !== index),
                    }))
                  }
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
          />
        </div>

        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="outline" disabled={submitting}>
            {submitting ? 'Saving…' : saveLabel}
          </Button>
          {showMarkSent ? (
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => onSubmit(form, 'sent')}
            >
              Mark sent
            </Button>
          ) : null}
          {showEmail ? (
            <Button
              type="button"
              disabled={submitting}
              onClick={() => onSubmit(form, 'email')}
            >
              {submitting ? 'Sending…' : 'Email invoice'}
            </Button>
          ) : null}
        </div>
      </div>

      <InvoiceDocument invoice={invoiceFromInput(form, { number, status })} />
    </form>
  )
}
