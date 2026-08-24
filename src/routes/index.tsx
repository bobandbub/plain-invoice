import { Link, createFileRoute } from '@tanstack/react-router'

import { InvoiceDocument } from '#/components/invoice-document'
import { Button } from '#/components/ui/button'
import { APP_NAME, FREE_INVOICE_LIMIT, PRO_PRICE_LABEL } from '#/lib/config'

export const Route = createFileRoute('/')({ component: Home })

const sampleInvoice = {
  number: 'INV-2026-001',
  status: 'sent' as const,
  from_name: 'Jordan Lee',
  from_email: 'jordan@studio.example',
  from_address: 'Independent design',
  to_name: 'Northwind Co.',
  to_email: 'ap@northwind.example',
  to_address: '',
  due_date: '2026-09-01',
  notes: 'Thank you — payable within 14 days.',
  payment_link: '',
  currency: 'USD',
  created_at: '2026-08-18',
  line_items: [
    {
      description: 'Landing page design',
      quantity: 1,
      unit_amount_cents: 180000,
    },
  ],
}

function Home() {
  return (
    <main className="page-wrap py-12">
      <section className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="rise-in">
          <p className="island-kicker">For solo freelancers</p>
          <h1 className="display-title mt-3 text-5xl leading-tight md:text-6xl">
            Send a due link. Know if it was paid.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-[var(--sea-ink-soft)]">
            {APP_NAME} is one job: write a bill, email the link, mark it paid.{' '}
            {FREE_INVOICE_LIMIT} free invoices, then {PRO_PRICE_LABEL} for
            unlimited.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/login" className="no-underline">
              <Button size="lg">Create an invoice</Button>
            </Link>
            <a href="#pricing" className="no-underline">
              <Button size="lg" variant="outline">
                See pricing
              </Button>
            </a>
          </div>
        </div>
        <div className="rise-in rise-in-delay-2">
          <InvoiceDocument invoice={sampleInvoice} />
        </div>
      </section>

      <section className="mt-20 grid gap-4 md:grid-cols-3">
        {(
          [
            ['Write it', 'Name, client, line items, due date. That is the whole form.', 'rise-in-delay-1'],
            ['Email it', 'One email with the public link. No inbox. Replies go to you.', 'rise-in-delay-2'],
            ['Mark it paid', 'You get paid however you already get paid. We just keep the record.', 'rise-in-delay-3'],
          ] as const
        ).map(([title, body, delay]) => (
          <article
            key={title}
            className={`feature-card rise-in ${delay} rounded-2xl border border-[var(--line)] p-5`}
          >
            <h2 className="display-title text-2xl">{title}</h2>
            <p className="mt-2 text-[var(--sea-ink-soft)]">{body}</p>
          </article>
        ))}
      </section>

      <section id="pricing" className="island-shell rise-in mt-20 rounded-3xl p-8 md:p-10">
        <p className="island-kicker">Pricing</p>
        <h2 className="display-title mt-2 text-4xl">Three free. Then {PRO_PRICE_LABEL}.</h2>
        <p className="mt-3 max-w-xl text-[var(--sea-ink-soft)]">
          No monthly trap. We do not collect your client’s payment — paste your own Stripe
          Payment Link on the invoice if you want them to pay online.
        </p>
        <ul className="mt-6 space-y-2 text-sm">
          <li>Email the invoice link, or copy it yourself</li>
          <li>Public page with print-to-PDF</li>
          <li>Draft / sent / paid statuses</li>
          <li>Unlimited invoices after the one-time license</li>
        </ul>
        <div className="mt-8">
          <Link to="/login" className="no-underline">
            <Button size="lg">Start free</Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
