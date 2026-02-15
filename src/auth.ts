import type { FastifyReply, FastifyRequest, onRequestHookHandler } from 'fastify'
import { timingSafeEqual } from 'node:crypto'

const API_ROUTES = ['/send', '/preview', '/logs']

function isApiRoute(url: string): boolean {
  return API_ROUTES.some((route) => url === route || url.startsWith(`${route}/`))
}

/** Constant-time string comparison to prevent timing attacks */
function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

function parseBasicAuth(header: string): { user: string; password: string } | null {
  const match = header.match(/^Basic\s+(.+)$/i)
  if (!match) return null

  const decoded = Buffer.from(match[1], 'base64').toString('utf-8')
  const separatorIndex = decoded.indexOf(':')
  if (separatorIndex === -1) return null

  return {
    user: decoded.slice(0, separatorIndex),
    password: decoded.slice(separatorIndex + 1),
  }
}

function rejectBasicAuth(reply: FastifyReply): void {
  void reply
    .status(401)
    .header('WWW-Authenticate', 'Basic realm="Kuriyr"')
    .send({ error: 'Unauthorized' })
}

/** Protects dashboard routes (everything except API routes) with HTTP Basic Auth */
export function createDashboardAuth(user: string, password: string): onRequestHookHandler {
  return (request: FastifyRequest, reply: FastifyReply, done) => {
    if (isApiRoute(request.url)) return done()

    const credentials = parseBasicAuth(request.headers.authorization ?? '')
    if (!credentials || !safeCompare(credentials.user, user) || !safeCompare(credentials.password, password)) {
      rejectBasicAuth(reply)
      return
    }

    done()
  }
}

/** Protects API routes (/send, /preview, /logs) with Bearer token */
export function createApiAuth(token: string): onRequestHookHandler {
  return (request: FastifyRequest, reply: FastifyReply, done) => {
    if (!isApiRoute(request.url)) return done()

    const match = request.headers.authorization?.match(/^Bearer\s+(.+)$/i)
    if (!match || !safeCompare(match[1], token)) {
      void reply.status(401).send({ error: 'Unauthorized' })
      return
    }

    done()
  }
}
