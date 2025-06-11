-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('FREE', 'BASIC', 'PROFESSIONAL', 'ENTERPRISE');

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "plan" "PlanType" NOT NULL DEFAULT 'FREE';
