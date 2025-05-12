import { Router } from 'express';
import { uploadMiddleware } from '../../../application/services/upload.service';
import logger from '../../../utils/logger';
import { UploadController } from '../controllers/upload.controller';
import { asyncHandler } from '../middlewares/async.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';

/**
 * @swagger
 * components:
 *   schemas:
 *     UploadResponse:
 *       type: object
 *       properties:
 *         url:
 *           type: string
 *           description: URL of the uploaded file
 *         filename:
 *           type: string
 *           description: Name of the uploaded file
 *         originalName:
 *           type: string
 *           description: Original name of the uploaded file
 *         mimeType:
 *           type: string
 *           description: MIME type of the uploaded file
 *         size:
 *           type: number
 *           description: Size of the uploaded file in bytes
 */

export const createUploadRouter = (): Router => {
  const router = Router();
  const uploadController = new UploadController();
  
  logger.info('Setting up upload routes');

  /**
   * @swagger
   * /api/upload/workspaces/{workspaceId}/upload:
   *   post:
   *     summary: Upload a file
   *     tags: [Upload]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: workspaceId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the workspace
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               file:
   *                 type: string
   *                 format: binary
   *                 description: File to upload
   *     responses:
   *       201:
   *         description: File uploaded successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UploadResponse'
   *       400:
   *         description: Bad request, no file provided
   *       500:
   *         description: Server error
   */
  router.post(
    '/workspaces/:workspaceId/upload',
    authMiddleware,
    uploadMiddleware.single('file'),
    asyncHandler(uploadController.uploadFile)
  );

  /**
   * @swagger
   * /api/upload/uploads/{workspaceId}/{filename}:
   *   get:
   *     summary: Get an uploaded file
   *     tags: [Upload]
   *     parameters:
   *       - in: path
   *         name: workspaceId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the workspace
   *       - in: path
   *         name: filename
   *         schema:
   *           type: string
   *         required: true
   *         description: Name of the file to retrieve
   *     responses:
   *       200:
   *         description: File content
   *         content:
   *           application/octet-stream:
   *             schema:
   *               type: string
   *               format: binary
   *       404:
   *         description: File not found
   *       500:
   *         description: Server error
   */
  router.get(
    '/uploads/:workspaceId/:filename',
    asyncHandler(uploadController.serveFile)
  );

  /**
   * @swagger
   * /api/upload/workspaces/{workspaceId}/upload/{filename}:
   *   delete:
   *     summary: Delete an uploaded file
   *     tags: [Upload]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: workspaceId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the workspace
   *       - in: path
   *         name: filename
   *         schema:
   *           type: string
   *         required: true
   *         description: Name of the file to delete
   *     responses:
   *       204:
   *         description: File deleted successfully
   *       404:
   *         description: File not found
   *       500:
   *         description: Server error
   */
  router.delete(
    '/workspaces/:workspaceId/upload/:filename',
    authMiddleware,
    asyncHandler(uploadController.deleteFile)
  );

  logger.info('Upload routes setup complete');
  return router;
}; 