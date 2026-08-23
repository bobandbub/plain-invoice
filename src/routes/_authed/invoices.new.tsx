import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'

import { InvoiceForm } from '#/components/invoice-form'
import { getAuthUser } from '#/lib/auth.functions'
import { emptyInvoiceInput } from '#/lib/invoices'
import { saveInvoice, setInvoiceStatus } from '#/lib/invoices.functions'
import { FREE_LIMIT_CODE } from '#/lib/types'

export const Route = createFileRoute('/_authed/invoices/new')({
  loader: async () => {
    const user = await getAuthUser()
    return { email: user?.email ?? '' }
  },
  component: NewInvoicePage,
})

function NewInvoicePage() {
  const { email } = Route.useLoaderData()
  const navigate = useNavigate()
  const save = useServerFn(saveInvoice)
  const setStatus = useServerFn(setInvoiceStatus)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <main className="page-wrap py-10">
      <h1 className="display-title text-4xl">New invoice</h1>
      <p className="mt-2 mb-8 text-[var(--sea-ink-soft)]">
        Save a draft if you are still writing. Mark sent when the client can
        open the public link.
      </p>
      <InvoiceForm
        initial={emptyInvoiceInput(email)}
        submitting={busy}
        error={error}
        showMarkSent
        onSubmit={async (input, intent) => {
          setBusy(true)
          setError(null)
          try {
            const result = await save({ data: input })
            if (intent === 'sent') {
              await setStatus({ data: { id: result.id, status: 'sent' } })
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
