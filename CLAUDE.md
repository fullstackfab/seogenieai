@AGENTS.md

# SEOGenieAI

Next.js 16 App Router rebuild of an AI-powered SEO/digital-marketing SaaS. TypeScript, Tailwind v4, MongoDB/Mongoose, NextAuth v5 (Google OAuth), Anthropic Claude, Stripe. See `README.md` for feature overview and setup.

## Commands

- `npm run dev` — dev server
- `npm run build` — production build (also runs the TypeScript check)
- `npm run lint` — eslint
- `npx tsc --noEmit` — type-check only, faster than a full build for verifying changes

## Structure

- `app/(marketing)/` — public pages (home, services, about, contact, blogs, legal).
- `app/(tools)/`, `app/ai-audit/` — auth-oriented tools (content writer, keyword planner, domain analysis, insight, ai-audit).
- `app/api/` — server routes, grouped by feature (`chat`, `stripe`, `domain-analysis`, `insight`, `ai-audit`, `google`, `content-writer`, `keyword-collections`, `seo`).
- `sections/<feature>/` — the actual `"use client"` views with hooks; `app/**/page.tsx` files are thin wrappers that import from here.
- `components/` — shared UI: `ui/primitives.tsx` (`Container`, `Wrapper`), `ui/buttons.tsx` (`Button`, `LinkButton`, `BackToHome`, `BackToHomeClick`), `ui/typography.tsx` (`H1`-`H6`, `Text`), `ui/modal.tsx`, `ai-report-modal.tsx`, `layout/header.tsx` + `layout/footer.tsx`.
- `lib/` — server/shared logic: `anthropic/` (Claude client + prompts), `pdf/` (Puppeteer rendering + report/email HTML builders), `google/` (GA4 + Search Console), `dataforseo/`, `audit/` (AI-audit engine), plus `stripe.ts`, `email.ts`, `db.ts`, `rate-limit.ts`, `csrf.ts`, `sanitize-html.ts`, `env.ts`, `validation/common.ts`.
- `models/` — Mongoose schemas: `User`, `GeneratedContent`, `KeywordCollection`, `PaidInsight`, `PaidAudit`, `PaidAnalyticsReport`, `Contact`.
- `providers/` — `AnalysisProvider` (cross-page domain/report state), `ToastProvider`, `AppProviders`.
- `auth.ts` — NextAuth v5 config.

## Conventions

- **Tailwind v4**: theme tokens (`--color-dark-100`, `--color-lightblue-100`, `--shadow-6xl`, etc.) live in `app/globals.css`, not a JS config. Custom descending breakpoints are `max-*` variants (e.g. `max-md-tab:`, `max-sm-tab:`) — also defined in `globals.css`.
- **Auth/identity**: use `await auth()` from `@/auth` server-side; the signed-in identity is always `session.user.email` — never trust a client-supplied email/domain for ownership checks (see the IDOR-fix comment in `app/api/google/analytics-report/route.ts`).
- **CSRF**: state-changing routes that rely on the session cookie call `isSameOrigin(request)` from `lib/csrf.ts` before doing anything.
- **Rate limiting**: cost-bearing or external-API routes call `rateLimit(clientKey(request, scope), { limit, windowMs })` from `lib/rate-limit.ts`.
- **Sanitization**: any AI-generated HTML is passed through `sanitizeHtml()` (`lib/sanitize-html.ts`) before `dangerouslySetInnerHTML`, both when rendering and before persisting to the DB.
- **Env vars**: added/read via `lib/env.ts` (zod-validated at import time) — never read `process.env.*` directly in server code outside that file.
- **Paid AI report pattern** (Stripe → Claude → cache → PDF → email): generate the report exactly once per purchase and cache it — never re-bill or re-generate on reopen. Reference implementations: `lib/audit/report-data.ts` (`getOrCreateReportData`), `models/PaidAnalyticsReport.ts` + `app/api/domain-analysis/report/route.ts` (the newest, most complete example: Stripe checkout/verify with account-bound metadata checks, Claude generation with a bounded prompt + `max_tokens`, Mongo-cached `reportHtml`, Puppeteer PDF, automatic email).
- No test suite exists — verify changes with `npm run lint`, `npx tsc --noEmit`, `npm run build`, and manual browser testing for UI/flow changes (especially anything touching Stripe/auth/payment gating).
