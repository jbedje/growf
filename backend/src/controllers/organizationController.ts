import { Request, Response } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { AuthRequest } from '../middleware/authorization';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export class OrganizationController {
  static async getAllOrganizations(req: Request, res: Response) {
    try {
      const { search, type, page = 1, limit = 10 } = req.query;

      const where: any = {};

      // Filtres
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      if (type) {
        where.type = type as string;
      }

      const organizations = await prisma.organization.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              isActive: true,
              createdAt: true
            }
          },
          _count: {
            select: {
              programs: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      });

      const total = await prisma.organization.count({ where });

      res.json({
        success: true,
        data: {
          organizations,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des organisations:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des organisations'
      });
    }
  }

  static async createOrganization(req: Request, res: Response) {
    try {
      const {
        email,
        password,
        name,
        type,
        description,
        website,
        phone,
        address,
        contactInfo
      } = req.body;

      // Vérifier si l'email existe déjà
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Un utilisateur avec cet email existe déjà'
        });
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 12);

      // Créer l'utilisateur et l'organisation
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            role: UserRole.ORGANIZATION,
            isVerified: true // Les organisations créées par les superadmins sont automatiquement vérifiées
          }
        });

        const organization = await tx.organization.create({
          data: {
            userId: user.id,
            name,
            type,
            description,
            website,
            phone,
            address,
            contactInfo
          }
        });

        return { user, organization };
      });

      res.status(201).json({
        success: true,
        data: {
          id: result.organization.id,
          name: result.organization.name,
          type: result.organization.type,
          email: result.user.email,
          isActive: result.user.isActive
        }
      });
    } catch (error) {
      console.error('Erreur lors de la création de l\'organisation:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création de l\'organisation'
      });
    }
  }

  static async getOrganizationById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user!;

      // Si l'utilisateur est une organisation, vérifier qu'il peut voir cette organisation
      let where: any = { id };
      if (user.role === UserRole.ORGANIZATION) {
        const userOrganization = await prisma.organization.findUnique({
          where: { userId: user.id }
        });

        if (!userOrganization || userOrganization.id !== id) {
          return res.status(403).json({
            success: false,
            message: 'Accès refusé'
          });
        }
      }

      const organization = await prisma.organization.findUnique({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              isActive: true,
              createdAt: true
            }
          },
          _count: {
            select: {
              programs: true
            }
          }
        }
      });

      if (!organization) {
        return res.status(404).json({
          success: false,
          message: 'Organisation non trouvée'
        });
      }

      res.json({
        success: true,
        data: organization
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'organisation:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de l\'organisation'
      });
    }
  }

  static async updateOrganization(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user!;
      const updateData = req.body;

      // Si l'utilisateur est une organisation, vérifier qu'il peut modifier cette organisation
      if (user.role === UserRole.ORGANIZATION) {
        const userOrganization = await prisma.organization.findUnique({
          where: { userId: user.id }
        });

        if (!userOrganization || userOrganization.id !== id) {
          return res.status(403).json({
            success: false,
            message: 'Accès refusé'
          });
        }
      }

      const organization = await prisma.organization.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              isActive: true
            }
          }
        }
      });

      res.json({
        success: true,
        data: organization
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'organisation:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour de l\'organisation'
      });
    }
  }

  static async deleteOrganization(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Supprimer l'organisation et l'utilisateur associé
      await prisma.$transaction(async (tx) => {
        const organization = await tx.organization.findUnique({
          where: { id },
          include: { user: true }
        });

        if (!organization) {
          throw new Error('Organisation non trouvée');
        }

        await tx.organization.delete({ where: { id } });
        await tx.user.delete({ where: { id: organization.userId } });
      });

      res.json({
        success: true,
        message: 'Organisation supprimée avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'organisation:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression de l\'organisation'
      });
    }
  }

  static async getMyOrganization(req: AuthRequest, res: Response) {
    try {
      const user = req.user!;

      const organization = await prisma.organization.findUnique({
        where: { userId: user.id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              isActive: true,
              createdAt: true
            }
          },
          _count: {
            select: {
              programs: true
            }
          }
        }
      });

      if (!organization) {
        return res.status(404).json({
          success: false,
          message: 'Organisation non trouvée'
        });
      }

      res.json({
        success: true,
        data: organization
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du profil'
      });
    }
  }

  static async updateMyOrganization(req: AuthRequest, res: Response) {
    try {
      const user = req.user!;
      const updateData = req.body;

      const organization = await prisma.organization.update({
        where: { userId: user.id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              isActive: true
            }
          }
        }
      });

      res.json({
        success: true,
        data: organization
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du profil'
      });
    }
  }

  static async getOrganizationStatistics(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user!;

      // Si l'utilisateur est une organisation, vérifier qu'il peut voir ces statistiques
      if (user.role === UserRole.ORGANIZATION) {
        const userOrganization = await prisma.organization.findUnique({
          where: { userId: user.id }
        });

        if (!userOrganization || userOrganization.id !== id) {
          return res.status(403).json({
            success: false,
            message: 'Accès refusé'
          });
        }
      }

      const organization = await prisma.organization.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              programs: true
            }
          }
        }
      });

      if (!organization) {
        return res.status(404).json({
          success: false,
          message: 'Organisation non trouvée'
        });
      }

      // Statistiques des programmes
      const programStats = await prisma.program.groupBy({
        by: ['status'],
        where: { organizationId: id },
        _count: true
      });

      // Statistiques des candidatures reçues
      const applicationStats = await prisma.application.count({
        where: {
          program: {
            organizationId: id
          }
        }
      });

      const stats = {
        totalPrograms: organization._count.programs,
        programsByStatus: programStats.reduce((acc, stat) => {
          acc[stat.status] = stat._count;
          return acc;
        }, {} as Record<string, number>),
        totalApplicationsReceived: applicationStats
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
}