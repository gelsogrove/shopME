import 'jest'
import { workspaceAuthMiddleware } from '../../../interfaces/http/middlewares/workspace-auth.middleware'
import { NextFunction, Request, Response } from 'express'

const baseReq = () => ({ headers: {}, params: {}, user: undefined } as unknown as Request)
const res = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() } as unknown as Response)
const next: NextFunction = jest.fn()

describe('workspaceAuthMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    delete process.env.INTEGRATION_TEST
    process.env.NODE_ENV = 'test'
  })

  it('returns 400 when workspaceId missing', () => {
    const req = baseReq()
    expect(() => workspaceAuthMiddleware(req, res(), next)).toThrow(/Workspace ID is required/)
  })

  it('bypasses auth in integration test with matching header', () => {
    process.env.INTEGRATION_TEST = 'true'
    const req = baseReq()
    ;(req as any).params = { workspaceId: 'ws-1' }
    ;(req as any).headers = { 'x-test-auth': 'true', 'x-workspace-id': 'ws-1' }

    expect(() => workspaceAuthMiddleware(req, res(), next)).not.toThrow()
    expect(next).toHaveBeenCalled()
  })

  it('throws 403 in integration test when header workspaceId mismatches', () => {
    process.env.INTEGRATION_TEST = 'true'
    const req = baseReq()
    ;(req as any).params = { workspaceId: 'ws-1' }
    ;(req as any).headers = { 'x-test-auth': 'true', 'x-workspace-id': 'ws-2' }

    expect(() => workspaceAuthMiddleware(req, res(), next)).toThrow(/access to this workspace/)
  })

  it('throws 401 when user is missing', () => {
    const req = baseReq()
    ;(req as any).params = { workspaceId: 'ws-1' }

    expect(() => workspaceAuthMiddleware(req, res(), next)).toThrow(/Authentication required/)
  })

  it('throws 403 when user has no access to workspace', () => {
    const req = baseReq()
    ;(req as any).params = { workspaceId: 'ws-3' }
    ;(req as any).user = { id: 'u1', workspaces: [{ id: 'ws-1' }, { id: 'ws-2' }] }

    expect(() => workspaceAuthMiddleware(req, res(), next)).toThrow(/access to this workspace/)
  })

  it('passes when user has access to workspace', () => {
    const req = baseReq()
    ;(req as any).params = { workspaceId: 'ws-2' }
    ;(req as any).user = { id: 'u1', workspaces: [{ id: 'ws-1' }, { id: 'ws-2' }] }

    expect(() => workspaceAuthMiddleware(req, res(), next)).not.toThrow()
    expect(next).toHaveBeenCalled()
  })
})