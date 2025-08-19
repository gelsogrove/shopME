/*
  Warnings:

  - You are about to drop the column `plan` on the `Workspace` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Workspace" DROP COLUMN "plan";

-- DropEnum
DROP TYPE "public"."PlanType";
