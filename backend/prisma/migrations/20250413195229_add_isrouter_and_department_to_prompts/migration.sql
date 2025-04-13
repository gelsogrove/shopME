-- AlterTable
ALTER TABLE "prompts" ADD COLUMN     "department" TEXT,
ADD COLUMN     "isRouter" BOOLEAN NOT NULL DEFAULT false;
