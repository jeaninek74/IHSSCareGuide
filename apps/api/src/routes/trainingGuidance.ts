import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { authMiddleware } from '../middleware/auth';
import { generateEmbedding, generateStructuredJSON } from '../utils/aiService';

interface AuthRequest extends FastifyRequest {
  userId?: string;
}

interface TrainingGuidanceAnswer {
  classification: 'required' | 'recommended' | 'optional';
  plainLanguageExplanation: string;
  whatToDoNext: string;
  verificationReminder: string;
  confidence: 'high' | 'low';
  sources: Array<{ title: string; source: string; snippet: string }>;
}

const guidanceBodySchema = z.object({
  certificationName: z.string().min(1).max(200),
  county: z.string().max(100).optional(),
  question: z.string().min(3).max(1000).optional(),
});

const TRAINING_GUIDANCE_PROMPT = {
  version: '1.0.0',
  build: (params: { certificationName: string; county?: string; question?: string; retrievedChunks: string }) => {
    const { certificationName, county, question, retrievedChunks } = params;
    const countyStr = county ? ` in ${county} County` : '';
    const questionStr = question ? `\n\nSpecific question: ${question}` : '';

    return `You are an IHSS training and certification guidance assistant. Your role is to help IHSS providers understand whether a specific training or certification is required, recommended, or optional but beneficial.

You MUST only answer based on the retrieved knowledge chunks below. Do not speculate or add information not present in the sources.

RETRIEVED KNOWLEDGE:
${retrievedChunks}

TASK:
Analyze the following certification/training for IHSS providers${countyStr}: "${certificationName}"${questionStr}

Respond with a JSON object in this exact format:
{
  "classification": "required" | "recommended" | "optional",
  "plainLanguageExplanation": "Clear, simple explanation of the requirement in 2-3 sentences",
  "whatToDoNext": "Specific actionable steps the provider should take",
  "verificationReminder": "Always verify this information with your county IHSS office or official IHSS resources before taking action.",
  "confidence": "high" | "low",
  "sources": [{ "title": "source title", "source": "source URL or name", "snippet": "relevant excerpt" }]
}

If the retrieved knowledge does not contain sufficient information to classify this training, set confidence to "low", classification to "recommended", and clearly state in the explanation that the provider must verify with official resources.

IMPORTANT RULES:
- Never claim a training is NOT required if you are uncertain
- Always include the verificationReminder
- If confidence is low, do not speculate — direct the user to official IHSS or county resources
- Keep explanations in plain language, avoid jargon`;
  },
};

export const trainingGuidanceRoutes = async (app: FastifyInstance) => {
  /**
   * POST /ai/training-guidance
   * Get AI-powered plain language guidance on a training/certification requirement.
   */
  app.post(
    '/training-guidance',
    { preHandler: [authMiddleware] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = guidanceBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.errors.map((e) => e.message).join(', '),
            requestId: request.id,
          },
        });
      }

      const { certificationName, county, question } = parsed.data;

      // Check knowledge base
      const chunkCount = await prisma.knowledgeChunk.count();
      if (chunkCount === 0) {
        return reply.code(200).send({
          success: true,
          data: {
            guidance: {
              classification: 'recommended',
              plainLanguageExplanation: 'The knowledge base has not been populated yet. Please contact your administrator or verify this training requirement directly with your county IHSS office.',
              whatToDoNext: 'Contact your county IHSS office or visit the CDSS IHSS website for official guidance.',
              verificationReminder: 'Always verify training requirements with your county IHSS office or official IHSS resources before taking action.',
              confidence: 'low',
              sources: [],
            },
          },
        });
      }

      // Build query string for embedding
      const queryText = `IHSS ${certificationName} training requirement ${county ? `${county} county` : ''} ${question || ''}`.trim();

      // Embed and retrieve relevant chunks
      const embedding = await generateEmbedding(queryText);
      const vectorLiteral = `'[${embedding.join(',')}]'::vector`;

      const chunks = await prisma.$transaction(async (tx) => {
        await tx.$executeRawUnsafe(`SET LOCAL enable_indexscan = off`);
        await tx.$executeRawUnsafe(`SET LOCAL enable_bitmapscan = off`);
        return tx.$queryRawUnsafe<Array<{
          id: string;
          title: string;
          source: string;
          content: string;
          similarity: number;
        }>>(
          `SELECT kc.id, kc.title, kc.source, kc.content,
                  1 - (kc.embedding <=> ${vectorLiteral}) AS similarity
           FROM knowledge_chunks kc
           WHERE kc.embedding IS NOT NULL
           ORDER BY kc.embedding <=> ${vectorLiteral}
           LIMIT 5`
        );
      });

      if (chunks.length === 0) {
        return reply.code(200).send({
          success: true,
          data: {
            guidance: {
              classification: 'recommended',
              plainLanguageExplanation: 'I do not have sufficient information about this specific training requirement. Please verify directly with your county IHSS office.',
              whatToDoNext: 'Contact your county IHSS office or visit the CDSS IHSS website at cdss.ca.gov/in-home-supportive-services.',
              verificationReminder: 'Always verify training requirements with your county IHSS office or official IHSS resources before taking action.',
              confidence: 'low',
              sources: [],
            },
          },
        });
      }

      // Build context
      const retrievedChunks = chunks
        .map((c, i) => `[${i + 1}] Source: ${c.source}\nTitle: ${c.title}\nContent: ${c.content}`)
        .join('\n\n---\n\n');

      const prompt = TRAINING_GUIDANCE_PROMPT.build({ certificationName, county, question, retrievedChunks });
      const guidance = await generateStructuredJSON<TrainingGuidanceAnswer>(prompt);

      return reply.code(200).send({ success: true, data: { guidance } });
    }
  );
};
