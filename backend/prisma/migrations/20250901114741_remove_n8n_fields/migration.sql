/*
  Warnings:

  - You are about to drop the column `n8nWorkflowUrl` on the `Workspace` table. All the data in the column will be lost.
  - You are about to drop the column `n8nWebhook` on the `whatsapp_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Workspace" DROP COLUMN "n8nWorkflowUrl";

-- AlterTable
ALTER TABLE "public"."whatsapp_settings" DROP COLUMN "n8nWebhook";
