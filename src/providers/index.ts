import type { KuriyrConfig } from '../config.js'
import type { Provider } from './provider.interface.js'
import { createSmtpProvider } from './smtp.js'

/** Factory that instantiates the correct provider based on config */
export function createProvider(config: KuriyrConfig): Provider {
  const emailConfig = config.providers.email

  switch (emailConfig.type) {
    case 'smtp':
      return createSmtpProvider(emailConfig)
    default:
      throw new Error(`Unknown email provider type: ${String(emailConfig.type)}`)
  }
}

export type { Provider, SendPayload, SendResult } from './provider.interface.js'
