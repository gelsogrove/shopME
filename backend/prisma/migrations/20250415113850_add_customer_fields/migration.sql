-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "company" TEXT,
ADD COLUMN     "discount" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "language" TEXT DEFAULT 'English',
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "serviceIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
