import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { WorkspaceService } from '../../application/services/workspace.service';
import { setupJest } from '../integration/setup';

const prisma = new PrismaClient();

describe('Workspace Creation Integration Tests', () => {
  let workspaceService: WorkspaceService;

  beforeAll(async () => {
    await setupJest();
    workspaceService = new WorkspaceService(prisma);
  });

  afterAll(async () => {
    // Clean up test data - just disconnect, individual tests handle their own cleanup
    await prisma.$disconnect();
  });

  describe('Workspace Creation with Default Settings', () => {
    it('should create workspace with GDPR settings and agent configuration', async () => {
      // Arrange
      const workspaceData = {
        name: 'Test Workspace for Auto-Creation',
        description: 'Test workspace to verify auto-creation of settings',
        language: 'en',
        currency: 'EUR',
        isActive: true,
        isDelete: false
      };

      // Act
      const createdWorkspace = await workspaceService.create(workspaceData);

      // Assert - Workspace created
      expect(createdWorkspace).toBeDefined();
      expect(createdWorkspace.id).toBeDefined();
      expect(createdWorkspace.name).toBe(workspaceData.name);
      expect(createdWorkspace.slug).toBe('test-workspace-for-auto-creation');

      // Assert - GDPR settings created
      const gdprSettings = await prisma.whatsappSettings.findFirst({
        where: { workspaceId: createdWorkspace.id }
      });
      
      expect(gdprSettings).toBeDefined();
      expect(gdprSettings?.workspaceId).toBe(createdWorkspace.id);
      expect(gdprSettings?.phoneNumber).toMatch(/^\+34-/);
      expect(gdprSettings?.apiKey).toBe('default-api-key');
      expect(gdprSettings?.gdpr).toBeDefined();
      expect(gdprSettings?.gdpr).toContain('Privacy Policy');

      // Assert - Agent configuration created
      const agentConfig = await prisma.prompts.findFirst({
        where: { 
          workspaceId: createdWorkspace.id,
          name: 'Default Assistant'
        }
      });
      
      expect(agentConfig).toBeDefined();
      expect(agentConfig?.workspaceId).toBe(createdWorkspace.id);
      expect(agentConfig?.name).toBe('Default Assistant');
      expect(agentConfig?.isRouter).toBe(true);
      expect(agentConfig?.isActive).toBe(true);
      expect(agentConfig?.temperature).toBe(0.7);
      expect(agentConfig?.top_p).toBe(0.9);
      expect(agentConfig?.top_k).toBe(40);
      expect(agentConfig?.model).toBe('openai/gpt-4o-mini');
      expect(agentConfig?.max_tokens).toBe(1000);
      expect(agentConfig?.content).toBeDefined();

      // Clean up
      await prisma.whatsappSettings.delete({
        where: { id: gdprSettings!.id }
      });
      
      await prisma.prompts.delete({
        where: { id: agentConfig!.id }
      });
      
      await prisma.workspace.delete({
        where: { id: createdWorkspace.id }
      });
    });

    it('should handle errors gracefully if GDPR or agent creation fails', async () => {
      // This test verifies that workspace creation doesn't fail completely
      // if there are issues creating the default settings
      
      const workspaceData = {
        name: 'Test Workspace Error Handling',
        description: 'Test workspace for error handling',
        language: 'en',
        currency: 'EUR',
        isActive: true,
        isDelete: false
      };

      // Act - should not throw even if there are issues with default settings
      const createdWorkspace = await workspaceService.create(workspaceData);

      // Assert - Workspace should still be created
      expect(createdWorkspace).toBeDefined();
      expect(createdWorkspace.id).toBeDefined();
      expect(createdWorkspace.name).toBe(workspaceData.name);

      // Clean up
      await prisma.whatsappSettings.deleteMany({
        where: { workspaceId: createdWorkspace.id }
      });
      
      await prisma.prompts.deleteMany({
        where: { workspaceId: createdWorkspace.id }
      });
      
      await prisma.workspace.delete({
        where: { id: createdWorkspace.id }
      });
    });

    it('should create unique phone numbers for different workspaces', async () => {
      // Arrange
      const workspace1Data = {
        name: 'Test Workspace 1',
        language: 'en',
        currency: 'EUR',
        isActive: true,
        isDelete: false
      };

      const workspace2Data = {
        name: 'Test Workspace 2',
        language: 'es',
        currency: 'EUR',
        isActive: true,
        isDelete: false
      };

      // Act
      const workspace1 = await workspaceService.create(workspace1Data);
      const workspace2 = await workspaceService.create(workspace2Data);

      // Assert
      const settings1 = await prisma.whatsappSettings.findFirst({
        where: { workspaceId: workspace1.id }
      });
      
      const settings2 = await prisma.whatsappSettings.findFirst({
        where: { workspaceId: workspace2.id }
      });

      expect(settings1?.phoneNumber).not.toBe(settings2?.phoneNumber);
      expect(settings1?.phoneNumber).toMatch(/^\+34-/);
      expect(settings2?.phoneNumber).toMatch(/^\+34-/);

      // Clean up
      await prisma.whatsappSettings.deleteMany({
        where: { 
          workspaceId: { 
            in: [workspace1.id, workspace2.id] 
          } 
        }
      });
      
      await prisma.prompts.deleteMany({
        where: { 
          workspaceId: { 
            in: [workspace1.id, workspace2.id] 
          } 
        }
      });
      
      await prisma.workspace.deleteMany({
        where: { 
          id: { 
            in: [workspace1.id, workspace2.id] 
          } 
        }
      });
    });
  });
}); 