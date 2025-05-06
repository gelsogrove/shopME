-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "currency" TEXT DEFAULT 'EUR',
ADD COLUMN     "last_privacy_version_accepted" TEXT,
ADD COLUMN     "privacy_accepted_at" TIMESTAMP(3),
ADD COLUMN     "push_notifications_consent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "push_notifications_consent_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "registration_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registration_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "registration_tokens_token_key" ON "registration_tokens"("token");
