import type { KuriyrConfig } from '../config.js'
import type { Provider } from './provider.interface.js'
import { createResendProvider } from './resend.js'
import { createSmtpProvider } from './smtp.js'

/** Factory that instantiates the correct provider based on config */
export function createProvider(config: KuriyrConfig): Provider {
  const emailConfig = config.providers.email

  switch (emailConfig.type) {
    case 'smtp':
      return createSmtpProvider(emailConfig)
    case 'resend':
      return createResendProvider(emailConfig.apiKey)
    default:
      throw new Error(`Unknown email provider type: ${String((emailConfig as { type: string }).type)}`)
  }
}

export type { Provider, SendPayload, SendResult } from './provider.interface.js'
