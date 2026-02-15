import { render } from '@react-email/render'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createElement } from 'react'
import type { Translations } from './i18n.js'

export interface RenderResult {
  html: string
  text: string
  subject: string
}

/** Guards against path traversal in template names */
function validateTemplateName(name: string): void {
  if (name.includes('..') || name.includes('/') || name.includes('\\')) {
    throw new Error(`Invalid template name: "${name}"`)
  }
}

/**
 * Dynamically imports a React Email template and renders it to HTML/text.
 * The template receives resolved translations (t) and user variables as props.
 */
export async function renderTemplate(
  template: string,
  translations: Translations,
  variables: Record<string, string>,
): Promise<RenderResult> {
  validateTemplateName(template)

  const templatePath = resolve(process.cwd(), 'templates', template, 'template.tsx')
  const fileUrl = pathToFileURL(templatePath).href

  const mod = (await import(fileUrl)) as { default: React.ComponentType<Record<string, unknown>> }
  const Component = mod.default

  const element = createElement(Component, { t: translations, ...variables })
  const html = await render(element)
  const text = await render(element, { plainText: true })

  // Subject comes from the reserved "subject" translation key
  const subject = translations['subject'] ?? ''

  return { html, text, subject }
}
