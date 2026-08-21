# Launch notes

Plain Invoice is ready to charge once Supabase (required) and Stripe (required to take money) are connected.

## Deploy (Vercel)

1. Push this repo to GitHub.
2. Import the project in Vercel.
3. Set environment variables from `.env.example` (production values).
4. After the first deploy, add `https://YOUR_DOMAIN/auth/callback` to Supabase Auth redirect URLs.
5. Set `VITE_APP_URL=https://YOUR_DOMAIN`.
6. In Stripe, add a webhook: `https://YOUR_DOMAIN/api/stripe/webhook`, event `checkout.session.completed`. Paste the signing secret into `STRIPE_WEBHOOK_SECRET`.

CLI (if you are logged in):

```sh
npx vercel --yes --prod
```

## Community posts (paste after the live URL exists)

Keep it helpful, not spammy. One post per community. Mention the 3-free / $29-once deal.

### r/freelance, r/forhire, r/smallbusiness

Title: I needed a dead-simple invoice page, so I shipped one (3 free)

Body:

I kept wanting a clean invoice I could send as a link — not a full accounting suite.

Plain Invoice does one job: make a bill, share a link, print/save PDF, mark it paid. Three invoices free, then $29 once for unlimited. I don’t collect your client’s payment; paste your own Stripe Payment Link if you want them to pay online.

Live: YOUR_URL

Happy to take “this is missing X” if X is still that one job.

### Indie Hackers

I shipped a tiny invoicing tool for solo freelancers: create → public link → PDF → mark paid. 3 free, $29 lifetime. No Stripe Connect, no expenses, no tax module. YOUR_URL

### Product Hunt (if a day remains)

Tagline: Send a clean invoice and know if it was paid.

Description: A one-job invoicing page for solo freelancers. Three free invoices, then a $29 unlimited license. Public link + print-to-PDF. You still get paid the way you already get paid.
