import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import app from '../../app';
import { mockAdminUser } from './mock/mockUsers';
import { prisma, setupJest, teardownJest } from './setup';

// Test per endpoint WIP status

describe('INTEGRATION: /api/internal/wip-status/:workspaceId/:phone', () => {
  let workspaceId: string;
  let testPhone: string = '+391234567890';

  beforeAll(async () => {
    await setupJest();
    // Crea workspace con challengeStatus true e wipMessages custom
    const workspace = await prisma.workspace.create({
      data: {
        name: 'WIP Test Workspace',
        slug: `wip-test-workspace-${Date.now()}`,
        language: 'ENG',
        currency: 'EUR',
        isActive: true,
        challengeStatus: true,
        wipMessages: {
          en: 'Work in progress. Please contact us later.',
          it: 'Lavori in corso. Contattaci più tardi.'
        },
        users: {
          create: {
            userId: (await prisma.user.create({
              data: {
                email: mockAdminUser.email,
                passwordHash: 'hash',
                firstName: mockAdminUser.firstName,
                lastName: mockAdminUser.lastName,
                role: 'ADMIN',
                gdprAccepted: new Date()
              }
            })).id,
            role: 'OWNER'
          }
        }
      }
    });
    workspaceId = workspace.id;
  });

  afterAll(async () => {
    await prisma.workspace.deleteMany({ where: { id: workspaceId } });
    await prisma.user.deleteMany({ where: { email: mockAdminUser.email } });
    await teardownJest();
  });

  it('should return hasActiveWip true and wipData for workspace in WIP mode', async () => {
    const res = await request(app)
      .get(`/api/internal/wip-status/${workspaceId}/${testPhone}`)
      .set('Authorization', 'Basic ' + Buffer.from('admin:admin').toString('base64'));
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('hasActiveWip', true);
    expect(res.body).toHaveProperty('wipData');
    expect(res.body.wipData).toHaveProperty('reason');
    expect(res.body.wipData.reason).toMatch(/maintenance|lavori in corso|work in progress/i);
  });

  it('should return hasActiveWip false for workspace not in WIP mode', async () => {
    // Disabilita challengeStatus
    await prisma.workspace.update({ where: { id: workspaceId }, data: { challengeStatus: false } });
    const res = await request(app)
      .get(`/api/internal/wip-status/${workspaceId}/${testPhone}`)
      .set('Authorization', 'Basic ' + Buffer.from('admin:admin').toString('base64'));
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('hasActiveWip', false);
    expect(res.body.wipData).toBeNull();
  });
}); 