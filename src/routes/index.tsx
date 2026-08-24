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

const steps = [
  {
    title: 'Write it',
    body: 'Name, client, line items, due date. That is the whole form.',
  },
  {
    title: 'Send the link',
    body: 'Email it, or copy it. Drafts stay private until you mark them sent.',
  },
  {
    title: 'Mark it paid',
    body: 'You still get paid the way you already get paid. We keep the record.',
  },
] as const

function Home() {
  const { user } = Route.useRouteContext()
  return (
    <main className="page-wrap page-enter py-8 md:py-10">
      <section className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.9fr)] lg:gap-6">
        <div className="max-w-xl pt-2 lg:pt-6">
          <p className="island-kicker">For one person, one job</p>
          <h1 className="display-title mt-3 text-[2.7rem] leading-[1.02] md:text-6xl">
            Send a <em>due link</em>.
            <br />
            Know if it was paid.
          </h1>
          <p className="mt-5 max-w-md text-[1.05rem] leading-relaxed text-[var(--sea-ink-soft)]">
            {APP_NAME} writes the bill, emails the link, and keeps the status.{' '}
            {FREE_INVOICE_LIMIT} free, then {PRO_PRICE_LABEL} for unlimited.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2">
            {user ? (
              <Link to="/dashboard" className="no-underline">
                <Button size="lg" variant="stamp">
                  Go to invoices
                </Button>
              </Link>
            ) : (
              <Link to="/login" search={{ mode: 'signup' }} className="no-underline">
                <Button size="lg" variant="stamp">
                  Create an invoice
                </Button>
              </Link>
            )}
            <a href="#pricing" className="text-sm text-[var(--sea-ink)]">
              See the price
            </a>
          </div>
        </div>
        <div className="lg:-mr-6 lg:mt-10">
          <div className="desk-sheet">
            <InvoiceDocument invoice={sampleInvoice} />
          </div>
          <p className="mt-4 text-right font-mono text-[0.68rem] tracking-wide text-[var(--sea-ink-soft)]">
            sample · not a real bill
          </p>
        </div>
      </section>

      <section className="mt-14 md:mt-16">
        {steps.map((step, index) => (
          <article key={step.title} className="step-row">
            <span className="step-index">0{index + 1}</span>
            <div className={index === 1 ? 'md:pl-10' : index === 2 ? 'md:pl-4' : ''}>
              <h2 className="display-title text-[1.85rem] leading-none">{step.title}</h2>
              <p className="mt-2 max-w-lg text-[var(--sea-ink-soft)]">{step.body}</p>
            </div>
          </article>
        ))}
      </section>

      <section id="pricing" className="price-ledger mt-16">
        <div>
          <p className="island-kicker">Price</p>
          <p className="price-figure mt-3">
            3<span className="ml-2 text-[1.15rem] tracking-normal text-[var(--sea-ink-soft)]">free</span>
          </p>
          <p className="display-title mt-3 text-3xl">
            then <em>{PRO_PRICE_LABEL}</em>
          </p>
        </div>
        <div className="pb-1">
          <p className="max-w-md text-[var(--sea-ink-soft)]">
            No monthly trap. We do not collect your client’s payment — paste your own
            Stripe Payment Link if you want them to pay online.
          </p>
          <ul className="mt-5 space-y-2 text-sm">
            <li>Email the invoice link, or copy it yourself</li>
            <li>Public page with print-to-PDF</li>
            <li>Draft / sent / paid — that’s the whole status list</li>
            <li>Unlimited invoices after the one-time license</li>
          </ul>
          <div className="mt-7">
            {user ? (
              <Link to="/dashboard" className="no-underline">
                <Button size="lg">Go to invoices</Button>
              </Link>
            ) : (
              <Link to="/login" search={{ mode: 'signup' }} className="no-underline">
                <Button size="lg">Start free</Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
