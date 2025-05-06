export class UploadService {
  /**
   * Get the public URL for an uploaded file
   */
  getFileUrl(workspaceId: string, filename: string): string {
    // In a production environment, this would be a CDN URL
    // For local development, we'll serve from our API
    return `/uploads/${workspaceId}/${filename}`;
  }
} 