import cors from '@fastify/cors'
import Fastify from 'fastify'
import { loadConfig } from './config.js'
import { createDispatcher } from './core/dispatcher.js'
import { createLogsRepository } from './db/logs.js'
import { initDatabase } from './db/schema.js'
import { createProvider } from './providers/index.js'
import { registerLogsRoutes } from './routes/logs.js'
import { registerPreviewRoute } from './routes/preview.js'
import { registerSendRoute } from './routes/send.js'

const start = async () => {
  const config = await loadConfig()
  const server = Fastify({ logger: true })

  await server.register(cors)

  const db = initDatabase()
  const logs = createLogsRepository(db)
  const provider = createProvider(config)
  const dispatcher = createDispatcher(config, provider, logs)

  server.get('/', async () => ({ name: 'kuriyr', status: 'ok' }))

  registerSendRoute(server, dispatcher)
  registerPreviewRoute(server, dispatcher)
  registerLogsRoutes(server, logs)

  // Graceful shutdown
  const shutdown = async () => {
    await server.close()
    db.close()
    process.exit(0)
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)

  try {
    await server.listen({ port: config.port, host: '0.0.0.0' })
    console.log(`Kuriyr listening on http://localhost:${config.port}`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
