import { Resend } from 'resend'
import type { Provider, SendPayload, SendResult } from './provider.interface.js'

export function createResendProvider(apiKey: string): Provider {
  const client = new Resend(apiKey)

  return {
    name: 'resend',

    async send(payload: SendPayload): Promise<SendResult> {
      const { data, error } = await client.emails.send({
        from: `${payload.from.name} <${payload.from.email}>`,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      })

      if (error) return { success: false, error: error.message }
      return { success: true, messageId: data!.id }
    },
  }
}
