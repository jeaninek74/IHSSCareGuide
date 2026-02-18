import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { authMiddleware } from '../middleware/auth';
import { ApiError } from '@ihss/shared-types';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const JWT_EXPIRES_IN = '7d';
const COOKIE_NAME = 'ihss_token';
const IS_PROD = process.env.APP_ENV === 'production';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  timezone: z.string().optional().default('America/Los_Angeles'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const setAuthCookie = (reply: Parameters<typeof authMiddleware>[0]['reply'], token: string) => {
  reply.setCookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? 'strict' : 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
};

export const authRoutes = async (app: FastifyInstance) => {
  // POST /auth/register
  app.post('/register', async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.errors.map((e) => e.message).join(', '),
          requestId: request.id,
        },
      } satisfies ApiError);
    }

    const { email, password, name, timezone } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return reply.code(409).send({
        success: false,
        error: {
          code: 'EMAIL_TAKEN',
          message: 'An account with this email already exists.',
          requestId: request.id,
        },
      } satisfies ApiError);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        profile: {
          create: { name, timezone: timezone || 'America/Los_Angeles' },
        },
      },
      include: { profile: true },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    setAuthCookie(reply, token);

    return reply.code(201).send({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
        profile: {
          id: user.profile!.id,
          userId: user.profile!.userId,
          name: user.profile!.name,
          timezone: user.profile!.timezone,
          createdAt: user.profile!.createdAt.toISOString(),
          updatedAt: user.profile!.updatedAt.toISOString(),
        },
      },
    });
  });

  // POST /auth/login
  app.post('/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid email or password format.',
          requestId: request.id,
        },
      } satisfies ApiError);
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return reply.code(401).send({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
          requestId: request.id,
        },
      } satisfies ApiError);
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    setAuthCookie(reply, token);

    return reply.code(200).send({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
        profile: {
          id: user.profile!.id,
          userId: user.profile!.userId,
          name: user.profile!.name,
          timezone: user.profile!.timezone,
          createdAt: user.profile!.createdAt.toISOString(),
          updatedAt: user.profile!.updatedAt.toISOString(),
        },
      },
    });
  });

  // POST /auth/logout
  app.post('/logout', async (_request, reply) => {
    reply.clearCookie(COOKIE_NAME, { path: '/' });
    return reply.code(200).send({ success: true, data: { message: 'Logged out successfully.' } });
  });

  // GET /auth/me
  app.get('/me', { preHandler: [authMiddleware] }, async (request, reply) => {
    const userId = (request as { userId?: string }).userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      return reply.code(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated.', requestId: request.id },
      } satisfies ApiError);
    }

    return reply.code(200).send({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
        profile: {
          id: user.profile!.id,
          userId: user.profile!.userId,
          name: user.profile!.name,
          timezone: user.profile!.timezone,
          createdAt: user.profile!.createdAt.toISOString(),
          updatedAt: user.profile!.updatedAt.toISOString(),
        },
      },
    });
  });
};
