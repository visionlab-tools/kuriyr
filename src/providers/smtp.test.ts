import { describe, expect, it, vi } from 'vitest'

// Mock nodemailer before importing the provider
const mockSendMail = vi.fn()
vi.mock('nodemailer', () => ({
  default: {
    createTransport: () => ({ sendMail: mockSendMail }),
  },
}))

const { createSmtpProvider } = await import('./smtp.js')

describe('SmtpProvider', () => {
  const provider = createSmtpProvider({ host: 'localhost', port: 587 })

  it('exposes "smtp" as name', () => {
    expect(provider.name).toBe('smtp')
  })

  it('returns success with messageId on send', async () => {
    mockSendMail.mockResolvedValueOnce({ messageId: '<abc@test>' })

    const result = await provider.send({
      from: { name: 'Test', email: 'test@test.com' },
      to: 'user@test.com',
      subject: 'Hello',
      html: '<p>Hi</p>',
      text: 'Hi',
    })

    expect(result.success).toBe(true)
    expect(result.messageId).toBe('<abc@test>')
  })

  it('returns error on send failure', async () => {
    mockSendMail.mockRejectedValueOnce(new Error('Connection refused'))

    const result = await provider.send({
      from: { name: 'Test', email: 'test@test.com' },
      to: 'user@test.com',
      subject: 'Hello',
      html: '<p>Hi</p>',
      text: 'Hi',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Connection refused')
  })
})
