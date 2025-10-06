/*
  Warnings:

  - The values [MESSAGE_BASE,LLM_RESPONSE] on the enum `BillingType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."BillingType_new" AS ENUM ('MONTHLY_CHANNEL', 'MESSAGE', 'NEW_CUSTOMER', 'NEW_ORDER', 'HUMAN_SUPPORT', 'PUSH_MESSAGE', 'NEW_FAQ', 'ACTIVE_OFFER');
ALTER TABLE "public"."Billing" ALTER COLUMN "type" TYPE "public"."BillingType_new" USING ("type"::text::"public"."BillingType_new");
ALTER TYPE "public"."BillingType" RENAME TO "BillingType_old";
ALTER TYPE "public"."BillingType_new" RENAME TO "BillingType";
DROP TYPE "public"."BillingType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."cart_items" DROP CONSTRAINT "cart_items_productId_fkey";

-- AlterTable
ALTER TABLE "public"."Billing" ADD COLUMN     "currentCharge" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "newTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "previousTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "userQuery" TEXT;

-- AlterTable
ALTER TABLE "public"."cart_items" ADD COLUMN     "itemType" "public"."ItemType" NOT NULL DEFAULT 'PRODUCT',
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "serviceId" TEXT,
ALTER COLUMN "productId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."cart_items" ADD CONSTRAINT "cart_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cart_items" ADD CONSTRAINT "cart_items_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."services"("id") ON DELETE SET NULL ON UPDATE CASCADE;
