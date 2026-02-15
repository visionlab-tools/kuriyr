# Kuriyr — Project Context

## Stack

- **Runtime**: Node.js 22+, ESM, TypeScript strict
- **Server**: Fastify 5
- **Email rendering**: React Email (`@react-email/render`, `@react-email/components`)
- **Database**: SQLite via `better-sqlite3` (WAL mode)
- **Validation**: Zod (config), Fastify JSON Schema (routes)
- **Email sending**: Nodemailer (SMTP)
- **Dashboard**: Svelte 5 + Tailwind CSS 4 (SPA, hash routing)
- **Config**: `kuriyr.config.ts` loaded dynamically via `tsx`

## Conventions

- No classes (except custom errors) — use factory functions returning objects
- Functions < 40 lines, comments explain "why" not "how"
- Repository pattern for DB access (pure functions)
- Factory pattern for providers
- TypeScript strict, no `any`

## Key Commands

```bash
pnpm dev              # Start dev server (port 4400)
pnpm tsc              # Type-check without emitting
pnpm lint             # ESLint
pnpm build:dashboard  # Build Svelte dashboard into src/dashboard/
pnpm generate-token   # Generate a cryptographic API token
```

## Key Files

- `src/index.ts` — Bootstrap: config → auth hooks → DB → provider → dispatcher → routes
- `src/config.ts` — Config loading with Zod validation
- `src/auth.ts` — Optional Basic Auth (dashboard) + Bearer token (API) hooks
- `src/cli.ts` — CLI commands (generate-token)
- `src/core/dispatcher.ts` — Orchestrates i18n → render → send → log
- `src/core/renderer.ts` — React Email rendering with dynamic imports
- `src/core/i18n.ts` — Translation loading with locale fallback
- `src/db/schema.ts` — SQLite schema initialization
- `src/db/logs.ts` — Logs repository (insert, find, count)
- `src/providers/smtp.ts` — SMTP provider via Nodemailer
- `src/routes/` — Fastify route handlers (send, preview, logs)

## Templates

Templates are in `templates/{name}/` with:
- `template.tsx` — React Email component
- `locales/{locale}.json` — Translation files

The `subject` key in translations is reserved for the email subject line.
