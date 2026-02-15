import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineConfig, loadConfig } from './config.js'

describe('defineConfig', () => {
  it('returns the same config object (identity)', () => {
    const input = {
      from: { name: 'Test', email: 'test@test.com' },
      providers: { email: { type: 'smtp' as const, host: 'localhost', port: 587 } },
    }
    expect(defineConfig(input)).toBe(input)
  })
})

describe('loadConfig from env', () => {
  const savedEnv = { ...process.env }

  beforeEach(() => {
    // Reset to clean env each test
    for (const key of Object.keys(process.env)) {
      if (key.startsWith('KURIYR_')) delete process.env[key]
    }
  })

  afterEach(() => {
    process.env = { ...savedEnv }
  })

  it('loads minimal SMTP config from env', async () => {
    process.env.KURIYR_SMTP_HOST = 'smtp.test.com'
    process.env.KURIYR_FROM_EMAIL = 'noreply@test.com'

    const config = await loadConfig()
    const email = config.providers.email
    expect(email.type).toBe('smtp')
    if (email.type !== 'smtp') throw new Error('expected smtp')
    expect(email.host).toBe('smtp.test.com')
    expect(email.port).toBe(587)
    expect(config.defaultLocale).toBe('en')
    expect(config.port).toBe(4400)
  })

  it('loads full SMTP config from env', async () => {
    process.env.KURIYR_SMTP_HOST = 'smtp.test.com'
    process.env.KURIYR_SMTP_PORT = '465'
    process.env.KURIYR_SMTP_SECURE = 'true'
    process.env.KURIYR_SMTP_USER = 'user'
    process.env.KURIYR_SMTP_PASS = 'pass'
    process.env.KURIYR_FROM_NAME = 'My App'
    process.env.KURIYR_FROM_EMAIL = 'hello@app.com'
    process.env.KURIYR_DEFAULT_LOCALE = 'fr'
    process.env.KURIYR_PORT = '3000'

    const config = await loadConfig()
    const email = config.providers.email
    if (email.type !== 'smtp') throw new Error('expected smtp')
    expect(email.port).toBe(465)
    expect(email.secure).toBe(true)
    expect(email.auth).toEqual({ user: 'user', pass: 'pass' })
    expect(config.from).toEqual({ name: 'My App', email: 'hello@app.com' })
    expect(config.defaultLocale).toBe('fr')
    expect(config.port).toBe(3000)
  })

  it('loads Resend config from env', async () => {
    process.env.KURIYR_RESEND_API_KEY = 're_test_123'
    process.env.KURIYR_FROM_EMAIL = 'noreply@test.com'

    const config = await loadConfig()
    const email = config.providers.email
    expect(email.type).toBe('resend')
    if (email.type !== 'resend') throw new Error('expected resend')
    expect(email.apiKey).toBe('re_test_123')
  })

  it('prefers SMTP over Resend when both are set', async () => {
    process.env.KURIYR_SMTP_HOST = 'smtp.test.com'
    process.env.KURIYR_RESEND_API_KEY = 're_test_123'
    process.env.KURIYR_FROM_EMAIL = 'noreply@test.com'

    const config = await loadConfig()
    expect(config.providers.email.type).toBe('smtp')
  })

  it('loads auth fields from env', async () => {
    process.env.KURIYR_SMTP_HOST = 'smtp.test.com'
    process.env.KURIYR_FROM_EMAIL = 'noreply@test.com'
    process.env.KURIYR_DASHBOARD_USER = 'admin'
    process.env.KURIYR_DASHBOARD_PASSWORD = 'secret'
    process.env.KURIYR_API_TOKEN = 'tok-123'

    const config = await loadConfig()
    expect(config.dashboardUser).toBe('admin')
    expect(config.dashboardPassword).toBe('secret')
    expect(config.apiToken).toBe('tok-123')
  })

  it('applies defaults for optional fields', async () => {
    process.env.KURIYR_SMTP_HOST = 'smtp.test.com'
    process.env.KURIYR_FROM_EMAIL = 'noreply@test.com'

    const config = await loadConfig()
    expect(config.defaultLocale).toBe('en')
    expect(config.port).toBe(4400)
    expect(config.dashboardUser).toBeUndefined()
    expect(config.apiToken).toBeUndefined()
  })
})
