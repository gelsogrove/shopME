import { api } from './api';

export interface OperatorRequest {
  id: string;
  workspaceId: string;
  chatId: string;
  phoneNumber: string;
  message: string;
  timestamp: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface OperatorRequestsResponse {
  success: boolean;
  operatorRequests: OperatorRequest[];
  count: number;
}

export interface OperatorRequestCheckResponse {
  success: boolean;
  hasOperatorRequest: boolean;
  operatorRequest: OperatorRequest | null;
}

export interface DeleteOperatorRequestResponse {
  success: boolean;
  message: string;
  deletedId: string;
}

/**
 * Get all operator requests for a workspace
 * @param workspaceId - The workspace ID
 * @returns Promise with operator requests data
 */
export const getOperatorRequests = async (workspaceId: string): Promise<OperatorRequestsResponse> => {
  try {
    const response = await api.get(`/workspaces/${workspaceId}/operator-requests`);
    return response.data;
  } catch (error) {
    console.error('Error fetching operator requests:', error);
    throw error;
  }
};

/**
 * Delete an operator request (when operator takes control)
 * @param workspaceId - The workspace ID
 * @param requestId - The operator request ID to delete
 * @returns Promise with deletion confirmation
 */
export const deleteOperatorRequest = async (
  workspaceId: string, 
  requestId: string
): Promise<DeleteOperatorRequestResponse> => {
  try {
    const response = await api.delete(`/workspaces/${workspaceId}/operator-requests/${requestId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting operator request:', error);
    throw error;
  }
};

/**
 * Check if a specific chat has pending operator requests
 * @param workspaceId - The workspace ID
 * @param chatId - The chat session ID to check
 * @returns Promise with operator request status for the chat
 */
export const checkChatHasOperatorRequest = async (
  workspaceId: string, 
  chatId: string
): Promise<OperatorRequestCheckResponse> => {
  try {
    const response = await api.get(`/workspaces/${workspaceId}/operator-requests/by-chat/${chatId}`);
    return response.data;
  } catch (error) {
    console.error('Error checking chat operator request:', error);
    throw error;
  }
};

/**
 * Get a map of chatIds that have pending operator requests
 * This is useful for efficiently checking multiple chats at once
 * @param workspaceId - The workspace ID
 * @returns Promise with a Set of chatIds that have pending requests
 */
export const getChatsWithOperatorRequests = async (workspaceId: string): Promise<Set<string>> => {
  try {
    const response = await getOperatorRequests(workspaceId);
    const chatIds = new Set(response.operatorRequests.map(req => req.chatId));
    return chatIds;
  } catch (error) {
    console.error('Error getting chats with operator requests:', error);
    throw error;
  }
};