import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'

import { InvoiceForm } from '#/components/invoice-form'
import { getAuthUser } from '#/lib/auth.functions'
import { emptyInvoiceInput } from '#/lib/invoices'
import {
  emailInvoice,
  getMailStatus,
  saveInvoice,
  setInvoiceStatus,
} from '#/lib/invoices.functions'
import { FREE_LIMIT_CODE } from '#/lib/types'

export const Route = createFileRoute('/_authed/invoices/new')({
  loader: async () => {
    const [user, mail] = await Promise.all([getAuthUser(), getMailStatus()])
    return { email: user?.email ?? '', mailReady: mail.mailReady }
  },
  component: NewInvoicePage,
})

function NewInvoicePage() {
  const { email, mailReady } = Route.useLoaderData()
  const navigate = useNavigate()
  const save = useServerFn(saveInvoice)
  const setStatus = useServerFn(setInvoiceStatus)
  const emailClient = useServerFn(emailInvoice)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <main className="page-wrap page-enter py-10">
      <h1 className="display-title text-4xl">New invoice</h1>
      <p className="mt-2 mb-8 max-w-xl text-[var(--sea-ink-soft)]">
        Save a draft while you write. Email invoice sends the public link to the
        client and marks it sent.
      </p>
      {!mailReady ? (
        <p className="mb-6 rounded-xl border border-[var(--line)] bg-white/80 px-4 py-3 text-sm text-[var(--sea-ink-soft)]">
          Email is off until <code>RESEND_API_KEY</code> is set. You can still
          copy the public link after you mark it sent.
        </p>
      ) : null}
      <InvoiceForm
        initial={emptyInvoiceInput(email)}
        submitting={busy}
        error={error}
        showMarkSent
        showEmail={mailReady}
        onSubmit={async (input, intent) => {
          setBusy(true)
          setError(null)
          try {
            const result = await save({ data: input })
            if (intent === 'sent') {
              await setStatus({ data: { id: result.id, status: 'sent' } })
            }
            if (intent === 'email') {
              await emailClient({ data: { id: result.id } })
            }
            await navigate({ to: '/invoices/$id', params: { id: result.id } })
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Could not save'
            if (message.includes(FREE_LIMIT_CODE)) {
              await navigate({ to: '/upgrade' })
              return
            }
            setError(message)
          } finally {
            setBusy(false)
          }
        }}
      />
    </main>
  )
}
