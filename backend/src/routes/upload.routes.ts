import { Router } from 'express';
import uploadController from '../controllers/upload.controller';
import { asyncMiddleware } from '../middlewares/async.middleware';
import { uploadMiddleware } from '../services/upload.service';

export const uploadRouter = () => {
  const router = Router();

  // Upload endpoints
  router.post(
    '/workspaces/:workspaceId/upload',
    uploadMiddleware.single('file'),
    asyncMiddleware(uploadController.uploadFile)
  );

  // Serve uploaded files
  router.get(
    '/uploads/:workspaceId/:filename',
    asyncMiddleware(uploadController.serveFile)
  );

  // Delete uploaded files
  router.delete(
    '/workspaces/:workspaceId/upload/:filename',
    asyncMiddleware(uploadController.deleteFile)
  );

  return router;
};

export default uploadRouter(); 