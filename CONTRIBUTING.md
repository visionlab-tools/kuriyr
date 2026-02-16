# Contributing to Kuriyr

Thank you for your interest in contributing to Kuriyr! This guide will help you get started.

## Prerequisites

- [Bun](https://bun.sh/) >= 1.1
- Git

## Getting Started

```bash
# Fork and clone the repo
git clone https://github.com/<your-username>/kuriyr.git
cd kuriyr

# Install dependencies
bun install

# Install dashboard dependencies
cd dashboard && bun install && cd ..

# Copy the example config
cp kuriyr.config.example.ts kuriyr.config.ts

# Build the dashboard
bun run build:dashboard

# Start the dev server
bun run dev
```

## Development Workflow

### Available Commands

| Command | Description |
|---|---|
| `bun run dev` | Start the dev server with watch mode (port 4400) |
| `bun run tsc` | Type-check without emitting |
| `bun run lint` | Run ESLint |
| `bun run test` | Run unit tests (Vitest) |
| `bun run build:dashboard` | Build the Svelte dashboard |

### Before Submitting

Make sure all checks pass locally:

```bash
bun run tsc
bun run lint
bun run test
```

These same checks run in CI on every pull request.

## Code Conventions

- **No classes** (except custom errors) — use factory functions returning objects
- **Functions < 40 lines** — extract helpers if a function grows beyond this
- **Comments explain "why"**, not "how"
- **TypeScript strict**, no `any`
- **Repository pattern** for DB access (pure functions)
- **Factory pattern** for providers
- **Formatting**: Prettier handles formatting (see `.prettierrc`). No semicolons, single quotes, trailing commas, 100 char line width.

## Project Structure

```
src/
├── index.ts              # Bootstrap entry point
├── config.ts             # Config loading (Zod)
├── auth.ts               # Authentication hooks
├── cli.ts                # CLI commands
├── core/
│   ├── dispatcher.ts     # Orchestrates i18n → render → send → log
│   ├── renderer.ts       # React Email rendering
│   └── i18n.ts           # Translation loading
├── db/
│   ├── schema.ts         # SQLite schema
│   └── logs.ts           # Logs repository
├── providers/
│   ├── smtp.ts           # SMTP via Nodemailer
│   └── resend.ts         # Resend API
└── routes/               # Fastify route handlers

templates/
└── {name}/
    ├── template.tsx      # React Email component
    └── locales/
        └── {locale}.json # Translation file

dashboard/                # Svelte 5 + Tailwind CSS 4 SPA
```

## Making Changes

### Bug Fixes

1. Create a branch: `git checkout -b fix/short-description`
2. Write a failing test that reproduces the bug (when applicable)
3. Fix the bug
4. Verify all checks pass
5. Submit a pull request

### New Features

1. Open an issue first to discuss the feature
2. Create a branch: `git checkout -b feat/short-description`
3. Implement the feature with tests
4. Verify all checks pass
5. Submit a pull request

### Templates

New email templates go in `templates/{name}/` with:
- `template.tsx` — the React Email component
- `locales/en.json` — English translations (minimum)

The `subject` key in translations is reserved for the email subject line. Variables use `{{variableName}}` syntax.

## Pull Requests

- Keep PRs focused on a single change
- Reference any related issue (e.g., `Fixes #42`)
- All CI checks must pass before merge
- Maintainers may request changes — this is normal and part of the review process

## Reporting Issues

Use the [GitHub issue tracker](https://github.com/visionlab-tools/kuriyr/issues). Please include:

- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Kuriyr version and runtime environment

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
