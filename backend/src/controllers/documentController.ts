import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { documentService } from '../services/documentService';
import multer = require('multer');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documents/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Only allow PDF files
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

export class DocumentController {
  /**
   * Upload a new document
   * POST /api/documents/upload
   */
  async uploadDocument(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const { workspaceId } = req.body;
      
      if (!workspaceId) {
        return res.status(400).json({
          success: false,
          message: 'Workspace ID is required'
        });
      }

      // Create document record in database
      const document = await documentService.createDocument({
        filename: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        workspaceId: workspaceId
      });
      // Fire-and-forget: trigger embedding regeneration for documents
      require('../services/embeddingService').embeddingService.generateDocumentEmbeddings(workspaceId).catch((err) => console.error('Embedding generation error (create):', err));

      res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        data: {
          id: document.id,
          filename: document.filename,
          originalName: document.originalName,
          fileSize: document.fileSize,
          status: document.status,
          createdAt: document.createdAt
        }
      });

    } catch (error) {
      console.error('Error uploading document:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload document',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Process document (extract text and generate embeddings)
   * POST /api/documents/:id/process
   */
  async processDocument(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Document ID is required'
        });
      }

      // Start processing (this is synchronous as per requirements)
      await documentService.processDocument(id);

      res.status(200).json({
        success: true,
        message: 'Document processed successfully',
        data: {
          documentId: id,
          status: 'PROCESSED'
        }
      });

    } catch (error) {
      console.error('Error processing document:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process document',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get all documents for a workspace (from URL params)
   * GET /api/workspaces/:workspaceId/documents
   */
  async getDocumentsByWorkspace(req: Request, res: Response) {
    try {
      console.log('=== DEBUGGING getDocumentsByWorkspace ===');
      console.log('req.params:', req.params);
      console.log('req.originalUrl:', req.originalUrl);
      
      const { workspaceId } = req.params;

      if (!workspaceId) {
        console.log('ERROR: workspaceId is missing from req.params');
        return res.status(400).json({
          success: false,
          message: 'Workspace ID is required'
        });
      }

      console.log(`Getting documents for workspace: ${workspaceId}`);
      
      const documents = await documentService.getDocuments(workspaceId);

      res.status(200).json({
        success: true,
        message: 'Documents retrieved successfully',
        data: documents
      });

    } catch (error) {
      console.error('Error getting documents by workspace:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get documents',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get all documents for a workspace (legacy - from query params)
   * GET /api/documents?workspaceId=xxx
   */
  async getDocuments(req: Request, res: Response) {
    try {
      const { workspaceId } = req.query;

      if (!workspaceId || typeof workspaceId !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Workspace ID is required'
        });
      }

      const documents = await documentService.getDocuments(workspaceId);

      res.status(200).json({
        success: true,
        message: 'Documents retrieved successfully',
        data: documents
      });

    } catch (error) {
      console.error('Error getting documents:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get documents',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Search documents using semantic similarity
   * POST /api/documents/search
   */
  async searchDocuments(req: Request, res: Response) {
    try {
      const { query, workspaceId, limit = 5 } = req.body;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      if (!workspaceId || typeof workspaceId !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Workspace ID is required'
        });
      }

      const results = await documentService.searchDocuments(query, workspaceId, limit);

      res.status(200).json({
        success: true,
        message: 'Document search completed successfully',
        data: {
          query: query,
          results: results,
          totalResults: results.length
        }
      });

    } catch (error) {
      console.error('Error searching documents:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search documents',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Delete a document
   * DELETE /api/documents/:id
   */
  async deleteDocument(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Document ID is required'
        });
      }

      await documentService.deleteDocument(id);
      // Fire-and-forget: trigger embedding regeneration for documents
      const deletedDoc = await documentService.getDocumentById(id); // Might be null after delete
      const workspaceIdForDelete = deletedDoc ? deletedDoc.workspaceId : req.body.workspaceId || req.query.workspaceId;
      if (workspaceIdForDelete) {
        require('../services/embeddingService').embeddingService.generateDocumentEmbeddings(workspaceIdForDelete).catch((err) => console.error('Embedding generation error (delete):', err));
      }

      res.status(200).json({
        success: true,
        message: 'Document deleted successfully',
        data: {
          documentId: id
        }
      });

    } catch (error) {
      console.error('Error deleting document:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete document',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get document details by ID
   * GET /api/documents/:id
   */
  async getDocumentById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Document ID is required'
        });
      }

      const document = await documentService.getDocumentById(id);

      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Document retrieved successfully',
        data: document
      });

    } catch (error) {
      console.error('Error getting document by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get document',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Download document file
   * GET /api/documents/:id/download
   */
  async downloadDocument(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Document ID is required'
        });
      }

      const document = await documentService.getDocumentById(id);

      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }

      // Check if file exists
      const path = require('path');
      if (!document.filePath || !require('fs').existsSync(document.filePath)) {
        return res.status(404).json({
          success: false,
          message: 'Document file not found on disk'
        });
      }

      // Set headers for file download
      res.setHeader('Content-Type', document.mimeType || 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
      res.setHeader('Content-Length', document.fileSize.toString());

      // Stream the file
      const fileStream = require('fs').createReadStream(document.filePath);
      fileStream.pipe(res);

    } catch (error) {
      console.error('Error downloading document:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to download document',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update document metadata
   * PUT /api/documents/:id
   */
  async updateDocument(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { originalName, isActive } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Document ID is required'
        });
      }

      // Build update data object
      const updateData: any = {};
      if (originalName !== undefined) {
        if (typeof originalName !== 'string') {
          return res.status(400).json({
            success: false,
            message: 'Document name must be a string'
          });
        }
        updateData.originalName = originalName;
      }
      
      if (isActive !== undefined) {
        if (typeof isActive !== 'boolean') {
          return res.status(400).json({
            success: false,
            message: 'isActive must be a boolean'
          });
        }
        updateData.isActive = isActive;
      }

      // Check if at least one field is provided
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one field (originalName or isActive) is required'
        });
      }

      const updatedDocument = await documentService.updateDocument(id, updateData);
      // Fire-and-forget: trigger embedding regeneration for documents
      const workspaceIdForUpdate = updatedDocument?.workspaceId || req.body.workspaceId || req.query.workspaceId;
      if (workspaceIdForUpdate) {
        require('../services/embeddingService').embeddingService.generateDocumentEmbeddings(workspaceIdForUpdate).catch((err) => console.error('Embedding generation error (update):', err));
      }

      res.status(200).json({
        success: true,
        message: 'Document updated successfully',
        data: updatedDocument
      });

    } catch (error) {
      console.error('Error updating document:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update document',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Generate embeddings for all active documents in a workspace
   * POST /api/workspaces/:workspaceId/documents/generate-embeddings
   */
  async generateEmbeddings(req: Request, res: Response) {
    try {
      console.log('=== DEBUGGING generateEmbeddings ===');
      console.log('req.params:', req.params);
      console.log('req.originalUrl:', req.originalUrl);
      console.log('req.url:', req.url);
      console.log('req.baseUrl:', req.baseUrl);
      
      const { workspaceId } = req.params;

      if (!workspaceId) {
        console.log('ERROR: workspaceId is missing from req.params');
        return res.status(400).json({
          success: false,
          message: 'Workspace ID is required'
        });
      }

      console.log(`Starting embedding generation for workspace: ${workspaceId}`);
      
      const result = await documentService.generateEmbeddingsForActiveDocuments(workspaceId);

      res.status(200).json({
        success: true,
        message: 'Embedding generation completed',
        data: {
          workspaceId: workspaceId,
          processed: result.processed,
          errors: result.errors,
          hasErrors: result.errors.length > 0
        }
      });

    } catch (error) {
      console.error('Error generating embeddings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate embeddings',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const documentController = new DocumentController(); 