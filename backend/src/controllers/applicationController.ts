import { Request, Response } from 'express';
import { PrismaClient, ApplicationStatus, UserRole } from '@prisma/client';
import { AuthRequest } from '../middleware/authorization';

const prisma = new PrismaClient();

export class ApplicationController {
  // Routes pour les entreprises
  static async getMyApplications(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const { status, page = 1, limit = 10 } = req.query;

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

      const where: any = { companyId: company.id };

      if (status) {
        where.status = status as ApplicationStatus;
      }

      const applications = await prisma.application.findMany({
        where,
        include: {
          program: {
            select: {
              id: true,
              title: true,
              description: true,
              deadline: true,
              amountMin: true,
              amountMax: true,
              organization: {
                select: {
                  id: true,
                  name: true,
                  type: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      });

      const total = await prisma.application.count({ where });

      res.json({
        success: true,
        data: {
          applications,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des candidatures:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des candidatures'
      });
    }
  }

  static async createApplication(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const { programId, data } = req.body;

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

      // Vérifier que le programme existe et est ouvert
      const program = await prisma.program.findUnique({
        where: { id: programId }
      });

      if (!program) {
        res.status(404).json({
          success: false,
          message: 'Programme non trouvé'
        });
        return;
      }

      if (program.status !== 'PUBLISHED') {
        res.status(400).json({
          success: false,
          message: 'Ce programme n\'est pas ouvert aux candidatures'
        });
        return;
      }

      if (program.deadline && new Date() > program.deadline) {
        res.status(400).json({
          success: false,
          message: 'La date limite de candidature est dépassée'
        });
        return;
      }

      // Vérifier qu'il n'y a pas déjà une candidature pour ce programme
      const existingApplication = await prisma.application.findUnique({
        where: {
          programId_companyId: {
            programId,
            companyId: company.id
          }
        }
      });

      if (existingApplication) {
        res.status(400).json({
          success: false,
          message: 'Vous avez déjà une candidature pour ce programme'
        });
        return;
      }

      const application = await prisma.application.create({
        data: {
          programId,
          companyId: company.id,
          data,
          status: ApplicationStatus.DRAFT
        },
        include: {
          program: {
            select: {
              id: true,
              title: true,
              organization: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        data: application
      });
    } catch (error) {
      console.error('Erreur lors de la création de la candidature:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création de la candidature'
      });
    }
  }

  static async getApplicationById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user!;

      let application;

      if (user.role === UserRole.COMPANY) {
        const company = await prisma.company.findUnique({
          where: { userId: user.id }
        });

        if (!company) {
          res.status(404).json({
            success: false,
            message: 'Entreprise non trouvée'
          });
        }

        application = await prisma.application.findFirst({
          where: {
            id: id!,
            companyId: company!.id
          },
          include: {
            program: {
              select: {
                id: true,
                title: true,
                description: true,
                deadline: true,
                amountMin: true,
                amountMax: true,
                requirements: true,
                applicationForm: true,
                organization: {
                  select: {
                    id: true,
                    name: true,
                    type: true
                  }
                }
              }
            },
            documents: true,
            messages: {
              include: {
                sender: {
                  select: {
                    id: true,
                    email: true,
                    role: true
                  }
                }
              },
              orderBy: { createdAt: 'asc' }
            }
          }
        });
        return;
      } else {
        // Pour les organisations et admins
        if (!id) {
          res.status(400).json({
            success: false,
            message: 'ID de candidature requis'
          });
          return;
        }

        application = await prisma.application.findUnique({
          where: { id },
          include: {
            program: {
              select: {
                id: true,
                title: true,
                description: true,
                deadline: true,
                amountMin: true,
                amountMax: true,
                requirements: true,
                applicationForm: true,
                organization: {
                  select: {
                    id: true,
                    name: true,
                    type: true
                  }
                }
              }
            },
            company: {
              select: {
                id: true,
                name: true,
                sector: true,
                size: true,
                location: true,
                description: true
              }
            },
            documents: true,
            messages: {
              include: {
                sender: {
                  select: {
                    id: true,
                    email: true,
                    role: true
                  }
                }
              },
              orderBy: { createdAt: 'asc' }
            }
          }
        });

        // Si l'utilisateur est une organisation, vérifier qu'il peut voir cette candidature
        if (user.role === UserRole.ORGANIZATION && application) {
          const organization = await prisma.organization.findUnique({
            where: { userId: user.id }
          });

          if (!organization || (application as any).program?.organization?.id !== organization.id) {
            res.status(403).json({
              success: false,
              message: 'Accès refusé'
            });
          }
        }
      }

      if (!application) {
        res.status(404).json({
          success: false,
          message: 'Candidature non trouvée'
        });
        return;
      }

      res.json({
        success: true,
        data: application
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de la candidature:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de la candidature'
      });
    }
  }

  static async updateApplication(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user!;
      const updateData = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID de candidature requis'
        });
        return;
      }

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

      // Vérifier que la candidature appartient à l'entreprise et peut être modifiée
      const existingApplication = await prisma.application.findFirst({
        where: {
          id,
          companyId: company.id
        }
      });

      if (!existingApplication) {
        res.status(404).json({
          success: false,
          message: 'Candidature non trouvée'
        });
        return;
      }

      if (existingApplication.status !== ApplicationStatus.DRAFT) {
        res.status(400).json({
          success: false,
          message: 'Seules les candidatures en brouillon peuvent être modifiées'
        });
        return;
      }

      const application = await prisma.application.update({
        where: { id },
        data: updateData,
        include: {
          program: {
            select: {
              id: true,
              title: true,
              organization: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      });

      res.json({
        success: true,
        data: application
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la candidature:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour de la candidature'
      });
    }
  }

  static async deleteApplication(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user!;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID de candidature requis'
        });
        return;
      }

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

      // Vérifier que la candidature appartient à l'entreprise et peut être supprimée
      const existingApplication = await prisma.application.findFirst({
        where: {
          id,
          companyId: company.id
        }
      });

      if (!existingApplication) {
        res.status(404).json({
          success: false,
          message: 'Candidature non trouvée'
        });
        return;
      }

      if (existingApplication.status !== ApplicationStatus.DRAFT) {
        res.status(400).json({
          success: false,
          message: 'Seules les candidatures en brouillon peuvent être supprimées'
        });
        return;
      }

      await prisma.application.delete({ where: { id } });

      res.json({
        success: true,
        message: 'Candidature supprimée avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de la candidature:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression de la candidature'
      });
    }
  }

  static async submitApplication(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = req.user!;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID de candidature requis'
        });
        return;
      }

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

      const application = await prisma.application.findFirst({
        where: {
          id,
          companyId: company.id
        },
        include: {
          program: true
        }
      });

      if (!application) {
        res.status(404).json({
          success: false,
          message: 'Candidature non trouvée'
        });
        return;
      }

      if (application.status !== ApplicationStatus.DRAFT) {
        res.status(400).json({
          success: false,
          message: 'Cette candidature a déjà été soumise'
        });
        return;
      }

      if (application.program.deadline && new Date() > application.program.deadline) {
        res.status(400).json({
          success: false,
          message: 'La date limite de candidature est dépassée'
        });
        return;
      }

      const updatedApplication = await prisma.application.update({
        where: { id },
        data: {
          status: ApplicationStatus.SUBMITTED,
          submittedAt: new Date()
        },
        include: {
          program: {
            select: {
              id: true,
              title: true,
              organization: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      });

      res.json({
        success: true,
        data: updatedApplication
      });
    } catch (error) {
      console.error('Erreur lors de la soumission de la candidature:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la soumission de la candidature'
      });
    }
  }

  // Routes pour les organisations et admins
  static async getAllApplications(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;
      const { status, programId, page = 1, limit = 10 } = req.query;

      const where: any = {};

      // Si l'utilisateur est une organisation, ne voir que ses candidatures
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

        where.program = {
          organizationId: organization.id
        };
      }

      if (status) {
        where.status = status as ApplicationStatus;
      }

      if (programId) {
        where.programId = programId as string;
      }

      const applications = await prisma.application.findMany({
        where,
        include: {
          program: {
            select: {
              id: true,
              title: true,
              deadline: true,
              organization: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          company: {
            select: {
              id: true,
              name: true,
              sector: true,
              size: true,
              location: true
            }
          }
        },
        orderBy: { submittedAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      });

      const total = await prisma.application.count({ where });

      res.json({
        success: true,
        data: {
          applications,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des candidatures:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des candidatures'
      });
    }
  }

  static async getApplicationsByProgram(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { programId } = req.params;
      const user = req.user!;
      const { status, page = 1, limit = 10 } = req.query;

      // Vérifier que l'utilisateur peut voir les candidatures de ce programme
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

        if (!programId) {
          res.status(400).json({
            success: false,
            message: 'ID de programme requis'
          });
          return;
        }

        const program = await prisma.program.findUnique({
          where: {
            id: programId
          }
        });

        if (!program || program.organizationId !== organization.id) {
          res.status(404).json({
            success: false,
            message: 'Programme non trouvé'
          });
          return;
        }
      }

      const where: any = { programId };

      if (status) {
        where.status = status as ApplicationStatus;
      }

      const applications = await prisma.application.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              sector: true,
              size: true,
              location: true
            }
          }
        },
        orderBy: { submittedAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      });

      const total = await prisma.application.count({ where });

      res.json({
        success: true,
        data: {
          applications,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des candidatures:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des candidatures'
      });
    }
  }

  static async updateApplicationStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const user = req.user!;

      // Vérifier que l'utilisateur peut modifier cette candidature
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

        if (!id) {
          res.status(400).json({
            success: false,
            message: 'ID de candidature requis'
          });
          return;
        }

        const application = await prisma.application.findUnique({
          where: { id },
          include: { program: true }
        });

        if (!application || application.program.organizationId !== organization.id) {
          res.status(404).json({
            success: false,
            message: 'Candidature non trouvée'
          });
          return;
        }
      }

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID de candidature requis'
        });
        return;
      }

      const updatedApplication = await prisma.application.update({
        where: { id },
        data: {
          status,
          reviewedAt: new Date()
        },
        include: {
          program: {
            select: {
              id: true,
              title: true,
              organization: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          company: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      res.json({
        success: true,
        data: updatedApplication
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour du statut'
      });
    }
  }

  static async reviewApplication(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { score, comments } = req.body;
      const user = req.user!;

      // Vérifier que l'utilisateur peut évaluer cette candidature
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

        if (!id) {
          res.status(400).json({
            success: false,
            message: 'ID de candidature requis'
          });
          return;
        }

        const application = await prisma.application.findUnique({
          where: { id },
          include: { program: true }
        });

        if (!application || application.program.organizationId !== organization.id) {
          res.status(404).json({
            success: false,
            message: 'Candidature non trouvée'
          });
          return;
        }
      }

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID de candidature requis'
        });
        return;
      }

      const updatedApplication = await prisma.application.update({
        where: { id },
        data: {
          score,
          status: ApplicationStatus.UNDER_REVIEW,
          reviewedAt: new Date()
        }
      });

      res.json({
        success: true,
        data: updatedApplication
      });
    } catch (error) {
      console.error('Erreur lors de l\'évaluation de la candidature:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'évaluation de la candidature'
      });
    }
  }

  static async getApplicationStatistics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user!;

      let where: any = {};

      // Si l'utilisateur est une organisation, ne voir que ses statistiques
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

        where.program = {
          organizationId: organization.id
        };
      }

      const totalApplications = await prisma.application.count({ where });

      const applicationsByStatus = await prisma.application.groupBy({
        by: ['status'],
        where,
        _count: true
      });

      const stats = {
        totalApplications,
        applicationsByStatus: applicationsByStatus.reduce((acc, stat) => {
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
}