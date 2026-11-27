import type { FastifyInstance } from 'fastify'

/** Liveness probe for container healthchecks: no auth, no side effects */
export function registerHealthRoute(server: FastifyInstance): void {
  server.get('/health', async () => ({ status: 'ok' }))
}
