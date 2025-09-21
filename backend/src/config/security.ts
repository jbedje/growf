import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { config } from './env';

// Rate limiting configuration
export const createRateLimit = () => {
  const windowMs = config.nodeEnv === 'production'
    ? parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') // 15 minutes in production
    : 60000; // 1 minute in development

  const max = config.nodeEnv === 'production'
    ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
    : 1000; // More permissive in development

  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for successful auth requests in development
    skip: (req) => {
      if (config.nodeEnv === 'development' && req.path === '/api/auth/login') {
        return false;
      }
      return false;
    }
  });
};

// Authentication rate limiting (stricter for login endpoints)
export const createAuthRateLimit = () => {
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const max = config.nodeEnv === 'production' ? 5 : 50; // 5 attempts in production, 50 in dev

  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: 'Too many authentication attempts, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
  });
};

// Helmet security configuration
export const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Needed for some file uploads
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
};

// CORS configuration
export const corsConfig = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = config.nodeEnv === 'production'
      ? (process.env.CORS_ORIGINS || '').split(',').filter(Boolean)
      : [
          'http://localhost:3000',
          'http://localhost:5173',
          'http://localhost:5174',
          'http://localhost:5175',
          'http://localhost:5176',
          'http://localhost:5177',
          'http://localhost:5180'
        ];

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-HTTP-Method-Override',
    'Accept',
    'Origin'
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Rate-Limit-Limit',
    'X-Rate-Limit-Remaining',
    'X-Rate-Limit-Reset'
  ]
};

// Security headers for production
export const securityHeaders = (req: any, res: any, next: any) => {
  if (config.nodeEnv === 'production') {
    // Remove server header
    res.removeHeader('X-Powered-By');

    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  }
  next();
};

// Request logging for production
export const requestLogger = (req: any, res: any, next: any) => {
  if (config.nodeEnv === 'production') {
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const logData = {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      };

      // In production, you'd want to use a proper logger like Winston
      console.log(JSON.stringify(logData));
    });
  }
  next();
};