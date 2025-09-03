-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'PARTIALLY_PAID');

-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "paymentStatus" "public"."PaymentStatus" DEFAULT 'PENDING';
