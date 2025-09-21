import rateLimit from 'express-rate-limit';
import { config } from '../config/env';

// Rate limiter général
export const generalLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  message: {
    success: false,
    error: 'Trop de requêtes, veuillez réessayer plus tard'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter strict pour l'authentification
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives par IP
  message: {
    success: false,
    error: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes'
  },
  skipSuccessfulRequests: true,
});

// Rate limiter pour les uploads
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 uploads par minute
  message: {
    success: false,
    error: 'Trop d\'uploads, veuillez réessayer dans une minute'
  },
});

// Rate limiter pour l'envoi d'emails
export const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 5, // 5 emails par heure
  message: {
    success: false,
    error: 'Trop d\'emails envoyés, veuillez réessayer dans une heure'
  },
});

// Rate limiter pour la recherche
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 recherches par minute
  message: {
    success: false,
    error: 'Trop de recherches, veuillez réessayer dans une minute'
  },
});