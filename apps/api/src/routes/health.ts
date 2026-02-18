import { FastifyInstance } from 'fastify';
import { prisma } from '../utils/prisma';
import { HealthResponse } from '../shared/types';

const APP_VERSION = process.env.npm_package_version || '1.0.0';
const APP_ENV = process.env.APP_ENV || 'development';

export const healthRoutes = async (app: FastifyInstance) => {
  app.get<{ Reply: HealthResponse }>('/', async (_request, reply) => {
    let dbStatus: 'connected' | 'disconnected' = 'disconnected';

    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch {
      dbStatus = 'disconnected';
    }

    return reply.code(200).send({
      status: 'ok',
      environment: APP_ENV,
      version: APP_VERSION,
      database: dbStatus,
      timestamp: new Date().toISOString(),
    });
  });
};
