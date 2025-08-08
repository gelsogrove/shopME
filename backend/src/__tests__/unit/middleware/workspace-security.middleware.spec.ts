import 'jest'
import { strictWorkspaceSecurity, lenientWorkspaceSecurity, getSecureWorkspaceId } from '../../../interfaces/http/middlewares/workspace-security.middleware'
import { NextFunction, Request, Response } from 'express'

const resFactory = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() } as unknown as Response)
const next: NextFunction = jest.fn()

const run = (mw: ReturnType<typeof strictWorkspaceSecurity>, req: Partial<Request>) => mw(req as Request, resFactory(), next)

describe('workspace-security.middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('strict: returns 400 when workspaceId is missing', () => {
    const req: any = { params: {}, body: {}, query: {}, headers: {}, get: jest.fn().mockReturnValue('jest-test') }
    const res = resFactory()
    strictWorkspaceSecurity(req as any, res, next)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'WORKSPACE_ID_REQUIRED' }))
    expect(next).not.toHaveBeenCalled()
  })

  it('strict: returns 400 when conflicting workspaceIds are present', () => {
    const req = { params: { workspaceId: 'ws-1' }, body: { workspaceId: 'ws-2' }, query: {}, headers: {} }
    const res = resFactory()
    strictWorkspaceSecurity(req as any, res, next)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'WORKSPACE_ID_CONFLICT' }))
  })

  it('strict: sets secureWorkspaceId when single id is present', () => {
    const req: any = { params: { workspaceId: 'ws-1' }, body: {}, query: {}, headers: {} }
    const res = resFactory()
    strictWorkspaceSecurity(req as Request, res, next)
    expect(getSecureWorkspaceId(req)).toBe('ws-1')
    expect(next).toHaveBeenCalled()
  })

  it('lenient: allows missing workspaceId and calls next', () => {
    const req: any = { params: {}, body: {}, query: {}, headers: {} }
    const res = resFactory()
    lenientWorkspaceSecurity(req as Request, res, next)
    expect(getSecureWorkspaceId(req)).toBeUndefined()
    expect(next).toHaveBeenCalled()
  })

  it('lenient: still detects conflicting ids', () => {
    const req: any = { params: { workspaceId: 'ws-1' }, body: { workspaceId: 'ws-2' }, query: {}, headers: {} }
    const res = resFactory()
    lenientWorkspaceSecurity(req as Request, res, next)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'WORKSPACE_ID_CONFLICT' }))
  })
})