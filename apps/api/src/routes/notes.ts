import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { authMiddleware } from '../middleware/auth';
import { moderateContent, generateStructuredJSON } from '../utils/aiService';
import { careLogStructuringPrompt } from '../shared/prompts';

interface AuthRequest extends FastifyRequest {
  userId?: string;
}

const generateNotesParamsSchema = z.object({
  shiftId: z.string().uuid('Invalid shift ID'),
});

interface StructuredNote {
  shiftId: string;
  date: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  activitiesPerformed: string[];
  clientConditionNotes: string;
  mealsPrepared: string[];
  medicationNotes: string;
  safetyNotes: string;
  caregiverNotes: string;
  espReadySummary: string;
}

export const notesRoutes = async (app: FastifyInstance) => {
  /**
   * POST /notes/shifts/:shiftId/generate
   * Generate AI-structured care notes from a completed shift's events.
   */
  app.post(
    '/shifts/:shiftId/generate',
    { preHandler: [authMiddleware] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = (request as AuthRequest).userId;

      const paramsParsed = generateNotesParamsSchema.safeParse(request.params);
      if (!paramsParsed.success) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: paramsParsed.error.errors.map((e) => e.message).join(', '),
            requestId: request.id,
          },
        });
      }

      const { shiftId } = paramsParsed.data;

      // Fetch the shift with events, ensuring it belongs to this user
      const shift = await prisma.shift.findFirst({
        where: { id: shiftId, userId: userId! },
        include: { events: { orderBy: { createdAt: 'asc' } } },
      });

      if (!shift) {
        return reply.code(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Shift not found.', requestId: request.id },
        });
      }

      if (shift.status !== 'completed') {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'SHIFT_NOT_COMPLETED',
            message: 'Notes can only be generated for completed shifts.',
            requestId: request.id,
          },
        });
      }

      if (shift.events.length === 0) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'NO_EVENTS',
            message: 'This shift has no logged events. Add events before generating notes.',
            requestId: request.id,
          },
        });
      }

      // Check if notes already exist
      const existing = await prisma.structuredNote.findFirst({
        where: { shiftId },
      });

      // Build the events text for the prompt
      const eventsText = shift.events
        .map((e, i) => `${i + 1}. [${e.type}] ${e.description || 'No description'} (${new Date(e.createdAt).toLocaleTimeString()})`)
        .join('\n');

      // Moderate the events content
      const isFlagged = await moderateContent(eventsText);
      if (isFlagged) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'CONTENT_FLAGGED',
            message: 'The shift events contain content that cannot be processed.',
            requestId: request.id,
          },
        });
      }

      // Build the prompt
      const startTime = new Date(shift.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const endTime = shift.endedAt ? new Date(shift.endedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'In Progress';
      const totalHours = shift.endedAt
        ? ((new Date(shift.endedAt).getTime() - new Date(shift.startedAt).getTime()) / 3600000).toFixed(2)
        : '0';

      const prompt = careLogStructuringPrompt.build({
        shiftDate: new Date(shift.startedAt).toLocaleDateString(),
        startTime,
        endTime,
        totalHours,
        events: eventsText,
      });

      // Generate structured notes
      const structuredData = await generateStructuredJSON<StructuredNote>(prompt);

      // Save to database (upsert)
      const note = await prisma.structuredNote.upsert({
        where: { shiftId },
        create: {
          shiftId,
          userId: userId!,
          promptVersion: careLogStructuringPrompt.version,
          rawInput: eventsText,
          structuredOutput: structuredData as object,
        },
        update: {
          promptVersion: careLogStructuringPrompt.version,
          rawInput: eventsText,
          structuredOutput: structuredData as object,
          updatedAt: new Date(),
        },
      });

      return reply.code(existing ? 200 : 201).send({
        success: true,
        data: {
          note: {
            id: note.id,
            shiftId: note.shiftId,
            structuredOutput: note.structuredOutput,
            promptVersion: note.promptVersion,
            createdAt: note.createdAt.toISOString(),
            updatedAt: note.updatedAt.toISOString(),
          },
        },
      });
    }
  );

  /**
   * GET /notes/shifts/:shiftId
   * Retrieve existing structured notes for a shift.
   */
  app.get(
    '/shifts/:shiftId',
    { preHandler: [authMiddleware] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = (request as AuthRequest).userId;
      const { shiftId } = request.params as { shiftId: string };

      const note = await prisma.structuredNote.findFirst({
        where: { shiftId, userId: userId! },
      });

      if (!note) {
        return reply.code(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: 'No structured notes found for this shift.', requestId: request.id },
        });
      }

      return reply.code(200).send({
        success: true,
        data: {
          note: {
            id: note.id,
            shiftId: note.shiftId,
            structuredOutput: note.structuredOutput,
            promptVersion: note.promptVersion,
            createdAt: note.createdAt.toISOString(),
            updatedAt: note.updatedAt.toISOString(),
          },
        },
      });
    }
  );
};
