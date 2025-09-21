import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { NotificationService } from '../services/notificationService';

interface MockDocument {
  id: string;
  applicationId: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  description?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export class MockDocumentController {
  private static documents: MockDocument[] = [];

  static async uploadDocument(req: AuthRequest, res: Response) {
    try {
      const { applicationId } = req.params;
      const user = req.user!;
      const { description } = req.body;

      // Mock file data since we don't have actual file upload in dev mode
      const mockFile = {
        originalname: 'document-example.pdf',
        mimetype: 'application/pdf',
        size: 1024 * 1024, // 1MB
        filename: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.pdf`
      };

      const document: MockDocument = {
        id: Math.random().toString(36).substr(2, 9),
        applicationId,
        filename: mockFile.filename,
        originalName: mockFile.originalname,
        mimetype: mockFile.mimetype,
        size: mockFile.size,
        path: `/uploads/documents/${applicationId}/${mockFile.filename}`,
        description,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user.id
      };

      this.documents.push(document);

      // Create notification for the recipient
      // Determine recipient - if uploader is company, notify organization and vice versa
      let recipientId: string | null = null;

      if (user.role === 'COMPANY') {
        // Find organization user for this application
        recipientId = 'organization-1'; // Mock organization user
      } else if (user.role === 'ORGANIZATION') {
        // Find company user for this application
        recipientId = 'company-1'; // Mock company user
      }

      if (recipientId && recipientId !== user.id) {
        try {
          await NotificationService.createDocumentNotification(
            recipientId,
            user.email,
            document.originalName,
            applicationId,
            document.id
          );
        } catch (notifError) {
          console.error('Erreur lors de la création de la notification:', notifError);
        }
      }

      res.status(201).json({
        success: true,
        data: document,
        message: 'Document uploadé avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de l\'upload du document:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur'
      });
    }
  }

  static async getApplicationDocuments(req: AuthRequest, res: Response) {
    try {
      const { applicationId } = req.params;
      const user = req.user!;

      const documents = this.documents
        .filter(doc => doc.applicationId === applicationId)
        .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

      res.json({
        success: true,
        data: documents
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des documents:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur'
      });
    }
  }

  static async downloadDocument(req: AuthRequest, res: Response) {
    try {
      const { documentId } = req.params;
      const user = req.user!;

      const document = this.documents.find(doc => doc.id === documentId);
      if (!document) {
        return res.status(404).json({
          success: false,
          error: 'Document non trouvé'
        });
      }

      // In a real implementation, this would send the actual file
      // For mock mode, we'll return a success response
      res.json({
        success: true,
        data: {
          message: 'Téléchargement simulé en mode développement',
          document: {
            name: document.originalName,
            size: document.size,
            mimetype: document.mimetype
          }
        }
      });
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur'
      });
    }
  }

  static async deleteDocument(req: AuthRequest, res: Response) {
    try {
      const { documentId } = req.params;
      const user = req.user!;

      const documentIndex = this.documents.findIndex(doc => doc.id === documentId);
      if (documentIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Document non trouvé'
        });
      }

      const document = this.documents[documentIndex];

      // Check permissions - only uploader or admin can delete
      if (document.uploadedBy !== user.id && !['ADMIN', 'SUPERADMIN'].includes(user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Accès refusé'
        });
      }

      this.documents.splice(documentIndex, 1);

      res.json({
        success: true,
        message: 'Document supprimé avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur'
      });
    }
  }

  static async updateDocument(req: AuthRequest, res: Response) {
    try {
      const { documentId } = req.params;
      const { description } = req.body;
      const user = req.user!;

      const documentIndex = this.documents.findIndex(doc => doc.id === documentId);
      if (documentIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Document non trouvé'
        });
      }

      const document = this.documents[documentIndex];

      // Check permissions - only uploader can update
      if (document.uploadedBy !== user.id && !['ADMIN', 'SUPERADMIN'].includes(user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Accès refusé'
        });
      }

      this.documents[documentIndex] = {
        ...document,
        description
      };

      res.json({
        success: true,
        data: this.documents[documentIndex],
        message: 'Document mis à jour avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur'
      });
    }
  }

  // Helper method to get all documents for testing
  static async getAllDocuments(req: any, res: Response): Promise<void> {
    try {
      res.json({
        success: true,
        data: this.documents,
        message: 'Liste de tous les documents (mode développement)'
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de tous les documents:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur'
      });
    }
  }
}