import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';

async function securityHeadersPlugin(fastify: FastifyInstance) {
  fastify.addHook('onSend', async (request, reply) => {
    // Prevent clickjacking
    reply.header('X-Frame-Options', 'DENY');
    // Prevent MIME type sniffing
    reply.header('X-Content-Type-Options', 'nosniff');
    // XSS protection (legacy browsers)
    reply.header('X-XSS-Protection', '1; mode=block');
    // Referrer policy
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    // Permissions policy
    reply.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    // HSTS (1 year)
    reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    // Content Security Policy
    reply.header(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.ihsscareguide.com https://api-production-67a7.up.railway.app; frame-ancestors 'none'"
    );
    // Remove server fingerprint
    reply.removeHeader('X-Powered-By');
  });
}

export default fp(securityHeadersPlugin, { name: 'security-headers' });
