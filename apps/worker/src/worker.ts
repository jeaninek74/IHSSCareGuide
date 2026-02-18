import pino from 'pino';
import { PrismaClient } from '@prisma/client';

const logger = pino({
  level: process.env.APP_ENV === 'production' ? 'info' : 'debug',
});

const prisma = new PrismaClient();

const POLL_INTERVAL_MS = 5000;
const APP_ENV = process.env.APP_ENV || 'development';

/**
 * Worker service
 * Handles asynchronous AI processing jobs:
 * - Structured note generation
 * - Weekly export generation
 * - Embedding generation during ingestion
 *
 * Uses a Postgres-backed job queue (no Redis required).
 * Job queue table will be added in Milestone 4.
 */
const processJobs = async () => {
  logger.debug('Polling for jobs...');

  try {
    // Verify DB connectivity
    await prisma.$queryRaw`SELECT 1`;
    logger.debug('DB connection healthy');
  } catch (err) {
    logger.error({ err }, 'DB connection failed in worker');
  }

  // Job processing logic will be added per milestone:
  // Milestone 4: structured note generation jobs
  // Milestone 5: weekly export generation jobs
  // Milestone 7: embedding generation jobs
};

const start = async () => {
  logger.info({ env: APP_ENV }, 'Worker service starting');

  // Initial DB check
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Worker DB connection established');
  } catch (err) {
    logger.error({ err }, 'Worker failed to connect to DB on startup');
    process.exit(1);
  }

  // Poll loop
  const poll = async () => {
    await processJobs();
    setTimeout(poll, POLL_INTERVAL_MS);
  };

  await poll();
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down worker');
  await prisma.$disconnect();
  process.exit(0);
});

start().catch((err) => {
  logger.error({ err }, 'Worker startup error');
  process.exit(1);
});
