import { N8nPayloadBuilder } from '../../../utils/n8n-payload-builder';

// Mock the MessageRepository import
const mockSaveMessage = jest.fn().mockResolvedValue(true);

jest.mock('../../../repositories/message.repository', () => {
  return {
    MessageRepository: jest.fn().mockImplementation(() => {
      return {
        saveMessage: mockSaveMessage
      };
    })
  };
});

// Mock the fetch API
global.fetch = jest.fn().mockImplementation(() => {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ message: "Test response" })
  });
});

describe('N8nPayloadBuilder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSaveMessage.mockResolvedValue(true);
  });

  describe('saveMessageToHistory', () => {
    it('should save messages to history correctly', async () => {
      // Test data
      const workspaceId = 'test-workspace-id';
      const phoneNumber = '+393451234567';
      const userMessage = 'ciao come stai';
      const botResponse = 'Sto bene, grazie! Come posso aiutarti?';
      
      // Call the function
      const result = await N8nPayloadBuilder.saveMessageToHistory(
        workspaceId,
        phoneNumber,
        userMessage,
        botResponse
      );
      
      // Verify the result
      expect(result).toBe(true);
      
      // Verify saveMessage was called with correct parameters
      expect(mockSaveMessage).toHaveBeenCalledTimes(1);
      expect(mockSaveMessage).toHaveBeenCalledWith({
        workspaceId,
        phoneNumber,
        message: userMessage,
        response: botResponse,
        agentSelected: "N8N_API_DIRECT"
      });
    });
    
    it('should handle errors gracefully', async () => {
      // Mock error for this test
      mockSaveMessage.mockRejectedValueOnce(new Error('Test error'));
      
      // Test data
      const workspaceId = 'test-workspace-id';
      const phoneNumber = '+393451234567';
      const userMessage = 'ciao come stai';
      const botResponse = 'Sto bene, grazie! Come posso aiutarti?';
      
      // Call the function with mocked error
      const result = await N8nPayloadBuilder.saveMessageToHistory(
        workspaceId,
        phoneNumber,
        userMessage,
        botResponse
      );
      
      // Should return false on error but not throw
      expect(result).toBe(false);
    });
  });
  
  describe('sendToN8N', () => {
    it('should save messages to history after successful N8N response', async () => {
      // Spy on saveMessageToHistory
      const saveMessageSpy = jest.spyOn(N8nPayloadBuilder, 'saveMessageToHistory')
        .mockResolvedValue(true);
      
      // Test data
      const payload = {
        workspaceId: 'test-workspace-id',
        phoneNumber: '+393451234567',
        messageContent: 'ciao come stai',
        sessionToken: 'test-session-token'
      };
      
      // Call sendToN8N
      const response = await N8nPayloadBuilder.sendToN8N(
        payload,
        'http://localhost:5678/webhook/webhook-start',
        'test'
      );
      
      // Verify response
      expect(response).toEqual({ message: "Test response" });
      
      // Verify saveMessageToHistory was called
      expect(saveMessageSpy).toHaveBeenCalledTimes(1);
      expect(saveMessageSpy).toHaveBeenCalledWith(
        payload.workspaceId,
        payload.phoneNumber,
        payload.messageContent,
        "Test response"
      );
    });
    
    it('should not attempt to save history when response has no message', async () => {
      // Mock fetch to return a response with no message
      global.fetch = jest.fn().mockImplementation(() => {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ status: "OK" }) // No message field
        });
      });
      
      // Spy on saveMessageToHistory
      const saveMessageSpy = jest.spyOn(N8nPayloadBuilder, 'saveMessageToHistory')
        .mockResolvedValue(true);
      
      // Test data
      const payload = {
        workspaceId: 'test-workspace-id',
        phoneNumber: '+393451234567',
        messageContent: 'ciao come stai',
        sessionToken: 'test-session-token'
      };
      
      // Call sendToN8N
      await N8nPayloadBuilder.sendToN8N(
        payload,
        'http://localhost:5678/webhook/webhook-start',
        'test'
      );
      
      // Verify saveMessageToHistory was NOT called
      expect(saveMessageSpy).not.toHaveBeenCalled();
    });
  });
}); 