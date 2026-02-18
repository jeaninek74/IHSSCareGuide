import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const COOKIE_NAME = 'ihss_token';

interface JwtPayload {
  userId: string;
}

export const authMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
  const token = request.cookies?.[COOKIE_NAME];

  if (!token) {
    return reply.code(401).send({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required.',
        requestId: request.id,
      },
    });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    (request as FastifyRequest & { userId: string }).userId = payload.userId;
  } catch {
    return reply.code(401).send({
      success: false,
      error: {
        code: 'TOKEN_INVALID',
        message: 'Session expired or invalid. Please log in again.',
        requestId: request.id,
      },
    });
  }
};
