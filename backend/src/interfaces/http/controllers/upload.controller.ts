import { Request, Response } from 'express';
import fs from 'fs';
import { UploadService } from '../../../application/services/upload.service';
import logger from '../../../utils/logger';

export class UploadController {
  private uploadService: UploadService;

  constructor(uploadService?: UploadService) {
    this.uploadService = uploadService || new UploadService();
  }

  /**
   * Upload a file
   */
  uploadFile = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.file) {
        logger.warn('Upload attempt with no file');
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const { workspaceId } = req.params;
      const file = req.file;
      
      // Generate the file URL
      const fileUrl = this.uploadService.getFileUrl(workspaceId, file.filename);
      
      logger.info(`File uploaded successfully: ${file.filename} (${file.size} bytes)`);
      
      return res.status(201).json({
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: fileUrl
      });
    } catch (error) {
      logger.error('Error uploading file:', error);
      return res.status(500).json({
        message: 'An error occurred during file upload',
        error: (error as Error).message
      });
    }
  };

  /**
   * Serve static files
   */
  serveFile = async (req: Request, res: Response): Promise<void | Response> => {
    try {
      const { workspaceId, filename } = req.params;
      const filePath = this.uploadService.getFilePath(workspaceId, filename);
      
      if (!fs.existsSync(filePath)) {
        logger.warn(`File not found: ${filePath}`);
        return res.status(404).json({ message: 'File not found' });
      }
      
      logger.debug(`Serving file: ${filePath}`);
      res.sendFile(filePath);
    } catch (error) {
      logger.error('Error serving file:', error);
      return res.status(500).json({
        message: 'An error occurred while serving the file',
        error: (error as Error).message
      });
    }
  };

  /**
   * Delete a file
   */
  deleteFile = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { workspaceId, filename } = req.params;
      
      const deleted = await this.uploadService.deleteFile(workspaceId, filename);
      
      if (!deleted) {
        return res.status(404).json({ message: 'File not found' });
      }
      
      logger.info(`File deleted successfully: ${filename} from workspace ${workspaceId}`);
      return res.status(204).send();
    } catch (error) {
      logger.error('Error deleting file:', error);
      return res.status(500).json({
        message: 'An error occurred while deleting the file',
        error: (error as Error).message
      });
    }
  };
} 