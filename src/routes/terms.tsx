import { createFileRoute } from '@tanstack/react-router'

import { APP_NAME, FREE_INVOICE_LIMIT } from '#/lib/config'

export const Route = createFileRoute('/terms')({
  component: TermsPage,
})

function TermsPage() {
  return (
    <main className="page-wrap prose py-12">
      <h1 className="display-title">Terms</h1>
      <p>
        {APP_NAME} is provided as-is for creating, emailing, and sharing invoices. You are
        responsible for the accuracy of your invoices and for collecting payment from
        your clients. The optional paid license unlocks more than {FREE_INVOICE_LIMIT}{' '}
        invoices; it is not tax, accounting, or legal advice. The free plan includes{' '}
        {FREE_INVOICE_LIMIT} invoices.
      </p>
      <p>
        We may change features or pricing. Refunds for the one-time license are at our
        discretion if the product cannot be used after a good-faith setup.
      </p>
    </main>
  )
}
