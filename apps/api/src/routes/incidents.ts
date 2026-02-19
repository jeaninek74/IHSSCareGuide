import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { authMiddleware } from '../middleware/auth';
import { moderateContent, generateStructuredJSON, AI_MODEL } from '../utils/aiService';
import { incidentStructuringPrompt } from '../shared/prompts';

const createIncidentSchema = z.object({
  description: z.string().min(1).max(5000),
});

function getUserId(request: FastifyRequest): string {
  return (request as unknown as { userId: string }).userId;
}

export const incidentRoutes = async (app: FastifyInstance) => {
  app.addHook('preHandler', authMiddleware);

  // POST /incidents — create a new incident report
  app.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    const parsed = createIncidentSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors.map((e) => e.message).join(', ') },
      });
    }

    const incident = await prisma.incident.create({
      data: { userId, description: parsed.data.description },
    });

    return reply.code(201).send({ success: true, data: { incident } });
  });

  // GET /incidents — list all incidents for the user
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    const incidents = await prisma.incident.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return reply.code(200).send({ success: true, data: { incidents } });
  });

  // GET /incidents/:incidentId — get a single incident
  app.get('/:incidentId', async (request: FastifyRequest<{ Params: { incidentId: string } }>, reply: FastifyReply) => {
    const userId = getUserId(request);
    const { incidentId } = request.params;

    const incident = await prisma.incident.findUnique({ where: { id: incidentId } });
    if (!incident) {
      return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Incident not found.' } });
    }
    if (incident.userId !== userId) {
      return reply.code(403).send({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied.' } });
    }

    return reply.code(200).send({ success: true, data: { incident } });
  });

  // POST /incidents/:incidentId/structure — AI-structure an incident report
  app.post(
    '/:incidentId/structure',
    async (request: FastifyRequest<{ Params: { incidentId: string } }>, reply: FastifyReply) => {
      const userId = getUserId(request);
      const { incidentId } = request.params;

      const incident = await prisma.incident.findUnique({ where: { id: incidentId } });
      if (!incident) {
        return reply.code(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Incident not found.' },
        });
      }
      if (incident.userId !== userId) {
        return reply.code(403).send({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Access denied.' },
        });
      }

      // Moderate content before AI processing
      const isFlagged = await moderateContent(incident.description);
      if (isFlagged) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'CONTENT_FLAGGED',
            message: 'The incident description contains content that cannot be processed.',
          },
        });
      }

      const incidentDate = new Date(incident.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const prompt = incidentStructuringPrompt.build({
        incidentDate,
        incidentDescription: incident.description,
      });

      const structured = await generateStructuredJSON<Record<string, unknown>>(prompt);

      const updated = await prisma.incident.update({
        where: { id: incidentId },
        data: {
          structuredJson: structured as object,
          modelUsed: AI_MODEL,
          promptVersion: incidentStructuringPrompt.version,
        },
      });

      return reply.code(200).send({ success: true, data: { incident: updated } });
    }
  );
};
