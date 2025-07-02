import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  getOperatorRequests, 
  deleteOperatorRequest, 
  checkChatHasOperatorRequest,
  getChatsWithOperatorRequests,
  OperatorRequest 
} from '../services/operatorRequestsApi';
import { useWorkspace } from './use-workspace';

/**
 * Hook for managing operator requests in the current workspace
 */
export const useOperatorRequests = () => {
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();
  const workspaceId = workspace?.id;

  // Query to get all operator requests for the workspace
  const {
    data: operatorRequestsData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['operatorRequests', workspaceId],
    queryFn: () => getOperatorRequests(workspaceId!),
    enabled: !!workspaceId,
    refetchInterval: 30000, // Refetch every 30 seconds to keep data fresh
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  // Query to get chats with operator requests (optimized for chat list)
  const {
    data: chatsWithRequests,
    isLoading: isLoadingChatMap,
  } = useQuery({
    queryKey: ['chatsWithOperatorRequests', workspaceId],
    queryFn: () => getChatsWithOperatorRequests(workspaceId!),
    enabled: !!workspaceId,
    refetchInterval: 30000,
    staleTime: 10000,
  });

  // Mutation to delete an operator request (take control)
  const deleteRequestMutation = useMutation({
    mutationFn: ({ requestId }: { requestId: string }) => 
      deleteOperatorRequest(workspaceId!, requestId),
    onSuccess: (data, variables) => {
      // Invalidate and refetch operator requests
      queryClient.invalidateQueries({ queryKey: ['operatorRequests', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['chatsWithOperatorRequests', workspaceId] });
      
      toast.success('Hai preso il controllo della chat', {
        description: 'Ora puoi rispondere direttamente al cliente',
        duration: 3000,
      });
    },
    onError: (error: any) => {
      console.error('Error taking control of chat:', error);
      toast.error('Errore nel prendere controllo della chat', {
        description: error.response?.data?.message || 'Riprova più tardi',
        duration: 5000,
      });
    },
  });

  // Function to check if a specific chat has operator requests
  const checkChatRequest = async (chatId: string) => {
    if (!workspaceId) return null;
    
    try {
      return await checkChatHasOperatorRequest(workspaceId, chatId);
    } catch (error) {
      console.error('Error checking chat operator request:', error);
      return null;
    }
  };

  // Function to handle operator taking control
  const takeControl = async (requestId: string) => {
    return deleteRequestMutation.mutateAsync({ requestId });
  };

  // Helper functions
  const operatorRequests = operatorRequestsData?.operatorRequests || [];
  const totalRequests = operatorRequestsData?.count || 0;
  
  // Function to check if a chat has pending requests (optimized)
  const chatHasRequest = (chatId: string): boolean => {
    return chatsWithRequests?.has(chatId) || false;
  };

  // Function to get operator request for a specific chat
  const getRequestForChat = (chatId: string): OperatorRequest | undefined => {
    return operatorRequests.find(req => req.chatId === chatId && req.status === 'PENDING');
  };

  // Function to get requests by phone number
  const getRequestsByPhone = (phoneNumber: string): OperatorRequest[] => {
    return operatorRequests.filter(req => req.phoneNumber === phoneNumber);
  };

  return {
    // Data
    operatorRequests,
    totalRequests,
    chatsWithRequests,
    
    // Loading states
    isLoading,
    isLoadingChatMap,
    isTakingControl: deleteRequestMutation.isPending,
    
    // Error states
    isError,
    error,
    
    // Functions
    refetch,
    takeControl,
    checkChatRequest,
    chatHasRequest,
    getRequestForChat,
    getRequestsByPhone,
    
    // Mutation states for UI feedback
    takeControlError: deleteRequestMutation.error,
  };
};

/**
 * Simplified hook for checking if a specific chat has operator requests
 * Useful for individual chat components that only need to know about one chat
 */
export const useChatOperatorRequest = (chatId: string) => {
  const { workspace } = useWorkspace();
  const workspaceId = workspace?.id;

  const {
    data: checkData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['chatOperatorRequest', workspaceId, chatId],
    queryFn: () => checkChatHasOperatorRequest(workspaceId!, chatId),
    enabled: !!workspaceId && !!chatId,
    refetchInterval: 30000,
    staleTime: 10000,
  });

  return {
    hasOperatorRequest: checkData?.hasOperatorRequest || false,
    operatorRequest: checkData?.operatorRequest || null,
    isLoading,
    isError,
  };
};