import { describe, expect, it, vi } from 'vitest'

// Mock the Resend class before importing the provider
const mockSend = vi.fn()
vi.mock('resend', () => ({
  Resend: class {
    emails = { send: mockSend }
  },
}))

const { createResendProvider } = await import('./resend.js')

describe('ResendProvider', () => {
  const provider = createResendProvider('re_test_key')

  const payload = {
    from: { name: 'Test', email: 'test@test.com' },
    to: 'user@test.com',
    subject: 'Hello',
    html: '<p>Hi</p>',
    text: 'Hi',
  }

  it('exposes "resend" as name', () => {
    expect(provider.name).toBe('resend')
  })

  it('returns success with messageId on send', async () => {
    mockSend.mockResolvedValueOnce({ data: { id: 'msg_123' }, error: null })

    const result = await provider.send(payload)

    expect(result.success).toBe(true)
    expect(result.messageId).toBe('msg_123')
  })

  it('returns error on send failure', async () => {
    mockSend.mockResolvedValueOnce({
      data: null,
      error: { message: 'Invalid API key' },
    })

    const result = await provider.send(payload)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid API key')
  })
})
