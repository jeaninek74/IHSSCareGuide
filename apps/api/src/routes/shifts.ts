import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { authMiddleware } from '../middleware/auth';

// ── Schemas ──────────────────────────────────────────────────────────────────

const addEventSchema = z.object({
  type: z.string().min(1).max(100),
  description: z.string().min(1).max(2000),
  occurredAt: z.string().datetime().optional(),
});

const weeklyRangeSchema = z.object({
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  weekEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// ── Helper ────────────────────────────────────────────────────────────────────

function getUserId(request: FastifyRequest): string {
  return (request as unknown as { userId: string }).userId;
}

function notFound(reply: FastifyReply, message: string) {
  return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message } });
}

function forbidden(reply: FastifyReply) {
  return reply.code(403).send({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied.' } });
}

// ── Routes ────────────────────────────────────────────────────────────────────

export const shiftRoutes = async (app: FastifyInstance) => {
  // All shift routes require authentication
  app.addHook('preHandler', authMiddleware);

  // POST /shifts/start — start a new shift
  app.post('/start', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);

    // Check for an already-active shift
    const active = await prisma.shift.findFirst({
      where: { userId, status: 'active' },
    });
    if (active) {
      return reply.code(409).send({
        success: false,
        error: {
          code: 'SHIFT_ALREADY_ACTIVE',
          message: 'You already have an active shift. End it before starting a new one.',
        },
      });
    }

    const shift = await prisma.shift.create({
      data: { userId },
      include: { events: true },
    });

    return reply.code(201).send({ success: true, data: { shift } });
  });

  // POST /shifts/:shiftId/events — add an event to a shift
  app.post('/:shiftId/events', async (request: FastifyRequest<{ Params: { shiftId: string } }>, reply: FastifyReply) => {
    const userId = getUserId(request);
    const { shiftId } = request.params;

    const shift = await prisma.shift.findUnique({ where: { id: shiftId } });
    if (!shift) return notFound(reply, 'Shift not found.');
    if (shift.userId !== userId) return forbidden(reply);
    if (shift.status !== 'active') {
      return reply.code(400).send({
        success: false,
        error: { code: 'SHIFT_NOT_ACTIVE', message: 'Cannot add events to a completed shift.' },
      });
    }

    const parsed = addEventSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors.map((e) => e.message).join(', ') },
      });
    }

    const { type, description, occurredAt } = parsed.data;
    const event = await prisma.shiftEvent.create({
      data: {
        shiftId,
        userId,
        type,
        description,
        occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
      },
    });

    return reply.code(201).send({ success: true, data: { event } });
  });

  // POST /shifts/:shiftId/end — end an active shift
  app.post('/:shiftId/end', async (request: FastifyRequest<{ Params: { shiftId: string } }>, reply: FastifyReply) => {
    const userId = getUserId(request);
    const { shiftId } = request.params;

    const shift = await prisma.shift.findUnique({
      where: { id: shiftId },
      include: { events: true },
    });
    if (!shift) return notFound(reply, 'Shift not found.');
    if (shift.userId !== userId) return forbidden(reply);
    if (shift.status !== 'active') {
      return reply.code(400).send({
        success: false,
        error: { code: 'SHIFT_ALREADY_ENDED', message: 'This shift has already been ended.' },
      });
    }

    const updated = await prisma.shift.update({
      where: { id: shiftId },
      data: { status: 'completed', endedAt: new Date() },
      include: { events: true },
    });

    return reply.code(200).send({ success: true, data: { shift: updated } });
  });

  // GET /shifts — get all shifts for the authenticated user
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);

    const shifts = await prisma.shift.findMany({
      where: { userId },
      include: { events: true },
      orderBy: { startedAt: 'desc' },
      take: 50,
    });

    return reply.code(200).send({ success: true, data: { shifts } });
  });

  // GET /shifts/active — get the current active shift (if any)
  app.get('/active', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);

    const shift = await prisma.shift.findFirst({
      where: { userId, status: 'active' },
      include: { events: true },
    });

    return reply.code(200).send({ success: true, data: { shift: shift || null } });
  });

  // GET /shifts/:shiftId — get a single shift with events
  app.get('/:shiftId', async (request: FastifyRequest<{ Params: { shiftId: string } }>, reply: FastifyReply) => {
    const userId = getUserId(request);
    const { shiftId } = request.params;

    const shift = await prisma.shift.findUnique({
      where: { id: shiftId },
      include: { events: true, structuredNotes: true },
    });

    if (!shift) return notFound(reply, 'Shift not found.');
    if (shift.userId !== userId) return forbidden(reply);

    return reply.code(200).send({ success: true, data: { shift } });
  });

  // GET /shifts/weekly-range — get shifts within a date range
  app.get('/weekly-range', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    const parsed = weeklyRangeSchema.safeParse(request.query);

    if (!parsed.success) {
      return reply.code(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'weekStart and weekEnd are required in YYYY-MM-DD format.',
        },
      });
    }

    const { weekStart, weekEnd } = parsed.data;
    const start = new Date(weekStart + 'T00:00:00.000Z');
    const end = new Date(weekEnd + 'T23:59:59.999Z');

    const shifts = await prisma.shift.findMany({
      where: {
        userId,
        startedAt: { gte: start, lte: end },
      },
      include: { events: true, structuredNotes: true },
      orderBy: { startedAt: 'asc' },
    });

    return reply.code(200).send({ success: true, data: { shifts, weekStart, weekEnd } });
  });

  // GET /shifts/:shiftId/events — get events for a specific shift
  app.get('/:shiftId/events', async (request: FastifyRequest<{ Params: { shiftId: string } }>, reply: FastifyReply) => {
    const userId = getUserId(request);
    const { shiftId } = request.params;
    const shift = await prisma.shift.findUnique({ where: { id: shiftId } });
    if (!shift) return notFound(reply, 'Shift not found.');
    if (shift.userId !== userId) return forbidden(reply);
    const events = await prisma.shiftEvent.findMany({
      where: { shiftId },
      orderBy: { occurredAt: 'asc' },
    });
    return reply.code(200).send({ success: true, data: { events } });
  });
};
