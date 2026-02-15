import { describe, expect, it, vi } from 'vitest'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { createApiAuth, createDashboardAuth } from './auth.js'

function createMockReply() {
  const reply = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: null as unknown,
    status(code: number) {
      reply.statusCode = code
      return reply
    },
    header(key: string, value: string) {
      reply.headers[key] = value
      return reply
    },
    send(payload: unknown) {
      reply.body = payload
      return reply
    },
  }
  return reply as unknown as FastifyReply
}

function createMockRequest(url: string, authorization?: string) {
  return { url, headers: { authorization } } as unknown as FastifyRequest
}

// Helper that calls the hook with a null `this` context
// (Fastify hooks expect `this` = FastifyInstance, irrelevant for unit tests)
function callHook(
  hook: ReturnType<typeof createDashboardAuth>,
  request: FastifyRequest,
  reply: FastifyReply,
  done: () => void,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hook.call(null as any, request, reply, done)
}

describe('createDashboardAuth', () => {
  const hook = createDashboardAuth('admin', 'secret')
  const validAuth = 'Basic ' + Buffer.from('admin:secret').toString('base64')

  it('skips API routes', () => {
    const done = vi.fn()
    callHook(hook, createMockRequest('/send'), createMockReply(), done)
    expect(done).toHaveBeenCalled()
  })

  it('allows valid Basic credentials', () => {
    const done = vi.fn()
    callHook(hook, createMockRequest('/', validAuth), createMockReply(), done)
    expect(done).toHaveBeenCalled()
  })

  it('rejects missing authorization', () => {
    const done = vi.fn()
    const reply = createMockReply()
    callHook(hook, createMockRequest('/'), reply, done)
    expect(done).not.toHaveBeenCalled()
    expect((reply as unknown as { statusCode: number }).statusCode).toBe(401)
    expect((reply as unknown as { headers: Record<string, string> }).headers['WWW-Authenticate']).toBe('Basic realm="Kuriyr"')
  })

  it('rejects wrong credentials', () => {
    const done = vi.fn()
    const reply = createMockReply()
    const badAuth = 'Basic ' + Buffer.from('admin:wrong').toString('base64')
    callHook(hook, createMockRequest('/', badAuth), reply, done)
    expect(done).not.toHaveBeenCalled()
    expect((reply as unknown as { statusCode: number }).statusCode).toBe(401)
  })
})

describe('createApiAuth', () => {
  const hook = createApiAuth('my-token')

  it('skips non-API routes', () => {
    const done = vi.fn()
    callHook(hook, createMockRequest('/'), createMockReply(), done)
    expect(done).toHaveBeenCalled()
  })

  it('allows valid Bearer token on /send', () => {
    const done = vi.fn()
    callHook(hook, createMockRequest('/send', 'Bearer my-token'), createMockReply(), done)
    expect(done).toHaveBeenCalled()
  })

  it('protects all 3 API routes', () => {
    for (const route of ['/send', '/preview', '/logs']) {
      const done = vi.fn()
      callHook(hook, createMockRequest(route, 'Bearer my-token'), createMockReply(), done)
      expect(done).toHaveBeenCalled()
    }
  })

  it('rejects missing Bearer token', () => {
    const done = vi.fn()
    const reply = createMockReply()
    callHook(hook, createMockRequest('/send'), reply, done)
    expect(done).not.toHaveBeenCalled()
    expect((reply as unknown as { statusCode: number }).statusCode).toBe(401)
  })

  it('rejects invalid Bearer token', () => {
    const done = vi.fn()
    const reply = createMockReply()
    callHook(hook, createMockRequest('/send', 'Bearer wrong'), reply, done)
    expect(done).not.toHaveBeenCalled()
    expect((reply as unknown as { statusCode: number }).statusCode).toBe(401)
  })
})
