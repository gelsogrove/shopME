import { SettingsService } from '../../../application/services/settings.service';
import { Settings } from '../../../domain/entities/settings.entity';
import { SettingsRepository } from '../../../repositories/settings.repository';

// Mock the repository
jest.mock('../../../repositories/settings.repository');
jest.mock('../../../utils/logger');

describe('SettingsService - GDPR Update', () => {
  let settingsService: SettingsService;
  let mockRepository: jest.Mocked<SettingsRepository>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create service instance
    settingsService = new SettingsService();
    
    // Get the mocked repository instance
    mockRepository = (settingsService as any).repository;
  });

  describe('updateGdprContent', () => {
    const workspaceId = 'test-workspace-id';
    const gdprContent = 'Test GDPR content for privacy policy';

    it('should successfully update GDPR content for existing workspace', async () => {
      // Arrange
      const expectedSettings = new Settings({
        id: 'test-id',
        workspaceId,
        phoneNumber: 'test-phone',
        apiKey: 'test-key',
        webhookUrl: 'test-url',
        settings: {},
        gdpr: gdprContent,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockRepository.updateGdprContent.mockResolvedValue(expectedSettings);

      // Act
      const result = await settingsService.updateGdprContent(workspaceId, gdprContent);

      // Assert
      expect(mockRepository.updateGdprContent).toHaveBeenCalledWith(workspaceId, gdprContent);
      expect(result).toEqual(expectedSettings);
      expect(result?.gdpr).toBe(gdprContent);
      expect(result?.workspaceId).toBe(workspaceId);
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      mockRepository.updateGdprContent.mockRejectedValue(error);

      // Act
      const result = await settingsService.updateGdprContent(workspaceId, gdprContent);

      // Assert
      expect(mockRepository.updateGdprContent).toHaveBeenCalledWith(workspaceId, gdprContent);
      expect(result).toBeTruthy();
      expect(result?.id).toBe('temp-id');
      expect(result?.gdpr).toBe(gdprContent);
      expect(result?.workspaceId).toBe(workspaceId);
    });

    it('should handle empty GDPR content', async () => {
      // Arrange
      const emptyContent = '';
      const expectedSettings = new Settings({
        id: 'test-id',
        workspaceId,
        phoneNumber: 'test-phone',
        apiKey: 'test-key',
        webhookUrl: 'test-url',
        settings: {},
        gdpr: emptyContent,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockRepository.updateGdprContent.mockResolvedValue(expectedSettings);

      // Act
      const result = await settingsService.updateGdprContent(workspaceId, emptyContent);

      // Assert
      expect(mockRepository.updateGdprContent).toHaveBeenCalledWith(workspaceId, emptyContent);
      expect(result).toEqual(expectedSettings);
      expect(result?.gdpr).toBe(emptyContent);
    });

    it('should handle very long GDPR content', async () => {
      // Arrange
      const longContent = 'A'.repeat(10000); // 10KB of content
      const expectedSettings = new Settings({
        id: 'test-id',
        workspaceId,
        phoneNumber: 'test-phone',
        apiKey: 'test-key',
        webhookUrl: 'test-url',
        settings: {},
        gdpr: longContent,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockRepository.updateGdprContent.mockResolvedValue(expectedSettings);

      // Act
      const result = await settingsService.updateGdprContent(workspaceId, longContent);

      // Assert
      expect(mockRepository.updateGdprContent).toHaveBeenCalledWith(workspaceId, longContent);
      expect(result).toEqual(expectedSettings);
      expect(result?.gdpr).toBe(longContent);
      expect(result?.gdpr?.length).toBe(10000);
    });
  });
}); 