import { Router } from 'express';
import { documentController, upload } from '../controllers/documentController';

const router = Router({ mergeParams: true });

/**
 * @swagger
 * components:
 *   schemas:
 *     Document:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Document unique identifier
 *         filename:
 *           type: string
 *           description: Generated filename on server
 *         originalName:
 *           type: string
 *           description: Original filename from upload
 *         filePath:
 *           type: string
 *           description: File path on server
 *         fileSize:
 *           type: integer
 *           description: File size in bytes
 *         mimeType:
 *           type: string
 *           description: MIME type of the file
 *         status:
 *           type: string
 *           enum: [UPLOADED, PROCESSING, PROCESSED, ERROR]
 *           description: Document processing status
 *         workspaceId:
 *           type: string
 *           description: Workspace identifier
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     
 *     DocumentSearchResult:
 *       type: object
 *       properties:
 *         documentId:
 *           type: string
 *           description: Document identifier
 *         chunkId:
 *           type: string
 *           description: Document chunk identifier
 *         content:
 *           type: string
 *           description: Chunk content
 *         similarity:
 *           type: number
 *           description: Similarity score (0-1)
 *         documentName:
 *           type: string
 *           description: Original document name
 */

/**
 * @swagger
 * /api/documents/upload:
 *   post:
 *     summary: Upload a PDF document
 *     tags: [Documents]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         required: true
 *         description: PDF file to upload
 *       - in: formData
 *         name: workspaceId
 *         type: string
 *         required: true
 *         description: Workspace identifier
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Document'
 *       400:
 *         description: Bad request - missing file or workspaceId
 *       500:
 *         description: Internal server error
 */
router.post('/upload', upload.single('file'), documentController.uploadDocument.bind(documentController));

/**
 * @swagger
 * /api/documents/{id}/process:
 *   post:
 *     summary: Process document (extract text and generate embeddings)
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     documentId:
 *                       type: string
 *                     status:
 *                       type: string
 *       400:
 *         description: Bad request - missing document ID
 *       500:
 *         description: Internal server error
 */
router.post('/:id/process', documentController.processDocument.bind(documentController));

/**
 * @swagger
 * /api/workspaces/{workspaceId}/documents:
 *   get:
 *     summary: Get all documents for a workspace (from URL params)
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace identifier
 *     responses:
 *       200:
 *         description: Documents retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Document'
 *       400:
 *         description: Bad request - missing workspaceId
 *       500:
 *         description: Internal server error
 */
router.get('/', documentController.getDocumentsByWorkspace.bind(documentController));

/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: Get all documents for a workspace (legacy - from query params)
 *     tags: [Documents]
 *     parameters:
 *       - in: query
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace identifier
 *     responses:
 *       200:
 *         description: Documents retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Document'
 *       400:
 *         description: Bad request - missing workspaceId
 *       500:
 *         description: Internal server error
 */
router.get('/legacy', documentController.getDocuments.bind(documentController));

/**
 * @swagger
 * /api/documents/search:
 *   post:
 *     summary: Search documents using semantic similarity
 *     tags: [Documents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *               - workspaceId
 *             properties:
 *               query:
 *                 type: string
 *                 description: Search query text
 *               workspaceId:
 *                 type: string
 *                 description: Workspace identifier
 *               limit:
 *                 type: integer
 *                 default: 5
 *                 description: Maximum number of results
 *     responses:
 *       200:
 *         description: Search completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     query:
 *                       type: string
 *                     results:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DocumentSearchResult'
 *                     totalResults:
 *                       type: integer
 *       400:
 *         description: Bad request - missing query or workspaceId
 *       500:
 *         description: Internal server error
 */
router.post('/search', documentController.searchDocuments.bind(documentController));

// Test endpoint for debugging
router.post('/test-embedding', (req, res) => {
  console.log('Test endpoint called!');
  console.log('req.params:', req.params);
  res.json({ success: true, message: 'Test endpoint works', params: req.params });
});

/**
 * @swagger
 * /api/workspaces/{workspaceId}/documents/generate-embeddings:
 *   post:
 *     summary: Generate embeddings for all active documents in a workspace
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace identifier
 *     responses:
 *       200:
 *         description: Embedding generation completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     workspaceId:
 *                       type: string
 *                     processed:
 *                       type: integer
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: string
 *                     hasErrors:
 *                       type: boolean
 *       400:
 *         description: Bad request - missing workspace ID
 *       500:
 *         description: Internal server error
 */
router.post('/generate-embeddings', documentController.generateEmbeddings.bind(documentController));

/**
 * @swagger
 * /api/documents/{id}:
 *   get:
 *     summary: Get document details by ID
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document details retrieved successfully
 *       404:
 *         description: Document not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete a document
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     documentId:
 *                       type: string
 *       400:
 *         description: Bad request - missing document ID
 *       404:
 *         description: Document not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', documentController.getDocumentById.bind(documentController));
router.delete('/:id', documentController.deleteDocument.bind(documentController));

/**
 * @swagger
 * /api/documents/{id}/download:
 *   get:
 *     summary: Download document file
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document file downloaded successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Document not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/download', documentController.downloadDocument.bind(documentController));

/**
 * @swagger
 * /api/documents/{id}:
 *   put:
 *     summary: Update document metadata
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - originalName
 *             properties:
 *               originalName:
 *                 type: string
 *                 description: New document name
 *     responses:
 *       200:
 *         description: Document updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Document'
 *       400:
 *         description: Bad request - missing document ID or name
 *       404:
 *         description: Document not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', documentController.updateDocument.bind(documentController));

export default router; 