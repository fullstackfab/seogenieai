# SEOGenieAI

AI-powered SEO & digital marketing platform — Next.js 16 App Router, TypeScript, Tailwind CSS, MongoDB/Mongoose, and Claude (Anthropic).

## Features

- **Marketing site** — home, services (with FAQ accordions), about, contact, blogs, legal pages.
- **Auth** — NextAuth v5 with Google OAuth (GA4 + Search Console scopes).
- **Tools**
  - AI Content Writer — generate and save blog posts, product descriptions, ad copy, etc.
  - Keyword Planner — location-targeted keyword research with saved collections.
  - Domain Analysis — GA4 + Search Console dashboard with a paid ($7.99, one-time per domain) Claude-generated **AI Growth Report** (prioritized fix plan, traffic/conversion/SEO insights), cached per user+domain, downloadable as PDF, auto-emailed, and revisitable from **My Reports**.
  - Insight — PageSpeed Insights scan with a paid ($4.99) AI fix-plan report.
  - AI Audit — free + paid ($9.99) AI-readiness audit (robots.txt, sitemap, structured data, DA/backlinks, AI visibility).
  - Website Analysis / SEO Tools — SEO Review Tools integration (traffic, domain authority, backlinks, SERP, AI visibility, competitor analysis).
- **Paid AI report infrastructure** — Stripe Checkout, Claude report generation, Puppeteer-rendered PDFs, SMTP email delivery, MongoDB-backed caching (a report is generated once per purchase and reused, never re-billed or re-generated).

## Getting Started

1. Copy `.env.example` to `.env.local` and fill in the values (all server vars are validated at startup in `lib/env.ts`):

   ```bash
   cp .env.example .env.local
   ```

   You'll need: a MongoDB connection string, a Google OAuth client (Analytics + Search Console readonly scopes), an Anthropic API key, Stripe keys (+ webhook secret), SMTP credentials, and a SEO Review Tools / PageSpeed Insights key.

2. Install dependencies and run the dev server:

   ```bash
   npm install
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

3. Other scripts:

   ```bash
   npm run build   # production build
   npm run start   # run the production build
   npm run lint    # eslint
   ```

## Project Structure

- `app/` — routes: `(marketing)` (public pages), `(tools)` (auth-oriented tools), `ai-audit/`, `api/` (all server routes, grouped by feature).
- `sections/` — feature views (`"use client"`), one directory per tool/page, wired up from a thin `app/**/page.tsx`.
- `components/` — shared UI primitives (`Container`, `Wrapper`, buttons, modal, typography) and cross-feature components (`ai-report-modal`, `hire-expert`, layout header/footer).
- `lib/` — server/shared logic: `anthropic/` (Claude client + prompts), `pdf/` (Puppeteer rendering + report/email HTML builders), `google/` (GA4/Search Console), `dataforseo/`, `audit/` (AI-audit engine), `stripe.ts`, `email.ts`, `db.ts`, `rate-limit.ts`, `csrf.ts`, `sanitize-html.ts`, `env.ts`.
- `models/` — Mongoose schemas (`User`, `GeneratedContent`, `KeywordCollection`, `PaidInsight`, `PaidAudit`, `PaidAnalyticsReport`, `Contact`).
- `providers/` — client-side React context (`AnalysisProvider`, `ToastProvider`, `AppProviders`).
- `auth.ts` — NextAuth v5 configuration.

## Notes

- `AGENTS.md` documents Next.js version-specific conventions this codebase relies on — read it before making framework-level changes.
- Paid AI reports follow a "generate once, cache forever" pattern: `lib/audit/report-data.ts` (`getOrCreateReportData`) and the `PaidAnalyticsReport`/`PaidInsight` models are the reference implementations — re-opening a report must never re-trigger Claude or re-charge the user.
