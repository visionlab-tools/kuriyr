import { beforeEach, describe, expect, it, vi } from 'vitest'
import { interpolate, loadTranslations } from './i18n.js'

describe('interpolate', () => {
  it('replaces placeholders with variable values', () => {
    expect(interpolate('Hello {{name}}!', { name: 'Alice' })).toBe('Hello Alice!')
  })

  it('replaces multiple placeholders', () => {
    const result = interpolate('{{greeting}}, {{name}}!', { greeting: 'Hi', name: 'Bob' })
    expect(result).toBe('Hi, Bob!')
  })

  it('replaces missing variables with empty string', () => {
    expect(interpolate('Hello {{name}}!', {})).toBe('Hello !')
  })

  it('returns text unchanged when no placeholders exist', () => {
    expect(interpolate('No placeholders here', { name: 'Alice' })).toBe('No placeholders here')
  })

  it('handles empty text', () => {
    expect(interpolate('', { name: 'Alice' })).toBe('')
  })
})

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
}))

// Import after mock declaration so vitest can intercept
const { readFile } = await vi.hoisted(async () => {
  const mod = await import('node:fs/promises')
  return { readFile: mod.readFile }
})

describe('loadTranslations', () => {
  const mockReadFile = vi.mocked(readFile)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns primary locale translations when file exists', async () => {
    mockReadFile.mockResolvedValueOnce(JSON.stringify({ subject: 'Hello', body: 'World' }))

    const result = await loadTranslations('welcome', 'fr', 'en')
    expect(result.locale).toBe('fr')
    expect(result.translations).toEqual({ subject: 'Hello', body: 'World' })
  })

  it('falls back to default locale when primary is missing', async () => {
    mockReadFile.mockRejectedValueOnce(new Error('ENOENT'))
    mockReadFile.mockResolvedValueOnce(JSON.stringify({ subject: 'Fallback' }))

    const result = await loadTranslations('welcome', 'de', 'en')
    expect(result.locale).toBe('en')
    expect(result.translations).toEqual({ subject: 'Fallback' })
  })

  it('throws when both primary and fallback are missing', async () => {
    mockReadFile.mockRejectedValueOnce(new Error('ENOENT'))
    mockReadFile.mockRejectedValueOnce(new Error('ENOENT'))

    await expect(loadTranslations('welcome', 'de', 'en')).rejects.toThrow(
      'No translations found for template "welcome"',
    )
  })

  it('does not attempt fallback when locale equals defaultLocale', async () => {
    mockReadFile.mockRejectedValueOnce(new Error('ENOENT'))

    await expect(loadTranslations('welcome', 'en', 'en')).rejects.toThrow(
      'No translations found for template "welcome"',
    )
    // Only one call — no fallback attempted
    expect(mockReadFile).toHaveBeenCalledTimes(1)
  })
})
