import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    isVerified: boolean;
  };
}

export const authorizeRoles = (allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Accès refusé - Permissions insuffisantes'
      });
      return;
    }

    next();
  };
};

export const authorizeOwnerOrRoles = (allowedRoles: UserRole[], ownerIdParam?: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié'
      });
    }

    // Si l'utilisateur a un rôle autorisé, permettre l'accès
    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    // Sinon, vérifier si l'utilisateur est le propriétaire de la ressource
    const resourceOwnerId = req.params[ownerIdParam || 'userId'];
    if (resourceOwnerId && resourceOwnerId === req.user.id) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Accès refusé - Vous ne pouvez accéder qu\'à vos propres ressources'
    });
  };
};