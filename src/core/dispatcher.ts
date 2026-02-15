import type { KuriyrConfig } from '../config.js'
import type { LogsRepository } from '../db/logs.js'
import type { Provider } from '../providers/provider.interface.js'
import { interpolate, loadTranslations } from './i18n.js'
import { renderTemplate } from './renderer.js'

export interface SendRequest {
  template: string
  locale?: string
  to: string
  variables: Record<string, string>
  channel?: string
}

export interface PreviewRequest {
  template: string
  locale?: string
  variables: Record<string, string>
}

export interface SendResponse {
  success: boolean
  logId: number
  messageId?: string
  error?: string
}

export interface PreviewResponse {
  html: string
  text: string
  subject: string
  locale: string
}

export interface Dispatcher {
  send(request: SendRequest): Promise<SendResponse>
  preview(request: PreviewRequest): Promise<PreviewResponse>
}

export function createDispatcher(
  config: KuriyrConfig,
  provider: Provider,
  logs: LogsRepository,
): Dispatcher {
  return { send, preview }

  async function send(request: SendRequest): Promise<SendResponse> {
    const locale = request.locale ?? config.defaultLocale
    const { translations, locale: resolvedLocale } = await loadTranslations(
      request.template,
      locale,
      config.defaultLocale,
    )

    // Interpolate all translation values with provided variables
    const interpolated = Object.fromEntries(
      Object.entries(translations).map(([k, v]) => [k, interpolate(v, request.variables)]),
    )

    const { html, text, subject } = await renderTemplate(
      request.template,
      interpolated,
      request.variables,
    )

    const result = await provider.send({
      from: config.from,
      to: request.to,
      subject,
      html,
      text,
    })

    const log = logs.insert({
      template: request.template,
      locale: resolvedLocale,
      recipient: request.to,
      channel: request.channel ?? 'email',
      subject,
      html,
      status: result.success ? 'sent' : 'error',
      message_id: result.messageId,
      error: result.error,
      variables: request.variables,
    })

    return {
      success: result.success,
      logId: log.id,
      messageId: result.messageId,
      error: result.error,
    }
  }

  async function preview(request: PreviewRequest): Promise<PreviewResponse> {
    const locale = request.locale ?? config.defaultLocale
    const { translations, locale: resolvedLocale } = await loadTranslations(
      request.template,
      locale,
      config.defaultLocale,
    )

    const interpolated = Object.fromEntries(
      Object.entries(translations).map(([k, v]) => [k, interpolate(v, request.variables)]),
    )

    const { html, text, subject } = await renderTemplate(
      request.template,
      interpolated,
      request.variables,
    )

    return { html, text, subject, locale: resolvedLocale }
  }
}
