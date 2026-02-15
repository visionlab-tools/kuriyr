# Kuriyr

Self-hosted transactional email microservice with **React Email** templates, **i18n** support, and a built-in **monitoring dashboard**.

## Why Kuriyr?

Most transactional email services are either SaaS-only, overly complex, or lack template previewing. Kuriyr gives you full control over your email sending pipeline with a simple API, beautiful React Email templates, and a real-time dashboard to monitor every email sent.

## Features

- **React Email templates** — Build beautiful emails with React components
- **i18n built-in** — Locale-based translations with automatic fallback
- **REST API** — Simple `POST /send` and `POST /preview` endpoints
- **Monitoring dashboard** — Built-in Svelte SPA to browse and preview sent emails
- **SQLite storage** — Zero-config persistent logging of all sent emails
- **Docker ready** — One command to deploy with `docker compose up`
- **Self-hosted** — Your data stays on your infrastructure

## Quick Start

### With Docker (recommended)

```bash
git clone https://github.com/visionlab-tools/kuriyr.git
cd kuriyr

# Edit your config
cp kuriyr.config.example.ts kuriyr.config.ts
# Update SMTP settings in kuriyr.config.ts

docker compose up --build
```

Kuriyr is now running at `http://localhost:4400`.

### Without Docker

```bash
git clone https://github.com/visionlab-tools/kuriyr.git
cd kuriyr

pnpm install
cd dashboard && pnpm install && cd ..

# Build the dashboard
pnpm build:dashboard

# Edit your config
cp kuriyr.config.example.ts kuriyr.config.ts

# Start the server
pnpm dev
```

## Configuration

Edit `kuriyr.config.ts` at the project root:

```typescript
import { defineConfig } from './src/config.js'

export default defineConfig({
  from: {
    name: 'My App',
    email: 'noreply@myapp.com',
  },
  defaultLocale: 'en',
  port: 4400,
  providers: {
    email: {
      type: 'smtp',
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: {
        user: 'your-user',
        pass: 'your-password',
      },
    },
  },
})
```

The `defineConfig` function provides full TypeScript autocompletion.

### Environment Variables

You can configure Kuriyr entirely via environment variables, which is ideal for Docker deployments. If `KURIYR_SMTP_HOST` is set, env vars take priority over the config file.

| Variable | Description | Default |
|---|---|---|
| `KURIYR_FROM_NAME` | Sender name | `Kuriyr` |
| `KURIYR_FROM_EMAIL` | Sender email | `noreply@localhost` |
| `KURIYR_DEFAULT_LOCALE` | Default locale for templates | `en` |
| `KURIYR_PORT` | Server port | `4400` |
| `KURIYR_SMTP_HOST` | SMTP server host | *(required)* |
| `KURIYR_SMTP_PORT` | SMTP server port | `587` |
| `KURIYR_SMTP_SECURE` | Use TLS | `false` |
| `KURIYR_SMTP_USER` | SMTP username | *(optional)* |
| `KURIYR_SMTP_PASS` | SMTP password | *(optional)* |

Example with Docker Compose:

```yaml
services:
  kuriyr:
    image: visionlab/kuriyr:latest
    ports:
      - '4400:4400'
    volumes:
      - ./templates:/app/templates
      - ./data:/app/data
    environment:
      - KURIYR_FROM_NAME=My App
      - KURIYR_FROM_EMAIL=noreply@myapp.com
      - KURIYR_SMTP_HOST=smtp.example.com
      - KURIYR_SMTP_PORT=587
      - KURIYR_SMTP_USER=your-user
      - KURIYR_SMTP_PASS=your-password
```

## API Reference

### Send an email

```bash
curl -X POST http://localhost:4400/send \
  -H "Content-Type: application/json" \
  -d '{
    "template": "welcome",
    "locale": "en",
    "to": "user@example.com",
    "variables": {
      "name": "John",
      "appName": "MyApp"
    }
  }'
```

**Response:**

```json
{
  "success": true,
  "logId": 1,
  "messageId": "<abc123@smtp.example.com>"
}
```

### Preview an email

```bash
curl -X POST http://localhost:4400/preview \
  -H "Content-Type: application/json" \
  -d '{
    "template": "welcome",
    "locale": "fr",
    "variables": {
      "name": "Jean",
      "appName": "MonApp"
    }
  }'
```

**Response:**

```json
{
  "html": "<!DOCTYPE html>...",
  "text": "Hello Jean...",
  "subject": "Bienvenue sur MonApp, Jean !",
  "locale": "fr"
}
```

### List logs

```bash
# Paginated list
curl "http://localhost:4400/logs?page=1&limit=20"

# Filter by template and status
curl "http://localhost:4400/logs?template=welcome&status=sent"
```

### Get a single log

```bash
curl http://localhost:4400/logs/1
```

## Creating Templates

Templates live in the `templates/` directory. Each template has its own folder:

```
templates/
└── welcome/
    ├── template.tsx          # React Email component
    └── locales/
        ├── en.json           # English translations
        └── fr.json           # French translations
```

### Template component

```tsx
import { Body, Container, Head, Heading, Html, Text } from '@react-email/components'

interface Props {
  t: Record<string, string>    // Resolved translations
  name?: string                // Variables passed via API
}

export default function MyEmail({ t }: Props) {
  return (
    <Html>
      <Head />
      <Body>
        <Container>
          <Heading>{t['greeting']}</Heading>
          <Text>{t['body']}</Text>
        </Container>
      </Body>
    </Html>
  )
}
```

### Translation files

```json
{
  "subject": "Welcome to {{appName}}, {{name}}!",
  "greeting": "Hello {{name}},",
  "body": "Thank you for joining {{appName}}."
}
```

The `subject` key is reserved and used as the email subject line. Variables are interpolated with `{{variableName}}` syntax.

## Dashboard

The monitoring dashboard is accessible at `http://localhost:4400` and provides:

- Paginated list of all sent emails
- Filters by template name and status (sent/error)
- Click on any log to see full details
- Live HTML preview of each email in an iframe

## Architecture

- **Fastify** — HTTP server
- **React Email** — Template rendering engine
- **SQLite** (better-sqlite3) — Persistent log storage
- **Svelte + Tailwind CSS 4** — Monitoring dashboard
- **Zod** — Configuration validation
- **Nodemailer** — SMTP provider

## License

[MIT](LICENSE)
