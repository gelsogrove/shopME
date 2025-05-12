import { IsUUID } from 'class-validator';

/**
 * WorkspaceContextDTO
 * Standardized DTO for workspace identification across the application
 */
export class WorkspaceContextDTO {
  @IsUUID(4, { message: 'Workspace ID must be a valid UUID' })
  workspaceId: string;

  constructor(workspaceId: string) {
    this.workspaceId = workspaceId;
  }

  /**
   * Factory method to create a WorkspaceContextDTO from various request sources
   * @param req Express Request object
   * @returns WorkspaceContextDTO or null if no workspaceId is found
   */
  static fromRequest(req: any): WorkspaceContextDTO | null {
    const workspaceId = 
      req.params?.workspaceId || 
      req.query?.workspaceId as string || 
      req.body?.workspaceId || 
      req.header?.('x-workspace-id');
    
    return workspaceId ? new WorkspaceContextDTO(workspaceId) : null;
  }

  /**
   * Validates if the workspace context is valid
   * @returns true if valid, false otherwise
   */
  isValid(): boolean {
    // Simple UUID v4 format validation
    const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidV4Regex.test(this.workspaceId);
  }
} 