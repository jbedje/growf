import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { config } from './config/env';
import {
  createRateLimit,
  createAuthRateLimit,
  helmetConfig,
  corsConfig,
  securityHeaders,
  requestLogger
} from './config/security';

// Import routes
import authRoutes from './routes/authRoutes';
import notificationRoutes from './routes/notificationRoutes';
import programRoutes from './routes/programRoutes';
import applicationRoutes from './routes/applicationRoutes';
import documentRoutes from './routes/documentRoutes';
import messageRoutes from './routes/messageRoutes';
import companyRoutes from './routes/companyRoutes';
import organizationRoutes from './routes/organizationRoutes';

const app = express();

// Trust proxy for accurate IP addresses behind load balancers
app.set('trust proxy', 1);

// Request logging (production only)
app.use(requestLogger);

// Security middleware
app.use(helmet(helmetConfig));
app.use(securityHeaders);
app.use(compression());

// Rate limiting
const globalRateLimit = createRateLimit();
const authRateLimit = createAuthRateLimit();

app.use(globalRateLimit);

// CORS configuration
app.use(cors(corsConfig));

// Body parsing middleware
app.use(express.json({
  limit: process.env.MAX_FILE_SIZE || '10mb',
  strict: true
}));
app.use(express.urlencoded({
  extended: true,
  limit: process.env.MAX_FILE_SIZE || '10mb'
}));
app.use(cookieParser());

// Health check endpoint (no rate limiting)
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    version: process.env.npm_package_version || '1.0.0',
    message: 'GROWF API is running'
  });
});

// API Routes with authentication rate limiting for auth endpoints
app.use('/api/auth', authRateLimit, authRoutes);

// Protected API routes
app.use('/api/notifications', notificationRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/organizations', organizationRoutes);

// Serve static files (uploads) with proper security headers
app.use('/uploads', express.static('uploads', {
  maxAge: '1d',
  setHeaders: (res, path) => {
    // Prevent execution of uploaded files
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Disposition', 'attachment');
  }
}));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  // Don't leak error details in production
  const isProduction = config.nodeEnv === 'production';

  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  res.status(err.status || 500).json({
    success: false,
    error: isProduction ? 'Internal server error' : err.message,
    ...(isProduction ? {} : { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
const port = config.port;
const server = app.listen(port, () => {
  console.log(`🚀 GROWF API server running on port ${port}`);
  console.log(`📖 Health check: http://localhost:${port}/health`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`🔒 Security: Enhanced security middleware enabled`);

  if (config.nodeEnv === 'production') {
    console.log('🛡️  Production mode: All security features active');
  } else {
    console.log('⚠️  Development mode: Some security features relaxed');
  }
});

// Handle server errors
server.on('error', (error: any) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
});

export default app;