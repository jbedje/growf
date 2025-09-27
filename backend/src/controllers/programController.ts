import { Request, Response } from 'express';
import { PrismaClient, ProgramStatus, UserRole } from '@prisma/client';
import { AuthRequest } from '../middleware/authorization';

const prisma = new PrismaClient();

export class ProgramController {
  // Routes publiques - pour les entreprises qui consultent les programmes
  static async getPublicPrograms(req: Request, res: Response) {
    try {
      const { sector, search, location, page = 1, limit = 10 } = req.query;

      const where: any = {
        status: ProgramStatus.PUBLISHED,
        deadline: {
          gte: new Date() // Seulement les programmes non expirés
        }
      };

      // Filtres
      if (sector) {
        where.sector = { has: sector as string };
      }

      if (search) {
        where.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      if (location) {
        where.location = { has: location as string };
      }

      const programs = await prisma.program.findMany({
        where,
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              type: true
            }
          },
          _count: {
            select: {
              applications: true
            }
          }
        },
        orderBy: { deadline: 'asc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      });

      const total = await prisma.program.count({ where });

      res.json({
        success: true,
        data: {
          programs,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des programmes publics:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des programmes'
      });
    }
  }

  static async getPublicProgramById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID du programme requis'
        });
        return;
      }

      const program = await prisma.program.findFirst({
        where: {
          id,
          status: ProgramStatus.PUBLISHED,
          deadline: {
            gte: new Date()
          }
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              type: true,
              description: true,
              website: true
            }
          }
        }
      });

      if (!program) {
        res.status(404).json({
          success: false,
          message: 'Programme non trouvé ou non disponible'
        });
        return;
      }

      res.json({
        success: true,
        data: program
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du programme:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du programme'
      });
    }
  }

  // Routes pour les organisations et admins
  static async getPrograms(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status, sector, search, page = 1, limit = 10 } = req.query;
      const user = req.user!;

      const where: any = {};

      // Si l'utilisateur est une organisation, ne voir que ses programmes
      if (user.role === UserRole.ORGANIZATION) {
        const organization = await prisma.organization.findUnique({
          where: { userId: user.id }
        });

        if (!organization) {
          res.status(404).json({
            success: false,
            message: 'Organisation non trouvée'
          });
        return;
      }

        where.organizationId = organization.id;
      }

      // Filtres
      if (status) {
        where.status = status as ProgramStatus;
      }

      if (sector) {
        where.sector = { has: sector as string };
      }

      if (search) {
        where.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      const programs = await prisma.program.findMany({
        where,
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              type: true
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

      const total = await prisma.program.count({ where });

      res.json({
        success: true,
        data: {
          programs,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des programmes:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des programmes'
      });
    }
  }

  static async createProgram(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const programData = req.body;

      let organizationId: string;

      if (user.role === UserRole.ORGANIZATION) {
        const organization = await prisma.organization.findUnique({
          where: { userId: user.id }
        });

        if (!organization) {
          res.status(404).json({
            success: false,
            message: 'Organisation non trouvée'
          });
        return;
      }

        organizationId = organization.id;
      } else {
        // Pour les admins et superadmins, l'organizationId doit être fourni
        organizationId = programData.organizationId;
        if (!organizationId) {
          res.status(400).json({
            success: false,
            message: 'ID de l\'organisation requis'
          });
        return;
      }
      }

      const program = await prisma.program.create({
        data: {
          ...programData,
          organizationId,
          status: ProgramStatus.DRAFT
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              type: true
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        data: program
      });
    } catch (error) {
      console.error('Erreur lors de la création du programme:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création du programme'
      });
    }
  }

  static async getProgramById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user!;

      const where: any = { id };

      // Si l'utilisateur est une organisation, vérifier qu'il peut voir ce programme
      if (user.role === UserRole.ORGANIZATION) {
        const organization = await prisma.organization.findUnique({
          where: { userId: user.id }
        });

        if (!organization) {
          res.status(404).json({
            success: false,
            message: 'Organisation non trouvée'
          });
        return;
      }

        where.organizationId = organization.id;
      }

      const program = await prisma.program.findUnique({
        where,
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              type: true
            }
          },
          _count: {
            select: {
              applications: true
            }
          }
        }
      });

      if (!program) {
        res.status(404).json({
          success: false,
          message: 'Programme non trouvé'
        });
      }

      res.json({
        success: true,
        data: program
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du programme:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération du programme'
      });
    }
  }

  static async updateProgram(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user!;
      const updateData = req.body;

      const where: any = { id };

      // Si l'utilisateur est une organisation, vérifier qu'il peut modifier ce programme
      if (user.role === UserRole.ORGANIZATION) {
        const organization = await prisma.organization.findUnique({
          where: { userId: user.id }
        });

        if (!organization) {
          res.status(404).json({
            success: false,
            message: 'Organisation non trouvée'
          });
        return;
      }

        where.organizationId = organization.id;
      }

      const program = await prisma.program.update({
        where,
        data: updateData,
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              type: true
            }
          }
        }
      });

      res.json({
        success: true,
        data: program
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du programme:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du programme'
      });
    }
  }

  static async deleteProgram(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user!;

      const where: any = { id };

      // Si l'utilisateur est une organisation, vérifier qu'il peut supprimer ce programme
      if (user.role === UserRole.ORGANIZATION) {
        const organization = await prisma.organization.findUnique({
          where: { userId: user.id }
        });

        if (!organization) {
          res.status(404).json({
            success: false,
            message: 'Organisation non trouvée'
          });
        return;
      }

        where.organizationId = organization.id;
      }

      await prisma.program.delete({ where });

      res.json({
        success: true,
        message: 'Programme supprimé avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du programme:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression du programme'
      });
    }
  }

  static async updateProgramStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const user = req.user!;

      const where: any = { id };

      // Si l'utilisateur est une organisation, vérifier qu'il peut modifier ce programme
      if (user.role === UserRole.ORGANIZATION) {
        const organization = await prisma.organization.findUnique({
          where: { userId: user.id }
        });

        if (!organization) {
          res.status(404).json({
            success: false,
            message: 'Organisation non trouvée'
          });
        return;
      }

        where.organizationId = organization.id;
      }

      const program = await prisma.program.update({
        where,
        data: { status },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              type: true
            }
          }
        }
      });

      res.json({
        success: true,
        data: program
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du statut'
      });
    }
  }

  static async duplicateProgram(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user!;

      const where: any = { id };

      // Si l'utilisateur est une organisation, vérifier qu'il peut dupliquer ce programme
      if (user.role === UserRole.ORGANIZATION) {
        const organization = await prisma.organization.findUnique({
          where: { userId: user.id }
        });

        if (!organization) {
          res.status(404).json({
            success: false,
            message: 'Organisation non trouvée'
          });
        return;
      }

        where.organizationId = organization.id;
      }

      const originalProgram = await prisma.program.findUnique({ where });

      if (!originalProgram) {
        res.status(404).json({
          success: false,
          message: 'Programme non trouvé'
        });
      }

      const { id: _, createdAt, updatedAt, ...programData } = originalProgram!;

      const duplicatedProgram = await prisma.program.create({
        data: {
          title: `${programData.title} (Copie)`,
          description: programData.description,
          sector: programData.sector,
          location: programData.location,
          organizationId: programData.organizationId,
          amountMin: programData.amountMin,
          amountMax: programData.amountMax,
          deadline: programData.deadline,
          requirements: programData.requirements as any,
          criteria: programData.criteria as any,
          applicationForm: programData.applicationForm as any,
          status: ProgramStatus.DRAFT
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              type: true
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        data: duplicatedProgram
      });
    } catch (error) {
      console.error('Erreur lors de la duplication du programme:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la duplication du programme'
      });
    }
  }

  static async getProgramStatistics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user!;

      const where: any = { id };

      // Si l'utilisateur est une organisation, vérifier qu'il peut voir ces statistiques
      if (user.role === UserRole.ORGANIZATION) {
        const organization = await prisma.organization.findUnique({
          where: { userId: user.id }
        });

        if (!organization) {
          res.status(404).json({
            success: false,
            message: 'Organisation non trouvée'
          });
        return;
      }

        where.organizationId = organization.id;
      }

      const program = await prisma.program.findUnique({
        where,
        include: {
          _count: {
            select: {
              applications: true
            }
          }
        }
      });

      if (!program) {
        res.status(404).json({
          success: false,
          message: 'Programme non trouvé'
        });
      }

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID du programme requis'
        });
        return;
      }

      // Statistiques des candidatures
      const applicationStats = await prisma.application.groupBy({
        by: ['status'],
        where: { programId: id },
        _count: true
      });

      const stats = {
        totalApplications: program!._count?.applications || 0,
        applicationsByStatus: applicationStats.reduce((acc, stat) => {
          acc[stat.status] = stat._count || 0;
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
}