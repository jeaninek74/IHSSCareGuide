-- CreateEnum: CertificationStatus
CREATE TYPE "CertificationStatus" AS ENUM ('active', 'expired', 'expiring_soon', 'missing');

-- CreateEnum: ReminderChannel
CREATE TYPE "ReminderChannel" AS ENUM ('email');

-- CreateEnum: ReminderEventStatus
CREATE TYPE "ReminderEventStatus" AS ENUM ('scheduled', 'sent', 'failed');

-- CreateTable: certification_types
CREATE TABLE "certification_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "default_validity_days" INTEGER,
    "is_common" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certification_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable: provider_certifications
CREATE TABLE "provider_certifications" (
    "id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "certification_type_id" TEXT,
    "custom_name" TEXT,
    "issued_date" TIMESTAMP(3),
    "expiration_date" TIMESTAMP(3),
    "status" "CertificationStatus" NOT NULL DEFAULT 'active',
    "document_url" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable: reminder_rules
CREATE TABLE "reminder_rules" (
    "id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "certification_type_id" TEXT,
    "days_before_expiration" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminder_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable: reminder_events
CREATE TABLE "reminder_events" (
    "id" TEXT NOT NULL,
    "provider_certification_id" TEXT NOT NULL,
    "scheduled_for" TIMESTAMP(3) NOT NULL,
    "sent_at" TIMESTAMP(3),
    "channel" "ReminderChannel" NOT NULL DEFAULT 'email',
    "status" "ReminderEventStatus" NOT NULL DEFAULT 'scheduled',
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reminder_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "provider_certifications_provider_id_idx" ON "provider_certifications"("provider_id");
CREATE INDEX "provider_certifications_status_idx" ON "provider_certifications"("status");
CREATE INDEX "reminder_rules_provider_id_idx" ON "reminder_rules"("provider_id");
CREATE INDEX "reminder_events_scheduled_for_idx" ON "reminder_events"("scheduled_for");
CREATE INDEX "reminder_events_status_idx" ON "reminder_events"("status");

-- AddForeignKey
ALTER TABLE "provider_certifications" ADD CONSTRAINT "provider_certifications_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "provider_certifications" ADD CONSTRAINT "provider_certifications_certification_type_id_fkey" FOREIGN KEY ("certification_type_id") REFERENCES "certification_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "reminder_rules" ADD CONSTRAINT "reminder_rules_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reminder_rules" ADD CONSTRAINT "reminder_rules_certification_type_id_fkey" FOREIGN KEY ("certification_type_id") REFERENCES "certification_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "reminder_events" ADD CONSTRAINT "reminder_events_provider_certification_id_fkey" FOREIGN KEY ("provider_certification_id") REFERENCES "provider_certifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed common certification types
INSERT INTO "certification_types" ("id", "name", "description", "default_validity_days", "is_common", "created_at") VALUES
    (gen_random_uuid(), 'CPR', 'Cardiopulmonary Resuscitation certification required for IHSS providers', 730, true, NOW()),
    (gen_random_uuid(), 'First Aid', 'Basic first aid certification for emergency response', 730, true, NOW()),
    (gen_random_uuid(), 'TB Test', 'Tuberculosis skin test or blood test result', 365, true, NOW()),
    (gen_random_uuid(), 'Live Scan', 'Fingerprint-based background check clearance', NULL, true, NOW()),
    (gen_random_uuid(), 'Orientation Completion', 'IHSS provider orientation program completion', NULL, true, NOW()),
    (gen_random_uuid(), 'Registry Training', 'IHSS Registry required training modules', NULL, true, NOW());
