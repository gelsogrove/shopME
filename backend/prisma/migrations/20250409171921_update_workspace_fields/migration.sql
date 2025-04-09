-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "description" TEXT,
ADD COLUMN     "messageLimit" INTEGER NOT NULL DEFAULT 50,
ALTER COLUMN "wipMessage" DROP NOT NULL,
ALTER COLUMN "wipMessage" DROP DEFAULT;
