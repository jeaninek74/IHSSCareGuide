import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { authMiddleware } from '../middleware/auth';

interface AuthRequest extends FastifyRequest {
  userId?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function computeStatus(expirationDate: Date | null): 'active' | 'expired' | 'expiring_soon' | 'missing' {
  if (!expirationDate) return 'active';
  const now = new Date();
  const daysUntilExpiry = Math.floor((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 30) return 'expiring_soon';
  return 'active';
}

async function createDefaultReminderEvents(certId: string, providerId: string, expirationDate: Date) {
  // Get provider's reminder rules (or use defaults: 30, 7, 1 days)
  const rules = await prisma.reminderRule.findMany({
    where: { providerId, enabled: true },
  });

  const daysBefore = rules.length > 0
    ? rules.map((r) => r.daysBeforeExpiration)
    : [30, 7, 1];

  const events = daysBefore.map((days) => {
    const scheduledFor = new Date(expirationDate);
    scheduledFor.setDate(scheduledFor.getDate() - days);
    return {
      providerCertificationId: certId,
      scheduledFor,
      channel: 'email' as const,
      status: 'scheduled' as const,
    };
  });

  // Only create future events
  const futureEvents = events.filter((e) => e.scheduledFor > new Date());
  if (futureEvents.length > 0) {
    await prisma.reminderEvent.createMany({ data: futureEvents });
  }
}

// ── Schemas ───────────────────────────────────────────────────────────────────

const createCertSchema = z.object({
  certificationTypeId: z.string().uuid().nullable().optional(),
  customName: z.string().min(1).max(200).nullable().optional(),
  issuedDate: z.string().datetime().nullable().optional(),
  expirationDate: z.string().datetime().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
}).refine((d) => d.certificationTypeId || d.customName, {
  message: 'Either certificationTypeId or customName is required',
});

const updateCertSchema = z.object({
  certificationTypeId: z.string().uuid().nullable().optional(),
  customName: z.string().min(1).max(200).nullable().optional(),
  issuedDate: z.string().datetime().optional().nullable(),
  expirationDate: z.string().datetime().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

// ── Routes ────────────────────────────────────────────────────────────────────

export const certificationRoutes = async (app: FastifyInstance) => {
  /**
   * GET /certification-types
   * List all available certification types.
   */
  app.get(
    '/types',
    { preHandler: [authMiddleware] },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      const types = await prisma.certificationType.findMany({
        orderBy: [{ isCommon: 'desc' }, { name: 'asc' }],
      });
      return reply.code(200).send({ success: true, data: { types } });
    }
  );

  /**
   * POST /certifications
   * Add a new certification for the authenticated provider.
   */
  app.post(
    '/',
    { preHandler: [authMiddleware] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = (request as AuthRequest).userId!;
      const parsed = createCertSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: parsed.error.errors.map((e) => e.message).join(', '), requestId: request.id },
        });
      }

      const { certificationTypeId, customName, issuedDate, expirationDate, notes } = parsed.data;
      const expDate = expirationDate ? new Date(expirationDate) : null;
      const status = computeStatus(expDate);

      const cert = await prisma.providerCertification.create({
        data: {
          providerId: userId,
          certificationTypeId: certificationTypeId || null,
          customName: customName || null,
          issuedDate: issuedDate ? new Date(issuedDate) : null,
          expirationDate: expDate,
          status,
          notes: notes || null,
        },
        include: { certificationType: true },
      });

      // Create default reminder events if expiration date is set
      if (expDate && expDate > new Date()) {
        await createDefaultReminderEvents(cert.id, userId, expDate);
      }

      // Also create default reminder rules for new provider if none exist
      const existingRules = await prisma.reminderRule.count({ where: { providerId: userId } });
      if (existingRules === 0) {
        await prisma.reminderRule.createMany({
          data: [
            { providerId: userId, daysBeforeExpiration: 30, enabled: true },
            { providerId: userId, daysBeforeExpiration: 7, enabled: true },
            { providerId: userId, daysBeforeExpiration: 1, enabled: true },
          ],
        });
      }

      return reply.code(201).send({ success: true, data: { certification: cert } });
    }
  );

  /**
   * GET /certifications
   * List all certifications for the authenticated provider.
   */
  app.get(
    '/',
    { preHandler: [authMiddleware] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = (request as AuthRequest).userId!;
      const { status } = request.query as { status?: string };

      const certs = await prisma.providerCertification.findMany({
        where: {
          providerId: userId,
          ...(status ? { status: status as any } : {}),
        },
        include: { certificationType: true, _count: { select: { reminderEvents: true } } },
        orderBy: [{ expirationDate: 'asc' }, { createdAt: 'desc' }],
      });

      // Recompute status dynamically
      const updated = certs.map((c) => ({
        ...c,
        status: computeStatus(c.expirationDate),
      }));

      // Summary counts
      const summary = {
        total: updated.length,
        active: updated.filter((c) => c.status === 'active').length,
        expiringSoon: updated.filter((c) => c.status === 'expiring_soon').length,
        expired: updated.filter((c) => c.status === 'expired').length,
        missing: updated.filter((c) => c.status === 'missing').length,
      };

      return reply.code(200).send({ success: true, data: { certifications: updated, summary } });
    }
  );

  /**
   * GET /certifications/:id
   * Get a single certification with reminder events.
   */
  app.get(
    '/:id',
    { preHandler: [authMiddleware] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = (request as AuthRequest).userId!;
      const { id } = request.params as { id: string };

      const cert = await prisma.providerCertification.findFirst({
        where: { id, providerId: userId },
        include: {
          certificationType: true,
          reminderEvents: { orderBy: { scheduledFor: 'asc' } },
        },
      });

      if (!cert) {
        return reply.code(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Certification not found', requestId: request.id },
        });
      }

      return reply.code(200).send({ success: true, data: { certification: { ...cert, status: computeStatus(cert.expirationDate) } } });
    }
  );

  /**
   * PUT /certifications/:id
   * Update a certification.
   */
  app.put(
    '/:id',
    { preHandler: [authMiddleware] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = (request as AuthRequest).userId!;
      const { id } = request.params as { id: string };

      const existing = await prisma.providerCertification.findFirst({ where: { id, providerId: userId } });
      if (!existing) {
        return reply.code(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Certification not found', requestId: request.id },
        });
      }

      const parsed = updateCertSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: parsed.error.errors.map((e) => e.message).join(', '), requestId: request.id },
        });
      }

      const { certificationTypeId, customName, issuedDate, expirationDate, notes } = parsed.data;
      const expDate = expirationDate !== undefined ? (expirationDate ? new Date(expirationDate) : null) : existing.expirationDate;
      const status = computeStatus(expDate);

      const cert = await prisma.providerCertification.update({
        where: { id },
        data: {
          ...(certificationTypeId !== undefined && { certificationTypeId }),
          ...(customName !== undefined && { customName }),
          ...(issuedDate !== undefined && { issuedDate: issuedDate ? new Date(issuedDate) : null }),
          expirationDate: expDate,
          status,
          ...(notes !== undefined && { notes }),
        },
        include: { certificationType: true },
      });

      // Recreate reminder events if expiration date changed
      if (expirationDate !== undefined && expDate && expDate > new Date()) {
        await prisma.reminderEvent.deleteMany({
          where: { providerCertificationId: id, status: 'scheduled' },
        });
        await createDefaultReminderEvents(id, userId, expDate);
      }

      return reply.code(200).send({ success: true, data: { certification: cert } });
    }
  );

  /**
   * DELETE /certifications/:id
   * Delete a certification.
   */
  app.delete(
    '/:id',
    { preHandler: [authMiddleware] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = (request as AuthRequest).userId!;
      const { id } = request.params as { id: string };

      const existing = await prisma.providerCertification.findFirst({ where: { id, providerId: userId } });
      if (!existing) {
        return reply.code(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Certification not found', requestId: request.id },
        });
      }

      await prisma.providerCertification.delete({ where: { id } });
      return reply.code(200).send({ success: true, data: { deleted: true } });
    }
  );

  /**
   * GET /certifications/reminders/rules
   * Get reminder rules for the authenticated provider.
   */
  app.get(
    '/reminders/rules',
    { preHandler: [authMiddleware] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = (request as AuthRequest).userId!;
      const rules = await prisma.reminderRule.findMany({
        where: { providerId: userId },
        orderBy: { daysBeforeExpiration: 'desc' },
      });
      return reply.code(200).send({ success: true, data: { rules } });
    }
  );

  /**
   * PUT /certifications/reminders/rules/:id
   * Toggle or update a reminder rule.
   */
  app.put(
    '/reminders/rules/:id',
    { preHandler: [authMiddleware] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = (request as AuthRequest).userId!;
      const { id } = request.params as { id: string };
      const { enabled } = request.body as { enabled: boolean };

      const rule = await prisma.reminderRule.findFirst({ where: { id, providerId: userId } });
      if (!rule) {
        return reply.code(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Reminder rule not found', requestId: request.id },
        });
      }

      const updated = await prisma.reminderRule.update({ where: { id }, data: { enabled } });
      return reply.code(200).send({ success: true, data: { rule: updated } });
    }
  );
};
