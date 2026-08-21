import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'

import { InvoiceForm } from '#/components/invoice-form'
import { Button } from '#/components/ui/button'
import { getInvoice, saveInvoice, setInvoiceStatus } from '#/lib/invoices.functions'

export const Route = createFileRoute('/_authed/invoices/$id')({
  loader: ({ params }) => getInvoice({ data: { id: params.id } }),
  component: EditInvoicePage,
})

function EditInvoicePage() {
  const invoice = Route.useLoaderData()
  const router = useRouter()
  const save = useServerFn(saveInvoice)
  const setStatus = useServerFn(setInvoiceStatus)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const publicUrl =
    typeof window === 'undefined'
      ? `/i/${invoice.public_id}`
      : `${window.location.origin}/i/${invoice.public_id}`

  async function copyLink() {
    if (invoice.status === 'draft') {
      await setStatus({ data: { id: invoice.id, status: 'sent' } })
      await router.invalidate()
    }
    await navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <main className="page-wrap py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/dashboard" className="text-sm">
            ← All invoices
          </Link>
          <h1 className="display-title mt-2 text-4xl">{invoice.number}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => void copyLink()}>
            {copied ? 'Copied' : 'Copy public link'}
          </Button>
          {invoice.status !== 'paid' ? (
            <Button
              onClick={async () => {
                await setStatus({ data: { id: invoice.id, status: 'paid' } })
                await router.invalidate()
              }}
            >
              Mark paid
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={async () => {
                await setStatus({ data: { id: invoice.id, status: 'sent' } })
                await router.invalidate()
              }}
            >
              Mark unpaid
            </Button>
          )}
        </div>
      </div>
      <InvoiceForm
        initial={{
          id: invoice.id,
          from_name: invoice.from_name,
          from_email: invoice.from_email,
          from_address: invoice.from_address,
          to_name: invoice.to_name,
          to_email: invoice.to_email,
          to_address: invoice.to_address,
          due_date: invoice.due_date,
          notes: invoice.notes,
          payment_link: invoice.payment_link,
          currency: invoice.currency,
          line_items: invoice.line_items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unit_amount_cents: item.unit_amount_cents,
          })),
        }}
        number={invoice.number}
        submitting={busy}
        error={error}
        onSubmit={async (input) => {
          setBusy(true)
          setError(null)
          try {
            await save({ data: { ...input, id: invoice.id } })
            await router.invalidate()
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not save')
          } finally {
            setBusy(false)
          }
        }}
      />
    </main>
  )
}
