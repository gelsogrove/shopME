import { api } from '@/services/api';
import { useQuery } from '@tanstack/react-query';

export function useRecentChats() {
  return useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      try {
        // Get current workspace ID from session storage
        const workspaceData = sessionStorage.getItem("currentWorkspace");
        let workspaceId = null;
        
        if (workspaceData) {
          try {
            const workspace = JSON.parse(workspaceData);
            workspaceId = workspace.id;
            console.log(`Using workspace ID for chats: ${workspaceId}`);
          } catch (e) {
            console.error("Error parsing workspace data:", e);
          }
        }
        
        // Make API request with explicit header
        const response = await api.get('/chat/recent', {
          headers: workspaceId ? {
            'x-workspace-id': workspaceId
          } : {}
        });
        
        if (response.data.success) {
          // Transform the backend data to match frontend expectations
          const transformedChats = response.data.data.map((chat: any) => ({
            id: chat.id,
            sessionId: chat.id, // Map id to sessionId for frontend compatibility
            customerId: chat.customerId,
            customerName: chat.customer?.name || 'Unknown Customer',
            customerPhone: chat.customer?.phone || '',
            companyName: chat.customer?.company || '',
            lastMessage: chat.lastMessage || '',
            lastMessageTime: chat.updatedAt || chat.createdAt,
            unreadCount: chat.unreadCount || 0,
            isActive: true,
            isFavorite: false,
            activeChatbot: chat.customer?.activeChatbot ?? true, // Include activeChatbot for chat list icon
          }));
          
          console.log('Transformed chats:', transformedChats);
          return transformedChats;
        }
        
        throw new Error('Error loading chats');
      } catch (error) {
        console.error('Error in useRecentChats:', error);
        throw error;
      }
    },
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  })
} 