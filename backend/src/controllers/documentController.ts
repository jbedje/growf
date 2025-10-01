import { Response } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { AuthRequest } from '../middleware/authorization';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export class DocumentController {
  static async uploadDocument(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { applicationId } = req.params;
      const user = req.user!;
      const file = req.file;

      if (!applicationId) {
        res.status(400).json({
          success: false,
          message: 'ID de candidature requis'
        });
        return;
      }

      if (!file) {
        res.status(400).json({
          success: false,
          message: 'Aucun fichier fourni'
        });
        return;
      }

      // Vérifier que l'utilisateur peut uploader des documents pour cette candidature
      if (user.role === UserRole.COMPANY) {
        const company = await prisma.company.findUnique({
          where: { userId: user.id }
        });

        if (!company) {
          res.status(404).json({
            success: false,
            message: 'Entreprise non trouvée'
          });
          return;
        }

        const application = await prisma.application.findUnique({
          where: {
            id: applicationId,
            companyId: company.id
          }
        });

        if (!application) {
          res.status(404).json({
            success: false,
            message: 'Candidature non trouvée'
          });
          return;
        }
      } else {
        // Pour les organisations et admins, vérifier l'accès
        const application = await prisma.application.findUnique({
          where: { id: applicationId },
          include: { program: true }
        });

        if (!application) {
          res.status(404).json({
            success: false,
            message: 'Candidature non trouvée'
          });
          return;
        }

        if (user.role === UserRole.ORGANIZATION) {
          const organization = await prisma.organization.findUnique({
            where: { userId: user.id }
          });

          if (!organization || !application.program || application.program.organizationId !== organization.id) {
            res.status(403).json({
              success: false,
              message: 'Accès refusé'
            });
            return;
          }
        }
      }

      // Créer l'enregistrement du document
      const document = await prisma.document.create({
        data: {
          applicationId,
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path
        }
      });

      res.status(201).json({
        success: true,
        data: document
      });
    } catch (error) {
      console.error('Erreur lors de l\'upload du document:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'upload du document'
      });
    }
  }

  static async getApplicationDocuments(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { applicationId } = req.params;
      const user = req.user!;

      // Vérifier l'accès à la candidature
      let hasAccess = false;

      if (user.role === UserRole.COMPANY) {
        const company = await prisma.company.findUnique({
          where: { userId: user.id }
        });

        if (company) {
          const application = await prisma.application.findUnique({
            where: {
              id: applicationId,
              companyId: company.id
            }
          });
          hasAccess = !!application;
        }
      } else {
        const application = await prisma.application.findUnique({
          where: { id: applicationId },
          include: { program: true }
        });

        if (application) {
          if (user.role === UserRole.ORGANIZATION) {
            const organization = await prisma.organization.findUnique({
              where: { userId: user.id }
            });
            hasAccess = organization?.id === application.program.organizationId;
          } else {
            hasAccess = [UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.ANALYST].includes(user.role);
          }
        }
      }

      if (!hasAccess) {
        res.status(403).json({
          success: false,
          message: 'Accès refusé'
        });
        return;
      }

      const documents = await prisma.document.findMany({
        where: { applicationId },
        orderBy: { uploadedAt: 'desc' }
      });

      res.json({
        success: true,
        data: documents
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des documents:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des documents'
      });
    }
  }

  static async downloadDocument(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { documentId } = req.params;
      const user = req.user!;

      const document = await prisma.document.findUnique({
        where: { id: documentId },
        include: {
          application: {
            include: {
              program: true,
              company: true
            }
          }
        }
      });

      if (!document) {
        res.status(404).json({
          success: false,
          message: 'Document non trouvé'
        });
        return;
      }

      // Vérifier l'accès
      let hasAccess = false;

      if (user.role === UserRole.COMPANY) {
        const company = await prisma.company.findUnique({
          where: { userId: user.id }
        });
        hasAccess = company?.id === document.application.companyId;
      } else if (user.role === UserRole.ORGANIZATION) {
        const organization = await prisma.organization.findUnique({
          where: { userId: user.id }
        });
        hasAccess = organization?.id === document.application.program.organizationId;
      } else {
        hasAccess = [UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.ANALYST].includes(user.role);
      }

      if (!hasAccess) {
        res.status(403).json({
          success: false,
          message: 'Accès refusé'
        });
        return;
      }

      // Vérifier que le fichier existe
      if (!fs.existsSync(document.path)) {
        res.status(404).json({
          success: false,
          message: 'Fichier non trouvé sur le serveur'
        });
        return;
      }

      // Définir les headers pour le téléchargement
      res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
      res.setHeader('Content-Type', document.mimetype);

      // Envoyer le fichier
      res.sendFile(path.resolve(document.path));
    } catch (error) {
      console.error('Erreur lors du téléchargement du document:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du téléchargement du document'
      });
    }
  }

  static async deleteDocument(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { documentId } = req.params;
      const user = req.user!;

      const document = await prisma.document.findUnique({
        where: { id: documentId },
        include: {
          application: {
            include: {
              company: true
            }
          }
        }
      });

      if (!document) {
        res.status(404).json({
          success: false,
          message: 'Document non trouvé'
        });
        return;
      }

      // Seule l'entreprise propriétaire peut supprimer ses documents (ou admin/superadmin)
      let canDelete = false;

      if (user.role === UserRole.COMPANY) {
        const company = await prisma.company.findUnique({
          where: { userId: user.id }
        });
        canDelete = company?.id === document.application.companyId;
      } else {
        canDelete = [UserRole.ADMIN, UserRole.SUPERADMIN].includes(user.role);
      }

      if (!canDelete) {
        res.status(403).json({
          success: false,
          message: 'Accès refusé'
        });
        return;
      }

      // Supprimer le fichier physique
      if (fs.existsSync(document.path)) {
        fs.unlinkSync(document.path);
      }

      // Supprimer l'enregistrement
      await prisma.document.delete({
        where: { id: documentId }
      });

      res.json({
        success: true,
        message: 'Document supprimé avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du document:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression du document'
      });
    }
  }

  static async updateDocument(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { documentId } = req.params;
      const { description } = req.body;
      const user = req.user!;

      const document = await prisma.document.findUnique({
        where: { id: documentId },
        include: {
          application: {
            include: {
              company: true
            }
          }
        }
      });

      if (!document) {
        res.status(404).json({
          success: false,
          message: 'Document non trouvé'
        });
        return;
      }

      // Vérifier les permissions
      let canUpdate = false;

      if (user.role === UserRole.COMPANY) {
        const company = await prisma.company.findUnique({
          where: { userId: user.id }
        });
        canUpdate = company?.id === document.application.companyId;
      } else {
        canUpdate = [UserRole.ADMIN, UserRole.SUPERADMIN].includes(user.role);
      }

      if (!canUpdate) {
        res.status(403).json({
          success: false,
          message: 'Accès refusé'
        });
        return;
      }

      const updatedDocument = await prisma.document.update({
        where: { id: documentId },
        data: { description }
      });

      res.json({
        success: true,
        data: updatedDocument
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du document:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du document'
      });
    }
  }
}