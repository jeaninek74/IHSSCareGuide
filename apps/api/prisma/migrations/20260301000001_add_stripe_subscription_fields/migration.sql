-- AlterTable: Add Stripe subscription fields to users
ALTER TABLE "users"
  ADD COLUMN "stripe_customer_id"     TEXT UNIQUE,
  ADD COLUMN "stripe_subscription_id" TEXT UNIQUE,
  ADD COLUMN "subscription_status"    TEXT,
  ADD COLUMN "subscription_price_id"  TEXT,
  ADD COLUMN "trial_ends_at"          TIMESTAMP(3),
  ADD COLUMN "subscription_ends_at"   TIMESTAMP(3);
