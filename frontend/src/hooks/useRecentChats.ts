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
          return response.data.data;
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