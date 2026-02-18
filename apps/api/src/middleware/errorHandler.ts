import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';

export const errorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  // Log the error (structured)
  request.log.error({
    err: {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    },
    requestId: request.id,
    url: request.url,
    method: request.method,
  });

  // Rate limit error
  if (error.statusCode === 429) {
    return reply.code(429).send({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please slow down and try again.',
        requestId: request.id,
      },
    });
  }

  // Validation error
  if (error.statusCode === 400) {
    return reply.code(400).send({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: error.message,
        requestId: request.id,
      },
    });
  }

  // Default: 500 - never leak internals
  return reply.code(500).send({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred. Please try again.',
      requestId: request.id,
    },
  });
};
