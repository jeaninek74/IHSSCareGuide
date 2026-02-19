import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';

// In-memory rate limiter (per IP, per route prefix)
// For production scale, replace with Redis-backed store
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

interface RateLimitOptions {
  max: number;        // max requests per window
  window: number;     // window in milliseconds
  keyPrefix?: string; // prefix for the store key
}

function getRateLimitKey(ip: string, prefix: string): string {
  return `${prefix}:${ip}`;
}

export function checkRateLimit(ip: string, opts: RateLimitOptions): { allowed: boolean; remaining: number; resetAt: number } {
  const key = getRateLimitKey(ip, opts.keyPrefix || 'default');
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    // New window
    const resetAt = now + opts.window;
    rateLimitStore.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: opts.max - 1, resetAt };
  }

  if (entry.count >= opts.max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: opts.max - entry.count, resetAt: entry.resetAt };
}

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Rate limit configurations per route type
export const RATE_LIMITS = {
  // AI endpoints — expensive, limit aggressively
  AI: { max: 20, window: 60 * 1000, keyPrefix: 'ai' },           // 20/min per IP
  AI_STRICT: { max: 5, window: 60 * 1000, keyPrefix: 'ai_strict' }, // 5/min for knowledge ask
  // Auth endpoints
  AUTH: { max: 10, window: 60 * 1000, keyPrefix: 'auth' },       // 10/min
  AUTH_STRICT: { max: 5, window: 15 * 60 * 1000, keyPrefix: 'auth_strict' }, // 5 per 15 min for register
  // General API
  GENERAL: { max: 100, window: 60 * 1000, keyPrefix: 'general' }, // 100/min
};

export async function rateLimitMiddleware(
  request: any,
  reply: any,
  opts: RateLimitOptions
): Promise<boolean> {
  const ip = request.ip || request.headers['x-forwarded-for'] || '127.0.0.1';
  const result = checkRateLimit(ip as string, opts);

  reply.header('X-RateLimit-Limit', opts.max);
  reply.header('X-RateLimit-Remaining', result.remaining);
  reply.header('X-RateLimit-Reset', Math.ceil(result.resetAt / 1000));

  if (!result.allowed) {
    reply.code(429).send({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please wait before trying again.',
        retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
      },
    });
    return false;
  }
  return true;
}

// Fastify plugin for global rate limiting
async function rateLimiterPlugin(fastify: FastifyInstance) {
  fastify.addHook('onRequest', async (request, reply) => {
    // Skip health endpoint
    if (request.url === '/health') return;

    const ip = request.ip || (request.headers['x-forwarded-for'] as string) || '127.0.0.1';
    const result = checkRateLimit(ip, RATE_LIMITS.GENERAL);

    if (!result.allowed) {
      reply.code(429).send({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please slow down.',
          retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
        },
      });
    }
  });
}

export default fp(rateLimiterPlugin, { name: 'rate-limiter' });
