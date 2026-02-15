import type { FastifyInstance } from 'fastify'
import type { LogsRepository } from '../db/logs.js'

interface LogsQuery {
  page?: string
  limit?: string
  template?: string
  status?: string
}

interface LogParams {
  id: string
}

export function registerLogsRoutes(server: FastifyInstance, logs: LogsRepository) {
  server.get<{ Querystring: LogsQuery }>('/logs', async (request, reply) => {
    const page = Math.max(1, parseInt(request.query.page ?? '1', 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(request.query.limit ?? '20', 10) || 20))
    const { template, status } = request.query

    const data = logs.findAll({ page, limit, template, status })
    const total = logs.count({ template, status })

    return reply.send({
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  })

  server.get<{ Params: LogParams }>('/logs/:id', async (request, reply) => {
    const id = parseInt(request.params.id, 10)
    if (isNaN(id)) {
      return reply.status(400).send({ error: 'Invalid log ID' })
    }

    const log = logs.findById(id)
    if (!log) {
      return reply.status(404).send({ error: 'Log not found' })
    }

    return reply.send(log)
  })
}
