import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { authMiddleware } from '../middleware/auth';
import { moderateContent, generateStructuredJSON } from '../utils/aiService';
import { weeklyExportPrompt } from '../shared/prompts';

interface AuthRequest extends FastifyRequest {
  userId?: string;
}

const weeklyExportBodySchema = z.object({
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'weekStart must be YYYY-MM-DD'),
  weekEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'weekEnd must be YYYY-MM-DD'),
});

interface WeeklyExportOutput {
  weekRange: string;
  totalHours: number;
  days: Array<{
    date: string;
    shifts: Array<{
      shiftId: string;
      startedAt: string;
      endedAt: string;
      hours: number;
      highlights: string[];
    }>;
    totalHours: number;
  }>;
  submissionChecklist: string[];
}

export const exportsRoutes = async (app: FastifyInstance) => {
  /**
   * POST /exports/weekly
   * Generate a weekly summary for ESP submission.
   */
  app.post(
    '/weekly',
    { preHandler: [authMiddleware] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = (request as AuthRequest).userId;

      const bodyParsed = weeklyExportBodySchema.safeParse(request.body);
      if (!bodyParsed.success) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: bodyParsed.error.errors.map((e) => e.message).join(', '),
            requestId: request.id,
          },
        });
      }

      const { weekStart, weekEnd } = bodyParsed.data;
      const startDate = new Date(`${weekStart}T00:00:00.000Z`);
      const endDate = new Date(`${weekEnd}T23:59:59.999Z`);

      // Fetch all completed shifts in the date range with their events
      const shifts = await prisma.shift.findMany({
        where: {
          userId: userId!,
          status: 'completed',
          startedAt: { gte: startDate, lte: endDate },
        },
        include: {
          events: { orderBy: { createdAt: 'asc' } },
        },
        orderBy: { startedAt: 'asc' },
      });

      if (shifts.length === 0) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'NO_SHIFTS',
            message: `No completed shifts found between ${weekStart} and ${weekEnd}.`,
            requestId: request.id,
          },
        });
      }

      // Build shifts data for the prompt
      const shiftsData = shifts
        .map((shift) => {
          const hours = shift.endedAt
            ? ((new Date(shift.endedAt).getTime() - new Date(shift.startedAt).getTime()) / 3600000).toFixed(2)
            : '0';
          const events = shift.events
            .map((e) => `  - [${e.type}] ${e.description || 'No description'}`)
            .join('\n');
          return `Shift ${shift.id}:
  Date: ${new Date(shift.startedAt).toLocaleDateString()}
  Start: ${new Date(shift.startedAt).toLocaleTimeString()}
  End: ${shift.endedAt ? new Date(shift.endedAt).toLocaleTimeString() : 'N/A'}
  Hours: ${hours}
  Events:
${events || '  (no events logged)'}`;
        })
        .join('\n\n');

      // Moderate the content
      const isFlagged = await moderateContent(shiftsData);
      if (isFlagged) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'CONTENT_FLAGGED',
            message: 'The shift data contains content that cannot be processed.',
            requestId: request.id,
          },
        });
      }

      const weekRange = `${new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

      const prompt = weeklyExportPrompt.build({
        weekRange,
        shiftsData,
      });

      // Generate the weekly summary
      const exportData = await generateStructuredJSON<WeeklyExportOutput>(prompt);

      // Save the weekly export — schema uses 'content' field
      const weeklyExport = await prisma.weeklyExport.create({
        data: {
          userId: userId!,
          weekStart: startDate,
          weekEnd: endDate,
          content: exportData as object,
        },
      });

      return reply.code(201).send({
        success: true,
        data: {
          export: {
            id: weeklyExport.id,
            weekStart: weeklyExport.weekStart.toISOString(),
            weekEnd: weeklyExport.weekEnd.toISOString(),
            structuredOutput: weeklyExport.content,
            promptVersion: weeklyExportPrompt.version,
            createdAt: weeklyExport.createdAt.toISOString(),
          },
          summary: exportData,
        },
      });
    }
  );

  /**
   * GET /exports
   * List all weekly exports for the current user.
   */
  app.get(
    '/',
    { preHandler: [authMiddleware] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = (request as AuthRequest).userId;

      const exports = await prisma.weeklyExport.findMany({
        where: { userId: userId! },
        orderBy: { weekStart: 'desc' },
        take: 20,
      });

      return reply.code(200).send({
        success: true,
        data: {
          exports: exports.map((e) => ({
            id: e.id,
            weekStart: e.weekStart.toISOString(),
            weekEnd: e.weekEnd.toISOString(),
            structuredOutput: e.content,
            promptVersion: weeklyExportPrompt.version,
            createdAt: e.createdAt.toISOString(),
          })),
        },
      });
    }
  );

  /**
   * GET /exports/:id
   * Get a single weekly export by ID.
   */
  app.get(
    '/:id',
    { preHandler: [authMiddleware] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = (request as AuthRequest).userId;
      const { id } = request.params as { id: string };

      const weeklyExport = await prisma.weeklyExport.findFirst({
        where: { id, userId: userId! },
      });

      if (!weeklyExport) {
        return reply.code(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Export not found.', requestId: request.id },
        });
      }

      return reply.code(200).send({
        success: true,
        data: {
          export: {
            id: weeklyExport.id,
            weekStart: weeklyExport.weekStart.toISOString(),
            weekEnd: weeklyExport.weekEnd.toISOString(),
            structuredOutput: weeklyExport.content,
            promptVersion: weeklyExportPrompt.version,
            createdAt: weeklyExport.createdAt.toISOString(),
          },
        },
      });
    }
  );
};
