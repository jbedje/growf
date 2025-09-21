import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    isVerified: boolean;
    companyId?: string;
    organizationId?: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Access token required'
    });
    return;
  }

  // Mock token validation for development
  let mockUser;

  switch (token) {
    case 'mock-jwt-token-superadmin':
      mockUser = {
        id: 'superadmin-1',
        email: 'superadmin@growf.fr',
        role: 'SUPERADMIN',
        isVerified: true,
      };
      break;
    case 'mock-jwt-token-admin-jbedje':
      mockUser = {
        id: 'admin-jbedje',
        email: 'jbedje@gmail.con',
        role: 'ADMIN',
        isVerified: true,
      };
      break;
    case 'mock-jwt-token-company':
      mockUser = {
        id: 'company-1',
        email: 'company@test.fr',
        role: 'COMPANY',
        isVerified: true,
        companyId: 'company-1'
      };
      break;
    case 'mock-jwt-token-organization':
      mockUser = {
        id: 'organization-1',
        email: 'org@financement.fr',
        role: 'ORGANIZATION',
        isVerified: true,
        organizationId: 'organization-1'
      };
      break;
    default:
      res.status(403).json({
        success: false,
        error: 'Invalid token'
      });
      return;
  }

  req.user = mockUser;
  next();
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentification requise'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Permissions insuffisantes'
      });
      return;
    }

    next();
  };
};

export const requireVerification = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentification requise'
    });
    return;
  }

  // For mock mode, just check the user's isVerified property
  if (!req.user.isVerified) {
    res.status(403).json({
      success: false,
      error: 'Vérification de l\'email requise'
    });
    return;
  }

  next();
};

export const requireCompanyProfile = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'COMPANY') {
    res.status(403).json({
      success: false,
      error: 'Profil entreprise requis'
    });
    return;
  }

  if (!req.user.companyId) {
    res.status(400).json({
      success: false,
      error: 'Profil entreprise non configuré'
    });
    return;
  }

  next();
};

export const requireOrganizationProfile = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'ORGANIZATION') {
    res.status(403).json({
      success: false,
      error: 'Profil organisation requis'
    });
    return;
  }

  if (!req.user.organizationId) {
    res.status(400).json({
      success: false,
      error: 'Profil organisation non configuré'
    });
    return;
  }

  next();
};