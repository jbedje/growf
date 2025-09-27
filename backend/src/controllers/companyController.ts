import { Request, Response } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { AuthRequest } from '../middleware/authorization';

const prisma = new PrismaClient();

export class CompanyController {
  static async getAllCompanies(req: Request, res: Response): Promise<void> {
    try {
      const { search, sector, size, location, page = 1, limit = 10 } = req.query;

      const where: any = {};

      // Filtres
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      if (sector) {
        where.sector = sector as string;
      }

      if (size) {
        where.size = size;
      }

      if (location) {
        where.location = { contains: location as string, mode: 'insensitive' };
      }

      const companies = await prisma.company.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              isActive: true,
              isVerified: true,
              createdAt: true
            }
          },
          _count: {
            select: {
              applications: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      });

      const total = await prisma.company.count({ where });

      res.json({
        success: true,
        data: {
          companies,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des entreprises:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des entreprises'
      });
    }
  }

  static async getCompanyById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user!;

      // Si l'utilisateur est une entreprise, vérifier qu'il peut voir cette entreprise
      if (user.role === UserRole.COMPANY) {
        const userCompany = await prisma.company.findUnique({
          where: { userId: user.id }
        });

        if (!userCompany || userCompany.id !== id) {
          res.status(403).json({
            success: false,
            message: 'Accès refusé'
          });
          return;
        }
      }

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID de l\'entreprise requis'
        });
        return;
      }

      const company = await prisma.company.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              isActive: true,
              isVerified: true,
              createdAt: true
            }
          },
          _count: {
            select: {
              applications: true,
              documents: true
            }
          }
        }
      });

      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Entreprise non trouvée'
        });
      }

      res.json({
        success: true,
        data: company
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'entreprise:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de l\'entreprise'
      });
    }
  }

  static async updateCompany(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user!;
      const updateData = req.body;

      // Si l'utilisateur est une entreprise, vérifier qu'il peut modifier cette entreprise
      if (user.role === UserRole.COMPANY) {
        const userCompany = await prisma.company.findUnique({
          where: { userId: user.id }
        });

        if (!userCompany || userCompany.id !== id) {
          res.status(403).json({
            success: false,
            message: 'Accès refusé'
          });
          return;
        }
      }

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID de l\'entreprise requis'
        });
        return;
      }

      const company = await prisma.company.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              isActive: true,
              isVerified: true
            }
          }
        }
      });

      res.json({
        success: true,
        data: company
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'entreprise:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour de l\'entreprise'
      });
    }
  }

  static async deleteCompany(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID de l\'entreprise requis'
        });
        return;
      }

      // Supprimer l'entreprise et l'utilisateur associé
      await prisma.$transaction(async (tx) => {
        const company = await tx.company.findUnique({
          where: { id },
          include: { user: true }
        });

        if (!company) {
          throw new Error('Entreprise non trouvée');
        }

        await tx.company.delete({ where: { id } });
        await tx.user.delete({ where: { id: company.userId } });
      });

      res.json({
        success: true,
        message: 'Entreprise supprimée avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'entreprise:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression de l\'entreprise'
      });
    }
  }

  static async getMyCompany(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;

      const company = await prisma.company.findUnique({
        where: { userId: user.id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              isActive: true,
              isVerified: true,
              createdAt: true
            }
          },
          _count: {
            select: {
              applications: true,
              documents: true
            }
          }
        }
      });

      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Entreprise non trouvée'
        });
      }

      res.json({
        success: true,
        data: company
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du profil'
      });
    }
  }

  static async updateMyCompany(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const updateData = req.body;

      const company = await prisma.company.update({
        where: { userId: user.id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              isActive: true,
              isVerified: true
            }
          }
        }
      });

      res.json({
        success: true,
        data: company
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du profil'
      });
    }
  }

  static async getCompanyStatistics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user!;

      // Si l'utilisateur est une entreprise, vérifier qu'il peut voir ces statistiques
      if (user.role === UserRole.COMPANY) {
        const userCompany = await prisma.company.findUnique({
          where: { userId: user.id }
        });

        if (!userCompany || userCompany.id !== id) {
          res.status(403).json({
            success: false,
            message: 'Accès refusé'
          });
          return;
        }
      }

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID de l\'entreprise requis'
        });
        return;
      }

      const company = await prisma.company.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              applications: true,
              documents: true
            }
          }
        }
      });

      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Entreprise non trouvée'
        });
      }

      // Statistiques des candidatures
      const applicationStats = await prisma.application.groupBy({
        by: ['status'],
        where: { companyId: id },
        _count: true
      });

      const stats = {
        totalApplications: company!._count?.applications || 0,
        totalDocuments: company!._count?.documents || 0,
        applicationsByStatus: applicationStats.reduce((acc, stat) => {
          acc[stat.status] = stat._count;
          return acc;
        }, {} as Record<string, number>)
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques'
      });
    }
  }

  static async getCompaniesStatistics(req: Request, res: Response): Promise<void> {
    try {
      const totalCompanies = await prisma.company.count();

      const companiesBySize = await prisma.company.groupBy({
        by: ['size'],
        _count: true
      });

      const companiesBySector = await prisma.company.groupBy({
        by: ['sector'],
        _count: true
      });

      const recentCompanies = await prisma.company.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 derniers jours
          }
        }
      });

      const stats = {
        totalCompanies,
        recentCompanies,
        companiesBySize: companiesBySize.reduce((acc, stat) => {
          acc[stat.size] = stat._count;
          return acc;
        }, {} as Record<string, number>),
        companiesBySector: companiesBySector.reduce((acc, stat) => {
          acc[stat.sector] = stat._count;
          return acc;
        }, {} as Record<string, number>)
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques globales:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques globales'
      });
    }
  }
}