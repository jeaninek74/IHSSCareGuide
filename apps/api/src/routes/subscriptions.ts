import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import Stripe from 'stripe';
import { prisma } from '../utils/prisma';
import { authMiddleware } from '../middleware/auth';

interface AuthRequest extends FastifyRequest {
  userId?: string;
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const MONTHLY_PRICE_ID = process.env.STRIPE_MONTHLY_PRICE_ID!;
const ANNUAL_PRICE_ID = process.env.STRIPE_ANNUAL_PRICE_ID!;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://ihsscareguide.com';

export const subscriptionRoutes = async (app: FastifyInstance) => {
  /**
   * GET /subscriptions/status
   * Returns the current user's subscription status.
   */
  app.get(
    '/status',
    { preHandler: [authMiddleware] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = (request as AuthRequest).userId!;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          subscriptionStatus: true,
          subscriptionPriceId: true,
          trialEndsAt: true,
          subscriptionEndsAt: true,
          stripeCustomerId: true,
        },
      });

      if (!user) {
        return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'User not found.' } });
      }

      const isActive =
        user.subscriptionStatus === 'active' ||
        user.subscriptionStatus === 'trialing';

      return reply.send({
        success: true,
        data: {
          isActive,
          status: user.subscriptionStatus,
          priceId: user.subscriptionPriceId,
          trialEndsAt: user.trialEndsAt,
          subscriptionEndsAt: user.subscriptionEndsAt,
          plan: user.subscriptionPriceId === MONTHLY_PRICE_ID ? 'monthly' : user.subscriptionPriceId === ANNUAL_PRICE_ID ? 'annual' : null,
        },
      });
    }
  );

  /**
   * POST /subscriptions/checkout
   * Creates a Stripe Checkout session and returns the URL.
   * Body: { priceId: 'monthly' | 'annual' }
   */
  app.post(
    '/checkout',
    { preHandler: [authMiddleware] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = (request as AuthRequest).userId!;
      const { priceId: planKey } = request.body as { priceId: 'monthly' | 'annual' };

      const priceId = planKey === 'annual' ? ANNUAL_PRICE_ID : MONTHLY_PRICE_ID;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, stripeCustomerId: true, subscriptionStatus: true },
      });

      if (!user) {
        return reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'User not found.' } });
      }

      // Get or create Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { userId },
        });
        customerId = customer.id;
        await prisma.user.update({ where: { id: userId }, data: { stripeCustomerId: customerId } });
      }

      // Create checkout session with 7-day trial
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        subscription_data: {
          trial_period_days: 7,
          metadata: { userId },
        },
        success_url: `${FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${FRONTEND_URL}/subscribe`,
        allow_promotion_codes: true,
      });

      return reply.send({ success: true, data: { url: session.url } });
    }
  );

  /**
   * POST /subscriptions/portal
   * Creates a Stripe Customer Portal session for managing billing.
   */
  app.post(
    '/portal',
    { preHandler: [authMiddleware] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = (request as AuthRequest).userId!;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { stripeCustomerId: true },
      });

      if (!user?.stripeCustomerId) {
        return reply.code(400).send({
          success: false,
          error: { code: 'NO_CUSTOMER', message: 'No billing account found. Please subscribe first.' },
        });
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${FRONTEND_URL}/dashboard`,
      });

      return reply.send({ success: true, data: { url: session.url } });
    }
  );

  /**
   * POST /subscriptions/webhook
   * Stripe webhook handler — updates subscription status in DB.
   * Must be registered WITHOUT auth middleware and with raw body.
   */
  app.post(
    '/webhook',
    {
        config: {},
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const sig = request.headers['stripe-signature'] as string;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

      let event: Stripe.Event;
      try {
        event = stripe.webhooks.constructEvent(
          (request as any).rawBody,
          sig,
          webhookSecret
        );
      } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return reply.code(400).send({ error: 'Invalid webhook signature' });
      }

      const sub = event.data.object as Stripe.Subscription;

      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const userId = sub.metadata?.userId;
          if (userId) {
            await prisma.user.update({
              where: { id: userId },
              data: {
                stripeSubscriptionId: sub.id,
                subscriptionStatus: sub.status,
                subscriptionPriceId: sub.items.data[0]?.price.id ?? null,
                trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
                subscriptionEndsAt: (sub as any).current_period_end ? new Date((sub as any).current_period_end * 1000) : null,
              },
            });
          }
          break;
        }

        case 'customer.subscription.deleted': {
          const userId = sub.metadata?.userId;
          if (userId) {
            await prisma.user.update({
              where: { id: userId },
              data: {
                subscriptionStatus: 'canceled',
                    subscriptionEndsAt: (sub as any).current_period_end ? new Date((sub as any).current_period_end * 1000) : null,
              },
            });
          }
          break;
        }

        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          if (session.subscription && session.customer) {
            // Fetch the subscription to get metadata
            const fullSub = await stripe.subscriptions.retrieve(session.subscription as string);
            const userId = fullSub.metadata?.userId;
            if (userId) {
              await prisma.user.update({
                where: { id: userId },
                data: {
                  stripeCustomerId: session.customer as string,
                  stripeSubscriptionId: fullSub.id,
                  subscriptionStatus: fullSub.status,
                  subscriptionPriceId: fullSub.items.data[0]?.price.id ?? null,
                  trialEndsAt: fullSub.trial_end ? new Date(fullSub.trial_end * 1000) : null,
                  subscriptionEndsAt: (fullSub as any).current_period_end ? new Date((fullSub as any).current_period_end * 1000) : null,
                },
              });
            }
          }
          break;
        }

        default:
          break;
      }

      return reply.send({ received: true });
    }
  );
};
