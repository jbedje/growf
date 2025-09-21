import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { config } from './config/env';
import { logger } from './config/logger';
import { errorHandler, notFound } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import prisma from './config/database';
import redis from './config/redis';

// Routes
import authRoutes from './routes/authRoutes';
import programRoutes from './routes/programRoutes';
import organizationRoutes from './routes/organizationRoutes';
import applicationRoutes from './routes/applicationRoutes';
import companyRoutes from './routes/companyRoutes';
import documentRoutes from './routes/documentRoutes';
import messageRoutes from './routes/messageRoutes';
import notificationRoutes from './routes/notificationRoutes';

const app = express();

// Middlewares de sécurité
app.use(helmet());
app.use(compression());
app.use(generalLimiter);

// CORS
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

// Servir les fichiers uploadés
app.use('/uploads', express.static(config.upload.uploadPath));

// Route de test
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'GROWF API is running!',
    version: '1.0.0',
  });
});

// Gestion des routes non trouvées
app.use(notFound);

// Gestionnaire d'erreurs global
app.use(errorHandler);

// Démarrage du serveur
const startServer = async () => {
  try {
    // Créer le dossier logs s'il n'existe pas
    const fs = require('fs');
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs');
    }

    // En mode développement, on démarre sans Redis et PostgreSQL
    if (config.nodeEnv === 'development') {
      console.log('🚧 Starting in development mode (without Redis/PostgreSQL)');

      // Démarrage du serveur en mode développement
      app.listen(config.port, () => {
        console.log(`🚀 Server running on port ${config.port}`);
        console.log(`📖 Health check: http://localhost:${config.port}/health`);
        console.log(`🌍 Environment: ${config.nodeEnv}`);
        console.log('⚠️  Redis and PostgreSQL connections skipped in dev mode');
      });
      return;
    }

    // En production, on essaie de se connecter aux services
    try {
      await redis.connect();
      logger.info('Connected to Redis');
    } catch (error) {
      logger.warn('Redis connection failed, continuing without Redis:', error);
    }

    try {
      await prisma.$connect();
      logger.info('Connected to database');
    } catch (error) {
      logger.warn('Database connection failed, continuing without database:', error);
    }

    // Démarrage du serveur
    app.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port}`);
      logger.info(`📖 Health check: http://localhost:${config.port}/health`);
      logger.info(`🌍 Environment: ${config.nodeEnv}`);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Gestion de l'arrêt propre
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  await redis.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  await redis.disconnect();
  process.exit(0);
});

// Démarrer le serveur
startServer();