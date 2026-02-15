import type { FastifyInstance } from 'fastify'
import type { Dispatcher } from '../core/dispatcher.js'

const bodySchema = {
  type: 'object',
  required: ['template', 'variables'],
  properties: {
    template: { type: 'string' },
    locale: { type: 'string' },
    variables: { type: 'object', additionalProperties: { type: 'string' } },
  },
} as const

interface PreviewBody {
  template: string
  locale?: string
  variables: Record<string, string>
}

export function registerPreviewRoute(server: FastifyInstance, dispatcher: Dispatcher) {
  server.post<{ Body: PreviewBody }>(
    '/preview',
    { schema: { body: bodySchema } },
    async (request, reply) => {
      try {
        const result = await dispatcher.preview(request.body)
        return reply.send(result)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error'
        return reply.status(400).send({ error: message })
      }
    },
  )
}
