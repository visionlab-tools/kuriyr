import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

export type Translations = Record<string, string>

interface LoadResult {
  translations: Translations
  locale: string
}

/** Replaces {{key}} placeholders with values from the variables map */
export function interpolate(text: string, variables: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => variables[key] ?? '')
}

/** Resolves the JSON translation file path for a given template and locale */
function translationPath(template: string, locale: string): string {
  return resolve(process.cwd(), 'templates', template, 'locales', `${locale}.json`)
}

async function readTranslationFile(path: string): Promise<Translations | null> {
  try {
    const content = await readFile(path, 'utf-8')
    return JSON.parse(content) as Translations
  } catch {
    return null
  }
}

/**
 * Loads translations for a template, falling back to defaultLocale
 * when the requested locale file doesn't exist.
 */
export async function loadTranslations(
  template: string,
  locale: string,
  defaultLocale: string,
): Promise<LoadResult> {
  const primary = await readTranslationFile(translationPath(template, locale))
  if (primary) return { translations: primary, locale }

  if (locale !== defaultLocale) {
    const fallback = await readTranslationFile(translationPath(template, defaultLocale))
    if (fallback) return { translations: fallback, locale: defaultLocale }
  }

  throw new Error(`No translations found for template "${template}" (tried: ${locale}, ${defaultLocale})`)
}
