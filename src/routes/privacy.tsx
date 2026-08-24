import { createFileRoute } from '@tanstack/react-router'

import { APP_NAME } from '#/lib/config'

export const Route = createFileRoute('/privacy')({
  component: PrivacyPage,
})

function PrivacyPage() {
  return (
    <main className="page-wrap prose py-12">
      <h1 className="display-title">Privacy</h1>
      <p>
        {APP_NAME} stores the email you use to sign in, the invoices you create, and
        (if you upgrade) a Stripe customer id. If you click Email invoice, we send that
        invoice link to the client address you entered. We do not store card numbers.
        Magic-link auth is handled by Supabase. License payments are handled by Stripe.
      </p>
      <p>
        Public invoice links are unguessable but not password-protected. Do not put
        secrets on an invoice you share.
      </p>
    </main>
  )
}
