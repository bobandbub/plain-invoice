import { createFileRoute, notFound } from '@tanstack/react-router'

import { InvoiceDocument } from '#/components/invoice-document'
import { Button } from '#/components/ui/button'
import { APP_NAME } from '#/lib/config'
import { getPublicInvoice } from '#/lib/invoices.functions'

export const Route = createFileRoute('/i/$publicId')({
  loader: async ({ params }) => {
    try {
      return await getPublicInvoice({ data: { public_id: params.publicId } })
    } catch {
      throw notFound()
    }
  },
  component: PublicInvoicePage,
  notFoundComponent: () => (
    <main className="page-wrap py-16 text-center">
      <h1 className="display-title text-3xl">Invoice not found</h1>
      <p className="mt-2 text-[var(--sea-ink-soft)]">
        Drafts stay private until the sender marks the invoice sent.
      </p>
    </main>
  ),
})

function PublicInvoicePage() {
  const invoice = Route.useLoaderData()

  return (
    <main className="page-wrap page-enter py-8">
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--sea-ink-soft)]">{APP_NAME}</p>
        <Button onClick={() => window.print()}>Print / Save PDF</Button>
      </div>
      <InvoiceDocument invoice={invoice} />
      {invoice.payment_link ? (
        <div className="no-print mt-6 text-center">
          <a href={invoice.payment_link} className="no-underline">
            <Button size="lg" variant="stamp">
              Pay this invoice
            </Button>
          </a>
        </div>
      ) : null}
    </main>
  )
}
