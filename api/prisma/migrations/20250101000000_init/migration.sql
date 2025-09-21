-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MEMBER');
CREATE TYPE "OpportunityStage" AS ENUM ('PREPARACION', 'PRESENTACION', 'NEGOCIACION', 'VENTA', 'NO_VENTA');

-- CreateTable
CREATE TABLE "companies" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL UNIQUE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE "users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
    "force_password_reset" BOOLEAN NOT NULL DEFAULT TRUE,
    "invitation_token" TEXT UNIQUE,
    "invitation_expires_at" TIMESTAMP WITH TIME ZONE,
    "last_login_at" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "users_company_id_email_key" UNIQUE ("company_id", "email"),
    CONSTRAINT "users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE
);

CREATE TABLE "api_keys" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "jti" TEXT NOT NULL UNIQUE,
    "hash" TEXT NOT NULL,
    "last_four" TEXT NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "revoked_at" TIMESTAMP WITH TIME ZONE,
    CONSTRAINT "api_keys_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE
);

CREATE INDEX "api_keys_company_id_idx" ON "api_keys"("company_id");

CREATE TABLE "accounts" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "industry" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "accounts_company_id_name_key" UNIQUE ("company_id", "name"),
    CONSTRAINT "accounts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE
);

CREATE INDEX "accounts_company_id_idx" ON "accounts"("company_id");

CREATE TABLE "contacts" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "position" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "contacts_company_id_email_key" UNIQUE ("company_id", "email"),
    CONSTRAINT "contacts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE,
    CONSTRAINT "contacts_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE
);

CREATE INDEX "contacts_company_id_idx" ON "contacts"("company_id");
CREATE INDEX "contacts_account_id_idx" ON "contacts"("account_id");

CREATE TABLE "opportunities" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "stage" "OpportunityStage" NOT NULL DEFAULT 'PREPARACION',
    "close_date" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "opportunities_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE,
    CONSTRAINT "opportunities_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE
);

CREATE INDEX "opportunities_company_id_idx" ON "opportunities"("company_id");
CREATE INDEX "opportunities_account_id_idx" ON "opportunities"("account_id");
CREATE INDEX "opportunities_company_id_stage_idx" ON "opportunities"("company_id", "stage");

CREATE TABLE "stage_changes" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "opportunity_id" UUID NOT NULL,
    "old_stage" "OpportunityStage" NOT NULL,
    "new_stage" "OpportunityStage" NOT NULL,
    "reason" TEXT,
    "changed_by_id" UUID,
    "changed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "stage_changes_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE,
    CONSTRAINT "stage_changes_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "opportunities"("id") ON DELETE CASCADE,
    CONSTRAINT "stage_changes_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "users"("id") ON DELETE SET NULL
);

CREATE INDEX "stage_changes_company_id_idx" ON "stage_changes"("company_id");
CREATE INDEX "stage_changes_opportunity_id_idx" ON "stage_changes"("opportunity_id");
CREATE INDEX "stage_changes_company_id_new_stage_idx" ON "stage_changes"("company_id", "new_stage");
CREATE INDEX "stage_changes_company_id_changed_at_idx" ON "stage_changes"("company_id", "changed_at");

CREATE TABLE "attachments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "opportunity_id" UUID NOT NULL,
    "filename" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "storage_key" TEXT NOT NULL,
    "uploaded_by_id" UUID,
    "uploaded_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "attachments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE,
    CONSTRAINT "attachments_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "opportunities"("id") ON DELETE CASCADE,
    CONSTRAINT "attachments_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE SET NULL
);

CREATE INDEX "attachments_company_id_idx" ON "attachments"("company_id");
CREATE INDEX "attachments_opportunity_id_idx" ON "attachments"("opportunity_id");

