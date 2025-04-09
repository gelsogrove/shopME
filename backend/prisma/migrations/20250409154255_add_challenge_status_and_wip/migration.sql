-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "challengeStatus" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "wipMessage" TEXT NOT NULL DEFAULT 'Lavori in corso si prega di contattarci piu tardi';
