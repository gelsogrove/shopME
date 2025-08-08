import 'jest'
import { authMiddleware } from '../../../middlewares/auth.middleware'
import { NextFunction, Request, Response } from 'express'
import { sign } from 'jsonwebtoken'

// Mock prisma used within auth.middleware
jest.mock('../../../lib/prisma', () => {
  return {
    prisma: {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'user-1',
          email: 'user@example.com',
          role: 'ADMIN',
          workspaces: [
            { role: 'ADMIN', workspace: { id: 'ws-1' } },
            { role: 'USER', workspace: { id: 'ws-2' } },
          ],
        }),
      },
    },
  }
})

describe('authMiddleware', () => {
  const secret = 'test-secret'
  const baseReq = () => ({ headers: {}, cookies: {}, query: {}, params: {}, path: '/api/test', originalUrl: '/api/test' }) as unknown as Request
  const res = () => {
    const r: Partial<Response> = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() }
    return r as Response
  }
  const next: NextFunction = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.JWT_SECRET = secret
  })

  it('extracts token from cookie and sets req.user', async () => {
    const token = sign({ id: 'user-1', email: 'user@example.com', role: 'ADMIN' }, secret)
    const req = baseReq()
    ;(req as any).cookies = { auth_token: token }

    await authMiddleware(req, res(), next)

    expect((req as any).user).toBeDefined()
    expect((req as any).user.email).toBe('user@example.com')
    expect(next).toHaveBeenCalled()
  })

  it('extracts token from Authorization header', async () => {
    const token = sign({ userId: 'user-1', email: 'user@example.com', role: 'ADMIN' }, secret)
    const req = baseReq()
    ;(req as any).headers = { authorization: `Bearer ${token}` }

    await authMiddleware(req, res(), next)

    expect((req as any).user?.id).toBe('user-1')
    expect(next).toHaveBeenCalled()
  })

  it('stores workspaceId from query/header/params when present', async () => {
    const token = sign({ id: 'user-1', email: 'user@example.com', role: 'ADMIN' }, secret)

    // From query
    let req = baseReq()
    ;(req as any).cookies = { auth_token: token }
    ;(req as any).query = { workspaceId: 'ws-query' }
    await authMiddleware(req, res(), next)
    expect((req as any).workspaceId).toBe('ws-query')

    // From header
    req = baseReq()
    ;(req as any).cookies = { auth_token: token }
    ;(req as any).headers = { 'x-workspace-id': 'ws-header' }
    await authMiddleware(req, res(), next)
    expect((req as any).workspaceId).toBe('ws-header')

    // From params
    req = baseReq()
    ;(req as any).cookies = { auth_token: token }
    ;(req as any).params = { workspaceId: 'ws-param' }
    await authMiddleware(req, res(), next)
    expect((req as any).workspaceId).toBe('ws-param')
  })

  it('returns 401 when token missing', async () => {
    const req = baseReq()
    const response = res()

    await authMiddleware(req, response, next)

    expect(response.status).toHaveBeenCalledWith(401)
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }))
  })

  it('returns 401 for invalid token', async () => {
    const req = baseReq()
    ;(req as any).cookies = { auth_token: 'invalid' }
    const response = res()

    await authMiddleware(req, response, next)

    expect(response.status).toHaveBeenCalledWith(401)
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }))
  })
})