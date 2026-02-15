# Kuriyr Demo

Try Kuriyr locally with [Mailpit](https://mailpit.axe.email/) as a fake SMTP server. No real email is sent — everything is captured and visible in Mailpit's web UI.

## Start

```bash
cd demo
docker compose up --build
```

This starts:

| Service | URL | Description |
|---|---|---|
| **Kuriyr** | [http://localhost:4400](http://localhost:4400) | API + monitoring dashboard |
| **Mailpit** | [http://localhost:8025](http://localhost:8025) | Captured emails inbox |

## Authentication

The demo comes with authentication enabled:

- **Dashboard**: username `admin`, password `admin`
- **API**: Bearer token `demo-secret-token`

## Send a test email

```bash
curl -X POST http://localhost:4400/send \
  -H "Authorization: Bearer demo-secret-token" \
  -H "Content-Type: application/json" \
  -d '{
    "template": "welcome",
    "locale": "en",
    "to": "test@example.com",
    "variables": {
      "name": "Jane",
      "appName": "Kuriyr"
    }
  }'
```

Then open [http://localhost:8025](http://localhost:8025) to see the captured email in Mailpit.

## Preview without sending

```bash
curl -X POST http://localhost:4400/preview \
  -H "Authorization: Bearer demo-secret-token" \
  -H "Content-Type: application/json" \
  -d '{
    "template": "welcome",
    "locale": "fr",
    "variables": {
      "name": "Jean",
      "appName": "Kuriyr"
    }
  }'
```

## Stop

```bash
docker compose down
```
