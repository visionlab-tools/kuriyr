export interface SendPayload {
  from: { name: string; email: string }
  to: string
  subject: string
  html: string
  text: string
}

export interface SendResult {
  success: boolean
  messageId?: string
  error?: string
}

export interface Provider {
  name: string
  send(payload: SendPayload): Promise<SendResult>
}
