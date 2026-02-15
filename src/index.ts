import Fastify from 'fastify'

const server = Fastify({ logger: true })

server.get('/', async () => {
  return { name: 'kuriyr', status: 'ok' }
})

const start = async () => {
  try {
    await server.listen({ port: 4400, host: '0.0.0.0' })
    console.log('Kuriyr listening on http://localhost:4400')
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
