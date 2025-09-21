import { Response } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { AuthRequest } from '../middleware/authorization';

const prisma = new PrismaClient();

export class MessageController {
  static async getApplicationMessages(req: AuthRequest, res: Response) {
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
        return res.status(403).json({
          success: false,
          message: 'Accès refusé'
        });
      }

      const messages = await prisma.message.findMany({
        where: { applicationId },
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
      });

      res.json({
        success: true,
        data: messages
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des messages'
      });
    }
  }

  static async sendMessage(req: AuthRequest, res: Response) {
    try {
      const { applicationId } = req.params;
      const { content, attachments = [] } = req.body;
      const user = req.user!;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Le contenu du message est requis'
        });
      }

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
        return res.status(403).json({
          success: false,
          message: 'Accès refusé'
        });
      }

      const message = await prisma.message.create({
        data: {
          applicationId,
          senderId: user.id,
          content: content.trim(),
          attachments
        },
        include: {
          sender: {
            select: {
              id: true,
              email: true,
              role: true
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        data: message
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi du message'
      });
    }
  }

  static async markMessageAsRead(req: AuthRequest, res: Response) {
    try {
      const { messageId } = req.params;
      const user = req.user!;

      const message = await prisma.message.findUnique({
        where: { id: messageId },
        include: {
          application: {
            include: {
              program: true,
              company: true
            }
          }
        }
      });

      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Message non trouvé'
        });
      }

      // Vérifier l'accès
      let hasAccess = false;

      if (user.role === UserRole.COMPANY) {
        const company = await prisma.company.findUnique({
          where: { userId: user.id }
        });
        hasAccess = company?.id === message.application.companyId;
      } else if (user.role === UserRole.ORGANIZATION) {
        const organization = await prisma.organization.findUnique({
          where: { userId: user.id }
        });
        hasAccess = organization?.id === message.application.program.organizationId;
      } else {
        hasAccess = [UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.ANALYST].includes(user.role);
      }

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé'
        });
      }

      // Ne marquer comme lu que si ce n'est pas l'expéditeur
      if (message.senderId !== user.id && !message.readAt) {
        await prisma.message.update({
          where: { id: messageId },
          data: { readAt: new Date() }
        });
      }

      res.json({
        success: true,
        message: 'Message marqué comme lu'
      });
    } catch (error) {
      console.error('Erreur lors du marquage du message:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du marquage du message'
      });
    }
  }

  static async markAllMessagesAsRead(req: AuthRequest, res: Response) {
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
        return res.status(403).json({
          success: false,
          message: 'Accès refusé'
        });
      }

      // Marquer tous les messages non lus comme lus (sauf ceux envoyés par l'utilisateur)
      await prisma.message.updateMany({
        where: {
          applicationId,
          senderId: { not: user.id },
          readAt: null
        },
        data: { readAt: new Date() }
      });

      res.json({
        success: true,
        message: 'Tous les messages ont été marqués comme lus'
      });
    } catch (error) {
      console.error('Erreur lors du marquage des messages:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du marquage des messages'
      });
    }
  }

  static async deleteMessage(req: AuthRequest, res: Response) {
    try {
      const { messageId } = req.params;
      const user = req.user!;

      const message = await prisma.message.findUnique({
        where: { id: messageId }
      });

      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Message non trouvé'
        });
      }

      // Seul l'expéditeur ou un admin peut supprimer un message
      if (message.senderId !== user.id && ![UserRole.ADMIN, UserRole.SUPERADMIN].includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé'
        });
      }

      await prisma.message.delete({
        where: { id: messageId }
      });

      res.json({
        success: true,
        message: 'Message supprimé avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du message:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression du message'
      });
    }
  }

  static async getUnreadCount(req: AuthRequest, res: Response) {
    try {
      const user = req.user!;

      let where: any = {
        senderId: { not: user.id },
        readAt: null
      };

      if (user.role === UserRole.COMPANY) {
        const company = await prisma.company.findUnique({
          where: { userId: user.id }
        });

        if (company) {
          where.application = {
            companyId: company.id
          };
        }
      } else if (user.role === UserRole.ORGANIZATION) {
        const organization = await prisma.organization.findUnique({
          where: { userId: user.id }
        });

        if (organization) {
          where.application = {
            program: {
              organizationId: organization.id
            }
          };
        }
      }

      const unreadCount = await prisma.message.count({ where });

      res.json({
        success: true,
        data: { unreadCount }
      });
    } catch (error) {
      console.error('Erreur lors du comptage des messages non lus:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du comptage des messages non lus'
      });
    }
  }

  static async getUserConversations(req: AuthRequest, res: Response) {
    try {
      const user = req.user!;
      const { page = 1, limit = 10 } = req.query;

      let where: any = {};

      if (user.role === UserRole.COMPANY) {
        const company = await prisma.company.findUnique({
          where: { userId: user.id }
        });

        if (company) {
          where.companyId = company.id;
        }
      } else if (user.role === UserRole.ORGANIZATION) {
        const organization = await prisma.organization.findUnique({
          where: { userId: user.id }
        });

        if (organization) {
          where.program = {
            organizationId: organization.id
          };
        }
      }

      const applications = await prisma.application.findMany({
        where: {
          ...where,
          messages: {
            some: {}
          }
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
          },
          messages: {
            select: {
              id: true,
              content: true,
              senderId: true,
              readAt: true,
              createdAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 1
          },
          _count: {
            select: {
              messages: {
                where: {
                  senderId: { not: user.id },
                  readAt: null
                }
              }
            }
          }
        },
        orderBy: {
          messages: {
            _count: 'desc'
          }
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      });

      const total = await prisma.application.count({
        where: {
          ...where,
          messages: {
            some: {}
          }
        }
      });

      res.json({
        success: true,
        data: {
          conversations: applications,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des conversations'
      });
    }
  }
}