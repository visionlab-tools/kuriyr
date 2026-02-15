import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { KuriyrConfig } from '../config.js'
import { createLogsRepository, type LogsRepository } from '../db/logs.js'
import { initDatabase } from '../db/schema.js'
import type { Provider } from '../providers/provider.interface.js'
import { createDispatcher } from './dispatcher.js'

// Mock i18n and renderer to isolate dispatcher logic
vi.mock('./i18n.js', () => ({
  loadTranslations: vi.fn(),
  interpolate: vi.fn((text: string) => text),
}))

vi.mock('./renderer.js', () => ({
  renderTemplate: vi.fn(),
}))

const { loadTranslations } = vi.mocked(await import('./i18n.js'))
const { renderTemplate } = vi.mocked(await import('./renderer.js'))

const CONFIG: KuriyrConfig = {
  from: { name: 'Test', email: 'test@test.com' },
  defaultLocale: 'en',
  port: 4400,
  providers: { email: { type: 'smtp', host: 'localhost', port: 587 } },
}

describe('dispatcher', () => {
  let logs: LogsRepository
  let provider: Provider

  beforeEach(() => {
    vi.clearAllMocks()
    logs = createLogsRepository(initDatabase(':memory:'))
    provider = { name: 'mock', send: vi.fn() }
  })

  describe('send', () => {
    it('orchestrates i18n, render, send, and log', async () => {
      loadTranslations.mockResolvedValueOnce({
        translations: { subject: 'Hello', body: 'World' },
        locale: 'en',
      })
      renderTemplate.mockResolvedValueOnce({
        html: '<p>World</p>',
        text: 'World',
        subject: 'Hello',
      })
      vi.mocked(provider.send).mockResolvedValueOnce({
        success: true,
        messageId: '<msg-1>',
      })

      const dispatcher = createDispatcher(CONFIG, provider, logs)
      const result = await dispatcher.send({
        template: 'welcome',
        to: 'user@test.com',
        variables: { name: 'Alice' },
      })

      expect(result.success).toBe(true)
      expect(result.logId).toBe(1)
      expect(result.messageId).toBe('<msg-1>')
      expect(provider.send).toHaveBeenCalled()
    })

    it('logs errors when provider fails', async () => {
      loadTranslations.mockResolvedValueOnce({
        translations: { subject: 'Hi' },
        locale: 'en',
      })
      renderTemplate.mockResolvedValueOnce({
        html: '<p>Hi</p>',
        text: 'Hi',
        subject: 'Hi',
      })
      vi.mocked(provider.send).mockResolvedValueOnce({
        success: false,
        error: 'SMTP failure',
      })

      const dispatcher = createDispatcher(CONFIG, provider, logs)
      const result = await dispatcher.send({
        template: 'welcome',
        to: 'user@test.com',
        variables: {},
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('SMTP failure')

      // Verify the error was logged in DB
      const log = logs.findById(result.logId)
      expect(log?.status).toBe('error')
    })
  })

  describe('preview', () => {
    it('returns rendered content without sending or logging', async () => {
      loadTranslations.mockResolvedValueOnce({
        translations: { subject: 'Preview' },
        locale: 'fr',
      })
      renderTemplate.mockResolvedValueOnce({
        html: '<p>Preview</p>',
        text: 'Preview',
        subject: 'Preview',
      })

      const dispatcher = createDispatcher(CONFIG, provider, logs)
      const result = await dispatcher.preview({
        template: 'welcome',
        locale: 'fr',
        variables: {},
      })

      expect(result.html).toBe('<p>Preview</p>')
      expect(result.subject).toBe('Preview')
      expect(result.locale).toBe('fr')
      expect(provider.send).not.toHaveBeenCalled()
      expect(logs.count({})).toBe(0)
    })
  })
})
