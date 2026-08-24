# Launch notes

GitHub: https://github.com/bobandbub/plain-invoice

Login, invoices, and checkout stay off until production env vars are set on Vercel.

## Deploy (Vercel)

1. Production project is linked to the GitHub repo. A push to `main` deploys.
2. Set environment variables from `.env.example` (production values) on Vercel.
3. After the first lasting deploy, add `https://YOUR_DOMAIN/auth/callback` and `https://YOUR_DOMAIN/auth/update-password` to Supabase Auth redirect URLs.
4. Set `VITE_APP_URL=https://YOUR_DOMAIN` and redeploy.
5. In Stripe, add a webhook: `https://YOUR_DOMAIN/api/stripe/webhook`, event `checkout.session.completed`. Paste the signing secret into `STRIPE_WEBHOOK_SECRET`.
6. To email invoices, add `RESEND_API_KEY` and a verified `RESEND_FROM_EMAIL`.

## Community posts (paste after a lasting URL exists)

Keep it helpful, not spammy. One post per community. Mention the 3-free / $29-once deal.

### r/freelance, r/forhire, r/smallbusiness

Title: I needed a dead-simple invoice page, so I shipped one (3 free)

Body:

I kept wanting a clean invoice I could send as a link — not a full accounting suite.

Due Link does one job: make a bill, email the link, print/save PDF, mark it paid. Three invoices free, then $29 once for unlimited. I don’t collect your client’s payment; paste your own Stripe Payment Link if you want them to pay online.

Live: YOUR_URL

Happy to take “this is missing X” if X is still that one job.

### Indie Hackers

I shipped Due Link, a tiny invoicing tool for solo freelancers: create → email the link → PDF → mark paid. 3 free, $29 lifetime. No Stripe Connect, no expenses, no tax module. YOUR_URL

### Product Hunt (if a day remains)

Tagline: Send a due link and know if it was paid.

Description: A one-job invoicing page for solo freelancers. Three free invoices, then a $29 unlimited license. Email the link or share it. Print-to-PDF. You still get paid the way you already get paid.
