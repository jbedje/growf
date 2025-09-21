import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { ApiResponse } from '../types';

export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction): void => {
  logger.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Prisma errors
  if (error.code === 'P2002') {
    res.status(409).json({
      success: false,
      error: 'Cette valeur existe déjà'
    } as ApiResponse);
    return;
  }

  if (error.code === 'P2025') {
    res.status(404).json({
      success: false,
      error: 'Enregistrement non trouvé'
    } as ApiResponse);
    return;
  }

  // Validation errors
  if (error.name === 'ValidationError' || error.details) {
    res.status(400).json({
      success: false,
      error: error.message || 'Données invalides'
    } as ApiResponse);
    return;
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: 'Token invalide'
    } as ApiResponse);
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: 'Token expiré'
    } as ApiResponse);
    return;
  }

  // Cast errors
  if (error.name === 'CastError') {
    res.status(400).json({
      success: false,
      error: 'Format d\'identifiant invalide'
    } as ApiResponse);
    return;
  }

  // Default error
  const status = error.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Une erreur interne s\'est produite'
    : error.message;

  res.status(status).json({
    success: false,
    error: message
  } as ApiResponse);
};

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route non trouvée'
  } as ApiResponse);
};