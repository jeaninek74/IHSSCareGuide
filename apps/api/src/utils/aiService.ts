import OpenAI from 'openai';
import { jsonRepairPrompt } from '../shared/prompts';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const AI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
export const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';

/**
 * Run OpenAI moderation on user input.
 * Returns true if content is flagged.
 */
export async function moderateContent(input: string): Promise<boolean> {
  try {
    const result = await openai.moderations.create({ input });
    return result.results[0]?.flagged ?? false;
  } catch (err) {
    console.error('Moderation check failed:', err);
    return false; // Fail open — do not block on moderation error
  }
}

/**
 * Generate a structured JSON response from a prompt.
 * Validates JSON output and attempts repair on failure.
 */
export async function generateStructuredJSON<T>(
  prompt: string,
  maxRetries = 2
): Promise<T> {
  let lastError: Error | null = null;
  let lastOutput = '';

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const promptToUse =
        attempt === 0
          ? prompt
          : jsonRepairPrompt.build({ originalPrompt: prompt, malformedOutput: lastOutput });

      const completion = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          {
            role: 'system',
            content:
              'You are a structured data extraction assistant. Always return valid JSON only. No markdown, no code blocks, no commentary.',
          },
          { role: 'user', content: promptToUse },
        ],
        temperature: 0.2,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0]?.message?.content || '';
      lastOutput = content;

      // Parse and validate JSON
      const parsed = JSON.parse(content) as T;
      return parsed;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.error(`AI generation attempt ${attempt + 1} failed:`, lastError.message);
    }
  }

  throw new Error(`AI generation failed after ${maxRetries + 1} attempts: ${lastError?.message}`);
}

/**
 * Generate an embedding vector for a text string.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.slice(0, 8000), // Truncate to avoid token limit
  });
  return response.data[0].embedding;
}

export { openai };
