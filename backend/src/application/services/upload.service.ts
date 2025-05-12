import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import logger from '../../utils/logger';

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  logger.info(`Created upload directory: ${uploadDir}`);
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create workspace-specific folder if it doesn't exist
    const workspaceId = req.params.workspaceId;
    const workspaceDir = path.join(uploadDir, workspaceId);
    
    if (!fs.existsSync(workspaceDir)) {
      fs.mkdirSync(workspaceDir, { recursive: true });
      logger.debug(`Created workspace upload directory: ${workspaceDir}`);
    }
    
    cb(null, workspaceDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const originalExt = path.extname(file.originalname);
    const filename = `${uuidv4()}${originalExt}`;
    logger.debug(`Generated filename for upload: ${filename}`);
    cb(null, filename);
  }
});

// Filter files by type
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    logger.warn(`Rejected file upload with unsupported mimetype: ${file.mimetype}`);
    cb(new Error('Only image files are allowed'));
  }
};

// Create upload middleware
export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  }
});

export class UploadService {
  /**
   * Get the public URL for an uploaded file
   */
  getFileUrl(workspaceId: string, filename: string): string {
    // In a production environment, this would be a CDN URL
    // For local development, we'll serve from our API
    return `/api/upload/uploads/${workspaceId}/${filename}`;
  }
  
  /**
   * Delete an uploaded file
   */
  async deleteFile(workspaceId: string, filename: string): Promise<boolean> {
    try {
      const filePath = path.join(uploadDir, workspaceId, filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.info(`Deleted file: ${filePath}`);
        return true;
      }
      
      logger.warn(`File not found for deletion: ${filePath}`);
      return false;
    } catch (error) {
      logger.error('Error deleting file:', error);
      return false;
    }
  }
  
  /**
   * Get the absolute path to a file
   */
  getFilePath(workspaceId: string, filename: string): string {
    return path.join(uploadDir, workspaceId, filename);
  }
} 