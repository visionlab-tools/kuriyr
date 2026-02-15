import nodemailer from 'nodemailer'
import type { Provider, SendPayload, SendResult } from './provider.interface.js'

interface SmtpConfig {
  host: string
  port: number
  secure?: boolean
  auth?: { user: string; pass: string }
}

export function createSmtpProvider(config: SmtpConfig): Provider {
  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure ?? false,
    auth: config.auth,
  })

  return {
    name: 'smtp',

    async send(payload: SendPayload): Promise<SendResult> {
      try {
        const info = await transport.sendMail({
          from: `"${payload.from.name}" <${payload.from.email}>`,
          to: payload.to,
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
        })
        return { success: true, messageId: info.messageId }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown SMTP error'
        return { success: false, error: message }
      }
    },
  }
}
