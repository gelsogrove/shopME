/*
  Warnings:

  - You are about to drop the column `wipMessage` on the `Workspace` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Workspace" DROP COLUMN "wipMessage",
ADD COLUMN     "wipMessages" JSONB DEFAULT '{"it": "Lavori in corso. Contattaci più tardi.", "en": "Work in progress. Please contact us later.", "es": "Trabajos en curso. Por favor, contáctenos más tarde.", "pt": "Em manutenção. Por favor, contacte-nos mais tarde."}';
