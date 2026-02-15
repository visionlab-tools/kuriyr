import type { FastifyInstance } from 'fastify'
import type { Dispatcher } from '../core/dispatcher.js'

const bodySchema = {
  type: 'object',
  required: ['template', 'to', 'variables'],
  properties: {
    template: { type: 'string' },
    locale: { type: 'string' },
    to: { type: 'string', format: 'email' },
    variables: { type: 'object', additionalProperties: { type: 'string' } },
    channel: { type: 'string' },
  },
} as const

interface SendBody {
  template: string
  locale?: string
  to: string
  variables: Record<string, string>
  channel?: string
}

export function registerSendRoute(server: FastifyInstance, dispatcher: Dispatcher) {
  server.post<{ Body: SendBody }>(
    '/send',
    { schema: { body: bodySchema } },
    async (request, reply) => {
      try {
        const result = await dispatcher.send(request.body)

        if (!result.success) {
          request.log.error({ template: request.body.template, to: request.body.to, err: result.error }, 'Email send failed')
          return reply.status(500).send({ success: false, error: result.error, logId: result.logId })
        }

        request.log.info({ template: request.body.template, to: request.body.to, logId: result.logId }, 'Email sent')
        return reply.send(result)
      } catch (err) {
        request.log.error({ template: request.body.template, to: request.body.to, err }, 'Send request error')
        const message = err instanceof Error ? err.message : 'Internal server error'
        return reply.status(400).send({ success: false, error: message })
      }
    },
  )
}
