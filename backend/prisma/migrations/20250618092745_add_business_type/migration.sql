-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('ECOMMERCE', 'RESTAURANT', 'CLINIC', 'RETAIL', 'SERVICES', 'GENERIC');

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "businessType" "BusinessType" NOT NULL DEFAULT 'ECOMMERCE';
