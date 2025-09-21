import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { validate, userValidationSchema } from '../utils/validation';
import { AuthRequest, ApiResponse } from '../types';
import { logger } from '../config/logger';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const validatedData = validate(userValidationSchema.register, req.body);
      const result = await AuthService.register(validatedData);

      res.status(201).json({
        success: true,
        data: result.user,
        message: result.message
      } as ApiResponse);
    } catch (error: any) {
      logger.error('Error in register controller:', error);
      res.status(400).json({
        success: false,
        error: error.message
      } as ApiResponse);
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const validatedData = validate(userValidationSchema.login, req.body);
      const result = await AuthService.login(validatedData);

      // Définir le refresh token comme cookie httpOnly
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      });

      res.json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken
        },
        message: 'Connexion réussie'
      } as ApiResponse);
    } catch (error: any) {
      logger.error('Error in login controller:', error);
      res.status(401).json({
        success: false,
        error: error.message
      } as ApiResponse);
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          error: 'Token de rafraîchissement requis'
        } as ApiResponse);
      }

      const result = await AuthService.refreshToken(refreshToken);

      res.json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken
        }
      } as ApiResponse);
    } catch (error: any) {
      logger.error('Error in refreshToken controller:', error);
      res.status(401).json({
        success: false,
        error: error.message
      } as ApiResponse);
    }
  }

  static async logout(req: AuthRequest, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;
      const accessToken = req.headers.authorization?.split(' ')[1];

      if (refreshToken && accessToken) {
        await AuthService.logout(refreshToken, accessToken);
      }

      // Supprimer le cookie
      res.clearCookie('refreshToken');

      res.json({
        success: true,
        message: 'Déconnexion réussie'
      } as ApiResponse);
    } catch (error: any) {
      logger.error('Error in logout controller:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la déconnexion'
      } as ApiResponse);
    }
  }

  static async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.params;

      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'Token requis'
        } as ApiResponse);
      }

      const result = await AuthService.verifyEmail(token);

      res.json({
        success: true,
        message: result.message
      } as ApiResponse);
    } catch (error: any) {
      logger.error('Error in verifyEmail controller:', error);
      res.status(400).json({
        success: false,
        error: error.message
      } as ApiResponse);
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const validatedData = validate(userValidationSchema.forgotPassword, req.body);
      const result = await AuthService.forgotPassword(validatedData.email);

      res.json({
        success: true,
        message: result.message
      } as ApiResponse);
    } catch (error: any) {
      logger.error('Error in forgotPassword controller:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de l\'envoi de l\'email'
      } as ApiResponse);
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const validatedData = validate(userValidationSchema.resetPassword, req.body);
      const result = await AuthService.resetPassword(validatedData.token, validatedData.password);

      res.json({
        success: true,
        message: result.message
      } as ApiResponse);
    } catch (error: any) {
      logger.error('Error in resetPassword controller:', error);
      res.status(400).json({
        success: false,
        error: error.message
      } as ApiResponse);
    }
  }

  static async changePassword(req: AuthRequest, res: Response) {
    try {
      const validatedData = validate(userValidationSchema.changePassword, req.body);

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentification requise'
        } as ApiResponse);
      }

      const result = await AuthService.changePassword(
        req.user.id,
        validatedData.currentPassword,
        validatedData.newPassword
      );

      res.json({
        success: true,
        message: result.message
      } as ApiResponse);
    } catch (error: any) {
      logger.error('Error in changePassword controller:', error);
      res.status(400).json({
        success: false,
        error: error.message
      } as ApiResponse);
    }
  }

  static async getProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentification requise'
        } as ApiResponse);
      }

      res.json({
        success: true,
        data: req.user
      } as ApiResponse);
    } catch (error: any) {
      logger.error('Error in getProfile controller:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération du profil'
      } as ApiResponse);
    }
  }
}