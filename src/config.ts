import { z } from 'zod'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

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

const configSchema = z.object({
  from: z.object({
    name: z.string(),
    email: z.string().email(),
  }),
  defaultLocale: z.string().default('en'),
  port: z.number().default(4400),
  providers: z.object({
    email: smtpConfigSchema,
  }),
})

export type KuriyrConfig = z.infer<typeof configSchema>

/** Identity function providing type-safe autocompletion for config files */
export function defineConfig(config: z.input<typeof configSchema>): z.input<typeof configSchema> {
  return config
}

/** Loads and validates kuriyr.config.ts from the project root */
export async function loadConfig(): Promise<KuriyrConfig> {
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

  return configSchema.parse(raw)
}
