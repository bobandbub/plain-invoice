# Due Link

Send a due link and know if it was paid.

Three free invoices. Then **$29 once** for unlimited. We do not collect your client’s payment — paste your own Stripe Payment Link on the invoice if you want them to pay online.

## Stack

- React 19 + TypeScript
- TanStack Start / Router / Query
- Tailwind CSS
- Supabase (email/password auth + Postgres + RLS)
- Stripe Checkout (one-time license)
- Resend (one email per invoice, optional)

## Local setup

```sh
npm install
cp .env.example .env
```

1. Create a **new** Supabase project (do not reuse another app’s project).
2. Put the project URL and publishable/anon key in `.env` (`VITE_*` and `SUPABASE_*`).
3. Paste [supabase/migrations/20260821160000_init.sql](supabase/migrations/20260821160000_init.sql) into the Supabase SQL editor and run it.
4. In Supabase Auth → URL configuration, add:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/update-password`
   - your production URL `/auth/callback` and `/auth/update-password`
5. (Optional, to take money) add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`. Point the webhook at `/api/stripe/webhook` for `checkout.session.completed`.
6. (Optional, to email invoices) add `RESEND_API_KEY`. For production, verify a domain and set `RESEND_FROM_EMAIL`.
7. Set `VITE_APP_URL` to the public origin before deploying.

```sh
npm run dev
```

Opens at http://localhost:3000.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Local server (port 3000) |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |

## Product scope (frozen)

This app does one job: create an invoice, email or share a public link, print/save PDF, mark paid. Do not add expenses, taxes, time tracking, client portals, in-app messaging, or Stripe Connect.

## Deploy

Nitro adapter — any Node host, or Vercel/Netlify. See [docs/LAUNCH.md](docs/LAUNCH.md) for deploy steps and community posts.
