import prisma from '../config/database';
import { AuthUtils } from '../utils/auth';
import { CreateUserData, LoginData, JWTPayload, UserRole } from '../types';
import { logger } from '../config/logger';
import { EmailService } from './emailService';

export class AuthService {
  static async register(userData: CreateUserData) {
    try {
      // Vérifier si l'email existe déjà
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        throw new Error('Un compte avec cet email existe déjà');
      }

      // Hasher le mot de passe
      const hashedPassword = await AuthUtils.hashPassword(userData.password);

      // Créer l'utilisateur
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
        },
        select: {
          id: true,
          email: true,
          role: true,
          isVerified: true,
          createdAt: true
        }
      });

      // Générer un token de vérification
      const verificationToken = AuthUtils.generateVerificationToken();
      await AuthUtils.storeVerificationToken(user.id, verificationToken);

      // Envoyer l'email de vérification
      await EmailService.sendVerificationEmail(user.email, verificationToken);

      logger.info(`New user registered: ${user.email}`);

      return {
        user,
        message: 'Compte créé avec succès. Vérifiez votre email pour activer votre compte.'
      };
    } catch (error) {
      logger.error('Error in register:', error);
      throw error;
    }
  }

  static async login(loginData: LoginData) {
    try {
      // Trouver l'utilisateur
      const user = await prisma.user.findUnique({
        where: { email: loginData.email },
        include: {
          company: {
            select: { id: true }
          },
          organization: {
            select: { id: true }
          }
        }
      });

      if (!user) {
        throw new Error('Email ou mot de passe incorrect');
      }

      if (!user.isActive) {
        throw new Error('Compte désactivé');
      }

      // Vérifier le mot de passe
      const isPasswordValid = await AuthUtils.comparePassword(loginData.password, user.password);
      if (!isPasswordValid) {
        throw new Error('Email ou mot de passe incorrect');
      }

      // Générer les tokens
      const tokenPayload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        companyId: user.company?.id,
        organizationId: user.organization?.id,
      };

      const accessToken = AuthUtils.generateAccessToken(tokenPayload);
      const refreshToken = AuthUtils.generateRefreshToken();

      // Sauvegarder la session
      const session = await prisma.session.create({
        data: {
          userId: user.id,
          refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
        }
      });

      logger.info(`User logged in: ${user.email}`);

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          companyId: user.company?.id,
          organizationId: user.organization?.id,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error('Error in login:', error);
      throw error;
    }
  }

  static async refreshToken(refreshToken: string) {
    try {
      // Trouver la session
      const session = await prisma.session.findUnique({
        where: { refreshToken },
        include: {
          user: {
            include: {
              company: {
                select: { id: true }
              },
              organization: {
                select: { id: true }
              }
            }
          }
        }
      });

      if (!session || session.expiresAt < new Date()) {
        throw new Error('Token de rafraîchissement invalide');
      }

      if (!session.user.isActive) {
        throw new Error('Compte désactivé');
      }

      // Générer un nouveau token d'accès
      const tokenPayload: JWTPayload = {
        userId: session.user.id,
        email: session.user.email,
        role: session.user.role,
        companyId: session.user.company?.id,
        organizationId: session.user.organization?.id,
      };

      const accessToken = AuthUtils.generateAccessToken(tokenPayload);

      return {
        accessToken,
        user: {
          id: session.user.id,
          email: session.user.email,
          role: session.user.role,
          isVerified: session.user.isVerified,
          companyId: session.user.company?.id,
          organizationId: session.user.organization?.id,
        }
      };
    } catch (error) {
      logger.error('Error in refreshToken:', error);
      throw error;
    }
  }

  static async logout(refreshToken: string, accessToken: string) {
    try {
      // Supprimer la session
      await prisma.session.deleteMany({
        where: { refreshToken }
      });

      // Blacklister le token d'accès
      await AuthUtils.blacklistToken(accessToken);

      logger.info('User logged out');
    } catch (error) {
      logger.error('Error in logout:', error);
      throw error;
    }
  }

  static async verifyEmail(token: string) {
    try {
      const userId = await AuthUtils.getVerificationToken(token);
      if (!userId) {
        throw new Error('Token de vérification invalide ou expiré');
      }

      // Mettre à jour l'utilisateur
      await prisma.user.update({
        where: { id: userId },
        data: { isVerified: true }
      });

      // Supprimer le token
      await AuthUtils.deleteVerificationToken(token);

      logger.info(`Email verified for user: ${userId}`);

      return { message: 'Email vérifié avec succès' };
    } catch (error) {
      logger.error('Error in verifyEmail:', error);
      throw error;
    }
  }

  static async forgotPassword(email: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        // Ne pas révéler si l'email existe ou non
        return { message: 'Si cet email existe, vous recevrez un lien de réinitialisation' };
      }

      // Générer un token de réinitialisation
      const resetToken = AuthUtils.generateResetToken();
      await AuthUtils.storeResetToken(user.id, resetToken);

      // Envoyer l'email de réinitialisation
      await EmailService.sendPasswordResetEmail(user.email, resetToken);

      logger.info(`Password reset requested for user: ${user.email}`);

      return { message: 'Si cet email existe, vous recevrez un lien de réinitialisation' };
    } catch (error) {
      logger.error('Error in forgotPassword:', error);
      throw error;
    }
  }

  static async resetPassword(token: string, newPassword: string) {
    try {
      const userId = await AuthUtils.getResetToken(token);
      if (!userId) {
        throw new Error('Token de réinitialisation invalide ou expiré');
      }

      // Hasher le nouveau mot de passe
      const hashedPassword = await AuthUtils.hashPassword(newPassword);

      // Mettre à jour l'utilisateur
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
      });

      // Supprimer toutes les sessions de l'utilisateur
      await prisma.session.deleteMany({
        where: { userId }
      });

      // Supprimer le token
      await AuthUtils.deleteResetToken(token);

      logger.info(`Password reset for user: ${userId}`);

      return { message: 'Mot de passe réinitialisé avec succès' };
    } catch (error) {
      logger.error('Error in resetPassword:', error);
      throw error;
    }
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      // Vérifier le mot de passe actuel
      const isCurrentPasswordValid = await AuthUtils.comparePassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new Error('Mot de passe actuel incorrect');
      }

      // Hasher le nouveau mot de passe
      const hashedPassword = await AuthUtils.hashPassword(newPassword);

      // Mettre à jour l'utilisateur
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
      });

      // Supprimer toutes les autres sessions
      await prisma.session.deleteMany({
        where: { userId }
      });

      logger.info(`Password changed for user: ${userId}`);

      return { message: 'Mot de passe modifié avec succès' };
    } catch (error) {
      logger.error('Error in changePassword:', error);
      throw error;
    }
  }
}