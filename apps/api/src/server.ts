import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { healthRoutes } from './routes/health';
import { authRoutes } from './routes/auth';
import { shiftRoutes } from './routes/shifts';
import { incidentRoutes } from './routes/incidents';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './plugins/requestLogger';
import { prisma } from './utils/prisma';

const PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const APP_ENV = process.env.APP_ENV || 'development';

export const buildApp = async () => {
  const app = Fastify({
    logger: {
      level: APP_ENV === 'production' ? 'info' : 'debug',
      serializers: {
        req(request) {
          return {
            method: request.method,
            url: request.url,
            requestId: request.id,
          };
        },
      },
    },
    genReqId: () => crypto.randomUUID(),
  });

  // Security
  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  // CORS
  await app.register(cors, {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      process.env.CORS_ORIGIN || 'http://localhost:3000',
      'https://frontend-production-d2b2.up.railway.app',
      'https://ihsscareguide.com',
      'https://www.ihsscareguide.com',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Cookies
  await app.register(cookie, {
    secret: process.env.COOKIE_SECRET || process.env.JWT_SECRET || 'change-me-in-production',
  });

  // Rate limiting
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    keyGenerator: (request) => request.ip,
  });

  // Request logging plugin
  await app.register(requestLogger);

  // Error handler
  app.setErrorHandler(errorHandler);

  // Routes
  await app.register(healthRoutes, { prefix: '/health' });
  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(shiftRoutes, { prefix: '/shifts' });
  await app.register(incidentRoutes, { prefix: '/incidents' });

  return app;
};

const start = async () => {
  try {
    const app = await buildApp();
    await app.listen({ port: PORT, host: HOST });
    app.log.info({ port: PORT, env: APP_ENV }, 'API server started');
  } catch (err) {
    console.error('Failed to start server:', err);
    await prisma.$disconnect();
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

start();
