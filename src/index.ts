import cors from '@fastify/cors'
import fastifyStatic from '@fastify/static'
import Fastify from 'fastify'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createApiAuth, createDashboardAuth } from './auth.js'
import { loadConfig } from './config.js'
import { createDispatcher } from './core/dispatcher.js'
import { createLogsRepository } from './db/logs.js'
import { initDatabase } from './db/schema.js'
import { createProvider } from './providers/index.js'
import { registerLogsRoutes } from './routes/logs.js'
import { registerPreviewRoute } from './routes/preview.js'
import { registerSendRoute } from './routes/send.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const start = async () => {
  const config = await loadConfig()
  const server = Fastify({ logger: true })

  await server.register(cors)

  // Serve the built dashboard if available
  const dashboardPath = resolve(__dirname, 'dashboard')
  if (existsSync(dashboardPath)) {
    await server.register(fastifyStatic, {
      root: dashboardPath,
      prefix: '/',
      decorateReply: false,
    })
  }

  // Register auth hooks when credentials are configured
  if (config.dashboardUser && config.dashboardPassword) {
    server.addHook('onRequest', createDashboardAuth(config.dashboardUser, config.dashboardPassword))
    console.log('Dashboard authentication enabled')
  }
  if (config.apiToken) {
    server.addHook('onRequest', createApiAuth(config.apiToken))
    console.log('API token authentication enabled')
  }

  const db = initDatabase()
  const logs = createLogsRepository(db)
  const provider = createProvider(config)
  const dispatcher = createDispatcher(config, provider, logs)

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
