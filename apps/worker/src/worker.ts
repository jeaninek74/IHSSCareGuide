import pino from 'pino';
import { PrismaClient } from '@prisma/client';
import sgMail from '@sendgrid/mail';

const logger = pino({ level: process.env.APP_ENV === 'production' ? 'info' : 'debug' });
const prisma = new PrismaClient();
const APP_ENV = process.env.APP_ENV || 'development';
const POLL_INTERVAL_MS = parseInt(process.env.WORKER_INTERVAL_MS || '300000', 10); // 5 min default

// ── SendGrid Email Transport ──────────────────────────────────────────────────
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM = process.env.SENDGRID_FROM || 'noreply@ihsscareguide.com';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  logger.info('SendGrid email transport configured');
} else {
  logger.warn('SENDGRID_API_KEY not set — email sending will be simulated');
}

async function sendReminderEmail(
  toEmail: string,
  certName: string,
  expirationDate: Date,
  daysUntilExpiry: number
): Promise<void> {
  const subject = `IHSS Certification Reminder: ${certName} expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`;
  const expiryStr = expirationDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const urgencyColor = daysUntilExpiry <= 7 ? '#d32f2f' : '#ed6c02';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <div style="background: #1976d2; color: white; padding: 20px 24px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0; font-size: 20px;">IHSS Caregiver Companion</h2>
        <p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">Certification Reminder</p>
      </div>
      <div style="background: #fff; border: 1px solid #e0e0e0; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
        <p style="margin-top: 0;">Hello,</p>
        <p>This is a reminder that your <strong>${certName}</strong> certification is expiring soon.</p>
        <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
          <tr>
            <td style="padding: 10px 12px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold; width: 40%;">Certification</td>
            <td style="padding: 10px 12px; border: 1px solid #ddd;">${certName}</td>
          </tr>
          <tr>
            <td style="padding: 10px 12px; border: 1px solid #ddd; background: #f5f5f5; font-weight: bold;">Expiration Date</td>
            <td style="padding: 10px 12px; border: 1px solid #ddd; color: ${urgencyColor}; font-weight: bold;">
              ${expiryStr} (${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''} remaining)
            </td>
          </tr>
        </table>
        <p><strong>What to do next:</strong> Log in to your IHSS Caregiver Companion account to update your certification details and ensure your records are current.</p>
        <p style="margin-bottom: 0; color: #666; font-size: 12px; padding-top: 16px; border-top: 1px solid #eee;">
          This reminder was sent automatically by IHSS Caregiver Companion. Always verify certification requirements with your county IHSS office or official IHSS resources. This app is not affiliated with CDSS or any county IHSS program.
        </p>
      </div>
    </div>
  `;

  if (!SENDGRID_API_KEY) {
    logger.info({ toEmail, subject }, '[SIMULATED EMAIL] Reminder would be sent via SendGrid');
    return;
  }

  await sgMail.send({
    to: toEmail,
    from: SENDGRID_FROM,
    subject,
    html,
  });
}

// ── Reminder Processing ───────────────────────────────────────────────────────

async function processReminders(): Promise<void> {
  const now = new Date();

  const dueEvents = await prisma.reminderEvent.findMany({
    where: { scheduledFor: { lte: now }, sentAt: null, status: 'scheduled' },
    include: {
      certification: {
        include: {
          provider: { select: { id: true, email: true } },
          certificationType: { select: { name: true } },
        },
      },
    },
    take: 50,
  });

  if (dueEvents.length === 0) {
    logger.debug('No due reminder events found');
    return;
  }

  logger.info({ count: dueEvents.length }, 'Processing due reminder events');

  for (const event of dueEvents) {
    const cert = event.certification;
    const certName = cert.certificationType?.name || cert.customName || 'Unknown Certification';
    const providerEmail = cert.provider.email;

    try {
      const daysUntilExpiry = cert.expirationDate
        ? Math.max(0, Math.floor((cert.expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        : 0;

      await sendReminderEmail(providerEmail, certName, cert.expirationDate || now, daysUntilExpiry);

      await prisma.reminderEvent.update({
        where: { id: event.id },
        data: { sentAt: now, status: 'sent' },
      });

      logger.info({ eventId: event.id, toEmail: providerEmail, certName }, 'Reminder sent successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error({ eventId: event.id, err: message }, 'Failed to send reminder');

      await prisma.reminderEvent.update({
        where: { id: event.id },
        data: { status: 'failed', errorMessage: message },
      });
    }
  }
}

// ── Certification Status Refresh ──────────────────────────────────────────────

async function refreshCertificationStatuses(): Promise<void> {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [expiredCount, expiringSoonCount, activeCount] = await Promise.all([
    prisma.providerCertification.updateMany({
      where: { expirationDate: { lt: now }, status: { not: 'expired' } },
      data: { status: 'expired' },
    }),
    prisma.providerCertification.updateMany({
      where: { expirationDate: { gte: now, lte: thirtyDaysFromNow }, status: { not: 'expiring_soon' } },
      data: { status: 'expiring_soon' },
    }),
    prisma.providerCertification.updateMany({
      where: { expirationDate: { gt: thirtyDaysFromNow }, status: { notIn: ['active'] } },
      data: { status: 'active' },
    }),
  ]);

  if (expiredCount.count + expiringSoonCount.count + activeCount.count > 0) {
    logger.info({ expiredCount: expiredCount.count, expiringSoonCount: expiringSoonCount.count, activeCount: activeCount.count }, 'Certification statuses refreshed');
  }
}

// ── Main Poll Loop ────────────────────────────────────────────────────────────

const processJobs = async () => {
  logger.debug('Polling for jobs...');
  try {
    await processReminders();
    await refreshCertificationStatuses();
  } catch (err) {
    logger.error({ err }, 'Error in job processing loop');
  }
};

const start = async () => {
  logger.info({ env: APP_ENV }, 'Worker service starting');

  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Worker DB connection established');
  } catch (err) {
    logger.error({ err }, 'Worker failed to connect to DB on startup');
    process.exit(1);
  }

  // Run immediately on startup
  await processJobs();

  // Then run on interval
  const poll = async () => {
    await processJobs();
    setTimeout(poll, POLL_INTERVAL_MS);
  };

  setTimeout(poll, POLL_INTERVAL_MS);
  logger.info({ intervalMs: POLL_INTERVAL_MS }, 'Worker scheduler started');
};

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down worker');
  await prisma.$disconnect();
  process.exit(0);
});

start().catch((err) => {
  logger.error({ err }, 'Worker startup error');
  process.exit(1);
});
