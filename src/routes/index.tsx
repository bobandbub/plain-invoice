import { Link, createFileRoute } from '@tanstack/react-router'

import { InvoiceDocument } from '#/components/invoice-document'
import { FadeIn, HoverLift, m } from '#/components/motion'
import { buttonVariants } from '#/components/ui/button'
import { APP_NAME, FREE_INVOICE_LIMIT, PRO_PRICE_LABEL } from '#/lib/config'
import { cn } from '#/lib/utils'

export const Route = createFileRoute('/')({ component: Home })

const sampleInvoice = {
  number: 'INV-2026-001',
  status: 'paid' as const,
  from_name: 'Jordan Lee',
  from_email: 'jordan@studio.example',
  from_address: 'Independent design',
  to_name: 'Northwind Co.',
  to_email: '',
  to_address: '',
  due_date: '2026-08-31',
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
    title: 'Write',
    body: 'List the job and the rate. Due Link lays it out as a proper invoice — no template to fight with.',
  },
  {
    title: 'Send',
    body: 'One link goes out by email, or you copy it. Your client opens it and sees the amount. No account for them.',
  },
  {
    title: 'Know',
    body: 'You mark it paid when the money lands. The record stays put. You stop hunting through email to remember.',
  },
] as const

function HomeCta({ user }: { user: { id: string } | null }) {
  const className = cn(buttonVariants({ size: 'lg' }), 'has-arrow no-underline')
  const label = user ? 'Go to invoices' : 'Create an invoice'
  const inner = user ? (
    <Link to="/dashboard" className={className}>
      {label}
    </Link>
  ) : (
    <Link to="/login" search={{ mode: 'signup' }} className={className}>
      {label}
    </Link>
  )

  return (
    <m.span
      className="inline-flex"
      whileHover={{ y: -2, scale: 1.03 }}
      whileTap={{ y: 0, scale: 0.98 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
    >
      {inner}
    </m.span>
  )
}

function Home() {
  const { user } = Route.useRouteContext()

  return (
    <main className="page-wrap">
      <section className="grid items-start gap-14 py-12 md:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <div>
          <p className="island-kicker">Ledger No. 001 — for one person, one job</p>
          <h1 className="display-title mt-5 text-[clamp(2.1rem,4.6vw,3.6rem)]">
            Send the bill.
            <br />
            Know when
            <br />
            it&apos;s <em>paid</em>.
          </h1>
          <p className="mt-6 max-w-[44ch] text-lg text-[var(--sea-ink-soft)]">
            {APP_NAME} writes the invoice, sends the link, and keeps the status.{' '}
            <b className="font-semibold text-[var(--sea-ink)]">
              No login for your client. No spreadsheet for you.
            </b>
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <HomeCta user={user} />
            <a href="#pricing" className="link-secondary">
              See the price
            </a>
          </div>
          <div className="ledger-meta">
            <div>
              <strong>{FREE_INVOICE_LIMIT}</strong>
              free invoices
            </div>
            <div>
              <strong>$29</strong>
              once, unlimited after
            </div>
            <div>
              <strong>0</strong>
              logins for your client
            </div>
          </div>
        </div>

        <HoverLift className="pr-3">
          <div className="desk-sheet">
            <InvoiceDocument invoice={sampleInvoice} />
          </div>
          <p className="stage-caption">sample — you mark it paid</p>
        </HoverLift>
      </section>

      <hr className="border-0 border-t-2 border-[var(--sea-ink)]" />

      <section className="py-16 md:py-20">
        <FadeIn>
          <div className="section-head">
            <h2>How the link works</h2>
            <span>three steps, one job</span>
          </div>
        </FadeIn>
        <div>
          {steps.map((step, index) => (
            <FadeIn key={step.title} delay={index * 0.07} className="step-wrap">
              <article className="step-row">
                <span className="step-index">0{index + 1}</span>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc max-w-[56ch] text-[0.95rem] text-[var(--sea-ink-soft)]">
                  {step.body}
                </p>
              </article>
            </FadeIn>
          ))}
        </div>
      </section>

      <section id="pricing" className="pb-20">
        <FadeIn>
          <HoverLift>
            <div className="pricing-box">
              <div>
                <p className="amt">
                  <span className="free">{FREE_INVOICE_LIMIT} invoices free</span>
                  {' — then '}
                  <b>{PRO_PRICE_LABEL}</b>
                  {', for unlimited. No subscription line item.'}
                </p>
                <p className="mt-2 max-w-xl text-sm text-[var(--sea-ink-soft)]">
                  We do not collect your client’s payment. Paste your own Stripe Payment
                  Link if you want them to pay online.
                </p>
              </div>
              <HomeCta user={user} />
            </div>
          </HoverLift>
        </FadeIn>
      </section>
    </main>
  )
}
