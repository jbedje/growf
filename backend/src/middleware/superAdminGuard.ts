import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { UserRole } from '@prisma/client';

/**
 * Middleware pour vérifier que l'utilisateur est SUPERADMIN
 * Utilisé pour les opérations sensibles comme la création de comptes backoffice
 */
export const requireSuperAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Vérifier si l'utilisateur est authentifié
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentification requise'
      });
      return;
    }

    // Vérifier le rôle SUPERADMIN
    if (req.user.role !== UserRole.SUPERADMIN) {
      res.status(403).json({
        success: false,
        error: 'Accès réservé aux super-administrateurs'
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la vérification des permissions'
    });
  }
};

/**
 * Middleware pour vérifier les permissions d'administration (ADMIN ou SUPERADMIN)
 */
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentification requise'
      });
      return;
    }

    const adminRoles = [UserRole.ADMIN, UserRole.SUPERADMIN];

    if (!adminRoles.includes(req.user.role as 'ADMIN' | 'SUPERADMIN')) {
      res.status(403).json({
        success: false,
        error: 'Accès réservé aux administrateurs'
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la vérification des permissions'
    });
  }
};

/**
 * Middleware pour vérifier les permissions d'accès au backoffice
 */
export const requireBackofficeAccess = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentification requise'
      });
      return;
    }

    const backofficeRoles = [UserRole.ANALYST, UserRole.ADMIN, UserRole.SUPERADMIN];

    if (!backofficeRoles.includes(req.user.role as 'ADMIN' | 'SUPERADMIN' | 'ANALYST')) {
      res.status(403).json({
        success: false,
        error: 'Accès au backoffice non autorisé'
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la vérification des permissions'
    });
  }
};