import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { z } from 'zod'

const smtpConfigSchema = z.object({
  type: z.literal('smtp'),
  host: z.string(),
  port: z.number(),
  secure: z.boolean().optional(),
  auth: z
    .object({
      user: z.string(),
      pass: z.string(),
    })
    .optional(),
})

const resendConfigSchema = z.object({
  type: z.literal('resend'),
  apiKey: z.string(),
})

const configSchema = z.object({
  from: z.object({
    name: z.string(),
    email: z.string().email(),
  }),
  defaultLocale: z.string().default('en'),
  port: z.number().default(4400),
  providers: z.object({
    email: z.discriminatedUnion('type', [smtpConfigSchema, resendConfigSchema]),
  }),
  // Optional auth — when omitted, Kuriyr runs without authentication
  dashboardUser: z.string().optional(),
  dashboardPassword: z.string().optional(),
  apiToken: z.string().optional(),
})

export type KuriyrConfig = z.infer<typeof configSchema>

/** Identity function providing type-safe autocompletion for config files */
export function defineConfig(config: z.input<typeof configSchema>): z.input<typeof configSchema> {
  return config
}

/** Shared env fields reused across provider configs */
function sharedEnvFields() {
  return {
    from: {
      name: process.env.KURIYR_FROM_NAME ?? 'Kuriyr',
      email: process.env.KURIYR_FROM_EMAIL ?? 'noreply@localhost',
    },
    defaultLocale: process.env.KURIYR_DEFAULT_LOCALE ?? 'en',
    port: parseInt(process.env.KURIYR_PORT ?? '4400', 10),
    dashboardUser: process.env.KURIYR_DASHBOARD_USER,
    dashboardPassword: process.env.KURIYR_DASHBOARD_PASSWORD,
    apiToken: process.env.KURIYR_API_TOKEN,
  }
}

/** Builds config from KURIYR_* environment variables */
function loadFromEnv(): Record<string, unknown> | null {
  // Priority: SMTP host > Resend key > null (fallback to config file)
  const smtpHost = process.env.KURIYR_SMTP_HOST
  if (smtpHost) {
    const auth =
      process.env.KURIYR_SMTP_USER && process.env.KURIYR_SMTP_PASS
        ? { user: process.env.KURIYR_SMTP_USER, pass: process.env.KURIYR_SMTP_PASS }
        : undefined

    return {
      ...sharedEnvFields(),
      providers: {
        email: {
          type: 'smtp',
          host: smtpHost,
          port: parseInt(process.env.KURIYR_SMTP_PORT ?? '587', 10),
          secure: process.env.KURIYR_SMTP_SECURE === 'true',
          auth,
        },
      },
    }
  }

  const resendKey = process.env.KURIYR_RESEND_API_KEY
  if (resendKey) {
    return {
      ...sharedEnvFields(),
      providers: { email: { type: 'resend', apiKey: resendKey } },
    }
  }

  return null
}

/** Loads config from kuriyr.config.ts file */
async function loadFromFile(): Promise<Record<string, unknown>> {
  const configPath = resolve(process.cwd(), 'kuriyr.config.ts')
  const fileUrl = pathToFileURL(configPath).href

  let rawModule: Record<string, unknown>
  try {
    rawModule = (await import(fileUrl)) as Record<string, unknown>
  } catch {
    throw new Error(`Could not load config file at ${configPath}`)
  }

  const raw = rawModule.default ?? rawModule.config
  if (!raw) {
    throw new Error('Config file must export a default value or a "config" named export')
  }

  return raw as Record<string, unknown>
}

/**
 * Loads config with priority: env vars > config file.
 * If KURIYR_SMTP_HOST is set, env vars are used exclusively.
 * Otherwise falls back to kuriyr.config.ts.
 */
export async function loadConfig(): Promise<KuriyrConfig> {
  const envConfig = loadFromEnv()
  if (envConfig) {
    console.log('Loading config from environment variables')
    return configSchema.parse(envConfig)
  }

  const configPath = resolve(process.cwd(), 'kuriyr.config.ts')
  if (!existsSync(configPath)) {
    throw new Error(
      'No config found. Set KURIYR_SMTP_HOST or KURIYR_RESEND_API_KEY env var, or create kuriyr.config.ts',
    )
  }

  console.log('Loading config from kuriyr.config.ts')
  const fileConfig = await loadFromFile()
  return configSchema.parse(fileConfig)
}
