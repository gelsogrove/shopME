-- AlterTable
ALTER TABLE "users" ADD COLUMN     "gdprAccepted" TIMESTAMP(3),
ALTER COLUMN "firstName" DROP NOT NULL,
ALTER COLUMN "lastName" DROP NOT NULL;
