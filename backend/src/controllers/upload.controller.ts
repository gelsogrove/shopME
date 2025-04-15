import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import uploadService from '../services/upload.service';

export class UploadController {
  /**
   * Upload a file
   */
  uploadFile = async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const { workspaceId } = req.params;
      const file = req.file;
      
      // Generate the file URL
      const fileUrl = uploadService.getFileUrl(workspaceId, file.filename);
      
      return res.status(201).json({
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: fileUrl
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      return res.status(500).json({
        message: 'An error occurred during file upload',
        error: (error as Error).message
      });
    }
  };

  /**
   * Serve static files
   */
  serveFile = async (req: Request, res: Response) => {
    try {
      const { workspaceId, filename } = req.params;
      const filePath = path.join(__dirname, '../../uploads', workspaceId, filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found' });
      }
      
      res.sendFile(filePath);
    } catch (error) {
      console.error('Error serving file:', error);
      return res.status(500).json({
        message: 'An error occurred while serving the file',
        error: (error as Error).message
      });
    }
  };

  /**
   * Delete a file
   */
  deleteFile = async (req: Request, res: Response) => {
    try {
      const { workspaceId, filename } = req.params;
      
      const deleted = await uploadService.deleteFile(workspaceId, filename);
      
      if (!deleted) {
        return res.status(404).json({ message: 'File not found' });
      }
      
      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting file:', error);
      return res.status(500).json({
        message: 'An error occurred while deleting the file',
        error: (error as Error).message
      });
    }
  };
}

export default new UploadController(); 