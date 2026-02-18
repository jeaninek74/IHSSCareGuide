import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

const requestLoggerPlugin = async (app: FastifyInstance) => {
  app.addHook('onRequest', async (request) => {
    request.log.info({
      requestId: request.id,
      method: request.method,
      url: request.url,
      ip: request.ip,
    }, 'Incoming request');
  });

  app.addHook('onResponse', async (request, reply) => {
    request.log.info({
      requestId: request.id,
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTime: reply.elapsedTime,
    }, 'Request completed');
  });
};

export const requestLogger = fp(requestLoggerPlugin);
