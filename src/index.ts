import Fastify from 'fastify'
import { loadConfig } from './config.js'

const start = async () => {
  const config = await loadConfig()
  const server = Fastify({ logger: true })

  server.get('/', async () => {
    return { name: 'kuriyr', status: 'ok' }
  })

  try {
    await server.listen({ port: config.port, host: '0.0.0.0' })
    console.log(`Kuriyr listening on http://localhost:${config.port}`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
