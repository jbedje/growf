import { Router } from 'express';
import { MockDocumentController } from '../controllers/mockDocumentController';
// import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all document routes - temporarily disabled
// router.use(authenticateToken);

// Upload document
router.post('/upload/:applicationId', MockDocumentController.uploadDocument);

// Get application documents
router.get('/application/:applicationId', MockDocumentController.getApplicationDocuments);

// Download document
router.get('/download/:documentId', MockDocumentController.downloadDocument);

// Delete document
router.delete('/:documentId', MockDocumentController.deleteDocument);

// Update document
router.patch('/:documentId', MockDocumentController.updateDocument);

// Get all documents (for testing in dev mode)
router.get('/all', MockDocumentController.getAllDocuments);

export default router;